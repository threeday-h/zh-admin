<template>
  <div class="digital-man-container">
    <div class="control-panel">
      <div class="input-group">
        <input v-model="textToSpeak" placeholder="请输入要说的话" class="speech-input" @keyup.enter="textToSpeechFn" />
        <div class="button-group">
          <button class="control-btn primary" @click="textToSpeechFn" :disabled="!textToSpeak">
            <i class="fas fa-play"></i>
            开始说话
          </button>
          <button class="control-btn secondary" @click="mouthFn">
            <i class="fas fa-random"></i>
            随机表情
          </button>
          <button v-if="mouthMoving" class="control-btn danger" @click="stopMouth">
            <i class="fas fa-stop"></i>
            停止
          </button>
        </div>
      </div>
    </div>
    <div class="canvas-container">
      <div v-if="loading" class="loading">
        <i class="fas fa-spinner fa-spin"></i>
        加载中...
      </div>
      <div v-if="error" class="error-message">
        <i class="fas fa-exclamation-circle"></i>
        {{ error }}
      </div>
      <canvas id="myCanvas" />
    </div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref } from "vue"
import * as PIXI from "pixi.js"
import { Live2DModel } from "pixi-live2d-display/cubism4"

window.PIXI = PIXI

let app
let model
const textToSpeak = ref("")
let speechSynthesis = window.speechSynthesis
let requestId = null
const mouthMoving = ref(false)
const loading = ref(false)
const error = ref("")

// 创建一个简单的嘴型动画控制器
const mouthController = {
  isMoving: false,
  interval: null,
  startMoving() {
    this.isMoving = true
    mouthMoving.value = true
    this.updateMouth(0.5)
  },
  stopMoving() {
    this.isMoving = false
    mouthMoving.value = false
    if (model) {
      model.internalModel.coreModel.setParameterValueById("ParamMouthOpenY", 0)
    }
    if (this.interval) {
      clearInterval(this.interval)
      this.interval = null
    }
  },
  updateMouth(value) {
    if (model && this.isMoving) {
      model.internalModel.coreModel.setParameterValueById("ParamMouthOpenY", value)
    }
  }
}

onMounted(() => {
  init()
})

onBeforeUnmount(() => {
  mouthController.stopMoving()
  if (app) {
    app.destroy(true)
  }
  app = null
  model = null
})

const init = async () => {
  if (app) return // 防止重复初始化

  loading.value = true
  error.value = ""

  try {
    app = new PIXI.Application({
      view: document.querySelector("#myCanvas"),
      resizeTo: document.querySelector("#myCanvas"),
      backgroundAlpha: 0,
      antialias: true // 抗锯齿
    })

    // 使用正确的模型路径
    model = await Live2DModel.from("/haru_greeter_pro_jp/runtime/haru_greeter_t05.model3.json", {
      autoInteract: true
    })

    if (!model) {
      throw new Error("模型加载失败")
    }

    model.scale.set(0.14) // 设置模型缩放
    // model.y = 0 // 设置模型位置
    // model.x = -24 // 设置模型位置
    app.stage.addChild(model)
  } catch (err) {
    console.error("模型加载失败:", err)
    error.value = "模型加载失败，请检查模型文件路径是否正确"
  } finally {
    loading.value = false
  }
}

const stopMouth = () => {
  mouthController.stopMoving()
}

const mouthFn = () => {
  if (mouthController.interval) {
    mouthController.stopMoving()
    return
  }

  mouthController.startMoving()
  mouthController.interval = setInterval(() => {
    const n = Math.random()
    mouthController.updateMouth(n)
  }, 100)
}

const textToSpeechFn = async () => {
  if (!textToSpeak.value) {
    return
  }

  // 如果已经在说话，先停止
  if (speechSynthesis.speaking) {
    speechSynthesis.cancel()
    mouthController.stopMoving()
  }

  const utterance = new SpeechSynthesisUtterance(textToSpeak.value)
    // 获取所有可用的声音
    const voices = speechSynthesis.getVoices()
    console.log(voices);
    
  // 选择中文女声 (如果有的话)
  // const chineseVoice = voices.find(voice => 
  //   voice.lang.includes('zh') && voice.name.includes('Female')
  // )

  const chineseVoice = voices[19]
  
  utterance.voice = chineseVoice || '' // 如果没找到中文女声，使用默认声音
  utterance.lang = "zh-CN"
  utterance.rate = 1.1
  utterance.pitch = 1

  utterance.onstart = () => {
    mouthController.startMoving()
    mouthController.interval = setInterval(() => {
      const mouthOpen = 0.3 + Math.random() * 0.7
      mouthController.updateMouth(mouthOpen)
    }, 100)
  }

  utterance.onend = () => {
    mouthController.stopMoving()
  }

  speechSynthesis.speak(utterance)
}
</script>

<style lang="less" scoped>
.digital-man-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;

  .control-panel {
    width: 100%;
    max-width: 600px;
    margin-bottom: 20px;
    background: white;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);

    .input-group {
      display: flex;
      flex-direction: column;
      gap: 15px;

      .speech-input {
        width: 100%;
        padding: 12px 15px;
        border: 2px solid #e2e8f0;
        border-radius: 8px;
        font-size: 16px;
        transition: all 0.3s ease;
        outline: none;

        &:focus {
          border-color: #4299e1;
          box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
        }
      }

      .button-group {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
      }
    }
  }

  .canvas-container {
    position: relative;
    padding: 20px;

    .loading {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      display: flex;
      align-items: center;
      gap: 10px;
      color: #4299e1;
      font-size: 16px;

      i {
        font-size: 24px;
      }
    }

    .error-message {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      display: flex;
      align-items: center;
      gap: 10px;
      color: #f56565;
      font-size: 14px;
      text-align: center;
      padding: 20px;

      i {
        font-size: 20px;
      }
    }
  }
}

.control-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  i {
    font-size: 16px;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &.primary {
    background: #4299e1;
    color: white;

    &:hover:not(:disabled) {
      background: #3182ce;
    }
  }

  &.secondary {
    background: #48bb78;
    color: white;

    &:hover:not(:disabled) {
      background: #38a169;
    }
  }

  &.danger {
    background: #f56565;
    color: white;

    &:hover:not(:disabled) {
      background: #e53e3e;
    }
  }
}

#myCanvas {
  width: 400px;
  height: 600px;
}
</style>
