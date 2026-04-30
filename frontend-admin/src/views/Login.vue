<script setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

import { setSession } from '../utils/auth'
import request from '../utils/request'

const router = useRouter()
const route = useRoute()
const loading = ref(false)
const form = reactive({
  phone: '13800000001',
  password: '123456',
})

const demoAccounts = [
  { label: '管理员', username: '林老师', phone: '13800000001', password: '123456' },
]

const resolveRedirect = () => {
  const redirect = route.query.redirect
  if (typeof redirect === 'string' && redirect.startsWith('/')) {
    return redirect
  }
  return '/dashboard'
}

const fillAccount = account => {
  form.phone = account.phone
  form.password = account.password
}

const submitLogin = async () => {
  if (!form.phone.trim() || !form.password.trim()) {
    ElMessage.warning('请输入手机号和密码')
    return
  }

  loading.value = true
  try {
    const session = await request({
      url: '/auth/login',
      method: 'POST',
      data: {
        phone: form.phone.trim(),
        password: form.password.trim(),
        portal: 'admin',
      },
    })
    setSession(session)
    ElMessage.success(`欢迎回来，${session.user.username}`)
    router.replace(resolveRedirect())
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-shell">
    <section class="login-card glass-panel">
      <div class="eyebrow">Admin Portal</div>
      <h1>校园救助后台登录</h1>
      <p class="desc">上线后后台入口会先经过这一层认证，未登录不再直接进入面板。</p>

      <div class="demo-box">
        <div class="demo-title">演示管理员账号</div>
        <button
          v-for="account in demoAccounts"
          :key="account.phone"
          class="demo-pill"
          @click="fillAccount(account)"
        >
          {{ account.username }} · {{ account.phone }}
        </button>
        <div class="demo-hint">默认密码均为 123456</div>
      </div>

      <el-form label-position="top" @submit.prevent="submitLogin">
        <el-form-item label="手机号">
          <el-input v-model="form.phone" placeholder="请输入管理员手机号" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input
            v-model="form.password"
            type="password"
            show-password
            placeholder="请输入登录密码"
            @keyup.enter="submitLogin"
          />
        </el-form-item>
        <el-button class="submit-btn" type="primary" :loading="loading" @click="submitLogin">
          登录后台
        </el-button>
      </el-form>
    </section>
  </div>
</template>

<style scoped>
.login-shell {
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.login-card {
  width: min(460px, 100%);
  border-radius: 32px;
  padding: 32px;
}

.eyebrow {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--accent-blue);
}

h1 {
  margin: 12px 0 0;
  font-size: 34px;
  line-height: 1.05;
  letter-spacing: -0.04em;
}

.desc {
  margin: 12px 0 24px;
  color: var(--text-muted);
  line-height: 1.7;
}

.demo-box {
  margin-bottom: 22px;
  padding: 18px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.68);
}

.demo-title {
  font-size: 14px;
  font-weight: 700;
}

.demo-pill {
  width: 100%;
  margin-top: 12px;
  border: none;
  border-radius: 18px;
  background: rgba(15, 23, 42, 0.06);
  padding: 12px 14px;
  text-align: left;
  cursor: pointer;
}

.demo-hint {
  margin-top: 10px;
  font-size: 12px;
  color: var(--text-muted);
}

.submit-btn {
  width: 100%;
  height: 46px;
  margin-top: 8px;
}
</style>
