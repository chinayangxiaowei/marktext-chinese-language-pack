'use strict'

process.env.NODE_ENV = 'production'

const { say } = require('cfonts')
const path = require('path')
const chalk = require('chalk')
const del = require('del')
const fs = require('fs-extra')
const webpack = require('webpack')
const Listr = require('listr')


function doTranslate() {
  let toLang = ''
  if (process.env['lang']){
    toLang = process.env['lang']
  }
  if (toLang == '') return true
  require('ts-node/register')
  const { markTextAsarTranslate } = require('../marktext_asar_translate')
  console.log(process.env['lang'])
  const longRootPath = './'
  const jsRootPath = './dist/electron/'
  const mainJsFileName = path.join(jsRootPath, './main.js')
  const outMainJsFileName = path.join(jsRootPath, './main.js')
  const rendererJsFileName = path.join(jsRootPath, './renderer.js')
  const outRendererJsFileName = path.join(jsRootPath, './renderer.js')
  return markTextAsarTranslate(longRootPath, toLang, mainJsFileName, outMainJsFileName, rendererJsFileName, outRendererJsFileName)
}


const mainConfig = require('./webpack.main.config')
const rendererConfig = require('./webpack.renderer.config')

const doneLog = chalk.bgGreen.white(' DONE ') + ' '
const errorLog = chalk.bgRed.white(' ERROR ') + ' '
const okayLog = chalk.bgBlue.white(' OKAY ') + ' '
const isCI = process.env.CI || false

if (process.env.BUILD_TARGET === 'clean') clean()
else if (process.env.BUILD_TARGET === 'web') web()
else build()

function clean () {
  del.sync(['build/*', '!build/icons', '!build/icons/icon.*'])
  console.log(`\n${doneLog}\n`)
  process.exit()
}

async function build () {
  greeting()

  del.sync(['dist/electron/*', '!.gitkeep'])
  del.sync(['static/themes/*'])

  const from = path.resolve(__dirname, '../src/muya/themes')
  const to = path.resolve(__dirname, '../static/themes')
  await fs.copy(from, to)

  let results = ''

  const tasks = new Listr(
    [
      {
        title: 'building main process',
        task: async () => {
          await pack(mainConfig)
            .then(result => {
              results += result + '\n\n'
            })
            .catch(err => {
              console.log(`\n  ${errorLog}failed to build main process`)
              console.error(`\n${err}\n`)
              process.exit(1)
            })
        }
      },
      {
        title: 'building renderer process',
        task: async () => {
          await pack(rendererConfig)
            .then(result => {
              results += result + '\n\n'
            })
            .catch(err => {
              console.log(`\n  ${errorLog}failed to build renderer process`)
              console.error(`\n${err}\n`)
              process.exit(1)
            })
        }
      }
    ],
    { concurrent: 2 }
  )

  await tasks
    .run()
    .then(() => {

      console.log('do translate process')
      if (!doTranslate()){
        process.exit(1)
      }

      process.stdout.write('\x1B[2J\x1B[0f')
      console.log(`\n\n${results}`)
      console.log(`${okayLog}take it away ${chalk.yellow('`electron-builder`')}\n`)
      process.exit()
    })
    .catch(err => {
      process.exit(1)
    })
}

function pack (config) {
  return new Promise((resolve, reject) => {
    webpack(config, (err, stats) => {
      if (err) reject(err.stack || err)
      else if (stats.hasErrors()) {
        let err = ''

        stats.toString({
          chunks: false,
          colors: true
        })
        .split(/\r?\n/)
        .forEach(line => {
          err += `    ${line}\n`
        })

        reject(err)
      } else {
        resolve(stats.toString({
          chunks: false,
          colors: true
        }))
      }
    })
  })
}

function greeting () {
  const cols = process.stdout.columns
  let text = ''

  if (cols > 155) text = 'building marktext'
  else if (cols > 76) text = 'building|marktext'
  else text = false

  if (text && !isCI) {
    say(text, {
      colors: ['yellow'],
      font: 'simple3d',
      space: false
    })
  } else {
    console.log(chalk.yellow.bold('\n  building marktext'))
  }
}
