export const SECOND = 1000
export const MINUTE = 60e3
export const HOUR = 3.6e6
export const DAY = 8.64e7

/**
 * timeunit table
 * @private
 * @internal
 */
const units = {
  s: SECOND,
  m: MINUTE,
  h: HOUR,
  d: DAY,
}

/**
 * parse timeunit string
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

/** Simple timeout class */
export class EboiTimeout {
  constructor(public date: Date) {}

  /**
   * create timeout from ms
   * @param length timeout length
   * @returns      timeout
   */
  static ms(length: number): EboiTimeout {
    return new this(new Date(Date.now() + length))
  }

  /**
   * has timeout passed
   * @returns timeout is passed
   */
  passed(): boolean {
    return this.date.getTime() < Date.now()
  }

  /**
   * timeout remains
   * @returns ms remaining
   */
  remaining(): number {
    return Math.max(this.date.getTime() - Date.now(), 0)
  }
}

export default EboiTimeout
