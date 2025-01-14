import Koa, { Context } from "koa"
import path from "path"
import config from "@/utils/config"
import jwt from "koa-jwt"
import jsonwebtoken from "jsonwebtoken"
import cors from "@koa/cors"
import session from "koa-session"
import bodyParser from "koa-bodyparser"
import log4js from "koa-log4"
import koaCookie from "koa-cookie"
// 静态资源
import staticResource from "koa-static"

// 配置 log4js，启用自定义布局
log4js.configure({
  appenders: {
    out: { type: "console" },
    app: {
      type: "file",
      filename: "application.log",
      maxLogSize: 10485760, // 10 MB
      backups: 3, // 保留3个备份文件
      compress: true, // 压缩备份文件
      layout: {
        type: "pattern",
        pattern: "[%d{yyyy-MM-dd hh:mm:ss}] [%p] %c - %m"
      }
    }
  },
  categories: {
    default: { appenders: ["out", "app"], level: "info" }
  }
})

// 获取 logger 实例
const logger = log4js.getLogger("app")

const { prot, mysql } = config

// mysql
const createDbConnection = require("@/mysql/index")
// 工具类
import { dbTools } from "@/mysql/tools"

// 全局 定时任务
import "@/cron/index"

// 工具
const toolsRouter = require("@/routes/tools/index") // 上传
// 系统模块
const sysDict = require("@/routes/sys/dict") // 字典
const sysUser = require("@/routes/sys/user") // 用户
const sysRoute = require("@/routes/sys/route") // 路由
const sysRole = require("@/routes/sys/role") // 路由
const sysDeepseek = require("@/routes/sys/deepseek") // 路由

class App {
  private app: Koa // Koa 实例
  private listenPort: number // 监听端口
  // 路由实例
  private routes: any = [toolsRouter, sysDict, sysUser, sysRoute, sysRole, sysDeepseek]

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
      msg: msg ?? "未知错误"
    }
  }

  // 初始化中间件
  private initializeMiddleware() {
    // 使用 koa-cookie 中间件
    this.app.use(koaCookie())
    // 使用 koa-log4 中间件
    this.app.use(log4js.koaLogger(logger, { level: "auto" }))
    // 设置 session 的 secret
    this.app.keys = [config.session.key]
    this.app.use(session(config.session, this.app))

    this.app.use(
      bodyParser({
        enableTypes: ["json", "form", "text"]
      })
    )
    // 跨域
    this.app.use(
      cors({
        credentials: true
      })
    )

    // 设置静态资源目录
    const staticPath = path.join(process.cwd(), "public")

    this.app.use(staticResource(staticPath))
  }

  // 初始化路由
  private initializeRoutes() {
    this.app.use(
      jwt({
        secret: config.token.singKey,
        algorithms: ["HS256"],
        getToken: (ctx: Context) => {
          const token = ctx.cookies.get("token") // 使用 koa-cookie 获取 token
          return token
        }
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

      // 获取用户信息
      const token = ctx.cookies.get("token")

      if (token) {
        try {
          const decoded = jsonwebtoken.verify(token, config.token.singKey, { algorithms: ["HS256"] })
          console.log("Decoded token:", decoded)
          ctx.state.user = decoded // 将解码后的用户信息存储到 ctx.state.user
          // 存入日志
          logger.info(`${JSON.stringify(decoded)} 访问了 ${ctx.request.url}`)
        } catch (err) {
          console.error("Token verification failed:", err.message)
        }
      }

      try {
        await next()
      } catch (error: any) {
        console.log("error", error.message)

        if (
          error.message === "Token not found" ||
          error.message === "jwt expired" ||
          error.message === "jwt malformed" ||
          error.message === "invalid signature" ||
          error.message === "invalid token"
        ) {
          ctx.generateResponse(401, "无效的或过期的 Token")
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
