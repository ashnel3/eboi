import gulp from 'gulp'
import ts from 'gulp-typescript'
import gulpIf from 'gulp-if'
import sourcemaps from 'gulp-sourcemaps'
import { spawn } from 'child_process'
import fs from 'fs/promises'
import path from 'path'

/**
 * Build mode
 * @type {'development' | 'production'}
 */
const MODE = process.env.NODE_ENV === 'development' ? 'development' : 'production'
/**
 * Sourcemaps enabled
 * @type {boolean}
 */
const SOURCEMAPS = MODE === 'development' && process.env.SOURCEMAPS === 'true'

// --- functions ---

/**
 * delete files
 * @param {string[]} paths  file paths
 * @returns {Promise<void>}
 */
const rm = async (paths) => {
  await Promise.all(
    paths.map(async (p) => {
      await fs.rm(path.resolve(p), { force: true, recursive: true })
    }),
  )
}

/**
 * @typedef {Object} SpawnPromise
 * @property {import('child_process').ChildProcess} child  child process
 * @property {Promise<void>} promise                       exec promise
 */

/**
 * spawn promise
 * @param {string} command                                 spawn command
 * @param {string[]} args                                  spawn command arguments
 * @param {import('child_process').SpawnOptions} options   spawn options
 * @returns {SpawnPromise}                                 spawn promise object
 */
const spawnp = (command, args, options) => {
  const child = spawn(command, args, options)
  return {
    child,
    promise: new Promise((resolve, reject) => {
      let error = null
      child
        .on('error', (err) => {
          error = err
        })
        .on('exit', () => {
          if (error === null) {
            resolve()
          } else {
            reject(error)
          }
        })
    }),
  }
}

/**
 * start application
 * @returns {Promise<void>}  application exit promise
 */
const run = async () => {
  const { child, promise } = spawnp(
    'node',
    [
      '--import',
      'data:text/javascript,import { register } from "node:module"; import { pathToFileURL } from "node:url"; register("ts-node/esm", pathToFileURL("./"));',
      '-r',
      'dotenv/config',
      path.resolve('./src/index.ts'),
    ],
    {
      env: {
        ...process.env,
        NODE_ENV: 'development',
        TS_NODE: 'true',
      },
      stdio: 'inherit',
    },
  )
  run.child?.kill()
  run.child = child
  return promise
}
run.child = null

// --- sub-tasks ---

gulp.task('build:copy', () => {
  return gulp
    .src(['assets/**/*', 'config/**/*'], { cwd: './src', cwdbase: true })
    .pipe(gulp.dest('./dist'))
})

gulp.task('build:prisma', () => {
  return spawnp('node', ['./node_modules/prisma/build/index.js', 'generate']).promise
})

gulp.task('build:typescript', () => {
  const project = ts.createProject('./tsconfig.json', {
    module: 'ESNext',
    moduleResolution: 'Node',
    stripInternal: MODE === 'production',
    target: 'ESNext',
  })
  return project
    .src()
    .pipe(gulpIf(SOURCEMAPS, sourcemaps.init()))
    .pipe(project())
    .pipe(gulpIf(SOURCEMAPS, sourcemaps.write('.')))
    .pipe(gulp.dest('./dist'))
})

// --- entrypoints ---

gulp.task('start', run)

gulp.task('dev', () => {
  return gulp
    .watch(
      ['./src/**/*'],
      {
        ignored: ['./src/assets/**/*', './src/test/**/*', './src/types/**/*'],
        ignoreInitial: false,
      },
      gulp.series('build:prisma', run),
    )
    .on('change', run)
})

gulp.task('clean:build', async () => await rm(['./dist']))

gulp.task('build', gulp.series('build:prisma', gulp.parallel('build:copy', 'build:typescript')))

gulp.task('unregister', async () => {
  const { REST, Routes } = await import('discord.js')
  const { DISCORD_APPLICATION_ID, DISCORD_GUILD_ID, DISCORD_TOKEN } =
    (await import('dotenv')).config().parsed ?? {}
  const rest = new REST().setToken(DISCORD_TOKEN)
  await Promise.all([
    async () => {
      if (typeof DISCORD_GUILD_ID === 'string' && DISCORD_GUILD_ID !== '') {
        await rest.put(Routes.applicationGuildCommands(DISCORD_APPLICATION_ID, DISCORD_GUILD_ID), {
          body: [],
        })
      }
    },
    async () => {
      await rest.put(Routes.applicationCommands(DISCORD_APPLICATION_ID), { body: [] })
    },
  ])
})
