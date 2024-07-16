import EboiCommand from '../class/EboiCommand.js'
import EboiEvent from '../class/EboiEvent.js'
import EboiShard from '../class/EboiShard.js'
import { PromisePool } from '@supercharge/promise-pool'
import { readdir } from 'fs/promises'
import { join } from 'path'
import { pathToFileURL } from 'url'

export interface EboiComponentModule {
  default?: {
    new <T, A extends Array<any> = any[]>(...args: A): T
  }
}

export interface EboiComponentResult {
  name: string
  url: string
  time: {
    start: number
    end: number
    total: number
  }
  type: string
}

export const readdirURL = async (
  directory: string,
  encoding?: BufferEncoding,
  recursive?: boolean,
): Promise<URL[]> => {
  return (await readdir(directory, { encoding, recursive, withFileTypes: false })).map((filename) =>
    pathToFileURL(join(directory, filename)),
  )
}

export const load = async (shard: EboiShard, directories: string[]) => {
  const resultGenerator = (url: string) => {
    const start = Date.now()
    return (type: string, name: string): EboiComponentResult => {
      const end = Date.now()
      return {
        name,
        url,
        time: { end, start, total: end - start },
        type,
      }
    }
  }
  return await PromisePool.for(
    (await Promise.all(directories.map(async (p) => await readdirURL(p)))).flatMap((url) =>
      url.toString(),
    ),
  )
    .withConcurrency(8)
    .process(async (url): Promise<EboiComponentResult> => {
      const result = resultGenerator(url)
      const { default: Component }: EboiComponentModule = await import(url)
      switch (true) {
        case Component?.prototype instanceof EboiEvent: {
          const event = new Component<EboiEvent>(shard)
          shard._events.set(event.name, event)
          shard.client.on(event.name, event.run.bind(event))
          return result('event', event.name)
        }
        case Component?.prototype instanceof EboiCommand: {
          const command = new Component<EboiCommand>(shard)
          shard._command.set(command.name, command)
          return result('command', command.name)
        }
        default:
          throw new Error(`invalid component '${url}'!`)
      }
    })
}

export default load
