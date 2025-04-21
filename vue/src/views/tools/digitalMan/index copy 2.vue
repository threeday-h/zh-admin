<template>
  <div class="digital-man-container">
    <div class="content-wrapper">
      <!-- 左侧控制面板 -->
      <div class="left-panel">
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
        
        <!-- 声音和参数控制区域 -->
        <div class="voice-params-row">
          <!-- 声音选择器 -->
          <div class="voice-selector">
            <div class="section-title">我的声音</div>
            <div class="voice-options">
              <div 
                v-for="voice in filteredVoices" 
                :key="voice.id" 
                class="voice-option" 
                :class="{ active: selectedVoice === voice.id }"
                @click="selectVoice(voice.id)"
              >
                <div class="voice-option-header">
                  <div class="voice-name">{{ voice.name }}</div>
                  <button class="delete-btn" @click="deleteVoice(voice.id, $event)" title="删除声音">
                    ×
                  </button>
                </div>
                <div v-if="voice.style" class="voice-details">
                  {{ voice.style }}
                </div>
              </div>
            </div>
          </div>
          
          <!-- 语音参数控制 -->
          <div class="voice-params-controls">
            <div class="section-title">语音参数调整</div>
            
            <div class="params-sliders">
              <div class="param-group">
                <label>语速 ({{ voiceParams.speed.toFixed(1) }})</label>
                <input 
                  type="range" 
                  v-model.number="voiceParams.speed" 
                  min="0.5" 
                  max="2.0" 
                  step="0.1" 
                  class="slider"
                />
                <div class="range-labels">
                  <span>慢</span>
                  <span>快</span>
                </div>
              </div>
              
              <div class="param-group">
                <label>音调 ({{ voiceParams.pitch }})</label>
                <input 
                  type="range" 
                  v-model.number="voiceParams.pitch" 
                  min="-12" 
                  max="12" 
                  step="1" 
                  class="slider"
                />
                <div class="range-labels">
                  <span>低</span>
                  <span>高</span>
                </div>
              </div>
              
              <div class="param-group">
                <label>音量 ({{ voiceParams.vol.toFixed(1) }})</label>
                <input 
                  type="range" 
                  v-model.number="voiceParams.vol" 
                  min="0.1" 
                  max="10.0" 
                  step="0.1" 
                  class="slider"
                />
                <div class="range-labels">
                  <span>小</span>
                  <span>大</span>
                </div>
              </div>
              
              <div class="param-group">
                <label>情绪</label>
                <select v-model="voiceParams.emotion" class="emotion-select">
                  <option v-for="option in emotionOptions" :key="option.value" :value="option.value">
                    {{ option.label }}
                  </option>
                </select>
              </div>
            </div>
            
            <button class="reset-params-btn" @click="resetVoiceParams">
              重置参数
            </button>
          </div>
        </div>
        
        <!-- 自定义声音生成 -->
        <div class="custom-voice-generator">
          <div class="section-title">生成新声音</div>
          
          <div class="generator-controls">
            <div class="control-group">
              <label>性别:</label>
              <select v-model="customVoiceParams.gender">
                <option value="male">男性</option>
                <option value="female">女性</option>
              </select>
            </div>
            
            <div class="control-group">
              <label>年龄:</label>
              <select v-model="customVoiceParams.age">
                <option value="child">儿童</option>
                <option value="teenager">青少年</option>
                <option value="young">青年</option>
                <option value="middle-aged">中年</option>
                <option value="old">老年</option>
              </select>
            </div>
            
            <div class="control-group full-width">
              <label>声音描述 (最多8个词):</label>
              <input 
                v-model="customVoiceDescInput" 
                placeholder="输入描述词，用逗号分隔" 
                class="voice-desc-input"
              />
            </div>
            
            <button 
              class="control-btn primary generate-btn" 
              @click="generateCustomVoice" 
              :disabled="isGeneratingVoice"
            >
              <i class="fas fa-magic"></i>
              {{ isGeneratingVoice ? '生成中...' : '生成声音' }}
            </button>
          </div>
        </div>
      </div>
      
      <!-- 右侧模型展示 -->
      <div class="right-panel">
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
    </div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, computed } from "vue"
import * as PIXI from "pixi.js"
import { Live2DModel } from "pixi-live2d-display/cubism4"
import axios from "axios"

window.PIXI = PIXI

let app
let model
const textToSpeak = ref("")
let speechSynthesis = window.speechSynthesis
let requestId = null
const mouthMoving = ref(false)
const loading = ref(false)
const error = ref("")
let audioElement = null

// 声音类型
const voiceTypes = [
  { id: 'custom', name: '我的声音' }
]

// 当前选择的声音类型
const selectedVoiceType = ref('custom')

// 自定义声音列表
const customVoices = ref([])

// 当前选择的声音
const selectedVoice = ref("female-shaonv")

// 自定义声音参数
const customVoiceParams = ref({
  gender: 'female',
  age: 'young',
  voice_desc: []
})

// 自定义声音描述输入
const customVoiceDescInput = ref('')

// 是否正在生成声音
const isGeneratingVoice = ref(false)

// 添加语音参数设置
const voiceParams = ref({
  speed: 1.0,  // 语速，范围 0.5-2.0
  pitch: 0,    // 音调，范围 -12 到 12
  vol: 1.0,    // 音量，范围 0-10
  emotion: "neutral" // 情绪，可选值: happy, sad, angry, fearful, disgusted, surprised, neutral
});

// 情绪选项
const emotionOptions = [
  { value: "neutral", label: "中性" },
  { value: "happy", label: "高兴" },
  { value: "sad", label: "悲伤" },
  { value: "angry", label: "愤怒" },
  { value: "fearful", label: "害怕" },
  { value: "disgusted", label: "厌恶" },
  { value: "surprised", label: "惊讶" }
];

// 选择声音的方法
const selectVoice = (voiceId) => {
  // 更新选择的声音
  selectedVoice.value = voiceId;
  console.log(`选择声音ID: ${voiceId}`);
}

// 选择声音类型的方法
const selectVoiceType = (typeId) => {
  selectedVoiceType.value = typeId
  
  // 如果切换到自定义声音，刷新自定义声音列表
  if (typeId === 'custom') {
    fetchCustomVoices()
  }
}

// 获取自定义声音列表
const fetchCustomVoices = async () => {
  try {
    loading.value = true;
    error.value = "";
    
    const response = await axios.post(
      "https://api.minimax.chat/v1/get_voice",
      {
        voice_type: "voice_generation" // 只获取自定义生成的声音
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJHcm91cE5hbWUiOiLliJgiLCJVc2VyTmFtZSI6IuWImCIsIkFjY291bnQiOiIiLCJTdWJqZWN0SUQiOiIxOTA0MTU1Mzk2MzE5MjMyMjM5IiwiUGhvbmUiOiIxODgzOTI0MTkyNyIsIkdyb3VwSUQiOiIxOTA0MTU1Mzk2MzEwODQzNjMxIiwiUGFnZU5hbWUiOiIiLCJNYWlsIjoiIiwiQ3JlYXRlVGltZSI6IjIwMjUtMDMtMjUgMTY6MzM6NDUiLCJUb2tlblR5cGUiOjEsImlzcyI6Im1pbmltYXgifQ.nfQfGHqhN5q_oVnB5wbkdP5BdxpPFEpTNstJSdFa3akwA4J0iRuPEveuF0Yf_JkZ66NcbPc3xw1EYmNd7DyuL5tn-Z0Il68FaFh4hxgzzxAEAZpdJzdwksnhOgnU9IzU5sMhOcBDtIj1dwNOAmL50rt2OV4SW0Q2lQKqVuUfiikqrt2vycDqNH4jyz5xUi-1POXrNbwnFqWVbImlnpjT_srShRgGyLUwaiBXv3vm8Swy2tnGKw9Wmq1YDq3fun4uOQ6VTPdefgSjBeCrz1tKVgN7AlSsC91hLnNA8ODm0Z6aRsH1trOUN7HgjrU1dyFBikr5ZBzNWq-9m-WlnOdLcA"
        }
      }
    );
    
    console.log("获取到的自定义声音列表:", response.data);
    
    if (response.data && response.data.voice_generation && response.data.voice_generation.length > 0) {
      // 更新自定义声音列表
      const apiVoices = response.data.voice_generation;
      
      // 清空现有声音列表
      customVoices.value = [];
      
      // 添加 API 返回的声音
      for (const voice of apiVoices) {
        // 从本地存储中获取声音描述
        const savedVoiceInfo = getSavedVoiceInfo(voice.voice_id);
        
        // 提取描述信息 - 优先使用本地存储的描述
        const description = savedVoiceInfo?.description || 
                           (voice.description && voice.description.length > 0 ? voice.description.join(', ') : '自定义声音');
        
        // 提取创建时间
        const createdTime = new Date(voice.created_time);
        const formattedTime = `${createdTime.getMonth() + 1}/${createdTime.getDate()} ${createdTime.getHours()}:${String(createdTime.getMinutes()).padStart(2, '0')}`;
        
        // 使用本地存储的名称或生成默认名称
        const voiceName = savedVoiceInfo?.name || `声音 ${formattedTime}`;
        
        customVoices.value.push({
          id: voice.voice_id,
          name: voiceName,
          type: 'custom',
          style: description,
          createdTime: voice.created_time
        });
      }
      
      // 按创建时间排序，最新的在前面
      customVoices.value.sort((a, b) => new Date(b.createdTime) - new Date(a.createdTime));
      
      console.log("更新后的自定义声音列表:", customVoices.value);
      
      // 如果有声音，选择第一个
      if (customVoices.value.length > 0) {
        selectedVoice.value = customVoices.value[0].id;
      }
    } else {
      console.log("API 未返回自定义声音列表");
      customVoices.value = [];
    }
  } catch (err) {
    console.error("获取自定义声音列表失败:", err);
    error.value = "获取声音列表失败";
    customVoices.value = [];
  } finally {
    loading.value = false;
  }
};

// 保存声音信息到本地存储
const saveVoiceInfo = (voiceId, voiceInfo) => {
  try {
    // 获取现有的声音信息
    const savedVoices = JSON.parse(localStorage.getItem('customVoices') || '{}');
    
    // 添加或更新声音信息
    savedVoices[voiceId] = voiceInfo;
    
    // 保存回本地存储
    localStorage.setItem('customVoices', JSON.stringify(savedVoices));
    
    console.log(`声音信息已保存: ${voiceId}`, voiceInfo);
  } catch (err) {
    console.error("保存声音信息失败:", err);
  }
};

// 从本地存储获取声音信息
const getSavedVoiceInfo = (voiceId) => {
  try {
    const savedVoices = JSON.parse(localStorage.getItem('customVoices') || '{}');
    return savedVoices[voiceId];
  } catch (err) {
    console.error("获取保存的声音信息失败:", err);
    return null;
  }
};

// 生成自定义声音
const generateCustomVoice = async () => {
  if (isGeneratingVoice.value) return;
  
  // 验证描述词数量
  const voiceDescList = customVoiceDescInput.value
    .split(',')
    .map(item => item.trim())
    .filter(item => item);
  
  if (voiceDescList.length === 0) {
    error.value = "请输入至少一个声音描述词";
    return;
  }
  
  if (voiceDescList.length > 8) {
    error.value = "声音描述词不能超过8个";
    return;
  }
  
  try {
    isGeneratingVoice.value = true;
    error.value = "";
    
    const response = await axios.post(
      "https://api.minimax.chat/v1/text2voice",
      {
        gender: customVoiceParams.value.gender,
        age: customVoiceParams.value.age,
        voice_desc: voiceDescList,
        text: textToSpeak.value || "这是一个测试文本，用于生成自定义声音。"
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJHcm91cE5hbWUiOiLliJgiLCJVc2VyTmFtZSI6IuWImCIsIkFjY291bnQiOiIiLCJTdWJqZWN0SUQiOiIxOTA0MTU1Mzk2MzE5MjMyMjM5IiwiUGhvbmUiOiIxODgzOTI0MTkyNyIsIkdyb3VwSUQiOiIxOTA0MTU1Mzk2MzEwODQzNjMxIiwiUGFnZU5hbWUiOiIiLCJNYWlsIjoiIiwiQ3JlYXRlVGltZSI6IjIwMjUtMDMtMjUgMTY6MzM6NDUiLCJUb2tlblR5cGUiOjEsImlzcyI6Im1pbmltYXgifQ.nfQfGHqhN5q_oVnB5wbkdP5BdxpPFEpTNstJSdFa3akwA4J0iRuPEveuF0Yf_JkZ66NcbPc3xw1EYmNd7DyuL5tn-Z0Il68FaFh4hxgzzxAEAZpdJzdwksnhOgnU9IzU5sMhOcBDtIj1dwNOAmL50rt2OV4SW0Q2lQKqVuUfiikqrt2vycDqNH4jyz5xUi-1POXrNbwnFqWVbImlnpjT_srShRgGyLUwaiBXv3vm8Swy2tnGKw9Wmq1YDq3fun4uOQ6VTPdefgSjBeCrz1tKVgN7AlSsC91hLnNA8ODm0Z6aRsH1trOUN7HgjrU1dyFBikr5ZBzNWq-9m-WlnOdLcA"
        }
      }
    );
    
    console.log("生成自定义声音响应:", response.data);
    
    if (response.data && response.data.voice_id) {
      // 添加新生成的声音到列表
      const now = new Date();
      const formattedTime = `${now.getMonth() + 1}/${now.getDate()} ${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      // 创建声音描述
      const description = voiceDescList.join(', ');
      
      // 创建声音名称 - 使用第一个描述词作为名称的一部分
      const voiceName = `${voiceDescList[0]} ${formattedTime}`;
      
      const newVoice = {
        id: response.data.voice_id,
        name: voiceName,
        type: 'custom',
        style: description,
        createdTime: now.toISOString()
      };
      
      // 保存声音信息到本地存储
      saveVoiceInfo(response.data.voice_id, {
        name: voiceName,
        description: description,
        gender: customVoiceParams.value.gender,
        age: customVoiceParams.value.age,
        createdTime: now.toISOString()
      });
      
      // 添加到列表前面
      customVoices.value.unshift(newVoice);
      
      // 选择新生成的声音
      selectedVoice.value = newVoice.id;
      
      // 清空输入
      customVoiceDescInput.value = "";
      
      // 播放试听音频
      if (response.data.trial_audio) {
        playTrialAudio(response.data.trial_audio);
      }
    } else {
      error.value = "生成声音失败，请重试";
    }
  } catch (err) {
    console.error("生成自定义声音失败:", err);
    error.value = "生成声音失败: " + (err.response?.data?.base_resp?.status_msg || err.message);
  } finally {
    isGeneratingVoice.value = false;
  }
};

// 播放试听音频
const playTrialAudio = (audioHex) => {
  try {
    // 将十六进制音频数据转换为 Blob
    const audioBytes = new Uint8Array(audioHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
    const audioBlob = new Blob([audioBytes], { type: "audio/mp3" });
    
    // 创建音频 URL 并播放
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    audio.play();
    
    // 播放完成后释放资源
    audio.onended = () => {
      URL.revokeObjectURL(audioUrl);
    };
  } catch (err) {
    console.error("播放试听音频失败:", err);
  }
};

// 根据选择的类型过滤声音列表
const filteredVoices = computed(() => {
  return customVoices.value;
});

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
  // 获取可用声音列表
  fetchCustomVoices()
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

// 修改 testVoiceId 函数，避免频繁测试导致速率限制
const testedVoiceIds = new Map(); // 缓存已测试的声音ID结果

const testVoiceId = async (voiceId) => {
  // 如果已经测试过这个声音ID，直接返回缓存的结果
  if (testedVoiceIds.has(voiceId)) {
    return testedVoiceIds.get(voiceId);
  }
  
  // 对于 female-shaonv，我们知道它是有效的，直接返回 true
  if (voiceId === "female-shaonv") {
    testedVoiceIds.set(voiceId, true);
    return true;
  }
  
  try {
    // 为了避免速率限制，我们不实际测试每个声音ID
    // 而是假设它们都有效，除非使用时出错
    console.log(`假设声音ID ${voiceId} 有效，跳过测试`);
    testedVoiceIds.set(voiceId, true);
    return true;
    
    /* 原测试代码，现在注释掉以避免速率限制
    const response = await axios.post(
      "https://api.minimax.chat/v1/t2a_v2?GroupId=1904155396310843631",
      {
        model: "speech-01-turbo",
        text: "测试声音",
        stream: false,
        voice_setting: {
          voice_id: voiceId,
          speed: 1.1,
          vol: 1,
          pitch: 0
        },
        audio_setting: {
          sample_rate: 32000,
          bitrate: 128000,
          format: "mp3"
        }
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJHcm91cE5hbWUiOiLliJgiLCJVc2VyTmFtZSI6IuWImCIsIkFjY291bnQiOiIiLCJTdWJqZWN0SUQiOiIxOTA0MTU1Mzk2MzE5MjMyMjM5IiwiUGhvbmUiOiIxODgzOTI0MTkyNyIsIkdyb3VwSUQiOiIxOTA0MTU1Mzk2MzEwODQzNjMxIiwiUGFnZU5hbWUiOiIiLCJNYWlsIjoiIiwiQ3JlYXRlVGltZSI6IjIwMjUtMDMtMjUgMTY6MzM6NDUiLCJUb2tlblR5cGUiOjEsImlzcyI6Im1pbmltYXgifQ.nfQfGHqhN5q_oVnB5wbkdP5BdxpPFEpTNstJSdFa3akwA4J0iRuPEveuF0Yf_JkZ66NcbPc3xw1EYmNd7DyuL5tn-Z0Il68FaFh4hxgzzxAEAZpdJzdwksnhOgnU9IzU5sMhOcBDtIj1dwNOAmL50rt2OV4SW0Q2lQKqVuUfiikqrt2vycDqNH4jyz5xUi-1POXrNbwnFqWVbImlnpjT_srShRgGyLUwaiBXv3vm8Swy2tnGKw9Wmq1YDq3fun4uOQ6VTPdefgSjBeCrz1tKVgN7AlSsC91hLnNA8ODm0Z6aRsH1trOUN7HgjrU1dyFBikr5ZBzNWq-9m-WlnOdLcA"
        }
      }
    );
    
    const isValid = response.data && response.data.data && response.data.data.audio;
    testedVoiceIds.set(voiceId, isValid);
    return isValid;
    */
  } catch (err) {
    console.error(`声音ID ${voiceId} 测试失败:`, err);
    testedVoiceIds.set(voiceId, false);
    return false;
  }
};

// 添加回退方法，在 MiniMax API 调用失败时使用
const fallbackToWebSpeechAPI = () => {
  const speechSynthesis = window.speechSynthesis
  
  if (speechSynthesis.speaking) {
    speechSynthesis.cancel()
    mouthController.stopMoving()
  }

  const utterance = new SpeechSynthesisUtterance(textToSpeak.value)
  const voices = speechSynthesis.getVoices()
  
  // 选择中文女声 (如果有的话)
  const chineseVoice = voices.find(voice => 
    voice.lang.includes('zh') && voice.name.includes('Female')
  )
  
  utterance.voice = chineseVoice || voices[0] // 如果没找到中文女声，使用默认声音
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

// 添加延迟函数，用于限制 API 调用频率
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 修改 textToSpeechFn 函数，加入语音参数
const textToSpeechFn = async () => {
  if (!textToSpeak.value) {
    return;
  }

  // 如果已经在说话，先停止
  if (audioElement && !audioElement.paused) {
    audioElement.pause();
    audioElement.currentTime = 0;
    mouthController.stopMoving();
  }

  // 记录用户选择的声音ID，用于调试
  console.log("用户选择的声音ID:", selectedVoice.value);
  console.log("语音参数:", voiceParams.value);
  
  try {
    // 使用选择的声音 ID
    let useVoiceId = selectedVoice.value;
    
    // 调用 MiniMax T2A v2 API
    let response;
    let retryCount = 0;
    const maxRetries = 2;
    
    while (retryCount <= maxRetries) {
      try {
        response = await axios.post(
          "https://api.minimax.chat/v1/t2a_v2?GroupId=1904155396310843631",
          {
            model: "speech-01-turbo",
            text: textToSpeak.value,
            stream: false,
            voice_setting: {
              voice_id: useVoiceId,
              speed: voiceParams.value.speed,
              vol: voiceParams.value.vol,
              pitch: voiceParams.value.pitch,
              emotion: voiceParams.value.emotion
            },
            audio_setting: {
              sample_rate: 32000,
              bitrate: 128000,
              format: "mp3"
            }
          },
          {
            headers: {
              "Content-Type": "application/json",
              "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJHcm91cE5hbWUiOiLliJgiLCJVc2VyTmFtZSI6IuWImCIsIkFjY291bnQiOiIiLCJTdWJqZWN0SUQiOiIxOTA0MTU1Mzk2MzE5MjMyMjM5IiwiUGhvbmUiOiIxODgzOTI0MTkyNyIsIkdyb3VwSUQiOiIxOTA0MTU1Mzk2MzEwODQzNjMxIiwiUGFnZU5hbWUiOiIiLCJNYWlsIjoiIiwiQ3JlYXRlVGltZSI6IjIwMjUtMDMtMjUgMTY6MzM6NDUiLCJUb2tlblR5cGUiOjEsImlzcyI6Im1pbmltYXgifQ.nfQfGHqhN5q_oVnB5wbkdP5BdxpPFEpTNstJSdFa3akwA4J0iRuPEveuF0Yf_JkZ66NcbPc3xw1EYmNd7DyuL5tn-Z0Il68FaFh4hxgzzxAEAZpdJzdwksnhOgnU9IzU5sMhOcBDtIj1dwNOAmL50rt2OV4SW0Q2lQKqVuUfiikqrt2vycDqNH4jyz5xUi-1POXrNbwnFqWVbImlnpjT_srShRgGyLUwaiBXv3vm8Swy2tnGKw9Wmq1YDq3fun4uOQ6VTPdefgSjBeCrz1tKVgN7AlSsC91hLnNA8ODm0Z6aRsH1trOUN7HgjrU1dyFBikr5ZBzNWq-9m-WlnOdLcA"
            }
          }
        );
        
        console.log("API调用成功，使用声音ID:", useVoiceId);
        break; // 成功则跳出循环
      } catch (err) {
        retryCount++;
        
        // 如果是速率限制错误，等待后重试
        if (err.response && err.response.data && err.response.data.base_resp && 
            err.response.data.base_resp.status_code === 1002) {
          console.log("遇到速率限制，等待后重试");
          
          if (retryCount <= maxRetries) {
            continue; // 继续循环，尝试重试
          }
        }
        
        // 如果是声音ID无效，或者已经重试了最大次数，尝试使用默认声音
        if (retryCount > maxRetries || 
            (err.response && err.response.data && err.response.data.base_resp && 
             err.response.data.base_resp.status_code === 20132)) {
          console.error("使用选择的声音失败:", err);
          console.log("尝试使用默认声音 female-shaonv");
          
          useVoiceId = "female-shaonv"; // 使用已知有效的声音 ID
          
          // 最后一次尝试，使用默认声音
          response = await axios.post(
            "https://api.minimax.chat/v1/t2a_v2?GroupId=1904155396310843631",
            {
              model: "speech-01-turbo",
              text: textToSpeak.value,
              stream: false,
              voice_setting: {
                voice_id: useVoiceId,
                speed: voiceParams.value.speed,
                vol: voiceParams.value.vol,
                pitch: voiceParams.value.pitch,
                emotion: voiceParams.value.emotion
              },
              audio_setting: {
                sample_rate: 32000,
                bitrate: 128000,
                format: "mp3"
              }
            },
            {
              headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJHcm91cE5hbWUiOiLliJgiLCJVc2VyTmFtZSI6IuWImCIsIkFjY291bnQiOiIiLCJTdWJqZWN0SUQiOiIxOTA0MTU1Mzk2MzE5MjMyMjM5IiwiUGhvbmUiOiIxODgzOTI0MTkyNyIsIkdyb3VwSUQiOiIxOTA0MTU1Mzk2MzEwODQzNjMxIiwiUGFnZU5hbWUiOiIiLCJNYWlsIjoiIiwiQ3JlYXRlVGltZSI6IjIwMjUtMDMtMjUgMTY6MzM6NDUiLCJUb2tlblR5cGUiOjEsImlzcyI6Im1pbmltYXgifQ.nfQfGHqhN5q_oVnB5wbkdP5BdxpPFEpTNstJSdFa3akwA4J0iRuPEveuF0Yf_JkZ66NcbPc3xw1EYmNd7DyuL5tn-Z0Il68FaFh4hxgzzxAEAZpdJzdwksnhOgnU9IzU5sMhOcBDtIj1dwNOAmL50rt2OV4SW0Q2lQKqVuUfiikqrt2vycDqNH4jyz5xUi-1POXrNbwnFqWVbImlnpjT_srShRgGyLUwaiBXv3vm8Swy2tnGKw9Wmq1YDq3fun4uOQ6VTPdefgSjBeCrz1tKVgN7AlSsC91hLnNA8ODm0Z6aRsH1trOUN7HgjrU1dyFBikr5ZBzNWq-9m-WlnOdLcA"
              }
            }
          );
          
          console.log("使用默认声音成功");
          break; // 跳出循环
        }
      }
    }

    // 处理响应
    if (response && response.data && response.data.data && response.data.data.audio) {
      // 将十六进制音频数据转换为 Blob
      const audioBytes = new Uint8Array(response.data.data.audio.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
      const audioBlob = new Blob([audioBytes], { type: "audio/mp3" });
      
      // 创建音频 URL 并播放
      const audioUrl = URL.createObjectURL(audioBlob);
      
      if (audioElement) {
        audioElement.pause();
        audioElement.src = audioUrl;
      } else {
        audioElement = new Audio(audioUrl);
      }
      
      // 播放音频
      audioElement.play();
      
      // 控制嘴巴动作
      mouthController.startMoving();
      
      // 播放完成后停止嘴巴动作
      audioElement.onended = () => {
        mouthController.stopMoving();
        URL.revokeObjectURL(audioUrl);
      };
    } else {
      throw new Error("API 响应中没有音频数据");
    }
  } catch (err) {
    console.error("MiniMax API 错误:", err);
    error.value = "请求错误: " + (err.message || "未知错误");
    
    // 使用浏览器的语音合成作为备选
    try {
      const utterance = new SpeechSynthesisUtterance(textToSpeak.value);
      utterance.rate = voiceParams.value.speed;
      utterance.pitch = (voiceParams.value.pitch + 12) / 24 * 2; // 转换为 0-2 范围
      utterance.volume = voiceParams.value.vol / 10; // 转换为 0-1 范围
      
      // 尝试找到中文声音
      const voices = speechSynthesis.getVoices();
      const chineseVoice = voices.find(voice => voice.lang.includes('zh'));
      if (chineseVoice) {
        utterance.voice = chineseVoice;
      }
      
      speechSynthesis.speak(utterance);
      
      // 控制嘴巴动作
      mouthController.startMoving();
      
      // 播放完成后停止嘴巴动作
      utterance.onend = () => {
        mouthController.stopMoving();
      };
    } catch (fallbackErr) {
      console.error("浏览器语音合成也失败:", fallbackErr);
    }
  }
};

// 添加删除声音的函数
const deleteVoice = async (voiceId, event) => {
  // 阻止事件冒泡，避免触发选择声音
  event.stopPropagation();
  
  if (!confirm("确定要删除这个声音吗？删除后将无法恢复。")) {
    return;
  }
  
  try {
    loading.value = true;
    error.value = "";
    
    const response = await axios.post(
      "https://api.minimax.chat/v1/delete_voice",
      {
        voice_type: "voice_generation",
        voice_id: voiceId
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJHcm91cE5hbWUiOiLliJgiLCJVc2VyTmFtZSI6IuWImCIsIkFjY291bnQiOiIiLCJTdWJqZWN0SUQiOiIxOTA0MTU1Mzk2MzE5MjMyMjM5IiwiUGhvbmUiOiIxODgzOTI0MTkyNyIsIkdyb3VwSUQiOiIxOTA0MTU1Mzk2MzEwODQzNjMxIiwiUGFnZU5hbWUiOiIiLCJNYWlsIjoiIiwiQ3JlYXRlVGltZSI6IjIwMjUtMDMtMjUgMTY6MzM6NDUiLCJUb2tlblR5cGUiOjEsImlzcyI6Im1pbmltYXgifQ.nfQfGHqhN5q_oVnB5wbkdP5BdxpPFEpTNstJSdFa3akwA4J0iRuPEveuF0Yf_JkZ66NcbPc3xw1EYmNd7DyuL5tn-Z0Il68FaFh4hxgzzxAEAZpdJzdwksnhOgnU9IzU5sMhOcBDtIj1dwNOAmL50rt2OV4SW0Q2lQKqVuUfiikqrt2vycDqNH4jyz5xUi-1POXrNbwnFqWVbImlnpjT_srShRgGyLUwaiBXv3vm8Swy2tnGKw9Wmq1YDq3fun4uOQ6VTPdefgSjBeCrz1tKVgN7AlSsC91hLnNA8ODm0Z6aRsH1trOUN7HgjrU1dyFBikr5ZBzNWq-9m-WlnOdLcA"
        }
      }
    );
    
    console.log("删除声音响应:", response.data);
    
    if (response.data && response.data.base_resp && response.data.base_resp.status_code === 0) {
      // 从列表中移除声音
      customVoices.value = customVoices.value.filter(voice => voice.id !== voiceId);
      
      // 从本地存储中移除声音信息
      removeVoiceInfo(voiceId);
      
      // 如果删除的是当前选中的声音，选择第一个可用的声音
      if (selectedVoice.value === voiceId) {
        if (customVoices.value.length > 0) {
          selectedVoice.value = customVoices.value[0].id;
        } else {
          selectedVoice.value = "";
        }
      }
      
      // 显示成功消息
      alert("声音已成功删除");
    } else {
      error.value = "删除声音失败: " + (response.data?.base_resp?.status_msg || "未知错误");
    }
  } catch (err) {
    console.error("删除声音失败:", err);
    error.value = "删除声音失败: " + (err.response?.data?.base_resp?.status_msg || err.message);
  } finally {
    loading.value = false;
  }
};

// 从本地存储中移除声音信息
const removeVoiceInfo = (voiceId) => {
  try {
    const savedVoices = JSON.parse(localStorage.getItem('customVoices') || '{}');
    
    if (savedVoices[voiceId]) {
      delete savedVoices[voiceId];
      localStorage.setItem('customVoices', JSON.stringify(savedVoices));
      console.log(`声音信息已从本地存储中移除: ${voiceId}`);
    }
  } catch (err) {
    console.error("移除声音信息失败:", err);
  }
};

// 重置语音参数
const resetVoiceParams = () => {
  voiceParams.value = {
    speed: 1.0,
    pitch: 0,
    vol: 1.0,
    emotion: "neutral"
  };
};
</script>

<style lang="scss" scoped>
.digital-man-container {
  padding: 20px;
  background: #f8fafc;
  height: 88vh;
  overflow: hidden;
  
  .content-wrapper {
    display: flex;
    gap: 20px;
    max-width: 1400px;
    margin: 0 auto;
    // height: calc(100vh - 40px);
    height: 100%;
  }
  
  .left-panel {
    flex: 0 0 400px;
    display: flex;
    flex-direction: column;
    gap: 15px;
    overflow-y: auto;
    padding-right: 5px;
    
    &::-webkit-scrollbar {
      width: 6px;
    }
    
    &::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 10px;
    }
    
    &::-webkit-scrollbar-thumb {
      background: #cbd5e0;
      border-radius: 10px;
    }
    
    &::-webkit-scrollbar-thumb:hover {
      background: #a0aec0;
    }
  }
  
  .right-panel {
    flex: 1;
    display: flex;
    justify-content: center;
  }
  
  .section-title {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 12px;
    color: #2d3748;
    border-bottom: 2px solid #e2e8f0;
    padding-bottom: 8px;
  }
  
  .control-panel {
    background: white;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    padding: 20px;
    
    .input-group {
      display: flex;
      flex-direction: column;
      gap: 15px;
      
      .speech-input {
        padding: 12px 15px;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        font-size: 16px;
        
        &:focus {
          outline: none;
          border-color: #4299e1;
          box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
        }
      }
      
      .button-group {
        display: flex;
        gap: 10px;
      }
    }
  }
  
  .voice-params-row {
    display: flex;
    gap: 15px;
    height: 500px;
    
    .voice-selector, .voice-params-controls {
      flex: 1;
      background: white;
      border-radius: 10px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
      padding: 20px;
      display: flex;
      flex-direction: column;
    }
    
    .voice-options {
      display: flex;
      flex-direction: column;
      gap: 8px;
      overflow-y: auto;
      flex: 1;
      
      &::-webkit-scrollbar {
        width: 6px;
      }
      
      &::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 10px;
      }
      
      &::-webkit-scrollbar-thumb {
        background: #cbd5e0;
        border-radius: 10px;
      }
      
      &::-webkit-scrollbar-thumb:hover {
        background: #a0aec0;
      }
      
      .voice-option {
        padding: 10px 12px;
        background: #edf2f7;
        border-radius: 8px;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        flex-direction: column;
        position: relative;
        
        .voice-option-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          
          .voice-name {
            font-weight: 500;
            flex: 1;
          }
          
          .delete-btn {
            background: none;
            border: none;
            color: #a0aec0;
            cursor: pointer;
            padding: 2px 8px;
            font-size: 16px;
            border-radius: 4px;
            opacity: 0.7;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            
            &:hover {
              color: #e53e3e;
              opacity: 1;
              background: rgba(0, 0, 0, 0.05);
            }
          }
        }
        
        .voice-details {
          font-size: 12px;
          color: #718096;
          margin-top: 3px;
        }
        
        &:hover {
          background: #e2e8f0;
        }
        
        &.active {
          background: #4299e1;
          color: white;
          
          .voice-details {
            color: rgba(255, 255, 255, 0.8);
          }
          
          .delete-btn {
            color: rgba(255, 255, 255, 0.8);
            
            &:hover {
              color: #fff;
              background: rgba(255, 255, 255, 0.2);
            }
          }
        }
      }
    }
    
    .params-sliders {
      display: grid;
      grid-template-columns: 1fr;
      gap: 12px;
      flex: 1;
      
      .param-group {
        display: flex;
        flex-direction: column;
        
        label {
          font-size: 14px;
          color: #4a5568;
          margin-bottom: 6px;
        }
        
        .slider {
          -webkit-appearance: none;
          width: 100%;
          height: 6px;
          border-radius: 3px;
          background: #e2e8f0;
          outline: none;
          
          &::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: #4299e1;
            cursor: pointer;
          }
          
          &::-moz-range-thumb {
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: #4299e1;
            cursor: pointer;
          }
        }
        
        .range-labels {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #718096;
          margin-top: 5px;
        }
        
        .emotion-select {
          padding: 10px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          font-size: 14px;
          
          &:focus {
            outline: none;
            border-color: #4299e1;
          }
        }
      }
    }
    
    .reset-params-btn {
      margin-top: 12px;
      padding: 8px 15px;
      background: #edf2f7;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      font-size: 14px;
      color: #4a5568;
      cursor: pointer;
      transition: all 0.2s ease;
      width: 100%;
      
      &:hover {
        background: #e2e8f0;
      }
    }
  }
  
  .custom-voice-generator {
    background: white;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    padding: 20px;
    
    .generator-controls {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      
      .control-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
        
        label {
          font-size: 14px;
          color: #4a5568;
        }
        
        select, input {
          padding: 10px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          font-size: 14px;
          
          &:focus {
            outline: none;
            border-color: #4299e1;
          }
        }
        
        &.full-width {
          grid-column: 1 / -1;
        }
      }
      
      .generate-btn {
        grid-column: 1 / -1;
        margin-top: 5px;
      }
    }
  }
  
  .canvas-container {
    position: relative;
    background: white;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
    padding: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 780px;
    
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
    justify-content: center;
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
}

@media (max-width: 1024px) {
  .digital-man-container {
    height: auto;
    overflow: visible;
    
    .content-wrapper {
      flex-direction: column;
      height: auto;
    }
    
    .left-panel {
      flex: 0 0 auto;
      width: 100%;
      overflow: visible;
    }
    
    .voice-params-row {
      flex-direction: column;
    }
  }
}
</style>
