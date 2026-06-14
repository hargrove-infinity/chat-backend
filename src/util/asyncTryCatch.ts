export async function asyncTryCatch<T>(
  promise: Promise<T>,
): Promise<[T, null] | [null, Error]> {
  try {
    const data = await promise;
    return [data, null];
  } catch (error) {
    if (!(error instanceof Error)) {
      throw new Error("Invalid Error");
    }
    return [null, error];
  }
}
