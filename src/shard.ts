// eboi shard entrypoint

import EboiShard from './class/EboiShard.js'

export const shard = await new EboiShard().setup()
