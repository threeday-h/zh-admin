<template>
  <div class="route">
    <!-- 筛选 -->
    <Search v-model="query" :fields="searchFields" @search="api.listRouteMenu()" @reset="resetQuery" />

    <!-- 表格 -->
    <Table class="mt-[10px]" :columns="columns" rowKey="id" :tableData="tableData" :showIndex="false" :showSelection="false" @handle-add="dialogVisible = true">
      <!-- 使用自定义插槽 -->
      <template #status="{ row }">
        <el-tag :type="sysStore.getDictValue('sys_status', row.status).remark">{{ sysStore.getDictValue('sys_status', row.status).dict_label }}</el-tag>
      </template>

      <!-- 使用自定义插槽 -->
      <template #icon="{ row }">
        <div class="flex items-center justify-center">
          <svg-icon :name="row.icon || ''" />
        </div>
      </template>

      <!-- 使用自定义插槽 -->
      <template #actions="{ row }">
        <div class="flex items-center justify-center px-[10px]" v-if="row.menu_name !== '首页'">
          <el-text class="cursor-pointer" style="margin-right: 10px" type="primary" @click="addBtn(row)">新增</el-text>
          <el-text class="cursor-pointer" :style="row.menu_id !== 2038 && row.parent_id !== 2038 ? 'margin-right: 10px' : ''" type="primary" @click="alertBtn(row)">修改</el-text>
          <el-popconfirm v-if="row.menu_id !== 2038 && row.parent_id !== 2038" title="是否确认删除" @confirm="api.deleteRouteMenu(row.menu_id)">
            <template #reference>
              <el-text class="cursor-pointer" type="primary">删除</el-text>
            </template>
          </el-popconfirm>
        </div>
        <div v-else>-</div>
      </template>
    </Table>

    <!-- 弹窗 -->
    <Dialog v-model="dialogVisible" :title="formData.menu_id ? '修改菜单' : '新增菜单'" width="50%" @handle-confirm="handleConfirm" @close=";(dialogVisible = false), resetFormData()">
      <template #content v-if="dialogVisible">
        <Form ref="customeFormRef" v-model="formData" :fields="formFields" :rules="formRules">
          <!-- 自定义插槽 -->
          <template #icon="{ formData }">
            <div class="input w-full flex items-center">
              <el-input disabled v-model="formData.icon" placeholder="请选择图标">
                <template #prepend>
                  <svg-icon :name="formData.icon" />
                </template>
              </el-input>
            </div>
            <div class="icon">
              <div class="item" v-for="(name, index) in iconNames" :key="index" :class="formData.icon === name && 'text-primary'" @click="formData.icon = name">
                <svg-icon :name="name || ''" :color="formData.icon === name ? '#1748fd' : '#000'" />
                <span>{{ name }}</span>
              </div>
            </div>
          </template>
        </Form>
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import type { FormInstance } from 'element-plus'
import { useRouteConfig } from './useDynamicConfig'
import { postAddRouteMenu, postDeleteRouteMenu, getListRouteMenu, postAlterRouteMenu } from '@/service/api/sys/route'

const instance = getCurrentInstance()
const tools = instance?.appContext.config.globalProperties.$tools

const { searchFields, query, formData, formFields, formRules, columns, sysStore, initQuery, resetFormData } = useRouteConfig()

const svg = import.meta.glob('../../../assets/icon/svg/**')
const iconNames = Object.keys(svg)
  .map((filePath) => {
    // 使用正则表达式提取文件名（不包括路径和扩展名）
    const match = filePath.match(/\/([^/]+)\.svg$/)
    return match ? match[1] : null
  })
  .filter(Boolean)

const dialogVisible = ref(false)
const customeFormRef = ref<InstanceType<typeof FormInstance | null>>(null)

const tableData = ref<Record<string, any>[]>([])

const handleConfirm = async () => {
  const formEl = customeFormRef.value?.formRef
  if (!formEl) return
  await formEl.validate((valid: Boolean, fields: Record<string, any>) => {
    if (valid) {
      if (formData.value.menu_type == 'M') formData.value.parent_id = 0

      if (formData.value.menu_id) {
        api.alterRouteMenu()
      } else {
        api.addRouteMenuApi()
      }
    } else {
      console.log('校验失败:', fields)
    }
  })
}

const resetQuery = () => {
  query.value = { ...initQuery }
  api.listRouteMenu()
}

// 新增按钮
const addBtn = (row: { id: number }) => {
  formData.value.parent_id = row.id
  formData.value.menu_type = 'C'
  dialogVisible.value = true
}

// 修改按钮
const alertBtn = (row: { menu_id: number; status: string; visible: string }) => {
  // row.status = Number(row.status)
  // row.visible = Number(row.visible)
  tools.objectSame(formData.value, row)
  formData.value.menu_id = row.menu_id
  dialogVisible.value = true

  console.log(formData.value)
}

const api = reactive({
  // 新增路由
  async addRouteMenuApi() {
    let params = { ...formData.value }
    if (params.menu_type === 'M') params.parent_id = ''

    const { code, msg } = await postAddRouteMenu(params)

    ElMessage({ message: msg, type: code != 200 ? 'error' : 'success' })

    if (code === 200) sysStore.getMenu(), api.listRouteMenu(), (dialogVisible.value = false)
  },
  // 删除路由
  async deleteRouteMenu(menu_id: number) {
    const { code, msg } = await postDeleteRouteMenu({ menu_id })

    ElMessage({ message: msg, type: code != 200 ? 'error' : 'success' })

    if (code === 200) sysStore.getMenu(), api.listRouteMenu()
  },
  // 获取路由
  async listRouteMenu() {
    const { data } = await getListRouteMenu(query.value)
    tableData.value = data.list
  },
  // 修改路由
  async alterRouteMenu() {
    const { msg, code } = await postAlterRouteMenu(formData.value)
    ElMessage({ message: msg, type: code != 200 ? 'error' : 'success' })
    if (code === 200) sysStore.getMenu(), api.listRouteMenu(), (dialogVisible.value = false)
  }
})

onMounted(() => {
  api.listRouteMenu()
})
</script>

<style scoped lang="scss">
.icon {
  @apply p-[10px] flex flex-wrap items-center h-[250px] overflow-y-auto border border-solid border-[#eee];
  .item {
    @apply w-[25%] flex items-center cursor-pointer;
    span {
      @apply ml-[10px];
    }
  }
}
</style>
