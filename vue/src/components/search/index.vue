<template>
  <div class="search-comp">
    <el-row v-for="(rowFields, rowIndex) in groupedFields" :key="rowIndex" class="search-row" :gutter="10">
      <el-col v-for="(field, fieldName) in rowFields" :key="fieldName" :span="field.fieldConfig.span" class="mb-[10px]">
        <template v-if="field.fieldConfig.type === 'input'">
          <div class="flex items-center">
            <label class="field-label">{{ field.fieldConfig.label }}</label>
            <el-input clearable v-model="modelValue[field.fieldName]" :placeholder="field.fieldConfig.placeholder" class="input-field" />
          </div>
        </template>
        <template v-else-if="field.fieldConfig.type === 'select'">
          <div class="flex items-center">
            <label class="field-label">{{ field.fieldConfig.label }}</label>

            <el-select clearable v-model="modelValue[field.fieldName]" :placeholder="field.fieldConfig.placeholder" class="input-field">
              <el-option
                v-for="option in field.fieldConfig.options"
                :key="option[field.fieldConfig.labelKey || 'label']"
                :label="option[field.fieldConfig.labelKey || 'label']"
                :value="option[field.fieldConfig.valueKey || 'value']"
              />
            </el-select>
          </div>
        </template>
        <template v-else-if="field.fieldConfig.type === 'date'">
          <label class="field-label">{{ field.fieldConfig.label }}</label>
          <el-date-picker clearable v-model="modelValue[field.fieldName]" type="date" value-format="YYYY-MM-DD" format="YYYY-MM-DD" :placeholder="field.fieldConfig.placeholder" class="input-field" />
        </template>
      </el-col>
    </el-row>
    <el-row>
      <el-button type="primary" :icon="'Search'" @click="btnClick">查询</el-button>
      <el-button type="" :icon="'Refresh'" @click="resetClick">重置</el-button>
    </el-row>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: Record<string, any> // 外部传入的对象
  fields: Record<string, { type: string; placeholder?: string; labelKey?: string; valueKey?: string; options?: Record<string, any>[]; span?: number; label?: string }> // 字段配置，包括 span 和 label
}>()

const groupedFields = computed(() => {
  const fieldsArray = Object.entries(props.fields)
  const rows: Array<Array<any>> = []
  let currentRow: Array<any> = []
  let currentSpan = 0

  for (const [fieldName, fieldConfig] of fieldsArray) {
    if (currentSpan + (fieldConfig.span || 24) > 24) {
      // 判断是否超过24
      rows.push(currentRow) // 保存当前行
      currentRow = [] // 重置当前行
      currentSpan = 0 // 重置当前 span
    }
    currentRow.push({ fieldName, fieldConfig })
    currentSpan += fieldConfig.span || 24 // 累加 span
  }
  if (currentRow.length) {
    rows.push(currentRow) // 添加最后一行
  }

  return rows
})

const emit = defineEmits(['search', 'reset'])

const btnClick = () => {
  emit('search')
}

const resetClick = () => {
  emit('reset')
}
</script>

<style scoped lang="scss">
.search-comp {
  color: rgba(0, 0, 0, 0.88);
  @apply bg-white py-[10px] px-[15px] rounded-1 overflow-hidden;

  .field-label {
    @apply text-[14px] mr-2;
    flex-shrink: 0; /* 防止标签缩小 */
  }

  .input-field {
    flex-grow: 1; /* 输入框占据剩余空间 */
  }
}
</style>
