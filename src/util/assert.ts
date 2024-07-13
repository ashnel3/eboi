/**
 * Assert truthy-ness
 * @param expr  input expression
 * @param msg   error message
 * @returns     input
 */
export const assert = <T>(expr: T, msg?: string): NonNullable<T> => {
  if (!expr) {
    throw new Error(msg)
  }
  return expr
}

export default assert
