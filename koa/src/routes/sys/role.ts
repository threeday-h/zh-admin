import Router from 'koa-router'
import { Context } from 'koa'

interface RoleType {
  id?: number
  menu_id?: string
  dict_code?: string
  role_id: number
  // 角色名称
  role_name: string
  // 角色权限字符串
  role_key: string
  // 显示顺序
  role_sort: number
  // 删除标志（0代表存在 2代表删除）
  del_flag: number
  // 创建者
  create_by: string
  // 备注
  remark: string
  // 角色状态（0正常 1停用）
  status: number
}

// 创建路由实例
const router = new Router({
  //设置前缀
  prefix: '/api/sys'
})

// 相关表名
const dbTable = {
  role: 'sys_role',
  menu: 'sys_role_menu',
  dictValue: 'sys_dict_data'
}

// 角色列表
router.get('/list/role', async (ctx: Context) => {
  const { role_name, role_key, status } = ctx.request.query

  // 筛选条件
  const filters = {
    role_name: { value: role_name, fuzzy: true },
    role_key,
    status,
    del_flag: 0
  }

  let { results, totalCount } = await ctx.dbTools.queryRecords({
    db: ctx.db,
    tableName: dbTable.role,
    filters,
    orderBy: 'role_sort ASC'
  })

  for (let index = 0; index < results.length; index++) {
    const item = results[index]

    const menuResult = await ctx.dbTools.queryRecords({
      db: ctx.db,
      tableName: dbTable.menu,
      filters: {
        role_id: item.role_id
      }
    })
    if (menuResult.results.length) {
      results[index].menu_id = menuResult.results[0].menu_id
    } else {
      results[index].menu_id = ''
    }
  }

  ctx.generateResponse(200, '获取数据成功', { list: results, total: totalCount })
})

// 新增角色
router.post('/add/role', async (ctx: Context) => {
  const body = ctx.request.body as RoleType

  const user = ctx.state.user // 获取用户信息

  const { role_name, role_key, menu_id } = body

  if (!role_name || !role_key || !menu_id) return ctx.generateResponse(500, 'role_name role_key menu_id 不为空')

  const { totalCount } = await ctx.dbTools.queryRecords({
    db: ctx.db,
    tableName: dbTable.role,
    filters: { role_key, del_flag: 0 }
  })

  if (totalCount) return ctx.generateResponse(500, '角色已存在')

  // 插入角色字典值
  const dictValue = await ctx.dbTools.insertRecord({
    db: ctx.db,
    tableName: dbTable.dictValue,
    data: { dict_type: 'sys_role', dict_label: role_name, dict_value: role_key, create_time: ctx.dbTools.getCurrentTimestamp() }
  })

  // 插入角色
  const { insertId } = await ctx.dbTools.insertRecord({
    db: ctx.db,
    tableName: dbTable.role,
    data: { ...body, dict_code: dictValue.insertId, create_by: user.nick_name, create_time: ctx.dbTools.getCurrentTimestamp() }
  })

  // 插入角色菜单关系
  await ctx.dbTools.insertRecord({
    db: ctx.db,
    tableName: dbTable.menu,
    data: { role_id: insertId, menu_id }
  })

  return ctx.generateResponse(200, '新增成功')
})

// 修改角色
router.post('/alter/role', async (ctx: Context) => {
  const body = ctx.request.body as RoleType

  const { role_id, menu_id, dict_code } = await body

  if (!role_id || !menu_id) return ctx.generateResponse(500, 'role_id 不为空')

  await ctx.dbTools.updateRecord({
    db: ctx.db,
    tableName: dbTable.role,
    data: { ...body, update_time: ctx.dbTools.getCurrentTimestamp() },
    identifier: { role_id }
  })

  await ctx.dbTools.updateRecord({
    db: ctx.db,
    tableName: dbTable.menu,
    data: { menu_id, update_time: ctx.dbTools.getCurrentTimestamp() },
    identifier: { role_id }
  })

  // 修改角色字典值
  await ctx.dbTools.updateRecord({
    db: ctx.db,
    tableName: dbTable.dictValue,
    data: { dict_type: 'sys_role', dict_label: body.role_name, dict_value: body.role_key },
    identifier: { dict_code }
  })

  return ctx.generateResponse(200, '修改成功')
})

// 删除角色
router.post('/delete/role', async (ctx: Context) => {
  const body = ctx.request.body as RoleType

  const { role_id, dict_code } = await body

  if (!role_id) return ctx.generateResponse(500, 'role_id 不为空')

  await ctx.dbTools.updateRecord({
    db: ctx.db,
    tableName: dbTable.role,
    data: { del_flag: 2, update_time: ctx.dbTools.getCurrentTimestamp() },
    identifier: { role_id }
  })

  await ctx.dbTools.deleteRecord({
    db: ctx.db,
    tableName: dbTable.menu,
    identifier: { role_id }
  })

  // 删除字典值
  await ctx.dbTools.deleteRecord({
    db: ctx.db,
    tableName: dbTable.dictValue,
    identifier: { dict_code }
  })

  return ctx.generateResponse(200, '删除成功')
})

module.exports = router
