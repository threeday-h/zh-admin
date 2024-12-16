<template>
  <div>
    <div class="user-info-head" @click="editCropper">
      <img :src="options.img" title="点击上传头像" class="img-circle img-lg" />
    </div>
    <el-dialog :title="title" v-model="open" width="800px" append-to-body @opened="modalOpened" @close="closeDialog">
      <el-row>
        <el-col :xs="24" :md="12" style="height: 350px">
          <div ref="cropperContainer" class="cropper-container" v-if="visible">
            <img ref="cropperImage" :src="options.img" class="cropper-image" />
          </div>
        </el-col>
        <el-col :xs="24" :md="12" style="height: 350px">
          <div class="avatar-upload-preview">
            <img :src="previews" />
          </div>
        </el-col>
      </el-row>
      <br />
      <el-row>
        <el-col :lg="2" :sm="3" :xs="3">
          <el-upload action="#" :show-file-list="false" :before-upload="beforeUpload">
            <el-button>
              选择
              <el-icon class="icon cursor-pointer" size="18">
                <UploadFilled />
              </el-icon>
            </el-button>
          </el-upload>
        </el-col>
        <el-col :lg="{ span: 1, offset: 2 }" :sm="2" :xs="2">
          <el-button :icon="'Plus'" @click="changeScale(1.1)"></el-button>
        </el-col>
        <el-col :lg="{ span: 1, offset: 1 }" :sm="2" :xs="2">
          <el-button :icon="'minus'" @click="changeScale(0.9)"></el-button>
        </el-col>
        <el-col :lg="{ span: 1, offset: 1 }" :sm="2" :xs="2">
          <el-button :icon="'RefreshLeft'" @click="rotateLeft"></el-button>
        </el-col>
        <el-col :lg="{ span: 1, offset: 1 }" :sm="2" :xs="2">
          <el-button :icon="'RefreshRight'" @click="rotateRight"></el-button>
        </el-col>
        <el-col :lg="{ span: 2, offset: 6 }" :sm="2" :xs="2">
          <el-button type="primary" @click="uploadImg">提交</el-button>
        </el-col>
      </el-row>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { upload } from '@/service/api/sys/tools'
import avater from '@/assets/img/avater.gif'
import Cropper from 'cropperjs'
import 'cropperjs/dist/cropper.css'

const props = defineProps({
  img: {
    type: String,
    required: true,
    default: avater
  }
})

const open = ref(false)
const visible = ref(false)
const title = '修改头像'
const previews = ref<string>('')
const cropperContainer = ref<HTMLDivElement | null>(null)
const cropperImage = ref<HTMLImageElement | null>(null)

const emit = defineEmits(['success'])

const options = ref({
  img: props.img,
  outputType: 'png',
  filename: 'avatar'
})

let Shuju: { myCropper: Cropper | null } = { myCropper: null }

function editCropper() {
  open.value = true
}

function modalOpened() {
  visible.value = true
  nextTick(() => {
    initializeCropper()
  })
}

function initializeCropper() {
  if (cropperImage.value) {
    Shuju.myCropper = new Cropper(cropperImage.value, {
      aspectRatio: 1, // 不限制宽高比
      autoCropArea: 0, // 不自动调整裁剪框大小
      viewMode: 0, // 允许裁剪框超出图片边界
      minCropBoxWidth: 1, // 设置最小裁剪框宽度，避免为零
      minCropBoxHeight: 1, // 设置最小裁剪框高度，避免为零
      crop() {
        const canvas = Shuju.myCropper?.getCroppedCanvas()
        previews.value = canvas?.toDataURL(options.value.outputType) || ''
      }
    })
  }
}

function changeScale(scale: number) {
  if (Shuju.myCropper) {
    Shuju.myCropper.scaleX(scale)
    Shuju.myCropper.scaleY(scale)
  }
}

function rotateLeft() {
  Shuju.myCropper?.rotate(-90)
}

function rotateRight() {
  Shuju.myCropper?.rotate(90)
}

function beforeUpload(file: File) {
  if (!file.type.startsWith('image/')) {
    ElMessage.error('文件格式错误，请上传图片类型')
    return false
  }

  const reader = new FileReader()

  reader.onload = async () => {
    Shuju.myCropper?.destroy()
    visible.value = false
    // 更新图片的 base64 数据
    options.value.img = reader.result as string

    // 强制更新 cropperImage 元素的 src
    if (cropperImage.value) {
      cropperImage.value.src = options.value.img
    }
    visible.value = true
    nextTick(() => {
      initializeCropper()
    })
  }

  reader.readAsDataURL(file)
  return false
}

function uploadImg() {
  if (Shuju.myCropper) {
    Shuju.myCropper.getCroppedCanvas().toBlob(async (blob: any) => {
      if (blob) {
        const file = new File([blob], `${new Date().getTime().toString()}.png`, { type: 'image/png' })

        const { code, msg, data } = await upload(file)

        if (code == 200) {
          emit('success', data.filePath)
          open.value = false
          visible.value = false
        }
      }
    })
  }
}

function closeDialog() {
  visible.value = false
  Shuju.myCropper?.destroy()
  Shuju.myCropper = null
}

onUnmounted(() => {
  Shuju.myCropper?.destroy()
})
</script>

<style scoped lang="scss">
.user-info-head {
  position: relative;
  display: inline-block;
  height: 120px;
  width: 120px;
  border-radius: 50%;
  overflow: hidden;
  margin-top: 20px;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}
.user-info-head:hover::after {
  content: '+';
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  color: #eee;
  background: rgba(0, 0, 0, 0.5);
  font-size: 24px;
  cursor: pointer;
  line-height: 110px;
  border-radius: 50%;
}
.cropper-container {
  width: 100%;
  height: 100%;
}
.avatar-upload-preview {
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  img {
    width: 200px;
    height: 200px;
    border-radius: 50%;
  }
}
</style>
