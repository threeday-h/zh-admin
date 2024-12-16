<template>
  <div>
    <el-pagination
      v-model:current-page="query.pageNum"
      v-model:page-size="query.pageSize"
      :page-sizes="[20, 50, 70, 100]"
      size="default"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  query: { pageNum: number; pageSize: number }
  total: number
}>()

const emit = defineEmits(['change'])

const handleSizeChange = (val: number) => {
  props.query.pageSize = val
  emit('change', props.query)
}
const handleCurrentChange = (val: number) => {
  props.query.pageNum = val
  emit('change', props.query)
}
</script>

<style scoped></style>
