<template>
  <div class="dict">
    <!-- 筛选 -->
    <Search v-model="query" :fields="searchFields" @search="api.dictTypeList()" @reset="resetQuery" />
    <!-- 表格 -->
    <Table class="mt-[10px]" :columns="columns" :tableData="tableData" :showIndex="false" @handle-add="dialogVisible = true">
      <!-- 使用自定义插槽 -->
      <template #status="{ row }">
        <el-tag :type="sysStore.getDictValue('sys_status', row.status).remark">{{ sysStore.getDictValue('sys_status', row.status).dict_label }}</el-tag>
      </template>

      <!-- 使用自定义插槽 -->
      <template #dict_type="{ row }">
        <el-text class="cursor-pointer" type="primary" @click="router.push({ path: '/dict/value', query: { dict_type: row.dict_type } })">{{ row.dict_type }}</el-text>
      </template>

      <!-- 使用自定义插槽 -->
      <template #actions="{ row }">
        <div class="flex items-center px-[10px]" :class="!row.dict_type.includes('sys') ? 'justify-between' : 'justify-center'">
          <el-text class="cursor-pointer" type="primary" v-if="!row.dict_type.includes('sys')" @click="alertBtn(row)">修改</el-text>
          <el-popconfirm title="是否确认删除" v-if="!row.dict_type.includes('sys')" @confirm="api.dictTypeDelete(row.dict_id)">
            <template #reference>
              <el-text class="cursor-pointer" type="primary">删除</el-text>
            </template>
          </el-popconfirm>
        </div>
      </template>
    </Table>

    <!-- 弹窗 -->
    <Dialog v-model="dialogVisible" :title="formData.dict_id ? '修改' : '新增'" width="50%" @handle-confirm="handleConfirm" @close=";(dialogVisible = false), resetFormData()">
      <template #content v-if="dialogVisible">
        <Form ref="customeFormRef" v-model="formData" :fields="formFields" :rules="formRules" />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { FormInstance } from 'element-plus'
import { getDictTypeList, postDictTypeAdd, postDictTypeAlter, postDictTypeDelete } from '@/service/api/sys/dict'
import { useDictConfig } from './useDynamicConfig'

const router = useRouter()

const { searchFields, query, columns, formData, formFields, formRules, initQuery, resetFormData, sysStore } = useDictConfig()

const customeFormRef = ref<InstanceType<typeof FormInstance | null>>(null)

const instance = getCurrentInstance()
const tools = instance?.appContext.config.globalProperties.$tools

// 表格
const tableData = ref<Record<string, any>[]>([])

// 弹窗
const dialogVisible = ref(false)

const resetQuery = () => {
  query.value = { ...initQuery }
  api.dictTypeList()
}

// 修改按钮
const alertBtn = (row: { dict_id: number; status: number }) => {
  tools.objectSame(formData.value, row)
  formData.value.dict_id = row.dict_id
  dialogVisible.value = true
}

// 弹窗确定
const handleConfirm = async () => {
  // 获取 DynamicForm 的 formRef
  const formEl = customeFormRef.value?.formRef
  if (!formEl) return
  await formEl.validate((valid: Boolean, fields: Record<string, any>) => {
    if (valid) {
      if (formData.value.dict_id) {
        api.dictTypeAlter()
      } else {
        api.dictTypeAdd()
      }
    } else {
      console.log('校验失败:', fields)
    }
  })
}

const api = reactive({
  // 获取字典列表
  async dictTypeList() {
    const { data } = await getDictTypeList(query.value)
    tableData.value = data.list
  },
  // 新增字典
  async dictTypeAdd() {
    const { code, msg } = await postDictTypeAdd(formData.value)
    ElMessage({ message: msg, type: code != 200 ? 'error' : 'success' })
    if (code === 200) api.dictTypeList(), (dialogVisible.value = false)
  },
  // 修改字典
  async dictTypeAlter() {
    const { code, msg } = await postDictTypeAlter(formData.value)
    ElMessage({ message: msg, type: code != 200 ? 'error' : 'success' })
    if (code === 200) api.dictTypeList(), (dialogVisible.value = false)
  },
  // 删除
  async dictTypeDelete(dict_id: number) {
    const { code, msg } = await postDictTypeDelete({ dict_id })
    ElMessage({ message: msg, type: code != 200 ? 'error' : 'success' })
    if (code === 200) api.dictTypeList()
  }
})

onMounted(() => {
  api.dictTypeList()
})
</script>

<style scoped lang="scss"></style>
