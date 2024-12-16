import Router from 'koa-router'
import multer from '@koa/multer'
import fs from 'fs'
import path from 'path'
import { Context } from 'koa'

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

// 动态生成上传目录
function createFolder() {
  const dateFolder = new Date().toISOString().split('T')[0].replace(/-/g, '')
  const uploadDir = path.join(__dirname, `../../../public/upload/${dateFolder}`)

  // 检查目录是否存在，不存在则创建
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
  }

  return uploadDir // 返回生成的目录路径
}

// 设置上传目录
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = createFolder() // 动态生成上传路径
      cb(null, uploadDir)
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname) // 获取文件扩展名
      const basename = path.basename(file.originalname, ext)
      cb(null, `${basename}-${Date.now()}${ext}`) // 生成唯一文件名
    }
  }),
  limits: {
    fileSize: 10 * 1024 * 1024 // 限制文件大小为 10MB
  }
})

router.post('/upload', upload.single('file'), async (ctx: Context) => {
  const file = ctx.file // 获取上传的文件

  if (!file) return ctx.generateResponse(500, 'No file uploaded!')

  ctx.generateResponse(200, '上传成功！', {
    size: file.size,
    newFilename: file.filename,
    originalFilename: file.originalname,
    filePath: file.path.split('public/')[1]
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
