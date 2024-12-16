// 定义字典类型配置
export const useDictConfig = () => {
  const sysStore = inject('sysStore') as sysStoreType
  // 筛选
  const searchFields = {
    dict_name: {
      type: 'input',
      placeholder: '请输入字典名称',
      span: 5,
      label: '字典名称'
    },
    dict_type: {
      type: 'input',
      placeholder: '请输入字典类型',
      span: 5,
      label: '字典类型'
    }
  }

  const initQuery = {
    pageNum: 1,
    pageSize: 20,
    dict_name: '',
    dict_type: ''
  }

  const query = ref({
    ...initQuery
  })

  // 表格
  const columns: TableColumn[] = [
    { label: '字典名称', prop: 'dict_name' },
    { label: '字典类型', prop: 'dict_type' },
    { label: '状态', prop: 'status' },
    { label: '备注', prop: 'remark' },
    { label: '创建时间', prop: 'create_time' },
    { label: '操作', prop: 'actions', width: 120, fixed: 'right' }
  ]

  const initFormData: dictType = {
    dict_name: '',
    dict_type: '',
    status: '0',
    remark: ''
  }

  const formData = ref({
    ...initFormData
  })

  // 表单
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
    dict_name: [{ required: true, message: '请输入字典名称', trigger: 'blur' }],
    dict_type: [{ required: true, message: '请输入字典类型', trigger: 'blur' }],
    status: [{ required: true, message: '请选择字典状态', trigger: 'change' }]
  }

  const resetFormData = () => {
    formData.value = { ...initFormData }
  }

  return {
    searchFields,
    initQuery,
    query,
    columns,
    formData,
    formFields,
    formRules,
    resetFormData,
    sysStore
  }
}
