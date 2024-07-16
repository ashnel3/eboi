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
 * Delete files
 * @param {string[]} paths
 * @returns {Promise<void>}
 */
const rm = async (paths) => {
  await Promise.all(
    paths.map(async (p) => {
      await fs.rm(path.resolve(p), { force: true, recursive: true })
    }),
  )
}

// --- sub-tasks ---

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

gulp.task('build:copy', () => {
  return gulp
    .src(['assets/**/*', 'config/**/*'], { cwd: './src', cwdbase: true })
    .pipe(gulp.dest('./dist'))
})

gulp.task('start:run', (cb) => {
  const child = spawn(
    'node',
    [
      '--import',
      'data:text/javascript,import { register } from "node:module"; import { pathToFileURL } from "node:url"; register("ts-node/esm", pathToFileURL("./"));',
      '-r',
      'dotenv/config',
      './src/index.ts',
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
  let error
  child
    .on('error', (err) => {
      error = err
    })
    .on('exit', () => cb(error))
})

// --- entrypoints ---

gulp.task('start', gulp.series('start:run'))

gulp.task('clean', async () => await rm(['./dist']))

gulp.task('build', gulp.parallel('build:copy', 'build:typescript'))
