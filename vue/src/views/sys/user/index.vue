<template>
  <div>
    <!-- 查询 -->
    <Search v-model="query" :fields="searchFields" @search="search" @reset="resetQuery" />
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
      <!-- 头像 -->
      <template #avatar="{ row }">
        <el-avatar shape="circle" :size="50" fit="cover" :src="row.avatar ? tools.addBaseUrl(row.avatar) : ''" />
      </template>

      <!-- 状态 -->
      <template #status="{ row }">
        <el-tag :type="sysStore.getDictValue('sys_status', row.status).remark" class="w-[50px]">{{ sysStore.getDictValue('sys_status', row.status).dict_label }}</el-tag>
      </template>
      <!-- 操作 -->
      <template #actions="{ row }">
        <div class="flex items-center justify-between px-[10px]" v-if="row.role_key !== 'admin'">
          <el-text class="cursor-pointer" type="primary" @click="alertBtn(row)">修改</el-text>
          <el-popconfirm title="是否确认删除" @confirm="api.delete(row.user_id)">
            <template #reference>
              <el-text class="cursor-pointer" type="primary">删除</el-text>
            </template>
          </el-popconfirm>
        </div>
        <div class="" v-else>-</div>
      </template>
    </Table>
    <!-- 弹窗 -->
    <Dialog v-model="dialogVisible" :title="formData.user_id ? '修改用户' : '新增用户'" width="50%" @handle-confirm="handleConfirm" @close=";(dialogVisible = false), resetFormData()">
      <template #content v-if="dialogVisible">
        <Form ref="customeFormRef" v-model="formData" :fields="formFields" :rules="formRules"> </Form>
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import type { FormInstance } from 'element-plus'
import { getList, postAddUser, postAlter, postDeleteUser } from '@/service/api/sys/user'
import { useUserConfig } from './useDynamicConfig'
const { query, searchFields, initQuery, columns, formData, formFields, formRules, resetFormData, sysStore } = useUserConfig()

const instance = getCurrentInstance()
const tools = instance?.appContext.config.globalProperties.$tools

const tableData = ref<Record<string, any>[]>([])
const customeFormRef = ref<InstanceType<typeof FormInstance | null>>(null)

const dialogVisible = ref(false)
const total = ref(0)

const resetQuery = () => {
  query.value = { ...initQuery }
  api.listApi()
}

const search = () => {
  query.value.pageNum = 1
  query.value.pageSize = 20
  api.listApi()
}

const alertBtn = (row: { user_id: number }) => {
  tools.objectSame(formData.value, row)
  console.log('formData.value', formData.value)
  formData.value.user_id = row.user_id
  dialogVisible.value = true
}

const pagination = (val: { pageNum: number; pageSize: number }) => {
  query.value.pageNum = val.pageNum
  query.value.pageSize = val.pageSize
  api.listApi()
}

const handleConfirm = async () => {
  const formEl = customeFormRef.value?.formRef // 获取 DynamicForm 的 formRef

  if (!formEl) return
  await formEl.validate((valid: Boolean, fields: Record<string, any>) => {
    if (valid) {
      if (formData.value.user_id) {
        api.alter()
      } else {
        api.addUser()
      }
    } else {
      console.log('校验失败:', fields)
    }
  })
}

//
const api = {
  // 列表
  async listApi() {
    const { data } = await getList(query.value)
    tableData.value = data.list
    total.value = data.total
  },
  // 新增
  async addUser() {
    const { code, msg } = await postAddUser(formData.value)
    api.success(code, msg)
  },
  // 修改
  async alter() {
    const { code, msg } = await postAlter(formData.value)
    api.success(code, msg)
  },
  // 删除
  async delete(user_id: number) {
    const { code, msg } = await postDeleteUser(user_id)
    api.success(code, msg)
  },

  success(code: number, msg: string) {
    ElMessage({ message: msg, type: code != 200 ? 'error' : 'success' })
    if (code === 200) {
      dialogVisible.value = false
      api.listApi()
    }
  }
}

onMounted(() => {
  api.listApi()
})
</script>

<style scoped lang="scss"></style>
