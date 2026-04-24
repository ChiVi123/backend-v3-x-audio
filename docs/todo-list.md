# Compliance and Optimization Tasks [2026-04-23] [2026-04-23]

## Response Format Compliance
- [x] Implement a global `ResponseInterceptor` to wrap success responses in the required envelope: `{ statusCode, message, data, pagination }`.
- [x] Update `GlobalExceptionsFilter` to match the error response format: `{ statusCode, message, error }`.
- [x] Implement pagination metadata logic in `application` layer and ensure it's reflected in the response envelope for list endpoints.
- [x] Update E2E tests to assert the new response envelope structure.

## Database Query Optimization
- [x] Audit `DrizzleProductRepository` and other repositories to explicitly specify `columns` in `findMany` and `findFirst` calls to avoid `SELECT *`.
- [x] Ensure `DrizzleImageRepository` also follows the "Don't select all columns" rule.

## Exception Handling Consistency
- [x] Replace NestJS built-in `BadRequestException` with custom `BadRequestException` from `~/application/exceptions` in `DrizzleProductRepository`.
- [x] Scan codebase for other built-in NestJS exceptions and replace them with custom ones from the `application` layer.

## Project Structure and Tech Stack
- [x] Verify if there are any other hardcoded references to `applications` (plural) in scripts or configs and update them to `application`.

# User Management and Authentication [2026-04-23] [Pending]

## Database and Entity Design
- [x] Create Drizzle schemas for `user`, `role`, and `user_to_role`.
- [x] Ensure `UserRepository` implements `existsByEmail` and `existsById` methods.

## Authentication and Security
- [x] Implement JWT-based authentication (Access and Refresh tokens).
- [x] Implement password hashing using `bcrypt`.
- [x] Ensure that sensitive data (`passwordHash`, `refreshTokenHash`) is never sent to the client in any controller response.

## Authorization (RBAC)
- [x] Implement `RolesGuard` and `@Roles` decorator for role-based access control.
- [x] Implement use cases: `RegisterUserUseCase`, `LoginUserUseCase`, `GetMeUseCase`.
