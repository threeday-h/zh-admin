export const useRoleConfig = () => {
  const sysStore = inject('sysStore') as sysStoreType
  // 筛选
  const searchFields = {
    role_name: {
      type: 'input',
      placeholder: '请输入角色名称',
      span: 5,
      label: '角色名称'
    },
    role_key: {
      type: 'input',
      placeholder: '请输入权限字符',
      span: 5,
      label: '权限字符'
    },
    status: {
      type: 'select',
      placeholder: '请选择角色状态',
      span: 5,
      label: '角色状态',
      labelKey: 'dict_label',
      valueKey: 'dict_value',
      options: sysStore.dictData['sys_status'].children
    }
  }

  const initQuery = {
    role_name: '',
    role_key: '',
    status: ''
  }

  const query = ref<roleType>({
    ...initQuery
  })

  // 表格
  const columns: TableColumn[] = [
    { label: '角色编号', prop: 'role_id' },
    { label: '角色名称', prop: 'role_name' },
    { label: '权限字符', prop: 'role_key' },
    { label: '显示顺序', prop: 'role_sort' },
    { label: '角色状态', prop: 'status' },
    { label: '创建时间', prop: 'create_time' },
    { label: '操作', prop: 'actions', width: 120, fixed: 'right' }
  ]

  // 表单
  const formFields: FormField[] = [
    {
      label: '角色名称',
      prop: 'role_name',
      type: 'input',
      placeholder: '请输入角色名称'
    },
    {
      label: '权限字符',
      prop: 'role_key',
      type: 'input',
      placeholder: '请输入权限字符'
    },
    {
      label: '显示顺序',
      prop: 'role_sort',
      type: 'input-number',
      placeholder: '请输入显示顺序'
    },
    {
      label: '角色状态',
      prop: 'status',
      type: 'radio',
      placeholder: '请选择角色状态',
      labelKey: 'dict_label',
      valueKey: 'dict_value',
      options: sysStore.dictData['sys_status'].children
    },
    {
      label: '菜单权限',
      prop: 'menu_id',
      type: 'radio',
      placeholder: '请选择菜单权限',
      slot: true
    },
    {
      label: '角色备注',
      prop: 'remark',
      type: 'textarea',
      rows: 4,
      placeholder: '请输入角色备注'
    }
  ]

  const formRules = {
    role_name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
    role_key: [{ required: true, message: '请输入权限字符', trigger: 'blur' }],
    role_sort: [{ required: true, message: '请输入显示顺序', trigger: 'blur' }],
    status: [{ required: true, message: '请选择角色状态', trigger: 'change' }]
  }

  const initFormData = {
    role_name: '',
    role_key: '',
    role_sort: 1,
    status: '0',
    menu_id: ''
  }

  const formData = ref<roleType>({ ...initFormData })

  const resetFormData = () => {
    formData.value = { ...initFormData }
  }

  return {
    searchFields,
    query,
    columns,
    formData,
    formFields,
    formRules,
    sysStore,
    initQuery,
    resetFormData
  }
}
