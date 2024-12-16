export const useRouteConfig = () => {
  const sysStore = inject('sysStore') as sysStoreType

  // 筛选
  const searchFields = {
    menu_name: {
      type: 'input',
      placeholder: '请输入菜单名称',
      span: 5,
      label: '菜单名称'
    },
    status: {
      type: 'select',
      placeholder: '请选择状态',
      span: 5,
      label: '菜单状态',
      labelKey: 'dict_label',
      valueKey: 'dict_value',
      options: sysStore.dictData['sys_status'].children
    }
  }

  const initQuery = {
    menu_name: '',
    status: ''
  }

  const query = ref({
    ...initQuery
  })

  // 表单
  const initFormData = { menu_name: '', menu_type: 'M', order_num: 1, icon: '', path: '', visible: '0', status: '0', parent_id: '', component: '', is_cache: '0' }

  const formData = ref<routeType>({ ...initFormData })

  const formFields: FormField[] = [
    {
      label: '菜单类型',
      prop: 'menu_type',
      type: 'radio',
      placeholder: '请选择菜单类型',
      labelKey: 'dict_label',
      valueKey: 'dict_value',
      options: sysStore.dictData['sys_menu_type'].children
    },
    {
      label: '上级菜单',
      prop: 'parent_id',
      type: 'tree-select',
      placeholder: '请选择上级菜单',
      tree: sysStore.menu,
      visibleIf: (formData: Record<string, any>) => formData['menu_type'] === 'C'
    },
    {
      label: '菜单名称',
      prop: 'menu_name',
      type: 'input',
      placeholder: '请输入菜单名称'
    },
    {
      label: '组件路径',
      prop: 'component',
      type: 'input',
      placeholder: '请输入组件路径'
    },
    {
      label: '路由地址',
      prop: 'path',
      type: 'input',
      placeholder: '请输入路由地址'
    },
    {
      label: '菜单图标',
      prop: 'icon',
      type: 'radio',
      // 自定义插槽
      slot: true
    },
    {
      label: '显示顺序',
      prop: 'order_num',
      type: 'input-number'
    },

    {
      label: '显示状态',
      prop: 'visible',
      type: 'radio',
      placeholder: '请选择菜单状态',
      labelKey: 'dict_label',
      valueKey: 'dict_value',
      options: sysStore.dictData['sys_menu_visible'].children
    },
    {
      label: '菜单状态',
      prop: 'status',
      type: 'radio',
      placeholder: '请选择菜单状态',
      labelKey: 'dict_label',
      valueKey: 'dict_value',
      options: sysStore.dictData['sys_status'].children
    },
    {
      label: '是否缓存',
      prop: 'is_cache',
      type: 'radio',
      placeholder: '请选择菜单是否缓存',
      labelKey: 'dict_label',
      valueKey: 'dict_value',
      options: sysStore.dictData['sys_menu_is_cache'].children
    }
  ]

  const formRules = {
    menu_name: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }],
    component: [{ required: true, message: '请输入组件路径', trigger: 'blur' }],
    order_num: [{ required: true, message: '请输入显示顺序', trigger: 'blur' }],
    path: [{ required: true, message: '请输入路由地址', trigger: 'blur' }],
    icon: [{ required: true, message: '请选择菜单图标', trigger: 'blur' }],
    visible: [{ required: true, message: '请选择显示状态', trigger: 'change' }],
    status: [{ required: true, message: '请选择菜单状态', trigger: 'change' }],
    is_cache: [{ required: true, message: '请选择菜单是否缓存', trigger: 'change' }],
    menu_type: [{ required: true, message: '请选择菜单类型', trigger: 'change' }],
    parent_id: [{ required: true, message: '请选择上级菜单', trigger: 'change' }]
  }

  // 表格
  const columns: TableColumn[] = [
    { label: '菜单名称', prop: 'menu_name' },
    { label: '菜单图标', prop: 'icon' },
    { label: '菜单排序', prop: 'order_num' },
    { label: '路由地址', prop: 'path' },
    { label: '组件地址', prop: 'component' },
    { label: '路由状态', prop: 'status' },
    { label: '创建时间', prop: 'create_time', width: 180 },
    { label: '操作', prop: 'actions', width: 150, fixed: 'right' }
  ]

  const resetFormData = () => {
    formData.value = { ...initFormData }
  }

  return {
    query,
    searchFields,
    formData,
    formFields,
    formRules,
    sysStore,
    columns,
    initQuery,
    resetFormData
  }
}
