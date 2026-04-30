<script setup>
import { computed, onMounted, ref } from 'vue'
import request from '../utils/request'

const loading = ref(false)
const records = ref([])
const typeFilter = ref('all')

const typeMap = {
  feeding: '流浪猫狗投喂',
  donation: '爱心物资捐赠',
  service: '流浪猫狗救治',
  patrol: '日常巡查记录',
  adoption_followup: '领养后状态更新',
}

const filteredRecords = computed(() =>
  records.value.filter(item => typeFilter.value === 'all' || item.record_type === typeFilter.value)
)

const fetchRecords = async () => {
  loading.value = true
  try {
    records.value = await request.get('/feed-records/')
  } finally {
    loading.value = false
  }
}

onMounted(fetchRecords)
</script>

<template>
  <div class="page-shell">
    <section class="hero glass-panel">
      <div>
        <h2 class="page-section-title">爱心救助</h2>
        <p class="page-section-desc">集中查看移动端提交的投喂、捐赠、救治和巡查记录。</p>
      </div>
      <el-select v-model="typeFilter" style="width: 220px">
        <el-option label="全部类型" value="all" />
        <el-option label="流浪猫狗投喂" value="feeding" />
        <el-option label="爱心物资捐赠" value="donation" />
        <el-option label="流浪猫狗救治" value="service" />
        <el-option label="日常巡查记录" value="patrol" />
      </el-select>
    </section>

    <section class="record-grid">
      <article v-for="item in filteredRecords" :key="item.id" class="record-card glass-panel">
        <img :src="item.pic_url || 'https://images.unsplash.com/photo-1519052537078-e6302a4968d4?auto=format&fit=crop&w=900&q=80'" :alt="item.title" />
        <div class="record-body">
          <div class="record-top">
            <div>
              <div class="record-title">{{ item.title || '未命名救助' }}</div>
              <div class="record-meta">
                {{ typeMap[item.record_type] || '救助记录' }} · {{ item.user_name || `用户 #${item.user_id}` }}
              </div>
            </div>
            <div class="record-points">+{{ item.points_reward }}</div>
          </div>

          <p class="record-desc">{{ item.description || '未填写文字说明' }}</p>

          <div class="record-footer">
            <span>关联动物：{{ item.animal_name || '无' }}</span>
            <span>{{ item.created_at?.replace('T', ' ').slice(0, 16) }}</span>
          </div>
        </div>
      </article>
    </section>

    <section v-if="!filteredRecords.length && !loading" class="empty glass-panel">
      当前暂无符合条件的救助记录
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
  gap: 18px;
}

.record-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.record-card {
  border-radius: var(--radius-xl);
  overflow: hidden;
}

.record-card img {
  width: 100%;
  height: 220px;
  object-fit: cover;
}

.record-body {
  padding: 18px;
}

.record-top,
.record-footer {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.record-title {
  font-size: 18px;
  font-weight: 700;
}

.record-meta,
.record-footer {
  color: var(--text-muted);
  font-size: 12px;
}

.record-points {
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(37, 99, 235, 0.08);
  color: #2563eb;
  font-weight: 700;
}

.record-desc {
  margin: 14px 0 0;
  min-height: 72px;
  color: var(--text-secondary);
  line-height: 1.75;
}

.record-footer {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--line);
}

.empty {
  border-radius: var(--radius-xl);
  padding: 32px;
  text-align: center;
  color: var(--text-muted);
}

@media (max-width: 1100px) {
  .hero {
    flex-direction: column;
    align-items: flex-start;
  }

  .record-grid {
    grid-template-columns: 1fr;
  }
}
</style>
