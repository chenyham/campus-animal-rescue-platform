<script setup>
import { nextTick, ref } from 'vue'
import request from '../utils/request'

const mode = ref('medical')
const inputMessage = ref('')
const loading = ref(false)
const scrollRef = ref(null)
const messages = ref([
  {
    role: 'ai',
    content: '这里是校园救助 AI 助理。你可以切换到医疗分析或科普答疑模式，辅助后台研判。',
  },
])

const scrollToBottom = async () => {
  await nextTick()
  if (scrollRef.value) {
    scrollRef.value.scrollTop = scrollRef.value.scrollHeight
  }
}

const sendMessage = async () => {
  const text = inputMessage.value.trim()
  if (!text || loading.value) return

  messages.value.push({ role: 'user', content: text })
  inputMessage.value = ''
  loading.value = true
  scrollToBottom()

  try {
    const res = await request.post('/ai/chat', { message: text, mode: mode.value })
    messages.value.push({ role: 'ai', content: res.reply })
  } catch (error) {
    messages.value.push({
      role: 'ai',
      content: error.response?.data?.detail || 'AI 服务暂不可用，请稍后重试。',
    })
  } finally {
    loading.value = false
    scrollToBottom()
  }
}
</script>

<template>
  <div class="page-shell">
    <section class="hero glass-panel">
      <div>
        <h2 class="page-section-title">AI 助理</h2>
        <p class="page-section-desc">支持医疗初筛和校园流浪动物科普答疑，两种模式共用同一对话视图。</p>
      </div>
      <el-segmented
        v-model="mode"
        :options="[
          { label: '医疗分析', value: 'medical' },
          { label: '科普答疑', value: 'science' },
        ]"
      />
    </section>

    <section class="chat-shell glass-panel">
      <div ref="scrollRef" class="chat-log">
        <div v-for="(item, index) in messages" :key="index" :class="['bubble-row', item.role]">
          <div class="bubble">{{ item.content }}</div>
        </div>
        <div v-if="loading" class="bubble-row ai">
          <div class="bubble loading">正在组织回答…</div>
        </div>
      </div>

      <div class="composer">
        <el-input
          v-model="inputMessage"
          type="textarea"
          :rows="3"
          resize="none"
          placeholder="输入症状、现场情况或常见喂养问题"
          @keyup.enter.ctrl="sendMessage"
        />
        <div class="composer-footer">
          <span>{{ mode === 'medical' ? '医疗模式更适合处理症状与伤情描述' : '科普模式适合日常喂养与行为学问题' }}</span>
          <el-button type="primary" :loading="loading" @click="sendMessage">发送</el-button>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.hero,
.chat-shell {
  border-radius: var(--radius-xl);
}

.hero {
  padding: 22px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
}

.chat-shell {
  min-height: calc(100vh - 220px);
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.chat-log {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-right: 6px;
}

.bubble-row {
  display: flex;
}

.bubble-row.user {
  justify-content: flex-end;
}

.bubble {
  max-width: min(760px, 75%);
  padding: 16px 18px;
  border-radius: 24px;
  white-space: pre-wrap;
  line-height: 1.75;
}

.bubble-row.ai .bubble {
  background: rgba(255, 255, 255, 0.86);
}

.bubble-row.user .bubble {
  background: linear-gradient(135deg, #0f172a, #2563eb);
  color: white;
}

.loading {
  color: var(--text-muted);
}

.composer {
  padding: 16px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.72);
}

.composer-footer {
  margin-top: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--text-muted);
  font-size: 12px;
}

@media (max-width: 900px) {
  .hero {
    flex-direction: column;
    align-items: flex-start;
  }

  .chat-shell {
    min-height: 70dvh;
  }

  .composer-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .bubble {
    max-width: 100%;
  }
}
</style>
