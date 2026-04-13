export async function asyncTryCatch<R>(
  promise: Promise<R>,
): Promise<[R, null] | [null, unknown]> {
  try {
    const data = await promise;
    return [data, null];
  } catch (error) {
    return [null, error];
  }
}
