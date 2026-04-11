export const isUniqueViolation = (error: unknown): boolean => {
  if (typeof error !== 'object' || error === null) return false;
  if (!('code' in error)) return false;
  // Postgres error code cho unique_violation là 23505
  return error.code === '23505';
};
