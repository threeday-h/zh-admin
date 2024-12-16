import Koa, { Context } from 'koa'
import fs from 'fs'
import path from 'path'
import https from 'https'
import config from '@/utils/config'
import jwt from 'koa-jwt'
import cors from '@koa/cors'
import session from 'koa-session'
import bodyParser from 'koa-bodyparser'
const { koaBody } = require('koa-body')

// 全局 定时任务
require('@/cron/index')

const { prot, mysql } = require('@/utils/config')
// mysql
const createDbConnection = require('@/mysql/index')
// 工具类
import { dbTools } from '@/mysql/tools'

// 静态资源
const staticResource = require('koa-static')

// 工具
const toolsRouter = require('@/routes/tools/index') // 上传
// 系统模块
const sysDict = require('@/routes/sys/dict') // 字典
const sysUser = require('@/routes/sys/user') // 用户
const sysRoute = require('@/routes/sys/route') // 路由
const sysRole = require('@/routes/sys/role') // 路由

class App {
  private app: Koa // Koa 实例
  private listenPort: number // 监听端口
  // 路由实例
  private routes: any = [toolsRouter, sysDict, sysUser, sysRoute, sysRole]

  constructor(app: Koa) {
    this.app = app
    this.listenPort = prot

    // 初始化中间件
    this.initializeMiddleware()
    this.initialize()
    this.initializeRoutes()
  }

  // 响应函数
  private generateResponse(ctx: Context, code: number, msg: string, data?: any) {
    ctx.status = 200
    ctx.body = {
      code,
      data,
      msg: msg ?? '未知错误'
    }
  }

  // 初始化中间件
  private initializeMiddleware() {
    // 设置 session 的 secret
    this.app.keys = [config.session.key]
    this.app.use(session(config.session, this.app))

    this.app.use(
      bodyParser({
        enableTypes: ['json', 'form', 'text']
      })
    )

    // 跨域
    this.app.use(
      cors({
        credentials: true
      })
    )

    // 设置静态资源目录
    const staticPath = path.join(__dirname, '../../public')

    this.app.use(staticResource(staticPath))
  }

  // 初始化路由
  private initializeRoutes() {
    this.app.use(
      jwt({
        secret: config.token.singKey,
        algorithms: ['HS256'],
        debug: true
      }).unless({
        path: config.token.unRouter
      })
    )
    this.routes.forEach((router: any) => {
      this.app.use(router.routes())
      this.app.use(router.allowedMethods())
    })
  }

  // 挂载全局中间件
  private initialize() {
    this.app.use(async (ctx: Context, next: () => Promise<any>) => {
      // 挂载响应函数
      ctx.generateResponse = (code: number, msg: string, data?: any) => {
        this.generateResponse(ctx, code, msg, data)
      }

      // 挂载 db 函数
      ctx.dbTools = dbTools

      // 获取数据库连接
      const connection = await createDbConnection(mysql)
      // 将连接存储到 ctx 中
      ctx.db = connection

      try {
        await next()
      } catch (error: any) {
        console.log('error', error.message)

        if (error.message === 'Token not found' || error.message === 'jwt expired' || error.message === 'jwt malformed' || error.message === 'invalid signature' || error.message === 'invalid token') {
          ctx.generateResponse(401, '无效的或过期的 Token')
        } else {
          ctx.generateResponse(500, error)
        }
      } finally {
        // 释放连接
        await connection.end()
      }
    })
  }

  // 启动服务
  public listen() {
    // 构建 SSL 证书文件的绝对路径
    // const privateKeyPath = path.join(__dirname, '../../public', 'static', 'xx.key')
    // const certificatePath = path.join(__dirname, '../../public', 'static', 'xx.crt')

    // 加载 SSL 证书
    // const options = {
    //   key: fs.readFileSync(privateKeyPath),
    //   cert: fs.readFileSync(certificatePath)
    // }

    // const server = https.createServer(options, this.app.callback())

    // server.listen(this.listenPort, () => {
    //   console.log(`Server is running on http://localhost:${this.listenPort}`)
    // })

    this.app.listen(this.listenPort, () => {
      console.log(`Server is running on http://localhost:${this.listenPort}`)
    })
  }
}

module.exports = App
