export async function asyncTryCatch<R>(
  promise: Promise<R>,
): Promise<[R, null] | [null, Error]> {
  try {
    const data = await promise;
    return [data, null];
  } catch (error) {
    if (!(error instanceof Error)) {
      throw error;
    }
    return [null, error];
  }
}
