import Router from 'koa-router'
import { Context } from 'koa'

interface DictType {
  id?: number
  parent_id?: number
  icon: string
  menu_name: string
  module_name: string
}

// 创建路由实例
const router = new Router({
  //设置前缀
  prefix: '/api/sys'
})

// 相关表名
const dbTable = {
  menu: 'sys_menu',
  role: 'sys_role',
  role_menu: 'sys_role_menu'
}

// 获取菜单列表

router.get('/list/route/menu', async (ctx: Context) => {
  const { menu_name, status, module_name } = ctx.request.query
  const { role_key, role_id } = ctx.state.user

  // 初始化菜单 ID 数组
  let menu_id: string[] = []
  if (role_key !== 'admin') {
    // 查询角色菜单
    const roleMenuResult = await ctx.dbTools.queryRecords({
      db: ctx.db,
      tableName: dbTable.role_menu,
      filters: { role_id }
    })
    menu_id = roleMenuResult.results[0].menu_id.split(',')
  }

  // 筛选条件
  const filters = {
    menu_name: { value: menu_name, fuzzy: true },
    module_name: { value: module_name, fuzzy: true },
    status,
    del_flag: 0
  }

  // 获取所有菜单记录
  const { results: allMenus } = await ctx.dbTools.queryRecords({
    db: ctx.db,
    tableName: dbTable.menu,
    filters
  })

  // 用 allMenus 保持原始数据，防止丢失
  let results = [...allMenus]

  // 如果有菜单 ID 筛选
  if (menu_id.length) {
    // 用 Set 去重存储父菜单 ID，避免重复
    const parentMenuIdSet = new Set<number>()

    // 过滤出符合条件的菜单，并收集父菜单的 parent_id
    results = results.filter((item: { menu_id: number; parent_id: number }) => {
      if (menu_id.includes(item.menu_id.toString())) {
        if (item.parent_id) parentMenuIdSet.add(item.parent_id) // 收集父菜单 ID
        return true
      }
      return false
    })

    // 补充缺失的父菜单
    const missingParents = Array.from(parentMenuIdSet).filter((parentId) => !results.some((item: { menu_id: number }) => item.menu_id === parentId))

    // 找到缺失的父菜单并添加到 results 中
    missingParents.forEach((parentId) => {
      const parentMenu = allMenus.find((item: { menu_id: number }) => item.menu_id === parentId)
      if (parentMenu) {
        results.push(parentMenu)
      }
    })
  }

  // 根据 order_num 排序
  results.sort((a: { order_num: number }, b: { order_num: number }) => (a.order_num || 0) - (b.order_num || 0))

  // 递归函数，用于构建层级菜单
  const buildMenuTree = (parentId: number): Array<any> => {
    return results
      .filter((item: { parent_id: number; menu_id: number }) => item.parent_id === parentId)
      .map((item: any) => ({
        ...item,
        id: item.menu_id,
        name: item.menu_name,
        index: item.path.replace(/^\//, '').replace(/\//g, '-'),
        label: item.menu_name,
        value: item.menu_id, // 修正为 item.menu_id
        children: buildMenuTree(item.menu_id) // 递归查找子菜单
      }))
      .sort((a: { order_num: number }, b: { order_num: number }) => (a.order_num || 0) - (b.order_num || 0))
  }

  // 构建根级菜单列表
  const menuTree = buildMenuTree(0) // 从根节点开始构建

  ctx.generateResponse(200, '查询成功', { list: menuTree })
})

// 新增菜单
router.post('/add/route/menu', async (ctx: Context) => {
  const body = ctx.request.body as DictType

  const user = ctx.state.user // 获取用户信息

  const { menu_name, icon, parent_id, module_name } = body

  if (!menu_name || !icon || !module_name) return ctx.generateResponse(500, 'menu_name、icon、module_name 不能为空')

  const { results, totalCount } = await ctx.dbTools.queryRecords({
    db: ctx.db,
    tableName: dbTable.menu,
    filters: { menu_name }
  })

  if (totalCount) return ctx.generateResponse(500, '菜单名称不可重复')

  await ctx.dbTools.insertRecord({
    db: ctx.db,
    tableName: dbTable.menu,
    data: { ...body, parent_id: !parent_id ? 0 : parent_id, create_by: user.nick_name, create_time: ctx.dbTools.getCurrentTimestamp() }
  })

  ctx.generateResponse(200, '新增成功')
})

// 删除菜单
router.post('/delete/route/menu', async (ctx: Context) => {
  const body = ctx.request.body as { menu_id: number }

  const { menu_id } = body

  if (!menu_id) return ctx.generateResponse(500, 'menu_id 不为空')

  await ctx.dbTools.updateRecord({
    db: ctx.db,
    tableName: dbTable.menu,
    data: { del_flag: 2, update_time: ctx.dbTools.getCurrentTimestamp() },
    identifier: { menu_id }
  })

  ctx.generateResponse(200, '删除成功')
})

// 修改菜单
router.post('/alter/route/menu', async (ctx: Context) => {
  const body = ctx.request.body as DictType & { menu_id: number }

  const { menu_id, menu_name, icon, module_name } = body

  if (!menu_id) return ctx.generateResponse(500, 'menu_id 不能为空')
  if (!menu_name || !icon || !module_name) return ctx.generateResponse(500, 'menu_name、icon、module_name 不能为空')

  await ctx.dbTools.updateRecord({
    db: ctx.db,
    tableName: dbTable.menu,
    data: { ...body, update_time: ctx.dbTools.getCurrentTimestamp() },
    identifier: { menu_id }
  })

  ctx.generateResponse(200, '修改成功')
})

module.exports = router
