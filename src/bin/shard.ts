// eboi shard entrypoint

import EboiShard from '../class/EboiShard.js'
import '../util/i18n.js'

export const shard = await new EboiShard().setup()
