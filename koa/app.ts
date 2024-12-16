import Koa from 'koa'

const path = require('path')

const moduleAlias = require('module-alias')

moduleAlias.addAlias('@', path.join(__dirname, '/src'))

const App = require('@/utils/index')

const app = new Koa()

const appConfig = new App(app) // 将 Koa 实例传入 App 类

appConfig.listen()
