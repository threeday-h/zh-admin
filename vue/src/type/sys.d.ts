// 路由类型
interface routeType {
  menu_type: string
  menu_name: string
  icon: string
  path: string
  visible: number | string
  status: number | string
  component: any
  order_num: number | string
  parent_id?: string | number
  menu_id?: number
}

interface MenuItem {
  // 菜单名称
  name: string
  // 菜单图标
  icon: any
  // 菜单索引
  index: string
  // 路由地址
  path: string
  // 页面地址
  component: string
  // 是否隐藏
  visible?: string
  // 是否缓存
  is_cache?: number
  // 是否禁用
  disabled?: boolean
  children?: MenuItem[]
}

interface Route {
  component: () => Promise<typeof import('*.vue')>
  name: string
  path: string
  children: Route[] // 子路由
}

// 路由标签
interface tagsType {
  path: string
  name: string
  fullPath: string
  query: Record<string, any>
  affix?: string
}

// 角色类型
interface roleType {
  role_name?: string
  role_key?: string
  role_sort?: number
  status?: string | number
  role_id?: number
  textarea?: string
  menu_id?: string
}

// 字典类型
interface dictType {
  dict_id?: number
  status?: string
  remark?: string
  dict_name?: string
  dict_type?: string
  pageNum?: number
  pageSize?: number
}

// 字典值
interface dictValue {
  status?: string
  dict_code?: number
  dict_type?: string
  dict_value?: string
  dict_label?: string
  dict_sort?: number
  pageNum?: number
  pageSize?: number
  remark?: string
}

// 用户类型
interface userType {
  user_id?: number
  avatar?: string
  code?: string
  user_name?: string
  password?: string
  nick_name?: string
  phonenumber?: string
  email?: string
  sex?: string
  role_key?: string
}

// 表单
interface FormFieldOption {
  label: string
  value: any
  [key: string]: any
}

interface FormField {
  label: string // 字段标签
  prop: string // 字段的属性名，与 formData 中的字段对应
  type?: 'input' | 'select' | 'textarea' | 'radio' | 'input-number' | 'tree-select' | 'upload-image' | 'switch' // 字段类型
  multiple?: boolean
  labelKey?: string
  valueKey?: string
  disabled?: boolean // 是否禁用
  placeholder?: string // 占位符
  slot?: boolean // 是否启用自定义插槽
  rows?: number // 仅对 textarea 类型有效，设置行数
  options?: FormFieldOption[] // 对于 select 和 radio 类型的字段，提供选项
  tree?: any // 对于 tree-select 类型，定义树形结构的数据
  limit?: number // 对于 upload-image 类型，限制上传的文件数
  visibleIf?: (formData: Record<string, any>) => boolean // 控制字段可见性的条件函数
}

// 表格
interface TableColumn {
  label: string // 列的标题
  prop: string // 数据中对应的字段
  width?: string | number // 列宽
  fixed?: 'left' | 'right' // 可选固定方向
}

interface PaginationQuery {
  pageNum: number // 当前页码
  pageSize: number // 每页显示的条数
}

interface TableConfig {
  rowKey?: string // 行的唯一标识符
  showSelection?: boolean // 是否显示选择框
  showDefaultButton?: boolean // 是否显示默认按钮
  showPagination?: boolean // 是否显示分页
  paginationQuery?: PaginationQuery // 分页查询的配置
  total?: number // 总记录数
  showIndex: boolean // 是否显示行号
  columns: TableColumn[] // 列配置
  tableData: Array<Record<string, any>> // 表格数据
}
