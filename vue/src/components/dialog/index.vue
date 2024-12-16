<template>
  <div>
    <el-dialog v-model="internalVisible" :title="title" :width="width" :close-on-click-modal="false" @close="close">
      <slot name="content"></slot>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCancel">取消</el-button>
          <el-button type="primary" @click="handleConfirm">保存</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  title: string
  width: string
  modelValue: boolean
}>()

const emit = defineEmits(['update:modelValue', 'handle-cancel', 'handle-confirm', 'close'])

const internalVisible = ref(props.modelValue)

// 监视外部 v-model 的变化
watch(
  () => props.modelValue,
  (newVal) => {
    internalVisible.value = newVal
  }
)

// 监视内部值的变化并更新外部 v-model
watch(internalVisible, (newVal) => {
  emit('update:modelValue', newVal)
})

const handleCancel = () => {
  internalVisible.value = false
  emit('handle-cancel')
}

const handleConfirm = () => {
  emit('handle-confirm')
}

const close = () => {
  emit('close')
}
</script>

<style scoped></style>
