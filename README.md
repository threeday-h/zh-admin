# 仿若依后台管理系统模版

## 运行效果图

![](http://api.k-tech-art.cn:9898/upload/sys/preview.png)

## 开发环境

### 前端技术栈
- Vue 3
- TypeScript
- Element Plus
- Pinia
- 启动命令 npm run dev

### 后端技术栈
- Koa
- TypeScript
- MySQL（5.7/8.0）
  - 5.7 版本sql路径（koa/src/mysql/update/modified_koa.sql）
  - 8.0 版本sql路径（koa/src/mysql/database/koa.sql）

- 启动命令 npm run start
- 转换sql文件 8.0转5.7 npm run db
  - 8.0版本sql文件需要存放（koa/src/mysql/database/xxx.sql）
  - 执行命令后 5.7 版本sql 存放（koa/src/mysql/update/modified_xxx.sql）

- 相关配置文件（mysql、token、prot、session 等）
  - 配置文件路径（koa/src/utils/config）


## 后台管理系统

### 环境简介
该后台管理系统模版集成了以下技术：
- **Tailwind CSS**：用于快速设计自定义界面。
- **unplugin-auto-import**：自动导入常用的 API 和函数，减少手动导入的代码。
- **unplugin-element-plus**：自动导入 Element Plus 组件，简化开发流程。

### 动态表单组件使用文档

该组件是一个动态表单，根据传入的字段配置自动渲染不同类型的表单控件，包括输入框、选择框、单选框、开关等。支持自定义插槽、字段可见性控制以及字段验证规则等功能。可进行二次拓展

示例（/components/form/index.vue）

```vue
<template>
<Form ref="customeFormRef" v-model="formData" :fields="formFields" :rules="formRules" />
</template>

<script setup>
  const process_bool = ref(false)
  
  const initFormData: dictType = {
    dict_name: '',
    dict_type: '',
    status: '0',
    remark: ''
  }
  
  const formData = ref({
		...initFormData
  })
  
const formFields: FormField[] = [
  {
    label: '字典名称',
    prop: 'dict_name',
    type: 'input',
    placeholder: '请输入字典名称'
  },
  {
    label: '字典类型',
    prop: 'dict_type',
    type: 'input',
    placeholder: '请输入字典类型'
  },
  {
    label: '字典状态',
    prop: 'status',
    type: 'radio',
    placeholder: '请选择字典状态',
    labelKey: 'dict_label',
    valueKey: 'dict_value',
    options: sysStore.dictData['sys_status'].children
    visibleIf: () => !process_bool.value
  },
  {
    label: '字典备注',
    prop: 'remark',
    type: 'textarea',
    rows: 4,
    placeholder: '请输入备注'
  }
]
  
const formRules = {
    dict_name: [{ required: true, message: '请输入字典名称', trigger: 	'blur' }],
    dict_type: [{ required: true, message: '请输入字典类型', trigger: 'blur' }],
    status: [{ required: true, message: '请选择字典状态', trigger: 'change' }]
 }
</script>
```
表单字段配置

|    属性     |                    类型                    |                             描述                             |
| :---------: | :----------------------------------------: | :----------------------------------------------------------: |
|    label    |                   string                   |                  字段的标签，用于显示字段名                  |
|    prop     |                   string                   |        字段的属性名，应该与 `formData` 中的字段名一致        |
|    type     |                   string                   | 字段类型，支持 `input`, `select`, `textarea`, `radio`, `input-number`, `tree-select`, `upload-image`, `switch`可自信拓展 |
|  multiple   |                  boolean                   |               对于 `select` 类型，是否支持多选               |
|  labelKey   |                   string                   |       对于 `select` 和 `radio` 类型，选项的标签字段名        |
|  valueKey   |                   string                   |        对于 `select` 和 `radio` 类型，选项的值字段名         |
|  disabled   |                  boolean                   |                        是否禁用该字段                        |
|    slot     |                  boolean                   |                      是否启用自定义插槽                      |
|    rows     |                   number                   |              仅对 `textarea` 类型有效，设置行数              |
|   options   |             FormFieldOption[]              |         选项数组，仅对 `select` 和 `radio` 类型有效          |
|    tree     |                    any                     |         对于 `tree-select` 类型，定义树形结构的数据          |
|    limit    |                   number                   |          对于 `upload-image` 类型，限制上传的文件数          |
|  visibleIf  | (formData: Record<string, any>) => boolean |  可选的字段可见性控制函数，根据 `formData` 返回字段是否可见  |
| placeholder |                   string                   |                         字段的占位符                         |

### 动态表格组件使用文档

该组件用于展示带有操作按钮、分页、选择框等功能的动态表格，支持自定义表头、行内容及分页功能。可进行二次拓展

```vue
<template>
  <Table
    :columns="columns"
    :tableData="tableData"
    :showSelection="true"
    :showIndex="true"
    :showPagination="true"
    :total="100"
    :paginationQuery="paginationQuery"
    @selection-change="handleSelectionChange"
    @handle-add="handleAdd"
    @handle-pagination="handlePaginationChange"
  >
    <!-- 可选自定义插槽 -->
    <template #customColumn="{ row }">
      <span>{{ row.custom }}</span>
    </template>
  </TableComp>
</template>
<script setup>
const columns = ref([
  { label: '姓名', prop: 'name' },
  { label: '年龄', prop: 'age' },
  { label: '性别', prop: 'gender' },
  { label: '自定义', prop: 'custom' }
])
const tableData = ref([
  { name: '张三', age: 28, gender: '男', custom: '数据1' },
  { name: '李四', age: 24, gender: '女', custom: '数据2' },
  { name: '王五', age: 32, gender: '男', custom: '数据3' }
])
const paginationQuery = ref({ pageNum: 1, pageSize: 20 })
const handleSelectionChange = (selection) => {
  console.log('选择的行:', selection)
}
const handleAdd = () => {
  console.log('新增数据')
}
const handlePaginationChange = (pagination) => {
  console.log('分页:', pagination)
}
</script>
```

表格字段配置

|       属性        |                  类型                  |                      描述                      |
| :---------------: | :------------------------------------: | :--------------------------------------------: |
|      columns      | Array<{ label: string, prop: string }> | 表格列的配置，包含列标题 `label` 和字段 `prop` |
|     tableData     |       Array<Record<string, any>>       |       表格数据，数组形式，每项是一个对象       |
|   showSelection   |                boolean                 |        是否显示选择框（默认：`false`）         |
| showDefaultButton |                boolean                 |      是否显示默认操作按钮（默认：`true`）      |
|  showPagination   |                boolean                 |       是否显示分页组件（默认：`false`）        |
|  paginationQuery  |                 Object                 |   分页查询对象，包含 `pageNum` 和 `pageSize`   |
|       total       |                 number                 |             数据总数，用于分页显示             |
|     showIndex     |                boolean                 |        是否显示索引列（默认：`false`）         |
|      rowKey       |                 string                 |              表格行的唯一标识字段              |

事件

|     事件名称      |          描述          |                  参数                   |
| :---------------: | :--------------------: | :-------------------------------------: |
| selection-change  | 当选择框状态变化时触发 |            选择的行数据数组             |
|    handle-add     |  当点击新增按钮时触发  |                   无                    |
| handle-pagination |    当分页变化时触发    | 包含 `pageNum` 和 `pageSize` 的分页对象 |

## Koa

### 环境简介

该后台集成了以下技术：

- **动态sql查询函数**：用于快速实现对表的增删改查（已经挂载到 ctx: Koa.Context）。
- **动态定时任务函数**：用于快速构造定时任务。

### 数据库工具文档

- 增

```typescript
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
```

- 使用案例

```typescript
// 新增字典类型
router.post('/add/dict/type', async (ctx: Context) => {
  const body = ctx.request.body as DictType

  const { dict_name, dict_type } = body

  if (!dict_name || !dict_type) return ctx.generateResponse(500, 'dict_name dict_type 不为空')

  await ctx.dbTools.insertRecord({
    db: ctx.db,
    tableName: dbTable.dict,
    data: { ...body, create_time: ctx.dbTools.getCurrentTimestamp() }
  })

  ctx.generateResponse(200, '新增成功')
})
```

- 删

```typescript
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
```

- 使用案例

```typescript
// 删除字典类型
router.post('/delete/dict/type', async (ctx: Context) => {
  const body = ctx.request.body as DictType

  const { dict_id } = body

  if (!dict_id) return ctx.generateResponse(500, 'dict_id 不为空')

  await ctx.dbTools.deleteRecord({
    db: ctx.db,
    tableName: dbTable.dict,
    identifier: { dict_id }
  })

  ctx.generateResponse(200, '删除成功')
})
```

- 改

```typescript
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
```

- 使用案例

```typescript
// 修改字典值
router.post('/alter/dict/value', async (ctx: Context) => {
  const body = ctx.request.body as DictValue

  const { dict_code } = body

  if (!dict_code) return ctx.generateResponse(500, 'dict_code 不为空')

  await ctx.dbTools.updateRecord({
    db: ctx.db,
    tableName: dbTable.dictValue,
    data: { ...body, update_time: ctx.dbTools.getCurrentTimestamp() },
    identifier: { dict_code }
  })

  ctx.generateResponse(200, '修改成功')
})
```

- 查

```typescript
/**
 * @description: 通用查询函数，支持多表连接查询，同时支持分页、排序和多条件过滤（包括模糊查询与“或”条件）。此函数构建 SQL 查询语句并执行查询操作，返回符合条件的记录及可选的记录总数。
 * 
 * @param {any} db - 数据库连接对象，通常是 MySQL、PostgreSQL 等数据库的连接实例，用于执行查询操作。
 * @param {string} tableName - 主表名称，用于指定查询的基础表，查询时会基于此表。
 * @param {Record<string, any>} [filters] - 查询条件字段和值的映射关系，支持以下结构：
 *   - 普通字段: { key: value }，如 { name: "John" }。
 *   - 模糊查询: { key: { value: "John", fuzzy: true } }，如 { name: { value: "John", fuzzy: true } }，使用 `LIKE` 查询。
 *   - “或”条件: { orFields: [{ field: 'field1', value: { value: 'value1', fuzzy: true } }, { field: 'field2', value: 'value2' }] }，表示“字段1 = value1 或 字段2 = value2”。
 * @param {number} [pageNum] - 当前页码，分页时的起始页，默认为 1。如果未指定，则不进行分页。
 * @param {number} [pageSize] - 每页记录数，指定分页大小，默认为不分页。如果未指定，则不进行分页。
 * @param {string} [orderBy] - 排序字段，格式为 "field ASC" 或 "field DESC"。用于指定查询结果的排序方式。
 * @param {boolean} [returnCount=true] - 是否返回总记录数，用于分页场景下获取数据总量，默认为 `true`。如果为 `false`，则不返回总记录数。
 * @param {Array<{ table: string; on: string; type?: string }>} [joins=[]] - 多表连接信息，支持指定关联表、连接条件和连接类型。格式如下：
 *   - `table`: 要连接的表名。
 *   - `on`: 连接条件，如 "mainTable.field = joinTable.field"。
 *   - `type`: 连接类型（可选），如 "INNER", "LEFT", "RIGHT"。默认为 "INNER"。
 * @param {string} [topField] - 置顶字段，用于控制查询结果的排序。当设置时，查询结果会根据此字段降序排列，置顶字段优先展示。
 * 
 * @return {Promise<any>} - 返回一个 `Promise`，该 `Promise` resolve 后会返回一个包含以下结构的对象：
 *   - `results`: 查询结果数组，包含每条记录的字段。所有时间字段会进行格式化为 "YYYY-MM-DD HH:mm:ss" 格式。
 *   - `totalCount`: 查询匹配的总记录数（仅在 `returnCount` 为 `true` 时返回）。用于分页场景下展示数据的总量。
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
```

- 使用案例

```typescript
// 查询字典值及相关信息
router.post('/query/dict/value', async (ctx: Context) => {
  const { 
    dict_code, 
    dict_name, 
    pageNum = 1, 
    pageSize = 10, 
    orderBy = 'dict_code ASC', 
    joins = [
      {
        table: 'dict_type',
        on: 'dict_value.dict_code = dict_type.dict_code',
        type: 'INNER'
      }
    ], 
    topField = 'update_time'
  } = ctx.request.body;

  // 构建查询条件
  const filters: Record<string, any> = {};
  
  // 1. 查询字典编码和名称
  if (dict_code) filters.dict_code = dict_code;
  if (dict_name) filters.dict_name = { value: dict_name, fuzzy: true };  // 模糊查询

  // 2. 查询字典类型（“或”条件示例）
  if (ctx.request.body.orFields) {
    filters.orFields = ctx.request.body.orFields; // Example: [{ field: 'dict_name', value: 'value1' }, { field: 'dict_code', value: 'value2' }]
  }

  // 调用查询函数，支持分页、排序、过滤条件和多表连接
  const { results, totalCount } = await ctx.dbTools.queryRecords({
    db: ctx.db,
    tableName: dbTable.dictValue,
    filters,
    pageNum,
    pageSize,
    orderBy,
    joins,
    topField
  });

  // 返回查询结果
  ctx.generateResponse(200, '查询成功', {
    data: results,
    totalCount
  });
});

```

### 定时任务工具文档

-  创建基于 Cron 表达式的定时任务

```typescript
/**
 * @description: 创建一个基于 Cron 表达式的定时任务，支持传入参数
 * @param {string} cronExpression - Cron 表达式，定义任务执行的时间规则
 * @param {() => void} callback - 任务执行时的回调函数
 * @param {any} params - 动态任务参数
 * @returns {Job} 返回一个任务对象，用于后续取消或操作
 */
function createCronJob(cronExpression: string, callback: (params: any) => Promise<any>, params: any): Job {
  const job = schedule.scheduleJob(cronExpression, async () => {
    try {
      const result = await callback(params) // 执行回调函数并传递参数
      // 保存任务执行结果
      const taskSchedule = taskSchedules.find((task) => task.job === job)
      if (taskSchedule) taskSchedule.result = result
    } catch (error) {
      console.error('任务执行出错:', error)
    }
  })
  // 保存任务信息
  taskSchedules.push({ cronExpression, callback, job, scheduledTime: moment(), params })
  return job
}
```

- 使用案例

```typescript
import job from './job/index'
// 创建每天凌晨 24 点 备份数据库
job.createCronJob(
  '0 0 0 * * *',
  async () => {
    const backupDir = path.join(__dirname, '../../mysql/backups')
    const dateFolder = new Date().toISOString().split('T')[0].replace(/-/g, '')
    const backupFile = path.join(backupDir, `${dateFolder}.sql`)
    const dumpCommand = `mysqldump -h ${mysql.host} -u ${mysql.user} -p${mysql.password} ${mysql.database} > ${backupFile}`

    exec(dumpCommand, (error: any, stdout: any, stderr: any) => {
      if (error) {
        console.error(`[ERROR] 数据库备份失败: ${error.message}`)
        return
      }
      console.log(`[INFO] ${backupFile} 数据库备份完成:`, backupFile)
    })
  },
  {}
)
```

- 创建指定时间执行的定时任务

```typescript
/**
 * @description: 创建一个在指定时间执行的定时任务，支持传入参数
 * @param {Date} date - 指定的执行时间
 * @param {() => void} callback - 任务执行时的回调函数
 * @param {any} params - 动态任务参数
 * @returns {Job} 返回一个任务对象，用于后续取消或操作
 */
function createJobAtDate(date: Date, callback: (params: any) => Promise<any>, params: any): Job | null {
  // 将日期转换为 moment 对象
  const momentDate = moment(date)

  if (!momentDate.isValid()) {
    console.error('createJobAtDate-无效的日期对象', date)
    return null
  }

  // 获取当前时间，确保格式一致
  const now = moment()

  // 检查时间是否在当前时间之前
  if (momentDate.isBefore(now)) {
    // 任务已经错过，立即执行任务
    console.log(`createJobAtDate-任务时间已过，立即执行任务：${momentDate.format('YYYY-MM-DD HH:mm:ss')}`)
    callback(params)
    return null // 不再创建定时任务
  }

  // 创建定时任务
  const job = schedule.scheduleJob(momentDate.toDate(), async () => {
    try {
      const result = await callback(params) // 执行回调函数并传递参数
      // 保存任务执行结果
      const taskSchedule = taskSchedules.find((task) => task.job === job)
      if (taskSchedule) taskSchedule.result = result
    } catch (error) {
      console.error('任务执行出错:', error)
    }
  })

  if (job) {
    // 保存任务信息
    taskSchedules.push({
      cronExpression: momentDate.format('YYYY-MM-DD HH:mm:ss'),
      callback,
      scheduledTime: momentDate,
      job,
      params
    })

    console.log(`createJobAtDate-任务已创建，定时任务时间：${momentDate.format('YYYY-MM-DD HH:mm:ss')}`)
  } else {
    console.error('createJobAtDate-任务创建失败')
  }

  return job
}

```

- 使用案例

```typescript
import job from './job/index'
const date = new Date(2024, 11, 24, 15, 30);  // 任务将在 2024-12-24 15:30 执行
const params = { message: '任务到期' };

const task = job.createJobAtDate(date, async (params) => {
  console.log(`指定时间任务执行: ${params.message}`);
}, params);

```

- 创建基于周期规则的定时任务

```typescript
/**
 * @description: 创建一个基于 RecurrenceRule（周期规则）的定时任务，支持传入参数
 * @param {RecurrenceRule} rule - 定义任务执行周期的规则
 * @param {() => void} callback - 任务执行时的回调函数
 * @param {any} params - 动态任务参数
 * @returns {Job} 返回一个任务对象，用于后续取消或操作
 */
function createPeriodicJob(rule: RecurrenceRule, callback: (params: any) => Promise<any>, params: any): Job {
  const job = schedule.scheduleJob(rule, async () => {
    try {
      const result = await callback(params) // 执行回调函数并传递参数
      // 保存任务执行结果
      const taskSchedule = taskSchedules.find((task) => task.job === job)
      if (taskSchedule) taskSchedule.result = result
    } catch (error) {
      console.error('任务执行出错:', error)
    }
  })
  // 保存任务信息
  taskSchedules.push({ cronExpression: rule.toString(), callback, job, scheduledTime: moment(), params })
  return job
}
```

- 使用案例

```typescript
import job from './job/index'
const rule = new RecurrenceRule();
rule.dayOfWeek = [new schedule.Range(0, 6)];  // 每天执行
rule.hour = 12;  // 每天中午12点执行
const params = { reminder: '午餐时间到了' };

const task = job.createPeriodicJob(rule, async (params) => {
  console.log(`周期任务执行: ${params.reminder}`);
}, params);

```

- 创建异步执行的定时任务

```typescript
/**
 * @description: 创建一个异步执行的定时任务，支持传入参数
 * @param {string} cronExpression - Cron 表达式，定义任务执行的时间规则
 * @param {() => Promise<void>} asyncCallback - 异步任务的回调函数
 * @param {any} params - 动态任务参数
 * @returns {Promise<Job>} 返回一个任务对象，用于后续取消或操作
 */
async function createAsyncJob(cronExpression: string, asyncCallback: (params: any) => Promise<void>, params: any): Promise<Job> {
  const job = schedule.scheduleJob(cronExpression, async () => {
    try {
      await asyncCallback(params) // 执行回调函数并传递参数
    } catch (error) {
      console.error('异步任务执行出错:', error)
    }
  })
  // 保存任务信息
  taskSchedules.push({ cronExpression, callback: asyncCallback, job, scheduledTime: moment(), params })
  return job
}
```

- 示例

```typescript
import job from './job/index'
const cronExpression = '*/10 * * * *';  // 每10分钟执行一次
const params = { taskId: 9876 };

const task = job.createAsyncJob(cronExpression, async (params) => {
  console.log(`异步任务执行: 任务ID ${params.taskId}`);
  // 异步任务处理，例如调用外部API
}, params);

console.log('异步任务已创建');

```

