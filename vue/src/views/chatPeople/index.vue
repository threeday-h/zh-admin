<template>
  <div class="ai-assistant">
    <!-- 机器人图标 -->
    <div class="bot-icon" :class="{ active: isOpen }" @click="toggleChat">
      <i class="fas fa-robot"></i>
    </div>

    <!-- 聊天窗口 -->
    <div class="chat-window" :class="{ open: isOpen }">
      <div class="chat-header">
        <div class="title">AI 助手</div>
        <div class="close-btn" @click="toggleChat">
          <i class="fas fa-times"></i>
        </div>
      </div>

      <div class="chat-messages" ref="messageContainer">
        <div v-for="(msg, index) in messages" :key="index" class="message" :class="msg.type">
          <div class="avatar">
            <i :class="msg.type === 'bot' ? 'fas fa-robot' : 'fas fa-user'"></i>
          </div>
          <div class="content" :class="{ typing: msg.isTyping }">
            {{ msg.type === "bot" && msg.isTyping ? typingText : msg.content }}
          </div>
        </div>
        <div v-if="isLoading && !isTyping" class="message bot">
          <div class="avatar">
            <i class="fas fa-robot"></i>
          </div>
          <div class="content loading-content">
            <div class="loading-dots">
              <div class="dot"></div>
              <div class="dot"></div>
              <div class="dot"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="chat-input">
        <input v-model="userInput" @keyup.enter="sendMessage" type="text" placeholder="请输入您的问题..." />
        <div class="button-group">
          <button v-if="isTyping" class="stop-btn" @click="stopTyping" title="停止生成">
            <i class="fas fa-stop"></i>
          </button>
          <button @click="sendMessage" :disabled="isLoading || isTyping" :class="{ 'send-btn': true, 'with-stop': isTyping }">
            <i :class="isLoading ? 'fas fa-spinner fa-spin' : 'fas fa-paper-plane'"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from "vue"
import { chatDeepseek } from "@/service/api/sys/deepseek"

interface Message {
  content: string
  type: "user" | "bot"
  isTyping?: boolean
}

const isOpen = ref(false)
const isLoading = ref(false)
const userInput = ref("")
const messages = ref<Message[]>([
  {
    type: "bot",
    content: "你好！我是AI助手，有什么可以帮助你的吗？"
  }
])
const messageContainer = ref<HTMLElement | null>(null)
const typingText = ref("")
const typingSpeed = 50 // 打字速度（毫秒）
const isTyping = ref(false)
const shouldStopTyping = ref(false)
const currentTypingMessage = ref<Message | null>(null)

const toggleChat = () => {
  isOpen.value = !isOpen.value
}

const scrollToBottom = async () => {
  await nextTick()
  if (messageContainer.value) {
    const container = messageContainer.value
    const isScrolledToBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 100

    // 只有在接近底部时才使用平滑滚动，否则立即滚动
    if (isScrolledToBottom) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth"
      })
    } else {
      container.scrollTop = container.scrollHeight
    }
  }
}

watch(
  messages,
  () => {
    scrollToBottom()
  },
  { deep: true }
)

// 打字机效果函数
const typeMessage = async (text: string) => {
  isTyping.value = true
  shouldStopTyping.value = false

  const msg: Message = {
    type: "bot",
    content: "",
    isTyping: true
  }
  messages.value.push(msg)
  currentTypingMessage.value = msg

  typingText.value = ""
  let lastScrollTime = 0
  const scrollInterval = 100 // 控制滚动频率（毫秒）

  try {
    for (let i = 0; i < text.length; i++) {
      if (shouldStopTyping.value) {
        break
      }
      typingText.value += text[i]

      // 控制滚动频率，避免过于频繁的滚动
      const now = Date.now()
      if (now - lastScrollTime >= scrollInterval) {
        await scrollToBottom()
        lastScrollTime = now
      } else {
        await new Promise(resolve => setTimeout(resolve, typingSpeed))
      }
    }
  } finally {
    if (currentTypingMessage.value) {
      currentTypingMessage.value.content = shouldStopTyping.value ? typingText.value : text
      currentTypingMessage.value.isTyping = false
    }
    isTyping.value = false
    shouldStopTyping.value = false
    currentTypingMessage.value = null
    await scrollToBottom()
  }
}

const stopTyping = () => {
  if (currentTypingMessage.value) {
    shouldStopTyping.value = true
  }
}

const sendMessage = async () => {
  if (!userInput.value.trim() || isLoading.value || isTyping.value) return

  // 添加用户消息
  messages.value.push({
    type: "user",
    content: userInput.value
  })

  const question = userInput.value
  userInput.value = ""
  isLoading.value = true

  try {
    const response: any = await chatDeepseek({
      content: question
    } as {})

    // 使用打字机效果显示回复
    await typeMessage(response.data.content || "抱歉，我现在无法回答这个问题。")
  } catch (error) {
    await typeMessage("抱歉，发生了一些错误，请稍后再试。")
    console.error("请求失败:", error)
  } finally {
    isLoading.value = false
  }
}
</script>

<style lang="less" scoped>
.ai-assistant {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;

  .bot-icon {
    width: 60px;
    height: 60px;
    background: #1890ff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
    transition: all 0.3s ease;

    i {
      color: white;
      font-size: 24px;
    }

    &:hover {
      transform: scale(1.1);
    }

    &.active {
      transform: scale(0.8);
    }
  }

  .chat-window {
    position: absolute;
    bottom: 80px;
    right: 0;
    width: 350px;
    height: 500px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    display: flex;
    flex-direction: column;
    transform: scale(0);
    opacity: 0;
    transform-origin: bottom right;
    transition: all 0.3s ease;

    &.open {
      transform: scale(1);
      opacity: 1;
    }

    .chat-header {
      padding: 15px;
      background: #1890ff;
      color: white;
      border-radius: 12px 12px 0 0;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .title {
        font-weight: bold;
      }

      .close-btn {
        cursor: pointer;
        padding: 5px;

        &:hover {
          opacity: 0.8;
        }
      }
    }

    .chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 15px;
      scroll-behavior: smooth; // 添加全局平滑滚动
      -webkit-overflow-scrolling: touch; // 改善移动端滚动体验

      // 添加滚动条样式
      &::-webkit-scrollbar {
        width: 6px;
      }

      &::-webkit-scrollbar-track {
        background: transparent;
      }

      &::-webkit-scrollbar-thumb {
        background: rgba(0, 0, 0, 0.1);
        border-radius: 3px;

        &:hover {
          background: rgba(0, 0, 0, 0.2);
        }
      }

      .message {
        display: flex;
        align-items: flex-start;
        margin-bottom: 15px;

        .avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #f0f2f5;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 10px;

          i {
            font-size: 16px;
            color: #666;
          }
        }

        .content {
          max-width: 70%;
          padding: 10px;
          border-radius: 12px;
          background: #f0f2f5;
          word-break: break-word;
          position: relative;

          &.typing {
            border-right: 2px solid #1890ff;
            animation: cursor-blink 0.8s infinite;
          }

          &.loading {
            display: flex;
            align-items: center;
            gap: 4px;
            padding: 15px;
            min-width: 60px;

            span {
              display: inline-block;
              width: 8px;
              height: 8px;
              background-color: #1890ff;
              border-radius: 50%;
              animation: loading-bounce 1.4s infinite ease-in-out both;

              &:nth-child(1) {
                animation-delay: -0.32s;
              }

              &:nth-child(2) {
                animation-delay: -0.16s;
              }
            }
          }

          &.loading-content {
            min-width: 60px;
            height: 35px;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0 15px;

            .loading-dots {
              display: flex;
              align-items: center;
              gap: 4px;
            }
          }
        }

        &.user {
          flex-direction: row-reverse;

          .avatar {
            margin-right: 0;
            margin-left: 10px;
            background: #e6f7ff;

            i {
              color: #1890ff;
            }
          }

          .content {
            background: #1890ff;
            color: white;
          }
        }
      }

      .loading-message {
        .loading-content {
          min-width: 60px;
          height: 35px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f0f2f5;
          border-radius: 12px;
          padding: 0 15px;
          position: relative;

          .loading-dots {
            display: flex;
            align-items: center;
            gap: 4px;

            .dot {
              width: 8px;
              height: 8px;
              background: #1890ff;
              border-radius: 50%;
              animation: bounce 1.4s infinite ease-in-out both;

              &:nth-child(1) {
                animation-delay: -0.32s;
              }

              &:nth-child(2) {
                animation-delay: -0.16s;
              }

              &:nth-child(3) {
                animation-delay: 0s;
              }
            }
          }

          .stop-button {
            position: absolute;
            right: -30px;
            top: 50%;
            transform: translateY(-50%);
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: #ff4d4f;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s;

            &:hover {
              background: darken(#ff4d4f, 10%);
              transform: translateY(-50%) scale(1.1);
            }

            i {
              font-size: 12px;
            }
          }
        }
      }
    }

    .chat-input {
      padding: 15px;
      display: flex;
      gap: 10px;
      border-top: 1px solid #eee;

      input {
        flex: 1;
        padding: 8px 12px;
        border: 1px solid #ddd;
        border-radius: 20px;
        outline: none;
        transition: all 0.3s;

        &:focus {
          border-color: #1890ff;
          box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
        }
      }

      .button-group {
        display: flex;
        gap: 8px;
        align-items: center;

        button {
          width: 40px;
          height: 40px;
          border: none;
          border-radius: 50%;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s;

          &.stop-btn {
            background: #ff4d4f;

            &:hover {
              background: darken(#ff4d4f, 10%);
            }

            i {
              font-size: 14px;
            }
          }

          &.send-btn {
            background: #1890ff;

            &:hover {
              background: darken(#1890ff, 10%);
            }

            &:disabled {
              background: #ccc;
              cursor: not-allowed;
            }

            &.with-stop {
              margin-left: -4px;
            }
          }
        }
      }
    }
  }
}

@keyframes cursor-blink {
  0%,
  100% {
    border-right-color: transparent;
  }
  50% {
    border-right-color: #1890ff;
  }
}

@keyframes loading-bounce {
  0%,
  80%,
  100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

@keyframes bounce {
  0%,
  80%,
  100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}
</style>
