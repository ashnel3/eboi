// main thread entrypoint

import EboiManager from '../class/EboiManager.js'

export const manager = await new EboiManager(await EboiManager.createEnvironment()).setup()
