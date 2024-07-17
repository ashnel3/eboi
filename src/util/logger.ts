import winston from 'winston'

export interface EboiLogMessage {
  _ids: ['main'] | number[]
  message: string
  error?: any
  meta?: any
}

/** winston logger */
export const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.json(),
    winston.format.errors(),
    winston.format.timestamp(),
  ),
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  transports: [new winston.transports.Console()],
})

export default logger
