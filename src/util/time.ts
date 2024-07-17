export const second = 1000
export const minute = 60e3
export const hour = 3.6e6
export const day = 8.64e7

export const units = {
  s: second,
  m: minute,
  h: hour,
  d: day,
}

/**
 * parse timeunit
 * @example timeunit('1.2d') // -> 103680000
 * @param value  timeunit string
 * @returns      milliseconds integer
 */
export const timeunit = (value: string): number => {
  const [full, v, unit] = /^([\d.]+)([smhd])$/.exec(value) ?? []
  const i = parseFloat(v as string)
  if (typeof full !== 'undefined' && !isNaN(i) && unit in units) {
    return units[unit as keyof typeof units] * i
  } else {
    throw new Error(`invalid time '${value}'!`)
  }
}
