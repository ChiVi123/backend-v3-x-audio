# BACKEND RULES — V3-X Audio

## Tech Stack

- **Runtime**: [Bun](https://bun.sh/) v1.3.11 & [Node.js](https://nodejs.org/) v25.1.0
- **API Framework**: [NestJS](https://nestjs.com/) v11.x.x
- **Database**: [PostgreSQL](https://www.postgresql.org/) v16.x
- **Language**: [TypeScript](https://www.typescriptlang.org/) v5.7.3
- **Bun Testing**: [Bun Test](https://bun.sh/test)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/) v0.45.2


### Request/Response Format

All JSON responses must follow this envelope:

```json
{
  "statusCode": 200,
  "message": "Success",
  "data": {},
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

Error responses:

```json
{
  "statusCode": 400,
  "message": "Bad Request",
  "error": "Validation failed"
}
```

## Folder Structure (Clean Architecture)
```
src/
├─ config/
├─ application/
│  ├─ constants/
│  ├─ exceptions/
│  ├─ mappers/
│  ├─ repositories/
│  ├─ services/
│  ├─ types/
│  └─ use-cases/
├─ domain/
│  ├─ entities/
│  ├─ enums/
│  └─ types/
├─ infrastructure/
│  ├─ cloudinary/
│  ├─ constants/
│  ├─ database/
│  │  ├─ drizzle/schema
│  ├─ repositories/
│  └─ services/
├─ presentation/
│  ├─ controllers/
│  ├─ decorators/
│  └─ dtos/
└─ main.ts
test/
  ├─ common/
  ├─ e2e/
  ├─ integration/
  └─ unit/
```

## Code style

- Prefer `const` over `let`.
- Don't use `any` type. Safety first.
- Code line width is 120 characters.
- Always use semicolon.
- Always use HTTP Exception from `~/application/exceptions`.
- Domain and Application layer must not depend on Infrastructure layer and third party libraries.
- If depends is class for NestJS DI or ValidationPipe, please use `import` keyword, not `import type`. 
- Suppress `lint/style/useImportType` for NestJS DI and ValidationPipe dependencies.
- Do not prefix interface names with "I" (e.g., use `ProductRepository` instead of `IProductRepository`).

## Database design

- Don't select all columns in query.

## Git
- Use conventional commits: feat:, fix:, docs:, style:, refactor:, perf:, test:, chore:
- Keep commits focused; one logical change per commit

## Task Management

- Maintain a `todo-list.md` in the `docs/` directory to track non-compliance issues and pending features.
- Section header format: `# [Short Description] [Created Date: YYYY-MM-DD] [Completed Date: YYYY-MM-DD or Pending]`
- Use markdown checkboxes `[ ]` for tasks.
- Keep the list updated as progress is made.