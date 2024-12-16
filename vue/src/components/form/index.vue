<template>
  <el-form ref="formRef" :model="formData" :rules="rules" label-width="auto" class="dynamic-form" status-icon>
    <template v-for="(field, index) in fields" :key="index">
      <el-form-item :label="field.label" :prop="field.prop" v-if="shouldDisplayField(field)">
        <div v-if="!field.slot" class="w-full">
          <template v-if="field.type === 'input'">
            <el-input v-model="formData[field.prop]" :placeholder="field.placeholder" :disabled="field.disabled" />
          </template>
          <template v-if="field.type === 'select'">
            <el-select v-model="formData[field.prop]" :placeholder="field.placeholder" :disabled="field.disabled" :multiple="field.multiple">
              <el-option v-for="(option, i) in field.options" :key="i" :label="option[field.labelKey || 'label']" :value="option[field.valueKey || 'value']" />
            </el-select>
          </template>
          <template v-if="field.type === 'textarea'">
            <el-input type="textarea" v-model="formData[field.prop]" :disabled="field.disabled" :rows="field.rows" :placeholder="field.placeholder" />
          </template>
          <template v-if="field.type === 'radio'">
            <el-radio-group v-model="formData[field.prop]" :disabled="field.disabled">
              <el-radio v-for="(option, i) in field.options" :key="i" :label="option[field.valueKey || 'value']">{{ option[field.labelKey || 'label'] }}</el-radio>
            </el-radio-group>
          </template>
          <template v-if="field.type === 'input-number'">
            <el-input-number :disabled="field.disabled" v-model="formData[field.prop]" :min="0" />
          </template>
          <template v-if="field.type === 'tree-select'">
            <el-tree-select
              :disabled="field.disabled"
              v-model="formData[field.prop]"
              :check-strictly="true"
              node-key="id"
              :data="field.tree"
              :expand-on-click-node="false"
              :render-after-expand="false"
            />
          </template>
          <template v-if="field.type === 'upload-image'">
            <Image v-model="formData[field.prop]" :limit="field.limit" />
          </template>
          <template v-if="field.type === 'switch'">
            <el-switch :disabled="field.disabled" v-model="formData[field.prop]" active-value="1" inactive-value="0" />
          </template>
        </div>
        <!-- 这里是插槽的选择性添加 -->
        <slot v-if="field.slot" :name="field.prop" :formData="formData" :key="field.prop" />
      </el-form-item>
    </template>
  </el-form>
</template>

<script setup lang="ts">
import type { FormRules, FormInstance } from 'element-plus'

const props = defineProps<{
  modelValue: Record<string | number, any>
  fields: FormField[]
  rules?: InstanceType<typeof FormRules>
}>()

const emit = defineEmits(['update:modelValue'])

const formData = ref({ ...props.modelValue })
const formRef = ref<InstanceType<typeof FormInstance | null>>(null)

// 用于判断字段是否应该显示的函数
const shouldDisplayField = (field: any) => {
  // 如果字段有可见性条件，则根据该条件返回结果
  if (field.visibleIf) {
    return field.visibleIf(formData.value)
  }
  // 其他字段默认显示
  return true
}

const resetForm = () => {
  formRef.value?.resetFields()
  // formData.value = { ...props.modelValue }
}

// 防抖函数
const debounce = (func: (...args: any[]) => void, delay: number) => {
  let timeout: ReturnType<typeof setTimeout>
  return (...args: any[]) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      func(...args)
    }, delay)
  }
}

watch(
  formData,
  (newVal) => {
    emit('update:modelValue', { ...newVal })
  },
  {
    deep: true
  }
)

// 将 formRef 作为暴露给父组件的引用
defineExpose({ formRef, resetForm })
</script>

<style scoped>
.dynamic-form {
  width: 100%;
}
</style>
