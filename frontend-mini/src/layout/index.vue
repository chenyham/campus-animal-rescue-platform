<script setup>
import {
  ChatDotRound,
  Checked,
  DataAnalysis,
  Document,
  HomeFilled,
  Opportunity,
  Search,
} from '@element-plus/icons-vue'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { authSession, clearSession } from '../utils/auth'

const route = useRoute()
const router = useRouter()

const menus = [
  { path: '/dashboard', label: '总览面板', icon: DataAnalysis },
  { path: '/animals', label: '动物档案', icon: Document },
  { path: '/reports', label: '救助工单', icon: Opportunity },
  { path: '/checkins', label: '爱心救助', icon: Checked },
  { path: '/adoptions', label: '领养申请', icon: HomeFilled },
  { path: '/aichat', label: 'AI 助理', icon: ChatDotRound },
]

const pageTitle = computed(() => route.meta.title || '校园救助后台')
const currentUser = computed(() => authSession.value?.user || {})
const profileName = computed(() => currentUser.value.username || '管理员')
const profileMeta = computed(() => {
  if (currentUser.value.role === 2) {
    return '管理员'
  }
  if (currentUser.value.role === 1) {
    return '志愿者'
  }
  return '校园用户'
})
const profileAvatar = computed(() => currentUser.value.avatar_url || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80')

const logout = () => {
  clearSession()
  router.replace('/login')
}
</script>

<template>
  <div class="shell">
    <aside class="sidebar glass-panel">
      <div class="brand">
        <div class="brand-orb"></div>
        <div>
          <div class="brand-name">校园流浪猫狗救助与领养平台</div>
          <div class="brand-meta">后台控制后台</div>
        </div>
      </div>

      <el-menu
        class="nav"
        :default-active="route.path"
        router
        background-color="transparent"
        text-color="#475569"
        active-text-color="#0f172a"
      >
        <el-menu-item v-for="item in menus" :key="item.path" :index="item.path">
          <el-icon><component :is="item.icon" /></el-icon>
          <span>{{ item.label }}</span>
        </el-menu-item>
      </el-menu>

      <div class="sidebar-card">
        <div class="sidebar-card-title">运行状态</div>
        <div class="sidebar-card-text">数据面板、工单中心和 AI 辅助模块已统一接入真实接口。</div>
      </div>
    </aside>

    <main class="content">
      <header class="topbar glass-panel">
        <div>
          <div class="topbar-title">{{ pageTitle }}</div>
          <div class="topbar-subtitle">校园流浪猫狗救助与领养平台后台控制台</div>
        </div>

        <div class="topbar-actions">
          <div class="search-pill">
            <el-icon><Search /></el-icon>
            <span></span>
          </div>
          <div class="profile-pill">
            <img class="avatar" :src="profileAvatar" :alt="profileName" />
            <div>
              <div class="profile-name">{{ profileName }}</div>
              <div class="profile-meta">{{ profileMeta }}</div>
            </div>
          </div>
          <button class="logout-pill" @click="logout">退出登录</button>
        </div>
      </header>

      <section class="view">
        <router-view />
      </section>
    </main>
  </div>
</template>

<style scoped>
.shell {
  height: 100dvh;
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 24px;
  padding: 24px;
  overflow: hidden;
}

.sidebar {
  border-radius: var(--radius-xl);
  padding: 24px 18px;
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 8px 10px 14px;
}

.brand-orb {
  width: 44px;
  height: 44px;
  border-radius: 16px;
  background: linear-gradient(135deg, #111827 0%, #3b82f6 55%, #bfdbfe 100%);
  box-shadow: 0 12px 32px rgba(37, 99, 235, 0.28);
}

.brand-name {
  font-size: 18px;
  font-weight: 700;
}

.brand-meta {
  font-size: 12px;
  color: var(--text-muted);
}

.nav {
  border-right: none;
}

:deep(.nav .el-menu-item) {
  height: 52px;
  border-radius: 16px;
  margin-bottom: 6px;
  font-weight: 600;
}

:deep(.nav .el-menu-item:hover) {
  background: rgba(255, 255, 255, 0.6);
}

:deep(.nav .el-menu-item.is-active) {
  background: rgba(255, 255, 255, 0.88);
  box-shadow: 0 10px 26px rgba(15, 23, 42, 0.06);
}

.sidebar-card {
  margin-top: auto;
  padding: 18px;
  border-radius: 20px;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.9), rgba(51, 65, 85, 0.92));
  color: white;
}

.sidebar-card-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
}

.sidebar-card-text {
  color: rgba(255, 255, 255, 0.78);
  font-size: 13px;
  line-height: 1.7;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
  min-height: 0;
}

.topbar {
  border-radius: var(--radius-xl);
  padding: 18px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.topbar-title {
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.04em;
}

.topbar-subtitle {
  color: var(--text-muted);
  font-size: 13px;
  margin-top: 4px;
}

.topbar-actions {
  display: flex;
  align-items: center;
  gap: 14px;
}

.search-pill,
.profile-pill,
.logout-pill {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.72);
}

.search-pill {
  color: var(--text-secondary);
}

.profile-pill {
  padding-right: 18px;
}

.logout-pill {
  border: none;
  cursor: pointer;
  color: var(--text-main);
}

.avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  object-fit: cover;
}

.profile-name {
  font-size: 14px;
  font-weight: 600;
}

.profile-meta {
  font-size: 12px;
  color: var(--text-muted);
}

.view {
  min-height: 0;
  overflow: auto;
  padding-right: 4px;
}

@media (max-width: 1279px) {
  .shell {
    height: auto;
    min-height: 100dvh;
    grid-template-columns: 1fr;
    overflow: visible;
  }

  .sidebar {
    order: 2;
  }

  .content {
    order: 1;
  }
}

@media (max-width: 860px) {
  .topbar {
    flex-direction: column;
    align-items: flex-start;
  }

  .topbar-actions {
    width: 100%;
    flex-wrap: wrap;
  }

  .search-pill {
    display: none;
  }
}
</style>
