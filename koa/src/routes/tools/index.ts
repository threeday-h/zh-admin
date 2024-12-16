import Router from 'koa-router'
import moment from 'moment'
import { Context } from 'koa'
const { v4: uuidv4 } = require('uuid')

// 创建路由实例
const router = new Router({
  //设置前缀
  prefix: '/api'
})

// 相关表名
const dbTable = {
  dict: 'sys_dict_type',
  dictValue: 'sys_dict_data',
  user: 'user'
}

// 上传文件
router.post('/upload', async (ctx: Context) => {
  const { files } = ctx.request as any

  if (!files || !files.file) return ctx.generateResponse(500, 'No file uploaded!')

  const file = files.file

  ctx.generateResponse(200, '上传成功！', {
    size: file.size,
    newFilename: file.newFilename,
    originalFilename: file.originalFilename,
    filePath: file.filepath.split('public/')[1]
  })
})

// 获取字典键值
router.get('/dict', async (ctx: Context) => {
  const orderBy = 'create_time DESC' // 按创建时间降序排序

  const dictResult = await ctx.dbTools.queryRecords({
    db: ctx.db,
    tableName: dbTable.dict,
    filters: { status: 0 },
    orderBy
  })

  let processed: Record<string, any> = {}

  if (dictResult.totalCount > 0) {
    for (let index = 0; index < dictResult.results.length; index++) {
      const { dict_type } = dictResult.results[index]

      const dictValueResult = await ctx.dbTools.queryRecords({
        db: ctx.db,
        tableName: dbTable.dictValue,
        filters: { status: 0, dict_type },
        orderBy: 'dict_sort ASC'
      })

      let children = []

      if (dictValueResult.totalCount > 0) {
        children = dictValueResult.results
      }

      processed[dict_type] = {
        ...dictResult.results[index],
        children
      }
    }
  }

  ctx.generateResponse(200, '获取字典数据成功', processed)
})

module.exports = router
