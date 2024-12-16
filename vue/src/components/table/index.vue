<template>
  <div class="table-comp">
    <div class="operate flex mb-[10px]" v-if="showDefaultButton">
      <slot name="buttons">
        <!-- 默认按钮 -->
        <el-button type="primary" :icon="'Plus'" @click="handleAdd">新增</el-button>
        <el-button v-if="showSelection" type="primary" :icon="'Delete'" :disabled="!multipleSelection.length">批量删除</el-button>
      </slot>
    </div>

    <el-table ref="multipleTableRef" :row-key="rowKey" border :data="tableData" :header-cell-style="tableHeaderColor" style="width: 100%" @selection-change="handleSelectionChange">
      <!-- 添加索引列 -->
      <el-table-column v-if="showSelection" type="selection" label="" width="55" align="center" />
      <!-- 添加索引列 -->
      <el-table-column v-if="showIndex" type="index" label="#" width="55" align="center" />

      <!-- 动态渲染表格列 -->
      <el-table-column show-overflow-tooltip v-for="column in columns" :key="column.prop" :prop="column.prop" :label="column.label" :width="column.width" :fixed="column.fixed" align="center">
        <!-- 判断是否有外部传入的自定义插槽内容 -->
        <template v-if="$slots[column.prop]" #default="{ row }">
          <slot :name="column.prop" :row="row" />
        </template>

        <!-- 默认显示数据字段内容 -->
        <template v-else #default="{ row }">
          <span class="custom-cell">{{ row[column.prop] !== null && row[column.prop] !== undefined && row[column.prop] !== '' ? row[column.prop] : '-' }}</span>
        </template>
      </el-table-column>
    </el-table>
    <div class="flex justify-end mt-[10px]" v-if="showPagination && total > 0">
      <Pagination :query="paginationQuery" :total="total" @change="paginationChange" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TableInstance } from 'element-plus'

interface TableConfig {
  rowKey?: string
  showSelection?: boolean
  showDefaultButton?: boolean // 默认值
  showPagination?: boolean
  paginationQuery?: { pageNum: number; pageSize: number }
  total?: number
  columns: Array<{
    label: string
    prop: string
    width?: string | number
    fixed?: 'left' | 'right'
  }>
  tableData: Array<Record<string, any>>
  showIndex: boolean
}

const props = withDefaults(defineProps<TableConfig>(), {
  showSelection: false,
  showPagination: false,
  showDefaultButton: true,
  paginationQuery: () => ({ pageNum: 1, pageSize: 20 }),
  total: 0
})

const tableHeaderColor = {
  background: '#f9f9f9 !important',
  color: '#333333',
  fontSize: '14px'
}

const multipleSelection = ref<Record<string, any>[]>([])
const multipleTableRef = ref<InstanceType<typeof TableInstance>>()

const emit = defineEmits(['selection-change', 'handle-add', 'handle-pagination'])

const handleSelectionChange = (val: Record<string, any>[]) => {
  multipleSelection.value = val
  emit('selection-change', val)
}

const handleAdd = () => {
  emit('handle-add')
}

const paginationChange = (val: { pageNum: number; pageSize: number }) => {
  emit('handle-pagination', val)
}
</script>

<style scoped lang="scss">
.table-comp {
  color: rgba(0, 0, 0, 0.88);
  width: 100%;
  // width: calc(100vw - 200px - 20px);
  @apply bg-white py-[10px] px-[15px] rounded-1;

  .custom-cell {
    color: rgba(0, 0, 0, 0.88);
  }
}
</style>
