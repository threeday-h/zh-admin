<template>
  <div class="component-upload-image">
    <el-upload
      multiple
      :action="uploadImgUrl"
      list-type="picture-card"
      :on-success="handleUploadSuccess"
      :before-upload="handleBeforeUpload"
      :limit="limit"
      :on-error="handleUploadError"
      :on-exceed="handleExceed"
      ref="imageUpload"
      :on-remove="handleDelete"
      :show-file-list="true"
      :file-list="fileList"
      :on-preview="handlePictureCardPreview"
      :class="{ hide: fileList.length >= limit }"
    >
      <el-icon><Plus /></el-icon>
    </el-upload>

    <div class="el-upload__tip" v-if="showTip">
      请上传
      <template v-if="fileSize">
        大小不超过 <b style="color: #f56c6c">{{ fileSize }}MB</b>
      </template>
      <template v-if="fileType">
        格式为 <b style="color: #f56c6c">{{ fileType.join('/') }}</b>
      </template>
      的文件
    </div>

    <el-dialog v-model:visible="dialogVisible" title="预览" width="800" append-to-body>
      <img :src="dialogImageUrl" style="display: block; max-width: 100%; margin: 0 auto" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  modelValue: {
    type: [String, Object, Array] as PropType<string | object | Array<string>>,
    required: false
  },
  limit: {
    type: Number,
    default: 5
  },
  fileSize: {
    type: Number,
    default: 5
  },
  fileType: {
    type: Array as PropType<string[]>,
    default: () => ['png', 'jpg', 'jpeg']
  },
  isShowTip: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue'])

const VITE_APP_BASE_URL = import.meta.env.VITE_APP_BASE_URL.slice(0, -3)

const dialogImageUrl = ref('')
const dialogVisible = ref(false)
const fileList = ref<Array<{ name: string; url: string }>>([])
const uploadList = ref<Array<{ name: string; url: string }>>([])
const number = ref(0)
const uploadImgUrl = `${VITE_APP_BASE_URL}api/upload`

const showTip = computed(() => props.isShowTip && (props.fileType || props.fileSize))

watch(
  () => props.modelValue,
  (val: any) => {
    if (val) {
      const list = Array.isArray(val) ? val : val.split(',')

      fileList.value = list.map((item: {}) => {
        if (typeof item === 'string') {
          item = item.includes(VITE_APP_BASE_URL) ? { name: item, url: item } : { name: `${VITE_APP_BASE_URL}${item}`, url: `${VITE_APP_BASE_URL}${item}` }
        }
        return item
      })
    } else {
      fileList.value = []
    }
  },
  { immediate: true, deep: true }
)

const handleBeforeUpload = (file: File) => {
  const fileExtension = file.name.split('.').pop()
  const isImg = props.fileType.includes(fileExtension || '')
  if (!isImg) {
    ElMessage.error(`文件格式不正确, 请上传${props.fileType.join('/')}格式文件!`)
    return false
  }
  if (file.size / 1024 / 1024 > props.fileSize) {
    ElMessage.error(`上传图片大小不能超过 ${props.fileSize} MB!`)
    return false
  }
  number.value++
  return true
}

const handleUploadSuccess = (res: any, file: any) => {
  if (res.code === 200) {
    const data = res.data
    uploadList.value.push({ name: data.newFilename, url: data.filePath })
    uploadedSuccessfully()
  } else {
    number.value--
    ElMessage.error(res.msg)
    handleDelete(file)
    uploadedSuccessfully()
  }
}

const handleDelete = (file: any) => {
  const index = fileList.value.findIndex((f) => f.name === file.name)
  if (index > -1) {
    fileList.value.splice(index, 1)
    emit('update:modelValue', listToString(fileList.value))
  }
}

const handleUploadError = () => {
  ElMessage.error('上传图片失败，请重试')
}

const handleExceed = () => {
  ElMessage.error(`上传文件数量不能超过 ${props.limit} 个!`)
}

const handlePictureCardPreview = (file: any) => {
  dialogImageUrl.value = file.url
  dialogVisible.value = true
}

const uploadedSuccessfully = () => {
  if (number.value > 0 && uploadList.value.length === number.value) {
    fileList.value = fileList.value.concat(uploadList.value)
    uploadList.value = []
    number.value = 0

    emit('update:modelValue', listToString(fileList.value))
  }
}

const listToString = (list: Array<{ name: string; url: string }>, separator = ',') => {
  return list.map((item) => item.url.replace(VITE_APP_BASE_URL, '')).join(separator)
}
</script>

<style scoped lang="scss">
:deep(.hide .el-upload--picture-card) {
  display: none;
}
:deep(.el-list-enter-active, .el-list-leave-active) {
  transition: all 0s;
}

:deep(.el-list-enter, .el-list-leave-active) {
  opacity: 0;
  transform: translateY(0);
}
</style>
