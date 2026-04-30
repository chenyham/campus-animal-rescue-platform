<script setup>
import { computed, onMounted, ref } from 'vue'
import request from '../utils/request'
import { ElMessage } from 'element-plus'

const reports = ref([])
const loading = ref(false)
const statusFilter = ref('all')

const statusLabel = status => ({ 0: '待处理', 1: '处理中', 2: '已完成', 3: '已忽略' }[status] || '未知')
const urgencyLabel = level => ({ 0: '常规', 1: '一般', 2: '紧急' }[level] || '未知')

const parseMediaUrls = media => {
  if (!media) return []
  if (Array.isArray(media)) return media.filter(Boolean)

  const text = String(media).trim()
  if (!text) return []

  try {
    const parsed = JSON.parse(text)
    if (Array.isArray(parsed)) return parsed.filter(Boolean)
    if (typeof parsed === 'string') return [parsed].filter(Boolean)
  } catch {
    // Keep plain string fallbacks below.
  }

  if (text.includes(',')) {
    return text.split(',').map(item => item.trim()).filter(Boolean)
  }

  return [text]
}

const fetchReports = async () => {
  loading.value = true
  try {
    reports.value = await request.get('/reports/')
  } finally {
    loading.value = false
  }
}

const filteredReports = computed(() => {
  return reports.value.filter(item => statusFilter.value === 'all' || String(item.status) === statusFilter.value)
})

const displayReports = computed(() =>
  filteredReports.value.map(item => ({
    ...item,
    imageUrls: parseMediaUrls(item.media_urls),
  }))
)

const updateReport = async (row, payload, successText) => {
  await request.put(`/reports/${row.id}`, payload)
  ElMessage.success(successText)
  fetchReports()
}

onMounted(fetchReports)
</script>

<template>
  <div class="page-shell">
    <section class="hero glass-panel">
      <div>
        <h2 class="page-section-title">救助工单</h2>
        <p class="page-section-desc">统一查看上报、接单分配、处理完成与忽略记录。</p>
      </div>
      <el-radio-group v-model="statusFilter" size="large">
        <el-radio-button label="all">全部</el-radio-button>
        <el-radio-button label="0">待处理</el-radio-button>
        <el-radio-button label="1">处理中</el-radio-button>
        <el-radio-button label="2">已完成</el-radio-button>
      </el-radio-group>
    </section>

    <section class="report-grid">
      <article v-for="item in displayReports" :key="item.id" class="report-card glass-panel">
        <div class="report-head">
          <div>
            <div class="report-id">工单 #{{ item.id }}</div>
            <div class="report-time">{{ item.created_at?.replace('T', ' ').slice(0, 16) }}</div>
          </div>
          <div class="tag-wrap">
            <el-tag :type="item.urgency_level === 2 ? 'danger' : item.urgency_level === 1 ? 'warning' : 'info'">
              {{ urgencyLabel(item.urgency_level) }}
            </el-tag>
            <el-tag>{{ statusLabel(item.status) }}</el-tag>
          </div>
        </div>

        <div class="report-location">{{ item.address_detail || '暂无地点信息' }}</div>
        <div class="report-desc">{{ item.description || '无补充描述' }}</div>

        <div v-if="item.imageUrls.length" class="report-images">
          <img
            v-for="(imageUrl, index) in item.imageUrls"
            :key="`${item.id}-${index}`"
            :src="imageUrl"
            :alt="`工单 ${item.id} 图片 ${index + 1}`"
          />
        </div>

        <div class="report-footer">
          <span>处理人：{{ item.handler_id ? `#${item.handler_id}` : '未分配' }}</span>
          <span>{{ item.process_remark || '等待跟进记录' }}</span>
        </div>

        <div class="report-actions">
          <el-button
            v-if="item.status === 0"
            type="primary"
            @click="updateReport(item, { status: 1, handler_id: 1, process_remark: '管理员已接单' }, '工单已接单')"
          >
            接单处理
          </el-button>
          <el-button
            v-if="item.status !== 2"
            @click="updateReport(item, { status: 2, handler_id: item.handler_id || 1, process_remark: '已完成现场跟进' }, '工单已完结')"
          >
            标记完成
          </el-button>
          <el-button
            v-if="item.status === 0"
            text
            @click="updateReport(item, { status: 3, process_remark: '经核验，已归档忽略' }, '工单已归档')"
          >
            忽略
          </el-button>
        </div>
      </article>
    </section>
  </div>
</template>

<style scoped>
.hero {
  border-radius: var(--radius-xl);
  padding: 22px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.report-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.report-card {
  border-radius: var(--radius-xl);
  padding: 22px;
}

.report-head,
.tag-wrap,
.report-footer,
.report-actions {
  display: flex;
  align-items: center;
}

.report-head,
.report-footer {
  justify-content: space-between;
  gap: 12px;
}

.tag-wrap,
.report-actions {
  gap: 10px;
}

.report-id {
  font-size: 18px;
  font-weight: 700;
}

.report-time,
.report-footer {
  color: var(--text-muted);
  font-size: 12px;
}

.report-location {
  margin-top: 18px;
  font-size: 15px;
  font-weight: 600;
}

.report-desc {
  margin-top: 10px;
  color: var(--text-secondary);
  line-height: 1.75;
  min-height: 72px;
}

.report-images {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
  margin-top: 16px;
}

.report-images img {
  width: 100%;
  height: 160px;
  border-radius: 18px;
  object-fit: cover;
  border: 1px solid var(--line);
  background: rgba(248, 250, 252, 0.92);
}

.report-footer {
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px solid var(--line);
}

.report-actions {
  margin-top: 18px;
}

@media (max-width: 1100px) {
  .hero {
    flex-direction: column;
    align-items: flex-start;
  }

  .report-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .report-head,
  .report-footer,
  .report-actions {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
