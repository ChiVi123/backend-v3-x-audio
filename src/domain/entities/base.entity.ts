export abstract class BaseEntity<T> {
  id: T;
  createdAt: Date;
  updatedAt: Date;
}
