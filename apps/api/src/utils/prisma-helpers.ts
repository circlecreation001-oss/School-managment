/**
 * Type-safe cast for Prisma create/update operations.
 * Used when spreading validated Zod input into Prisma's strict UncheckedCreateInput types.
 * The Zod schema guarantees required fields are present at runtime,
 * but TypeScript cannot infer this through the spread + partial pattern.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function prismaData<T>(data: any): T {
  return data as T;
}

/**
 * Cast metadata to Prisma-compatible JSON type
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toJsonValue(value: Record<string, unknown> | undefined): any {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}
