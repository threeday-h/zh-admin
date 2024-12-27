import fs from 'fs'
import mysql from 'mysql2/promise'
import config from './src/utils/config'

async function getTableStructure(dbConfig: any, tableName: string) {
  const connection = await mysql.createConnection(dbConfig)
  const [rows] = await connection.execute(`SHOW COLUMNS FROM ${tableName}`)
  await connection.end()
  return rows
}

function generateTypeScriptInterface(tableName: string, columns: any[]) {
  const interfaceName = `${capitalize(tableName)}Type`
  const fields = columns
    .map((col) => {
      const optional = col.Null === 'YES' ? '?' : ''
      return `  ${col.Field}${optional}: ${mapSqlTypeToTsType(col.Type)};`
    })
    .join('\n')

  return `interface ${interfaceName} {\n${fields}\n}\n`
}

function mapSqlTypeToTsType(sqlType: string): string {
  if (sqlType.includes('int')) return 'number'
  if (sqlType.includes('varchar') || sqlType.includes('text')) return 'string'
  if (sqlType.includes('date') || sqlType.includes('time')) return 'Date'
  return 'any'
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function generateCrudCode(tableName: string, columns: any[], prefix: string) {
  const interfaceName = `${capitalize(tableName)}Type`
  const primaryKey = columns.find((col) => col.Key === 'PRI')?.Field || 'id'

  return `
import Router from 'koa-router';
import { Context } from 'koa';

${generateTypeScriptInterface(tableName, columns)}

const router = new Router({
  prefix: '${prefix}/${tableName}'
});

// 获取所有记录
router.get('/list', async (ctx: Context) => {
  const { pageNum, pageSize, ...filters } = ctx.request.query;
  const results = await ctx.dbTools.queryRecords({
    db: ctx.db,
    tableName: '${tableName}',
    filters,
    pageNum: Number(pageNum),
    pageSize: Number(pageSize),
  });
  ctx.generateResponse(200, '获取数据成功', results);
});

// 获取单个记录
router.get('/:id', async (ctx: Context) => {
  const { id } = ctx.params;
  const results = await ctx.dbTools.queryRecords({
    db: ctx.db,
    tableName: '${tableName}',
    filters: { ${primaryKey}: id },
  });
  ctx.generateResponse(200, '获取数据成功', results);
});

// 新增记录
router.post('/add', async (ctx: Context) => {
  const body = ctx.request.body as ${interfaceName};
  await ctx.dbTools.insertRecord({
    db: ctx.db,
    tableName: '${tableName}',
    data: body,
  });
  ctx.generateResponse(200, '新增成功');
});

// 修改记录
router.post('/update/:id', async (ctx: Context) => {
  const { id } = ctx.params;
  const body = ctx.request.body as ${interfaceName};
  await ctx.dbTools.updateRecord({
    db: ctx.db,
    tableName: '${tableName}',
    data: body,
    identifier: { ${primaryKey}: id },
  });
  ctx.generateResponse(200, '修改成功');
});

// 删除记录
router.post('/delete/:id', async (ctx: Context) => {
  const { id } = ctx.params;
  await ctx.dbTools.deleteRecord({
    db: ctx.db,
    tableName: '${tableName}',
    identifier: { ${primaryKey}: id },
  });
  ctx.generateResponse(200, '删除成功');
});

export default router;
`
}

async function main() {
  const dbConfig = config.mysql
  // 表名
  const tableName = 'sys_menu'
  // 接口前缀
  const prefix = '/api'
  const columns: any = await getTableStructure(dbConfig, tableName)
  const crudCode = generateCrudCode(tableName, columns, prefix)
  
  fs.writeFile('curd.text', crudCode, 'utf8', (err) => {
    if (err) throw err
    console.log('File has been saved!')
  })
}

main().catch(console.error)
