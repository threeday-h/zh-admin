export const useUserConfig = () => {
  const sysStore = inject('sysStore') as sysStoreType
  // 筛选
  const searchFields = {
    nick_name: {
      type: 'input',
      placeholder: '请输入用户昵称',
      span: 5,
      label: '用户昵称'
    },
    phonenumber: {
      type: 'input',
      placeholder: '请输入用户手机号',
      span: 5,
      label: '用户手机号'
    },
    status: {
      type: 'select',
      placeholder: '请选择用户状态',
      span: 5,
      label: '用户状态',
      labelKey: 'dict_label',
      valueKey: 'dict_value',
      options: sysStore.dictData['sys_status'].children
    },
    create_time: {
      type: 'date',
      placeholder: '请选择用户注册时间',
      span: 5.5,
      label: '注册时间'
    }
  }

  const initQuery = {
    nick_name: '',
    phonenumber: '',
    status: '',
    create_time: '',
    pageNum: 1,
    pageSize: 20
  }

  const query = ref<{ nick_name: string; status: string; phonenumber: string; create_time: string; pageNum: number; pageSize: number }>({
    ...initQuery
  })

  // 表格
  const columns: TableColumn[] = [
    { label: '用户编号', prop: 'user_id', width: 90 },
    { label: '用户昵称', prop: 'nick_name' },
    { label: '用户头像', prop: 'avatar' },
    { label: '用户手机号', prop: 'phonenumber', width: 150 },
    { label: '用户账号', prop: 'user_name' },
    { label: '用户密码', prop: 'password' },
    { label: '用户角色', prop: 'role_name' },
    { label: '用户状态', prop: 'status' },
    { label: '创建时间', prop: 'create_time', width: 180 },
    { label: '操作', prop: 'actions', width: 120, fixed: 'right' }
  ]

  // 表单
  const formFields: FormField[] = [
    {
      label: '用户头像',
      prop: 'avater',
      type: 'upload-image',
      placeholder: '请选择用户头像',
      limit: 1
    },
    {
      label: '用户昵称',
      prop: 'nick_name',
      type: 'input',
      placeholder: '请输入用户名称'
    },
    {
      label: '用户手机号',
      prop: 'phonenumber',
      type: 'input',
      placeholder: '请输入用户手机号'
    },
    {
      label: '用户账号',
      prop: 'user_name',
      type: 'input',
      placeholder: '请输入用户账号'
    },
    {
      label: '用户密码',
      prop: 'password',
      type: 'input',
      placeholder: '请输入用户密码'
    },
    {
      label: '用户角色',
      prop: 'role_key',
      type: 'select',
      placeholder: '请选择用户角色',
      labelKey: 'dict_label',
      valueKey: 'dict_value',
      options: sysStore.dictData['sys_role'].children.filter((item: { dict_label: string }) => item.dict_label !== '超级管理员')
    },
    {
      label: '用户状态',
      prop: 'status',
      type: 'radio',
      placeholder: '请选择用户状态',
      labelKey: 'dict_label',
      valueKey: 'dict_value',
      options: sysStore.dictData['sys_status'].children
    },
    {
      label: '用户邮箱',
      prop: 'email',
      type: 'input',
      placeholder: '请输入用户邮箱'
    }
  ]

  const formRules = {
    nick_name: [{ required: true, message: '请输入用户名称', trigger: 'blur' }],
    phonenumber: [{ required: true, message: '请输入用户手机号', trigger: 'blur' }],
    user_name: [{ required: true, message: '请输入用户账号', trigger: 'blur' }],
    password: [{ required: true, message: '请输入用户密码', trigger: 'blur' }],
    role_key: [{ required: true, message: '请选择用户角色', trigger: 'change' }],
    avater: [{ required: true, message: '请选择用户头像', trigger: 'change' }],
    status: [{ required: true, message: '请选择用户状态', trigger: 'change' }]
  }

  const initFormData = {
    nick_name: '',
    phonenumber: '',
    status: '0',
    user_name: '',
    password: '',
    avater: 'upload/sys/avater.gif',
    role_key: '',
    email: ''
  }

  const formData = ref<userType>({ ...initFormData })

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
