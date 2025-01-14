import Router from "koa-router"
import { Context } from "koa"

interface DictType {
  dict_id?: number
  dict_name: string
  dict_type: string
}

interface DictValue {
  dict_code?: number
  dict_sort?: number
  dict_type?: string
  dict_value?: string
  dict_label?: string
}

// 创建路由实例
const router = new Router({
  //设置前缀
  prefix: "/api/sys"
})

// 相关表名
const dbTable = {
  dict: "sys_dict_type",
  dictValue: "sys_dict_data"
}

// 新增字典类型
router.post("/add/dict/type", async (ctx: Context) => {
  const body = ctx.request.body as DictType

  const { dict_name, dict_type } = body

  if (!dict_name || !dict_type) return ctx.generateResponse(500, "dict_name dict_type 不为空")

  const { results, totalCount } = await ctx.dbTools.queryRecords({
    db: ctx.db,
    tableName: dbTable.dict,
    filters: { dict_type }
  })

  if (totalCount) return ctx.generateResponse(500, "字典类型已存在")

  await ctx.dbTools.insertRecord({
    db: ctx.db,
    tableName: dbTable.dict,
    data: { ...body, create_time: ctx.dbTools.getCurrentTimestamp() }
  })

  ctx.generateResponse(200, "新增成功")
})

// 修改字典类型
router.post("/alter/dict/type", async (ctx: Context) => {
  const body = ctx.request.body as DictType

  const { dict_id, dict_name, dict_type } = body

  if (!dict_id || !dict_name || !dict_type) return ctx.generateResponse(500, "dict_id, dict_name dict_type 不为空")

  await ctx.dbTools.updateRecord({
    db: ctx.db,
    tableName: dbTable.dict,
    data: { ...body, update_time: ctx.dbTools.getCurrentTimestamp() },
    identifier: { dict_id }
  })

  ctx.generateResponse(200, "修改成功")
})

// 删除字典类型
router.post("/delete/dict/type", async (ctx: Context) => {
  const body = ctx.request.body as DictType

  const { dict_id } = body

  if (!dict_id) return ctx.generateResponse(500, "dict_id 不为空")

  await ctx.dbTools.deleteRecord({
    db: ctx.db,
    tableName: dbTable.dict,
    identifier: { dict_id }
  })

  ctx.generateResponse(200, "删除成功")
})

// 查询字典类型
router.get("/list/dict/type", async (ctx: Context) => {
  const { dict_name, dict_type, pageNum, pageSize } = ctx.request.query

  // 筛选条件
  const filters = {
    dict_name: { value: dict_name, fuzzy: true },
    dict_type
  }

  const orderBy = "create_time DESC" // 按创建时间降序排序

  const { results, totalCount } = await ctx.dbTools.queryRecords({
    db: ctx.db,
    tableName: dbTable.dict,
    filters,
    pageNum: Number(pageNum),
    pageSize: Number(pageSize),
    orderBy
  })

  ctx.generateResponse(200, "获取数据成功", { list: results, total: totalCount })
})

// 字典值列表
router.get("/list/dict/value", async (ctx: Context) => {
  const { dict_type, pageNum, pageSize } = ctx.request.query

  // 筛选条件
  const filters = {
    dict_type,
    del_flag: 0
  }

  const orderBy = "dict_sort ASC" // 按创建时间降序排序

  const { results, totalCount } = await ctx.dbTools.queryRecords({
    db: ctx.db,
    tableName: dbTable.dictValue,
    filters,
    pageNum: Number(pageNum),
    pageSize: Number(pageSize),
    orderBy
  })

  ctx.generateResponse(200, "获取数据成功", { list: results, total: totalCount })
})

// 新增字典值
router.post("/add/dict/value", async (ctx: Context) => {
  const body = ctx.request.body as DictValue

  const { dict_type, dict_value, dict_label, dict_sort } = body

  if (!dict_type || !dict_value || !dict_label || !dict_sort)
    return ctx.generateResponse(500, "dict_type,dict_value,dict_label,dict_sort 不为空")

  await ctx.dbTools.insertRecord({
    db: ctx.db,
    tableName: dbTable.dictValue,
    data: { ...body, create_time: ctx.dbTools.getCurrentTimestamp() }
  })

  ctx.generateResponse(200, "新增成功")
})

// 修改
router.post("/alter/dict/value", async (ctx: Context) => {
  const body = ctx.request.body as DictValue

  const { dict_code } = body

  if (!dict_code) return ctx.generateResponse(500, "dict_code 不为空")

  await ctx.dbTools.updateRecord({
    db: ctx.db,
    tableName: dbTable.dictValue,
    data: { ...body, update_time: ctx.dbTools.getCurrentTimestamp() },
    identifier: { dict_code }
  })

  ctx.generateResponse(200, "修改成功")
})

// 删除
router.post("/delete/dict/value", async (ctx: Context) => {
  const body = ctx.request.body as DictValue

  const { dict_code } = body

  if (!dict_code) return ctx.generateResponse(500, "dict_code 不为空")

  await ctx.dbTools.deleteRecord({
    db: ctx.db,
    tableName: dbTable.dictValue,
    identifier: { dict_code }
  })

  ctx.generateResponse(200, "删除成功")
})

module.exports = router
