<template>
  <div>
    <!-- 查询 -->
    <Search v-model="query" :fields="searchFields" @search="api.listRole()" @reset="resetQuery" />
    <!-- 表格 -->
    <Table class="mt-[10px]" :columns="columns" :tableData="tableData" :showIndex="false" @handle-add="handleAdd">
      <!-- 状态 -->
      <template #status="{ row }">
        <el-tag :type="sysStore.getDictValue('sys_status', row.status).remark" class="w-[50px]">{{ sysStore.getDictValue('sys_status', row.status).dict_label }}</el-tag>
      </template>

      <!-- 操作 -->
      <template #actions="{ row }">
        <div class="flex items-center justify-between px-[10px]" v-if="row.role_key !== 'admin'">
          <el-text class="cursor-pointer" type="primary" @click="alertBtn(row)">修改</el-text>
          <el-popconfirm title="是否确认删除" @confirm="api.deleteRole(row.role_id, row.dict_code)">
            <template #reference>
              <el-text class="cursor-pointer" type="primary">删除</el-text>
            </template>
          </el-popconfirm>
        </div>
        <div class="" v-else>-</div>
      </template>
    </Table>
    <!-- 弹窗 -->
    <Dialog v-model="dialogVisible" :title="formData.role_id ? '修改角色' : '新增角色'" width="50%" @handle-confirm="handleConfirm" @close=";(dialogVisible = false), resetFormData()">
      <template #content v-if="dialogVisible">
        <Form ref="customeFormRef" v-model="formData" :fields="formFields" :rules="formRules">
          <!-- 自定义插槽 -->
          <template #menu_id="{ formData }">
            <div class="flex flex-col w-full">
              <div class="border border-solid border-[#eee] w-full">
                <el-tree ref="treeRef" node-key="id" default-expand-all style="max-height: 600px" show-checkbox :data="sysStore.menu" />
              </div>
            </div>
          </template>
        </Form>
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { getListRole, postAddRole, postAlterRole, postDeleteRole } from '@/service/api/sys/role'
import { useRoleConfig } from './useDynamicConfig'
import type { ElTree, FormInstance } from 'element-plus'
const instance = getCurrentInstance()
const tools = instance?.appContext.config.globalProperties.$tools

const { query, searchFields, columns, formData, formFields, formRules, sysStore, resetFormData, initQuery } = useRoleConfig()

const dialogVisible = ref(false)
const tableData = ref<Record<string, any>[]>([])

const treeRef = ref<InstanceType<typeof ElTree>>()
const customeFormRef = ref<InstanceType<typeof FormInstance | null>>(null)

const resetQuery = () => {
  query.value = { ...initQuery }
  api.listRole()
}

const handleAdd = () => {
  dialogVisible.value = true
  nextTick(() => {
    sysStore.menu[0].disabled = true
    treeRef.value!.setCheckedKeys([2042], false)
  })
}

// 修改按钮
const alertBtn = (row: { role_id: number; status: number; menu_id: string; dict_code: string }) => {
  tools.objectSame(formData.value, row)
  formData.value.role_id = row.role_id
  formData.value.dict_code = row.dict_code
  dialogVisible.value = true
  nextTick(() => {
    sysStore.menu[0].disabled = true
    treeRef.value!.setCheckedKeys(row.menu_id.split(','), false)
  })
}

const handleConfirm = async () => {
  const formEl = customeFormRef.value?.formRef // 获取 DynamicForm 的 formRef

  formData.value.menu_id = treeRef.value!.getCheckedKeys(false).toString()

  if (!formEl) return
  await formEl.validate((valid: Boolean, fields: Record<string, any>) => {
    if (valid) {
      console.log('提交成功:', formData.value)

      if (formData.value.role_id) {
        api.alterRole()
      } else {
        api.addRole()
      }
    } else {
      console.log('校验失败:', fields)
    }
  })
}

const api = reactive({
  async listRole() {
    const { data } = await getListRole(query.value)
    tableData.value = data.list
  },
  // 新增
  async addRole() {
    const { code, msg } = await postAddRole(formData.value)
    ElMessage({ message: msg, type: code != 200 ? 'error' : 'success' })
    if (code === 200) api.listRole(), (dialogVisible.value = false)
  },
  // 修改
  async alterRole() {
    const { code, msg } = await postAlterRole(formData.value)
    ElMessage({ message: msg, type: code != 200 ? 'error' : 'success' })
    if (code === 200) api.listRole(), (dialogVisible.value = false)
  },
  // 删除
  async deleteRole(role_id: number, dict_code: string) {
    const { code, msg } = await postDeleteRole({ role_id, dict_code })
    ElMessage({ message: msg, type: code != 200 ? 'error' : 'success' })
    if (code === 200) api.listRole()
  }
})

onMounted(() => {
  api.listRole()
})
</script>

<style scoped lang="scss"></style>
