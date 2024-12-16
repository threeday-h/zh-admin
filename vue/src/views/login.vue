<template>
  <div class="bg">
    <div class="content">
      <div class="left">
        <div class="title">
          欢迎登录
          <br />
          欢迎登录 KTechArtAdmin V3
        </div>
        <div class="desc">
          <img class="w-full h-full" src="@/assets/img/logo.png" alt="" />
        </div>
      </div>
      <div class="right">
        <div class="title">账号登录</div>
        <div class="form">
          <el-form ref="ruleFormRef" :model="ruleForm" :rules="rules" size="large" label-width="auto" class="demo-ruleForm" status-icon>
            <el-form-item label="" prop="user_name">
              <el-input v-model="ruleForm.user_name" placeholder="请输入用户名" />
            </el-form-item>
            <el-form-item label="" prop="password">
              <el-input type="password" show-password v-model="ruleForm.password" placeholder="请输入密码" />
            </el-form-item>
            <el-form-item label="" prop="code">
              <div class="flex items-center justify-between">
                <el-input v-model="ruleForm.code" placeholder="请输入验证码" />
                <div class="w-[125px] h-[40px] ml-[20px] cursor-pointer" v-html="captcha" @click="api.captcha()"></div>
              </div>
            </el-form-item>
            <el-form-item>
              <el-checkbox size="large" v-model="ruleForm.remember">记住密码</el-checkbox>
            </el-form-item>
            <el-form-item>
              <el-button style="width: 100%; height: 50px; background-color: #1861ea; color: #fff" size="large" :loading="loading" @click="submitForm(ruleFormRef)"> 登录 </el-button>
            </el-form-item>
          </el-form>
        </div>
        <div class="title-box cursor-pointer" @click="openLink">
          <p class="line"></p>
          <p class="name">XICP备xxxxxxxxx号-3</p>
          <p class="line"></p>
        </div>
        <!-- <div class="icon flex items-center justify-between">
          <img src="@/assets/icon/login/1.png" alt="" />
          <img src="@/assets/icon/login/2.png" alt="" />
          <img src="@/assets/icon/login/3.png" alt="" />
          <img src="@/assets/icon/login/4.png" alt="" />
          <img src="@/assets/icon/login/5.png" alt="" />
          <img src="@/assets/icon/login/6.png" alt="" />
          <img src="@/assets/icon/login/7.png" alt="" />
        </div> -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { getCaptcha, postLogin } from '@/service/api/sys/user'
import type { FormInstance, FormRules } from 'element-plus'
import { useUserStore } from '@/store/modules/user'
import { useSysStore } from '@/store/modules/sys'
import cookieTools from '@/utils/cookie'

const userStore = useUserStore()
const sysStore = useSysStore()

const router = useRouter()

interface RuleForm {
  user_name: string
  password: string
  code: string
  remember: boolean
}

const ruleFormRef = ref<InstanceType<typeof FormInstance>>()

const loading = ref(false)

let ruleForm = ref<RuleForm>({
  user_name: '',
  password: '',
  code: '',
  remember: false
})

const rules = reactive<InstanceType<typeof FormRules>>({
  user_name: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  code: [{ required: true, message: '请输入验证码', trigger: 'blur' }]
})

const captcha = ref()

const openLink = () => {
  window.open('https://beian.miit.gov.cn', '_blank')
}

const submitForm = async (formEl: InstanceType<typeof FormInstance> | undefined) => {
  if (!formEl) return
  await formEl.validate((valid: boolean, fields: any) => {
    if (valid) {
      if (ruleForm.value.remember) {
        let _ruleForm = { ...ruleForm.value }
        _ruleForm.code = ''
        cookieTools.setCookie('loginForm', JSON.stringify(_ruleForm))
      } else {
        cookieTools.deleteCookie('loginForm')
      }
      loading.value = true
      api.login()
    } else {
      console.log('error submit!', fields)
    }
  })
}

const api = {
  // 验证码
  async captcha() {
    captcha.value = await getCaptcha()
  },
  // 登录
  async login() {
    const { code, data, msg } = await postLogin(ruleForm.value)
    ElMessage({ message: msg, type: code != 200 ? 'error' : 'success' })
    setTimeout(() => {
      loading.value = false
    }, 500)

    if (code != 200) return api.captcha()

    cookieTools.setCookie('token', data.token)
    cookieTools.setCookie('userInfo', JSON.stringify(data.userInfo))

    userStore.$state.userInfo = data.userInfo

    await sysStore.getMenu()

    router.push('/')
  }
}

onMounted(() => {
  api.captcha()

  const loginForm = cookieTools.getCookie('loginForm')

  if (loginForm) ruleForm.value = JSON.parse(loginForm)
})
</script>

<style lang="scss" scoped>
.bg {
  @apply w-[100vw] h-[100vh] overflow-hidden flex items-center justify-center;
  background-image: url('@/assets/img/login-bg.png');
  background-size: cover;
  background-repeat: no-repeat;

  .content {
    @apply w-[888px] h-[570px] flex justify-between;
    .left {
      @apply w-[50%] bg-[#003b94] px-[23px] py-[25px] text-white;
      border-radius: 12px 0 0 12px;
      box-shadow: 0 16px 73px 8px #cbcbcb33;
      .title {
        @apply font-7 text-7;
      }
      .desc {
        @apply w-[90%]  mt-[70px] mx-auto;
      }
    }
    .right {
      @apply bg-white w-[50%] px-[42px] py-[34px] flex flex-col items-center justify-center;
      border-radius: 0px 12px 12px 0px;
      box-shadow: 0 16px 73px 8px #cbcbcb33;
      .title {
        @apply font-7 text-[30px] text-[#1e1e1e] mb-[35px];
      }
      .form {
        @apply w-full;
      }
      .title-box {
        @apply flex items-center justify-between w-full;
        .line {
          @apply w-[75px] h-[1px] bg-[#e6e6e6];
        }
        .name {
          @apply text-[14px] font-5 text-[#a1aebe] mx-[19px];
        }
      }
      .icon {
        @apply mt-[25px] w-full;
        img {
          @apply w-[30px] h-[30px] cursor-pointer;
        }
      }
    }
  }
}
</style>
