# V3-X Audio — Backend API

Backend REST API cho nền tảng thương mại điện tử **V3-X Audio** — chuyên cung cấp sản phẩm tai nghe cao cấp. Được xây dựng bằng **NestJS**, theo kiến trúc **Clean Architecture**, sử dụng **Drizzle ORM** + **PostgreSQL** và tích hợp **Cloudinary** để lưu trữ ảnh.

---

## Tech Stack

| Thành phần | Công nghệ |
|---|---|
| Framework | NestJS 11 |
| Runtime | Bun |
| Ngôn ngữ | TypeScript 5 |
| Database | PostgreSQL |
| ORM | Drizzle ORM |
| Auth | Passport.js + JWT |
| Upload ảnh | Cloudinary |
| Validation | class-validator + class-transformer |
| Linter/Formatter | Biome |
| Testing | Bun Test |

---

## Kiến trúc

Dự án tuân theo **Clean Architecture** với 3 lớp chính:

```
src/
├── core/               # Domain layer (entities, interfaces, types)
│   ├── entities/       # Domain entities: Product, Category, Image, User, Role
│   ├── repositories/   # Repository interfaces (abstractions)
│   ├── services/       # Service interfaces (abstractions)
│   └── types/          # Branded types (ProductId, Ohm, Hertz, Usd, ...)
│
├── applications/       # Application layer (use-cases, DTOs)
│   ├── use-cases/      # Business logic: create/update product, login, register
│   └── dtos/           # Data Transfer Objects với validation
│
├── infrastructure/     # Infrastructure layer (implementations cụ thể)
│   ├── auth/           # JWT strategy, guards (JwtAuthGuard, RolesGuard)
│   ├── database/       # Drizzle config, schemas (PostgreSQL)
│   ├── repositories/   # Drizzle repository implementations
│   ├── services/       # Cloudinary media service
│   ├── tasks/          # Scheduled tasks (Image Garbage Collector)
│   ├── decorators/     # Custom decorators (@Roles, @ParseFormData, @IsCoordinate2D)
│   ├── filters/        # Global exception filters
│   └── validations/    # Custom validators
│
└── presentation/       # Presentation layer (HTTP controllers)
    ├── auth.controller.ts
    └── product.controller.ts
```

---

## API Endpoints

### Auth — `/auth`

| Method | Endpoint | Mô tả | Auth |
|---|---|---|---|
| `POST` | `/auth/register` | Đăng ký tài khoản mới | Không |
| `POST` | `/auth/login` | Đăng nhập, trả về JWT token | Không |

### Products — `/products`

| Method | Endpoint | Mô tả | Auth |
|---|---|---|---|
| `GET` | `/products` | Lấy danh sách sản phẩm (có phân trang, lọc theo category) | Không |
| `GET` | `/products/:id` | Lấy chi tiết sản phẩm theo ID | Không |
| `POST` | `/products` | Tạo sản phẩm mới (multipart/form-data) | Admin |
| `PATCH` | `/products/:id` | Cập nhật sản phẩm (multipart/form-data) | Admin, Editor |

#### Query params cho `GET /products`

| Param | Kiểu | Mô tả |
|---|---|---|
| `categoryId` | `string` | Lọc theo danh mục |
| `page` | `number` | Số trang (mặc định: 1) |
| `limit` | `number` | Số sản phẩm mỗi trang (mặc định: 10) |

---

## Domain Model — Product

Mỗi sản phẩm bao gồm các thuộc tính:

- **Thông tin cơ bản**: `name`, `slug`, `description`, `price` (USD), `stock`, `categoryId`
- **Thông số kỹ thuật** (`specs`):
  - `impedance` (Ohm)
  - `sensitivity` (dB)
  - `frequencyResponse` — `{ min, max }` (Hz)
  - `driverType` — `Dynamic | Planar | Electrostatic | Balanced Armature`
- **Đồ thị tần số** (`frGraphData`): mảng toạ độ `[x, y][]` dùng cho D3.js
- **3D Model**: `threeModelId` (tuỳ chọn)
- **Trạng thái**: `draft | live | archived`
- **Hình ảnh**: nhiều ảnh, hỗ trợ đánh dấu ảnh chính (`isPrimary`)

---

## Cài đặt

### Yêu cầu

- [Bun](https://bun.sh/) >= 1.0
- PostgreSQL
- Tài khoản [Cloudinary](https://cloudinary.com/)

### 1. Clone và cài dependencies

```bash
git clone <repository-url>
cd backend-v3-x-audio
bun install
```

### 2. Cấu hình biến môi trường

Sao chép file `.env.example` thành `.env` và điền các giá trị:

```bash
cp .env.example .env
```

```env
NODE_ENV=development
PORT=3000

DATABASE_URL=postgresql://user:password@localhost:5432/v3x_audio

IMAGE_PRODUCT_PLACEHOLDER_URL=<url_ảnh_placeholder>

CLOUDINARY_CLOUD_NAME=<your_cloud_name>
CLOUDINARY_API_KEY=<your_api_key>
CLOUDINARY_API_SECRET=<your_api_secret>
CLOUDINARY_BASE_FOLDER=<your_base_folder>

JWT_SECRET=<your_jwt_secret>
JWT_EXPIRES_IN=7d
```

### 3. Khởi tạo Database

```bash
# Generate migration files từ schema
bun run db:generate

# Apply migration lên database
bun run db:migrate

# Hoặc push schema trực tiếp (development)
bun run db:push

# Seed dữ liệu mẫu
bun run db:seed
```

---

## Chạy ứng dụng

```bash
# Development (hot reload)
bun run start:dev

# Development (không reload)
bun run start

# Debug mode
bun run start:debug

# Production
bun run start:prod
```

---

## Kiểm thử

```bash
# Chạy toàn bộ unit tests
bun run test

# Watch mode
bun run test:watch

# E2E tests
bun run test:e2e

# Coverage report
bun run test:cov
```

### Môi trường test riêng biệt

Dự án hỗ trợ môi trường test độc lập qua `.env.test.local`:

```bash
# Push schema lên DB test
bun run db:push:test

# Seed DB test
bun run db:seed:test

# Reset DB test
bun run db:reset:test
```

---

## Database — Drizzle ORM

### Schemas

| Schema | Bảng | Mô tả |
|---|---|---|
| `product.schema.ts` | `products` | Thông tin sản phẩm |
| `category.schema.ts` | `categories` | Danh mục sản phẩm |
| `image.schema.ts` | `images`, `product_images` | Ảnh sản phẩm (join table) |
| `user.schema.ts` | `users` | Người dùng |
| `role.schema.ts` | `roles`, `user_roles` | Phân quyền |

### Drizzle Studio (GUI)

```bash
bun run db:studio
```

---

## Tính năng nổi bật

### 🗑️ Image Garbage Collector

Scheduled task chạy **mỗi ngày lúc 00:00** để tự động dọn dẹp:
- Ảnh **orphan** (không gắn với sản phẩm nào)
- Ảnh ở trạng thái `pending` quá 24 giờ (do lỗi upload)

Ảnh orphan sẽ bị xoá khỏi cả **Cloudinary** và **database**.

### 🔐 Role-based Access Control (RBAC)

- Sử dụng `JwtAuthGuard` + `RolesGuard`
- Decorator `@Roles('admin', 'editor')` để bảo vệ endpoint
- Hỗ trợ các roles: `admin`, `editor`

### 📐 Branded Types

Sử dụng TypeScript Branded Types để đảm bảo type safety ở compile time:
- `ProductId`, `CategoryId`, `ImageId`, `UserId`
- `Ohm`, `Decibel`, `Hertz`, `Usd`

### 📤 Multipart Form Data

Upload ảnh sản phẩm qua `multipart/form-data` với custom decorator `@ParseFormData()` để parse và validate dữ liệu phức tạp (nested objects, arrays).

---

## Cấu trúc thư mục đầy đủ

```
backend-v3-x-audio/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── core/               # Domain layer
│   ├── applications/       # Application layer
│   ├── infrastructure/     # Infrastructure layer
│   └── presentation/       # HTTP layer
├── drizzle/                # Migration files
├── scripts/                # CLI scripts (seed, reset)
├── test/                   # E2E tests
├── rest-client/            # HTTP client files (.http)
├── docs/                   # Tài liệu bổ sung
├── drizzle.config.ts
├── biome.json
├── tsconfig.json
└── package.json
```

---

## License

UNLICENSED — Dự án nội bộ.
