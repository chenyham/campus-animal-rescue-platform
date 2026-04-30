<script setup>
import { computed, onMounted, ref } from 'vue'
import request from '../utils/request'
import { ElMessage } from 'element-plus'

const loading = ref(false)
const statusFilter = ref('all')
const applications = ref([])

const statusMap = {
  0: '待审核',
  1: '审核通过',
  2: '已领养',
  3: '已驳回',
}

const filteredApplications = computed(() =>
  applications.value.filter(item => statusFilter.value === 'all' || String(item.status) === statusFilter.value)
)

const fetchApplications = async () => {
  loading.value = true
  try {
    applications.value = await request.get('/adoptions/')
  } finally {
    loading.value = false
  }
}

const approve = async item => {
  await request.put(`/adoptions/${item.id}`, { status: 2, contract_url: '/static/contracts/demo-contract.pdf' })
  ElMessage.success('已同意领养，动物状态同步更新为已领养')
  fetchApplications()
}

const reject = async item => {
  await request.put(`/adoptions/${item.id}`, { status: 3, reject_reason: '当前条件暂不满足，建议补充居住与照护说明' })
  ElMessage.success('申请已驳回')
  fetchApplications()
}

onMounted(fetchApplications)
</script>

<template>
  <div class="page-shell">
    <section class="hero glass-panel">
      <div>
        <h2 class="page-section-title">领养申请</h2>
        <p class="page-section-desc">查看移动端提交的领养申请，并执行通过或驳回操作。</p>
      </div>
      <el-select v-model="statusFilter" style="width: 220px">
        <el-option label="全部状态" value="all" />
        <el-option label="待审核" value="0" />
        <el-option label="已领养" value="2" />
        <el-option label="已驳回" value="3" />
      </el-select>
    </section>

    <section class="application-grid">
      <article v-for="item in filteredApplications" :key="item.id" class="application-card glass-panel">
        <img :src="item.animal_pic" :alt="item.animal_name" />
        <div class="application-body">
          <div class="application-top">
            <div>
              <div class="application-title">{{ item.animal_name || '待领养动物' }}</div>
              <div class="application-meta">{{ item.applicant_name || item.real_name }} · {{ item.animal_species || '未知物种' }}</div>
            </div>
            <el-tag :type="item.status === 0 ? 'warning' : item.status === 2 ? 'success' : item.status === 3 ? 'danger' : 'info'">
              {{ statusMap[item.status] }}
            </el-tag>
          </div>

          <div class="info-line">申请人：{{ item.real_name }}</div>
          <div class="info-line">居住地：{{ item.residence }}</div>
          <p class="application-desc">{{ item.experience || '未填写养宠经验说明' }}</p>

          <div class="application-footer">
            <span>{{ item.apply_type === 1 ? '校外人士申请' : '校内学生申请' }}</span>
            <span>{{ item.created_at?.replace('T', ' ').slice(0, 16) }}</span>
          </div>

          <div v-if="item.status === 0" class="application-actions">
            <el-button type="primary" @click="approve(item)">同意领养</el-button>
            <el-button @click="reject(item)">驳回</el-button>
          </div>
          <div v-else-if="item.status === 3" class="reject-text">
            {{ item.reject_reason || '已驳回' }}
          </div>
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
  justify-content: space-between;
  align-items: center;
  gap: 18px;
}

.application-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.application-card {
  border-radius: var(--radius-xl);
  overflow: hidden;
}

.application-card img {
  width: 100%;
  height: 220px;
  object-fit: cover;
}

.application-body {
  padding: 18px;
}

.application-top,
.application-footer,
.application-actions {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.application-title {
  font-size: 19px;
  font-weight: 700;
}

.application-meta,
.application-footer,
.reject-text {
  color: var(--text-muted);
  font-size: 12px;
}

.info-line {
  margin-top: 12px;
  font-size: 13px;
  color: var(--text-secondary);
}

.application-desc {
  margin: 14px 0 0;
  min-height: 72px;
  color: var(--text-secondary);
  line-height: 1.75;
}

.application-footer {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--line);
}

.application-actions {
  margin-top: 18px;
}

.reject-text {
  margin-top: 14px;
}

@media (max-width: 1100px) {
  .hero {
    flex-direction: column;
    align-items: flex-start;
  }

  .application-grid {
    grid-template-columns: 1fr;
  }
}
</style>

