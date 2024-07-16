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

export const assertEnv = (name: string): string => {
  return assert(process.env[name], `Missing required environment variable '${name}'!`)
}

export default assert
