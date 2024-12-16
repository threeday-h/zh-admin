import Router from 'koa-router'
import { Context } from 'koa'
import { aesEncrypt, aesDecrypt, setToken } from '@/utils/jwt'
import CaptchaController from '@/utils/captcha'

const geoip = require('geoip-lite')
const useragent = require('useragent')

interface User {
  avatar?: string
  user_id?: number
  code?: string
  user_name: string
  password: string
}

// 创建路由实例
const router = new Router({
  //设置前缀
  prefix: '/api/sys'
})

const captcha = new CaptchaController()

const dbTable = {
  user: 'sys_user',
  role: 'sys_role'
}

// 图形验证码
router.get('/captcha', async (ctx: Context) => {
  captcha.getCaptcha(ctx)
})

// 新增
router.post('/add/user', async (ctx: Context) => {
  const body = ctx.request.body as User
  // console.log(ctx.state.user);

  const { nick_name } = ctx.state.user

  let { user_name, password, avatar } = body

  if (!user_name || !password) return ctx.generateResponse(500, 'user_name password 不为空')

  // 查询用户是否存在
  const { totalCount } = await ctx.dbTools.queryRecords({
    db: ctx.db,
    tableName: dbTable.user,
    filters: { user_name, del_flag: 0 }
  })
  if (totalCount) return ctx.generateResponse(500, '用户已存在')

  // 加密 密码
  password = aesEncrypt(password)

  await ctx.dbTools.insertRecord({
    db: ctx.db,
    tableName: dbTable.user,
    data: {
      ...body,
      avatar: avatar ?? 'upload/sys/avater.gif',
      password,
      nick_name: user_name,
      create_by: nick_name,
      create_time: ctx.dbTools.getCurrentTimestamp()
    }
  })

  ctx.generateResponse(200, '注册成功')
})

// 登录
router.post('/login/user', async (ctx: Context) => {
  const body = ctx.request.body as User

  const { user_name, password, code } = body

  if (!user_name || !password || !code) return ctx.generateResponse(500, 'user_name password code 不为空')

  if (code !== ctx.session.captcha) {
    ctx.generateResponse(500, '验证码不正确')
    delete ctx.session.captcha
    return
  }

  // 查询用户是否存在
  const userResult = await ctx.dbTools.queryRecords({
    db: ctx.db,
    tableName: dbTable.user,
    filters: { user_name, del_flag: 0 }
  })
  if (!userResult.totalCount) return ctx.generateResponse(500, '用户不存在')
  if (Number(userResult.results[0].status)) return ctx.generateResponse(500, '账号已注销')

  // 获取客户端ip地址
  const clientIP = ctx.request.header['X-Forwarded-For'] || ctx.request.header['x-real-ip'] || '127.0.0.1'
  console.log('clientIP', clientIP)
  // 获取城市信息
  const geo = geoip.lookup(clientIP)
  const country = geo ? geo.country : '未知国家'
  const region = geo ? geo.region : '未知省份'
  const city = geo ? geo.city : '未知城市'

  // 获取系统信息
  const agent = useragent.parse(ctx.request.header['user-agent'])
  // 操作系统信息
  const os = agent.os.toString()
  // 浏览器信息
  const browser = agent.toAgent()

  // 修改登录时间
  await ctx.dbTools.updateRecord({
    db: ctx.db,
    tableName: dbTable.user,
    data: { login_os: os, login_browser: browser, login_address: `${country},${region},${city}`, login_ip: clientIP, login_date: ctx.dbTools.getCurrentTimestamp() },
    identifier: { user_name, del_flag: 0 }
  })

  // 查询最新信息
  const { results } = await ctx.dbTools.queryRecords({
    db: ctx.db,
    tableName: dbTable.user,
    filters: { user_name, del_flag: 0 }
  })

  // 查询角色
  const roleResult = await ctx.dbTools.queryRecords({
    db: ctx.db,
    tableName: dbTable.role,
    filters: { role_key: results[0].role_key, del_flag: 0 }
  })

  let userInfo = results[0]

  // 解密 密码
  userInfo.password_new = aesDecrypt(userInfo.password)

  if (roleResult.results.length) {
    userInfo.role_id = roleResult.results[0].role_id
    userInfo.role_name = roleResult.results[0].role_name
  } else {
    userInfo.role_id = null
  }

  if (userInfo.password_new !== password) return ctx.generateResponse(500, '密码错误')

  delete userInfo.password_new

  ctx.generateResponse(200, '登录成功', {
    userInfo,
    token: setToken(userInfo)
  })
})

// 修改用户信息
router.post('/alter/user', async (ctx: Context) => {
  let body = ctx.request.body as User

  if (body.password) body.password = aesEncrypt(body.password)

  const { user_id, nick_name } = ctx.state.user // 获取用户信息

  await ctx.dbTools.updateRecord({
    db: ctx.db,
    tableName: dbTable.user,
    data: { ...body, update_by: nick_name, update_time: ctx.dbTools.getCurrentTimestamp() },
    identifier: { user_id: body.user_id ?? user_id }
  })

  if (!body.user_id) {
    const { results } = await ctx.dbTools.queryRecords({
      db: ctx.db,
      tableName: dbTable.user,
      filters: { user_id: user_id, del_flag: 0 }
    })

    let userInfo = results[0]

    ctx.generateResponse(200, '修改成功', {
      userInfo: userInfo,
      token: setToken(userInfo)
    })
  } else {
    ctx.generateResponse(200, '修改成功')
  }
})

// 修改用户密码
router.post('/alter/password', async (ctx: Context) => {
  const body = ctx.request.body

  const { old_pass, new_pass, user_name } = body as { old_pass: string; new_pass: string; user_name: string }

  const { user_id, password } = ctx.state.user // 获取用户信息

  // 原密码
  const show_password = aesDecrypt(password)

  if (show_password !== old_pass) return ctx.generateResponse(500, '原密码不正确')

  await ctx.dbTools.updateRecord({
    db: ctx.db,
    tableName: dbTable.user,
    data: { password: aesEncrypt(new_pass), user_name, update_time: ctx.dbTools.getCurrentTimestamp() },
    identifier: { user_id }
  })

  const { results } = await ctx.dbTools.queryRecords({
    db: ctx.db,
    tableName: dbTable.user,
    filters: { user_id, del_flag: 0 }
  })

  let userInfo = results[0]

  ctx.generateResponse(200, '修改成功', {
    userInfo: userInfo,
    token: setToken(userInfo)
  })
})

// 用户列表
router.get('/list/user', async (ctx: Context) => {
  const { nick_name, status, phonenumber, create_time, pageNum, pageSize } = ctx.request.query as {
    nick_name: string
    status: string
    phonenumber: string
    create_time: string
    pageNum: string
    pageSize: string
  }

  // 筛选条件
  const filters = {
    nick_name: { value: nick_name, fuzzy: true },
    phonenumber,
    status,
    del_flag: 0,
    create_time: { value: create_time, fuzzy: true }
  }

  // 获取所有角色
  let roleData = await ctx.dbTools.queryRecords({
    db: ctx.db,
    tableName: dbTable.role,
    filters: { del_flag: 0 }
  })

  // 筛选和获取所有菜单记录
  const { results, totalCount } = await ctx.dbTools.queryRecords({
    db: ctx.db,
    tableName: dbTable.user,
    filters,
    pageNum: Number(pageNum),
    pageSize: Number(pageSize),
    orderBy: 'create_time DESC'
  })

  ctx.generateResponse(200, '获取用户列表成功', {
    list: results.map((i: { role_key: string; role_name: string; password: string }) => {
      const find = roleData.results.find((ii: { role_key: string }) => ii.role_key == i.role_key)
      if (find) {
        i.role_name = find.role_name
        i.password = aesDecrypt(i.password)
      }

      return i
    }),
    total: totalCount
  })
})

// 删除
router.post('/delete/user', async (ctx: Context) => {
  const body = ctx.request.body as User

  const { user_id } = body

  if (!user_id) return ctx.generateResponse(500, 'user_id 不为空')

  const { nick_name } = ctx.state.user

  await ctx.dbTools.updateRecord({
    db: ctx.db,
    tableName: dbTable.user,
    data: { del_flag: 2, update_by: nick_name, update_time: ctx.dbTools.getCurrentTimestamp() },
    identifier: { user_id }
  })

  return ctx.generateResponse(200, '删除成功')
})

module.exports = router
