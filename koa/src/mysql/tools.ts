interface Column {
  Field: string
  Type: string
  Null: string
  Key: string
  Default: any
  Extra: string
}

// 生成当前时间
function getCurrentTimestamp() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0') // 月份从 0 开始
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

/**
 * @description: 增
 * @param {any} db 数据库连接对象
 * @param {string} tableName 表名
 * @param {Record<string, any>} data  包含要新增字段及其新值的对象
 * @return {*}
 */
async function insertRecord(params: { db: any; tableName: string; data: Record<string, any> }): Promise<any> {
  const { db, tableName, data } = params

  // 获取表的字段列表
  const validFields = await getTableFields(db, tableName)

  // 过滤掉无效字段
  const filteredData = Object.fromEntries(Object.entries(data).filter(([key]) => validFields.includes(key)))

  const placeholders = Object.keys(filteredData)
    .map(() => '?')
    .join(', ')

  const sql = `INSERT INTO ${tableName} (${Object.keys(filteredData).join(', ')}) VALUES (${placeholders})`
  const values = Object.values(filteredData)

  // 执行插入操作
  const [result] = await db.query(sql, values)
  return result
}

/**
 * @description: 删
 * @param {any} db 数据库连接对象
 * @param {string} tableName 表名
 * @param {Record<string, any>} identifier 包含用于查找记录的唯一标识符的对象（例如主键）
 * @return {*}
 */
async function deleteRecord(params: { db: any; tableName: string; identifier: Record<string, any> }): Promise<any> {
  const { db, tableName, identifier } = params
  // 生成 WHERE 子句
  const whereClause = Object.keys(identifier)
    .map((key) => `${key} = ?`)
    .join(' AND ')

  const sql = `DELETE FROM ${tableName} WHERE ${whereClause}`

  // 获取标识符值
  const values = Object.values(identifier)

  // 执行删除操作
  const [result] = await db.query(sql, values)
  return result
}

/**
 * @description: 改
 * @param {any} db 数据库连接对象
 * @param {string} tableName 表名
 * @param {Record<string, any>} data  包含要更新字段及其新值的对象
 * @param {Record<string, any>} identifier 包含用于查找记录的唯一标识符的对象（例如主键）
 * @return {*}
 */
async function updateRecord(params: { db: any; tableName: string; data: Record<string, any>; identifier: Record<string, any> }): Promise<any> {
  const { db, tableName, data, identifier } = params

  // 获取表的字段列表
  const validFields = await getTableFields(db, tableName)

  // 过滤掉无效字段
  const filteredData = Object.fromEntries(Object.entries(data).filter(([key]) => validFields.includes(key)))

  // 检查是否有有效字段
  if (Object.keys(filteredData).length === 0) {
    throw new Error('没有有效字段可以更新')
  }

  // 生成 SET 子句
  const setClause = Object.keys(filteredData)
    .map((key) => `${key} = ?`)
    .join(', ')

  // 生成 WHERE 子句
  const whereClause = Object.keys(identifier)
    .map((key) => `${key} = ?`)
    .join(' AND ')

  const sql = `UPDATE ${tableName} SET ${setClause} WHERE ${whereClause}`

  // 合并更新值和标识符值
  const values = [...Object.values(filteredData), ...Object.values(identifier)]

  // 执行更新操作
  const [result] = await db.query(sql, values)
  return result
}

/**
 * @description: 通用查询函数，支持多表连接查询，同时支持分页、排序和多条件过滤（包括模糊查询与“或”条件）。
 * @param {any} db - 数据库连接对象，通常是 MySQL、PostgreSQL 等数据库的连接实例。
 * @param {string} tableName - 主表名称，用于指定查询的基础表。
 * @param {Record<string, any>} filters - 查询条件字段和值的映射关系，支持以下结构：
 *   - 普通字段: { key: value }，如 { name: "John" }
 *   - 模糊查询: { key: { value: "John", fuzzy: true } }，如 { name: { value: "John", fuzzy: true } }
 *   - “或”关系字段: { orFields: [{ field: 'field1', value: { value: 'value1', fuzzy: true } }, { field: 'field2', value: 'value2' }] }
 * @param {number} [pageNum] - 当前页码，分页时的起始页，默认为 1。
 * @param {number} [pageSize] - 每页记录数，指定分页大小，默认为不分页。
 * @param {string} [orderBy] - 排序字段，格式为 "field ASC" 或 "field DESC"。
 * @param {boolean} [returnCount=true] - 是否返回总记录数，用于分页场景下获取数据总量。
 * @param {Array<{ table: string; on: string; type?: string }>} [joins=[]] - 多表连接信息，支持指定关联表、连接条件和连接类型。格式如下：
 *   - `table`: 要连接的表名。
 *   - `on`: 连接条件，如 "mainTable.field = joinTable.field"。
 *   - `type`: 连接类型（可选），如 "INNER", "LEFT", "RIGHT"，默认值为 "INNER"。
 * @return {Promise<any>} - 返回一个 Promise，包含以下结构：
 *   - `results`: 查询结果数组，包含每条记录的字段。
 *   - `totalCount`: 查询匹配的总记录数（仅在 returnCount 为 true 时返回）。
 * @param {string} topField - 置顶字段
 */
async function queryRecords(params: {
  db: any
  tableName: string
  filters?: Record<string, any>
  returnCount?: boolean
  joins?: Array<{ table: string; on: string; type?: string }>
  topField?: string // 指定置顶字段
  pageNum?: number
  pageSize?: number
  orderBy?: string
}): Promise<any> {
  let { db, tableName, filters, pageNum, pageSize, orderBy, returnCount, joins, topField } = params
  if (!filters) filters = {}
  if (!joins) joins = []
  if (!returnCount) returnCount = true
  if (!topField) topField = ''

  const validFields = await getTableFields(db, tableName)

  // 验证关联表字段
  for (const join of joins) {
    const joinFields = await getTableFields(db, join.table)
    validFields.push(...joinFields.map((field: string) => `${join.table}.${field}`)) // 添加关联表字段
  }

  const whereClauses: string[] = []
  const values: any[] = []

  for (const [key, value] of Object.entries(filters)) {
    // 如果是包含表前缀的字段
    if (key.includes('.')) {
      if (typeof value === 'object' && value.fuzzy) {
        whereClauses.push(`${key} LIKE ?`)
        values.push(`%${value.value ?? ''}%`)
      } else {
        whereClauses.push(`${key} = ?`)
        values.push(value)
      }
    }
    // 普通字段的处理（没有表前缀的字段）
    else if (validFields.includes(key) && value !== undefined && value !== '') {
      if (typeof value === 'object' && Array.isArray(value.orValues)) {
        const orValuesClauses = value.orValues.map(() => `${key} = ?`)
        whereClauses.push(`(${orValuesClauses.join(' OR ')})`)
        values.push(...value.orValues)
      } else if (typeof value === 'object' && value.fuzzy) {
        whereClauses.push(`${key} LIKE ?`)
        values.push(`%${value.value ?? ''}%`)
      } else {
        whereClauses.push(`${key} = ?`)
        values.push(value)
      }
    }
  }

  const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : ''

  // 生成 JOIN 子句
  const joinClauses = joins.map((join) => `${join.type || 'INNER'} JOIN ${join.table} ON ${join.on}`).join(' ')

  // 动态排序逻辑
  const orderByClause = topField ? `ORDER BY ${topField} DESC${orderBy ? `, ${orderBy}` : ''}` : orderBy ? `ORDER BY ${orderBy}` : ''

  // SELECT 子句
  const selectFields = [`${tableName}.*`, ...joins.map((join) => `${join.table}.*`)]

  // 构造最终 SQL
  let sql = `SELECT ${selectFields.join(', ')} FROM ${tableName} ${joinClauses} ${whereClause} ${orderByClause}`

  // 分页逻辑
  if (pageNum && pageSize) {
    const offset = (pageNum - 1) * pageSize
    sql += ` LIMIT ${offset}, ${pageSize}`
  }

  const [results] = await db.query(sql, values)

  // 获取表结构，找到时间类型字段
  const timeFields = await getTimeFields(db, tableName)

  // 格式化时间字段
  const formattedResults = results.map((record: Record<string, any>) => {
    Object.entries(record).forEach(([key, value]) => {
      if (timeFields.includes(key) && value) {
        const date = new Date(value)
        record[key] = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(
          date.getMinutes()
        ).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`
      }
    })
    return record
  })

  let totalCount = 0
  if (returnCount) {
    const countSql = `SELECT COUNT(*) as total FROM ${tableName} ${joinClauses} ${whereClause}`
    const [countResult] = await db.query(countSql, values)
    totalCount = countResult[0]?.total || 0
  }

  return { results: formattedResults, totalCount }
}

/**
 * @description: 获取指定表中的所有时间字段
 * @param {any} db 数据库连接对象
 * @param {string} tableName 表名
 * @return {Promise<string[]>} 返回时间字段名称列表
 */
async function getTimeFields(db: any, tableName: string): Promise<string[]> {
  const query = `SHOW COLUMNS FROM ${tableName}`
  const [columns] = await db.query(query)

  // 获取所有类型为 DATETIME 或 DATE 的字段
  const timeFields = columns
    .filter((column: any) => {
      return column.Type.includes('datetime') || column.Type.includes('date')
    })
    .map((column: any) => column.Field)

  return timeFields
}

/**
 * @description: 过滤表中没有的字段 防止注入错误
 * @param {any} db 数据库连接对象
 */
async function getTableFields(db: any, tableName: string) {
  const [rows] = await db.query(`SHOW COLUMNS FROM ??`, [tableName]) // 使用参数化查询防止 SQL 注入
  return rows.map((row: Column) => row.Field)
}

export const dbTools = {
  insertRecord,
  updateRecord,
  deleteRecord,
  queryRecords,
  getCurrentTimestamp
}
