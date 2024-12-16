<template>
  <div>
    <!-- 筛选 -->
    <Search v-model="query" :fields="searchFields" @search="api.dictValueList()" @reset="resetQuery" />
    <!-- 表格 -->
    <Table
      class="mt-[10px]"
      :columns="columns"
      :tableData="tableData"
      :showIndex="false"
      :showPagination="true"
      :paginationQuery="query"
      :total="total"
      @handle-pagination="pagination"
      @handle-add="dialogVisible = true"
    >
      <!-- 使用自定义插槽 -->
      <template #status="{ row }">
        <el-tag :type="sysStore.getDictValue('sys_status', row.status).remark">{{ sysStore.getDictValue('sys_status', row.status).dict_label }}</el-tag>
      </template>
      <!-- 使用自定义插槽 -->
      <template #actions="{ row }">
        <div class="flex items-center justify-between px-[10px]">
          <el-text class="cursor-pointer" type="primary" @click="alertBtn(row)">修改</el-text>
          <el-popconfirm title="是否确认删除" @confirm="api.dictValueDelete(row.dict_code)">
            <template #reference>
              <el-text class="cursor-pointer" type="primary">删除</el-text>
            </template>
          </el-popconfirm>
        </div>
      </template>
    </Table>
    <!-- 弹窗 -->
    <Dialog v-model="dialogVisible" :title="formData.dict_code ? '修改' : '新增'" width="50%" @handle-confirm="handleConfirm" @close=";(dialogVisible = false), resetFormData()">
      <template #content v-if="dialogVisible">
        <Form ref="customeFormRef" v-model="formData" :fields="formFields" :rules="formRules" />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { postDictValueAdd, getDictValueList, postDictValueAlter, postDictValueDelete } from '@/service/api/sys/dict'
import { useRoute } from 'vue-router'
import type { FormInstance } from 'element-plus'

const route = useRoute()
const sysStore = inject('sysStore') as sysStoreType

const dialogVisible = ref(false)
const customeFormRef = ref<InstanceType<typeof FormInstance | null>>(null)

const instance = getCurrentInstance()
const tools = instance?.appContext.config.globalProperties.$tools

const query = ref({
  pageNum: 1,
  pageSize: 20,
  dict_type: '',
  status: ''
})

const total = ref(0)

const getDictTypeOptions = () => {
  let arr = []

  for (const key in sysStore.dictData) {
    const value = sysStore.dictData[key]
    arr.push(value)
  }
  return arr as Record<string, any>[]
}

const searchFields = reactive({
  dict_type: {
    type: 'select',
    placeholder: '请选择字典名称',
    span: 5,
    label: '字典名称',
    labelKey: 'dict_name',
    valueKey: 'dict_type',
    options: [] as Record<string, any>[]
  },
  status: {
    type: 'select',
    placeholder: '请选择字典状态',
    span: 5,
    label: '字典状态',
    labelKey: 'dict_label',
    valueKey: 'dict_value',
    options: sysStore.dictData['sys_status'].children
  }
})

const columns: TableColumn[] = [
  { label: '字典标签', prop: 'dict_label' },
  { label: '字典键值', prop: 'dict_value' },
  { label: '字典排序', prop: 'dict_sort' },
  { label: '字典状态', prop: 'status' },
  { label: '字典备注', prop: 'remark' },
  { label: '创建时间', prop: 'create_time' },
  { label: '操作', prop: 'actions', width: 120, fixed: 'right' }
]

const formFields: FormField[] = [
  {
    label: '字典类型',
    prop: 'dict_type',
    type: 'input',
    disabled: true,
    placeholder: '请输入字典类型'
  },
  {
    label: '字典标签',
    prop: 'dict_label',
    type: 'input',
    placeholder: '请输入字典标签'
  },
  {
    label: '字典键值',
    prop: 'dict_value',
    type: 'input',
    placeholder: '请输入字典键值'
  },
  {
    label: '字典排序',
    prop: 'dict_sort',
    type: 'input-number',
    placeholder: '请输入字典排序'
  },
  {
    label: '字典状态',
    prop: 'status',
    type: 'radio',
    labelKey: 'dict_label',
    valueKey: 'dict_value',
    options: sysStore.dictData['sys_status'].children
  },
  {
    label: '字典备注',
    prop: 'remark',
    type: 'textarea',
    placeholder: '请输入字典备注'
  }
]

const formRules = {
  dict_type: [{ required: true, message: '请输入字典标签', trigger: 'blur' }],
  dict_label: [{ required: true, message: '请输入字典标签', trigger: 'blur' }],
  dict_value: [{ required: true, message: '请输入字典键值', trigger: 'blur' }],
  dict_sort: [{ required: true, message: '请输入字典排序', trigger: 'blur' }],
  status: [{ required: true, message: '请选择字典状态', trigger: 'change' }]
}

const formData = ref<dictValue>({
  dict_type: '',
  dict_label: '',
  dict_value: '',
  status: '0',
  dict_sort: 1,
  remark: ''
})

const tableData = ref<Record<string, any>[]>([])

const resetQuery = () => {
  query.value = {
    pageNum: 1,
    pageSize: 20,
    status: '',
    dict_type: typeof route.query.dict_type === 'string' ? route.query.dict_type : ''
  }

  api.dictValueList()
}

const pagination = (val: { pageNum: number; pageSize: number }) => {
  query.value.pageNum = val.pageNum
  query.value.pageSize = val.pageSize
  api.dictValueList()
}

const resetFormData = () => {
  formData.value = {
    dict_label: '',
    dict_value: '',
    status: '0',
    dict_sort: 1,
    remark: '',
    dict_type: typeof route.query.dict_type === 'string' ? route.query.dict_type : ''
  }
}

const alertBtn = (row: { dict_code: number; status: number }) => {
  tools.objectSame(formData.value, row)
  formData.value.dict_code = row.dict_code
  dialogVisible.value = true
}

const handleConfirm = async () => {
  const formEl = customeFormRef.value?.formRef
  if (!formEl) return
  await formEl.validate((valid: Boolean, fields: Record<string, any>) => {
    if (valid) {
      if (formData.value.dict_code) {
        api.dictValueAlter()
      } else {
        api.dictValueAdd()
      }
    } else {
      console.log('校验失败:', fields)
    }
  })
}

const api = {
  // 列表
  async dictValueList() {
    const { data } = await getDictValueList(query.value)

    tableData.value = data.list
    total.value = data.total
  },
  // 新增
  async dictValueAdd() {
    const { code, msg } = await postDictValueAdd(formData.value)
    api.success(code, msg)
  },
  // 修改
  async dictValueAlter() {
    const { code, msg } = await postDictValueAlter(formData.value)
    api.success(code, msg)
  },
  // 删除
  async dictValueDelete(dict_code: number) {
    const { code, msg } = await postDictValueDelete(dict_code)
    api.success(code, msg)
  },

  success(code: number, msg: string) {
    ElMessage({ message: msg, type: code != 200 ? 'error' : 'success' })
    if (code === 200) {
      // resetQuery()
      dialogVisible.value = false
      api.dictValueList()
    }
  }
}

onMounted(() => {
  api.dictValueList()
})

watch(
  route,
  (val) => {
    const _query = val.query as { dict_type: string }
    if (_query.dict_type) {
      query.value.dict_type = _query.dict_type || ''
      formData.value.dict_type = _query.dict_type || ''

      searchFields.dict_type.options = getDictTypeOptions()
    }
  },
  {
    immediate: true,
    deep: true
  }
)
</script>

<style scoped lang="scss"></style>
