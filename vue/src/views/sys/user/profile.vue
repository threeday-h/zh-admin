<template>
  <div class="profile">
    <el-row :gutter="20">
      <el-col :span="6" :xs="24">
        <div class="box">
          <div class="title">
            <span>个人信息</span>
          </div>
          <div class="px-[20px] pb-[20px]">
            <div class="text-center">
              <Avater :img="tools.addBaseUrl(userInfo.avatar)" @success="(file:string) => api.alter({ avatar: file })" />
            </div>
            <ul class="list-group">
              <li class="list-group-item">
                <svg-icon name="user" />
                <span>用户昵称</span>
                <div class="pull-right">{{ userInfo.nick_name }}</div>
              </li>
              <li class="list-group-item">
                <svg-icon name="phone" /> <span>手机号码</span>
                <div class="pull-right">{{ userInfo.phonenumber }}</div>
              </li>
              <li class="list-group-item">
                <svg-icon name="email" /> <span>用户邮箱</span>
                <div class="pull-right">{{ userInfo.email }}</div>
              </li>

              <li class="list-group-item">
                <svg-icon name="peoples" /><span>所属角色</span>
                <div class="pull-right">{{ userInfo.role_name }}</div>
              </li>
              <li class="list-group-item">
                <svg-icon name="date" /><span>创建日期</span>
                <div class="pull-right">{{ userInfo.create_time }}</div>
              </li>
            </ul>
          </div>
        </div>
      </el-col>
      <el-col :span="18" :xs="24">
        <div class="box">
          <div class="title">
            <span>基本资料</span>
          </div>
          <el-tabs class="p-[20px]" v-model="activeName">
            <el-tab-pane label="基本资料" name="userinfo">
              <Form ref="basicFormRef" v-model="formBasic" :fields="formFields.basic" :rules="formRule.basic" />
            </el-tab-pane>
            <el-tab-pane label="修改密码" name="resetPwd">
              <Form ref="passFormRef" v-model="formPass" :fields="formFields.pass" :rules="formRule.pass" />
            </el-tab-pane>
            <el-button type="primary" @click="handleConfirm">保存</el-button>
            <el-button @click="close">关闭</el-button>
          </el-tabs>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { FormInstance } from 'element-plus'
import { useUserStore } from '@/store/modules/user'
import { postAlter, postAlterPassword } from '@/service/api/sys/user'
import cookieTools from '@/utils/cookie'

const sysStore = inject('sysStore') as sysStoreType

const router = useRouter()

const userStore = useUserStore()
const { userInfo } = userStore.$state

const instance = getCurrentInstance()
const tools = instance?.appContext.config.globalProperties.$tools

const passFormRef = ref<InstanceType<typeof FormInstance | null>>(null)
const basicFormRef = ref<InstanceType<typeof FormInstance | null>>(null)

const activeName = ref('userinfo')

// 表单配置项
const formFields: { basic: FormField[]; pass: FormField[] } = {
  basic: [
    {
      label: '用户昵称',
      prop: 'nick_name',
      type: 'input',
      placeholder: '请输入用户昵称'
    },
    {
      label: '手机号码',
      prop: 'phonenumber',
      type: 'input',
      placeholder: '请输入手机号码'
    },
    {
      label: '邮箱',
      prop: 'email',
      type: 'input',
      placeholder: '请输入邮箱'
    },
    {
      label: '性别',
      prop: 'sex',
      type: 'radio',
      labelKey: 'dict_label',
      valueKey: 'dict_value',
      options: sysStore.dictData['sys_sex'].children
    }
  ],
  pass: [
    {
      label: '账号名称',
      prop: 'user_name',
      type: 'input',
      placeholder: '请输入账号名称'
    },
    {
      label: '旧密码',
      prop: 'old_pass',
      type: 'input',
      placeholder: '请输入旧密码'
    },
    {
      label: '新密码',
      prop: 'new_pass',
      type: 'input',
      placeholder: '请输入新密码'
    },
    {
      label: '确认密码',
      prop: 'reply_pass',
      type: 'input',
      placeholder: '请再次输入密码'
    }
  ]
}

const formRule = {
  basic: {
    nick_name: [{ required: true, message: '请输入用户昵称', trigger: 'blur' }],
    phonenumber: [{ required: true, message: '请输入手机号码', trigger: 'blur' }],
    email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }],
    sex: [{ required: true, message: '请选择性别', trigger: 'change' }]
  },
  pass: {
    user_name: [{ required: true, message: '请输入账号名称', trigger: 'blur' }],
    old_pass: [{ required: true, message: '请输入旧密码', trigger: 'blur' }],
    new_pass: [{ required: true, message: '请输入新密码', trigger: 'blur' }],
    reply_pass: [{ required: true, message: '请再次输入密码', trigger: 'blur' }]
  }
}

// 基本资料
const formBasic = ref<userType>({
  nick_name: '',
  phonenumber: '',
  email: '',
  sex: ''
})

// 修改密码
const formPass = ref({
  old_pass: '',
  new_pass: '',
  reply_pass: '',
  user_name: ''
})

const close = () => {
  router.go(-1)
}

const handleConfirm = async () => {
  const formEl = activeName.value === 'userinfo' ? basicFormRef.value?.formRef : passFormRef.value?.formRef

  if (!formEl) return
  await formEl.validate((valid: Boolean, fields: Record<string, any>) => {
    if (valid) {
      if (activeName.value === 'userinfo') {
        api.alter(formBasic.value)
      } else {
        if (formPass.value.reply_pass !== formPass.value.new_pass) return ElMessage({ message: '新密码和确认密码不一致', type: 'error' })
        api.alterPassword()
      }
    } else {
      console.log('校验失败:', fields)
    }
  })
}

const api = {
  // 修改信息
  async alter(params: userType) {
    const { data, code, msg } = await postAlter(params)
    api.success(data, code, msg)
  },
  // 修改密码
  async alterPassword() {
    const { data, code, msg } = await postAlterPassword(formPass.value)
    api.success(data, code, msg)
  },
  success(data: { token: string; userInfo: Record<string, any> }, code: number, msg: string) {
    ElMessage({ message: msg, type: code != 200 ? 'error' : 'success' })
    if (code === 200) {
      cookieTools.setCookie('token', data.token)
      cookieTools.setCookie('userInfo', JSON.stringify(data.userInfo))
      userStore.$state.userInfo = data.userInfo
    }
  }
}

tools.objectSame(formBasic.value, userInfo)
</script>

<style scoped lang="scss">
.box {
  @apply bg-white rounded-1;
  -webkit-box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.title {
  padding: 15px;
  min-height: 40px;
  border-bottom: 1px solid #e7eaec;
  color: #303133;
}

.list-group-striped > .list-group-item {
  border-left: 0;
  border-right: 0;
  border-radius: 0;
  padding-left: 0;
  padding-right: 0;
}

.list-group {
  padding-left: 0px;
  list-style: none;
}

.list-group-item {
  border-bottom: 1px solid #e7eaec;

  margin-bottom: -1px;
  padding: 11px 0px;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  span {
    margin-left: 10px;
  }
}
.list-group-striped > .list-group-item {
  border-left: 0;
  border-right: 0;
  border-radius: 0;
  padding-left: 0;
  padding-right: 0;
}
.pull-right {
  flex: 1;
  text-align: right;
}
</style>
