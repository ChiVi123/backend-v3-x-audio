# 📂 1. Cấu trúc thư mục (Folder Structure)
Việc phân chia lớp giúp ứng dụng dễ bảo trì và kiểm thử độc lập.

src/
├── constants.ts                    # Lưu các Token Injection (ví dụ: 'IUserRepository')
├── core/                           # LỚP TRUNG TÂM (DOMAIN/BUSINESS LOGIC)
│   ├── interfaces/                 # Định nghĩa "Hợp đồng" (Hành vi mong muốn)
│   │   ├── user-repository.interface.ts
│   │   └── storage-service.interface.ts
│   └── use-cases/                  # Quy trình nghiệp vụ thực tế (User Stories)
│       └── update-profile.use-case.ts
├── infrastructure/                 # LỚP THỰC THI CÔNG NGHỆ (EXTERNAL TOOLS)
│   ├── database/                   # Cấu hình Drizzle ORM
│   │   ├── drizzle.module.ts
│   │   └── schema.ts               # Định nghĩa bảng SQL
│   ├── repositories/               # Triển khai Interface bằng Drizzle
│   │   └── user.repository.impl.ts
│   └── storage/                    # Triển khai Interface bằng Cloudinary
│       └── cloudinary.service.ts
├── presentation/                   # LỚP GIAO TIẾP (ENTRY POINTS)
│   ├── controllers/                # Tiếp nhận HTTP Request
│   │   └── user.controller.ts
│   └── dtos/                       # Định nghĩa Schema dữ liệu & Validation
│       └── update-profile.dto.ts
└── app.module.ts                   # Nơi ráp nối (Dependency Injection Container)

# 🛠️ 2. Mã nguồn tiêu biểu
## 🔹 Constants (Quản lý Token)
Sử dụng Token chuỗi để vượt qua rào cản "xóa kiểu" (Type Erasure) của TypeScript khi dùng Interface.

```ts
// src/constants.ts
export const TOKENS = {
  UserRepository: 'IUserRepository',
  StorageService: 'IStorageService',
  Drizzle: 'DRIZZLE_INSTANCE',
};
```

## 🔹 Core Layer: Use Case
Use Case chỉ phụ thuộc vào Interface. Điều này giúp logic không bị "dính chặt" vào bất kỳ database nào.

```ts
// src/core/use-cases/update-profile.use-case.ts
@Injectable()
export class UpdateProfileUseCase {
  constructor(
    @Inject(TOKENS.UserRepository) private userRepo: IUserRepository,
    @Inject(TOKENS.StorageService) private storage: IStorageService,
  ) {}

  async execute(userId: number, file: any, name: string) {
    const url = await this.storage.upload(file);
    await this.userRepo.update(userId, { name, avatar: url });
    return { success: true, avatarUrl: url };
  }
}
```

## 🔹 Infrastructure Layer: Repository (Drizzle)
Triển khai chi tiết cách lưu dữ liệu xuống database.

```ts
// src/infrastructure/repositories/user.repository.impl.ts
@Injectable()
export class DrizzleUserRepository implements IUserRepository {
  constructor(@Inject(TOKENS.Drizzle) private db: NodePgDatabase<typeof schema>) {}

  async update(id: number, data: any) {
    await this.db.update(schema.users).set(data).where(eq(schema.users.id, id));
  }
}
```
## 💡 3. Các quy tắc quan trọng cần ghi nhớ
1. Dependency Inversion Principle (DIP)
Quy tắc: Lớp cao (Use Case) không được phụ thuộc lớp thấp (Drizzle/Cloudinary). Cả hai phải phụ thuộc vào lớp trừu tượng (Interface).

Tại sao: Để khi thay đổi Database hoặc Library, bạn không phải sửa code nghiệp vụ.

2. Dependency Injection (DI) trong NestJS
Class-based: Dùng trực tiếp Class (như CloudinaryService) làm Token. NestJS tự nhận diện qua metadata.

Interface-based: Dùng @Inject(TOKENS.UserRepository). Bắt buộc phải có vì Interface biến mất sau khi biên dịch sang JS.

3. Quy trình xử lý dữ liệu (Data Flow)
Presentation: Controller tiếp nhận dữ liệu từ Client (qua DTO).

Core: Use Case xử lý logic nghiệp vụ (quy trình).

Infrastructure: Repository thực hiện ghi xuống Database hoặc Storage.

## 🧪 4. Kiểm thử (Unit Testing)
Nhờ Clean Architecture, việc viết Unit Test cho Use Case trở nên cực kỳ đơn giản vì không cần database thật:

```ts
describe('UpdateProfileUseCase', () => {
  it('nên gọi upload và update database', async () => {
    // Giả lập (Mocking)
    const mockUserRepo = { update: jest.fn() };
    const mockStorage = { upload: jest.fn().mockResolvedValue('url_anh') };
    
    const useCase = new UpdateUserProfileUseCase(mockUserRepo, mockStorage);
    await useCase.execute(1, 'file_data', 'Tên mới');

    expect(mockStorage.upload).toBeCalled();
    expect(mockUserRepo.update).toBeCalledWith(1, { name: 'Tên mới', avatar: 'url_anh' });
  });
});
```

## 🚀 5. Lời khuyên vận hành
Drizzle Migrations: Luôn quản lý schema database qua drizzle-kit generate và migrate.

Validation: Sử dụng ValidationPipe toàn cục trong main.ts để DTO tự động bắt lỗi dữ liệu.

Environment: Lưu CLOUDINARY_API_KEY, DATABASE_URL trong file .env và quản lý qua @nestjs/config.

Người viết: Gemini AI
Framework: NestJS v10+
ORM: Drizzle