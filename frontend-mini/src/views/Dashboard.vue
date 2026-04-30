<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import * as echarts from 'echarts'
import request from '../utils/request'

const overview = ref({
  stats: [],
  trend: [],
  animals_by_status: [],
  pending_reports: [],
  recent_animals: [],
  active_volunteers: [],
})
const loading = ref(false)
const chartRef = ref(null)
let trendChart
let donutChart

const toneMap = {
  blue: 'linear-gradient(135deg, #dbeafe, #eff6ff)',
  amber: 'linear-gradient(135deg, #fef3c7, #fff7ed)',
  green: 'linear-gradient(135deg, #dcfce7, #ecfdf5)',
  purple: 'linear-gradient(135deg, #ede9fe, #f5f3ff)',
}

const loadOverview = async () => {
  loading.value = true
  try {
    overview.value = await request.get('/overview/')
    renderCharts()
  } finally {
    loading.value = false
  }
}

const renderCharts = () => {
  if (!chartRef.value) return

  if (!trendChart) {
    trendChart = echarts.init(chartRef.value.querySelector('.trend-chart'))
    donutChart = echarts.init(chartRef.value.querySelector('.donut-chart'))
    window.addEventListener('resize', handleResize)
  }

  trendChart.setOption({
    animationDuration: 600,
    tooltip: { trigger: 'axis' },
    legend: { top: 0, textStyle: { color: '#475569' } },
    grid: { left: 20, right: 20, bottom: 10, top: 44, containLabel: true },
    xAxis: {
      type: 'category',
      data: overview.value.trend.map(item => item.date),
      axisLine: { lineStyle: { color: '#cbd5e1' } },
      axisLabel: { color: '#64748b' },
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: 'rgba(148, 163, 184, 0.16)' } },
      axisLabel: { color: '#64748b' },
    },
    series: [
      {
        name: '新增工单',
        type: 'line',
        smooth: true,
        symbolSize: 8,
        itemStyle: { color: '#2563eb' },
        areaStyle: { color: 'rgba(37, 99, 235, 0.12)' },
        data: overview.value.trend.map(item => item.reports),
      },
      {
        name: '处理完成',
        type: 'line',
        smooth: true,
        symbolSize: 8,
        itemStyle: { color: '#059669' },
        areaStyle: { color: 'rgba(5, 150, 105, 0.12)' },
        data: overview.value.trend.map(item => item.resolved),
      },
      {
        name: '投喂记录',
        type: 'bar',
        barWidth: 16,
        itemStyle: { color: '#c084fc', borderRadius: 99 },
        data: overview.value.trend.map(item => item.feed_records),
      },
    ],
  })

  donutChart.setOption({
    tooltip: { trigger: 'item' },
    series: [
      {
        type: 'pie',
        radius: ['52%', '78%'],
        avoidLabelOverlap: false,
        label: { show: true, formatter: '{b}\n{c}', color: '#334155' },
        labelLine: { length: 8, length2: 8 },
        data: overview.value.animals_by_status,
      },
    ],
  })
}

const handleResize = () => {
  trendChart?.resize()
  donutChart?.resize()
}

onMounted(loadOverview)

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  trendChart?.dispose()
  donutChart?.dispose()
})
</script>

<template>
  <div class="page-shell">
    <section class="hero glass-panel">
      <div>
        <h2 class="page-section-title">校园救助总览</h2>
        <p class="page-section-desc">统一查看动物档案、工单压力、投喂活跃度和志愿者沉淀数据。</p>
      </div>
      <el-button round type="primary" @click="loadOverview" :loading="loading">刷新数据</el-button>
    </section>

    <section class="stat-grid">
      <article
        v-for="item in overview.stats"
        :key="item.label"
        class="stat-card glass-panel"
        :style="{ background: toneMap[item.tone] || toneMap.blue }"
      >
        <div class="stat-label">{{ item.label }}</div>
        <div class="stat-value">{{ item.value }}</div>
        <div class="stat-trend">{{ item.trend }}</div>
      </article>
    </section>

    <section ref="chartRef" class="insight-grid">
      <article class="chart-card glass-panel">
        <div class="section-header">
          <div>
            <h3>近七日救助动态</h3>
            <p>工单、处理完成与投喂记录的并行变化</p>
          </div>
        </div>
        <div class="trend-chart chart-box"></div>
      </article>

      <article class="chart-card glass-panel">
        <div class="section-header">
          <div>
            <h3>动物状态分布</h3>
            <p>在册动物生命周期一览</p>
          </div>
        </div>
        <div class="donut-chart chart-box small"></div>
      </article>
    </section>

    <section class="bottom-grid">
      <article class="list-card glass-panel">
        <div class="section-header">
          <div>
            <h3>待跟进工单</h3>
            <p>按时间倒序显示最近工单</p>
          </div>
        </div>
        <div class="list-body">
          <div v-for="item in overview.pending_reports" :key="item.id" class="list-row">
            <div>
              <div class="row-title">#{{ item.id }} {{ item.address_detail }}</div>
              <div class="row-meta">{{ item.description }}</div>
            </div>
            <el-tag :type="item.status === 0 ? 'danger' : item.status === 1 ? 'warning' : 'success'">
              {{ item.status === 0 ? '待处理' : item.status === 1 ? '处理中' : '已完成' }}
            </el-tag>
          </div>
        </div>
      </article>

      <article class="list-card glass-panel">
        <div class="section-header">
          <div>
            <h3>最新动物档案</h3>
            <p>最近更新的动物信息</p>
          </div>
        </div>
        <div class="animal-grid">
          <div v-for="animal in overview.recent_animals" :key="animal.id" class="animal-item">
            <img :src="animal.main_pic_url" :alt="animal.name" />
            <div>
              <div class="row-title">{{ animal.name || '未命名' }}</div>
              <div class="row-meta">{{ animal.species }} · {{ animal.health_status }}</div>
            </div>
          </div>
        </div>
      </article>

      <article class="list-card glass-panel">
        <div class="section-header">
          <div>
            <h3>活跃志愿者</h3>
            <p>按积分排序</p>
          </div>
        </div>
        <div class="volunteer-list">
          <div v-for="user in overview.active_volunteers" :key="user.id" class="volunteer-row">
            <img :src="user.avatar_url" :alt="user.username" />
            <div class="volunteer-info">
              <div class="row-title">{{ user.username }}</div>
              <div class="row-meta">积分 {{ user.points }} · {{ user.role === 2 ? '管理员' : '志愿者' }}</div>
            </div>
          </div>
        </div>
      </article>
    </section>
  </div>
</template>

<style scoped>
.hero {
  border-radius: var(--radius-xl);
  padding: 24px 28px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
}

.stat-card {
  padding: 20px 22px;
  border-radius: 24px;
}

.stat-label {
  color: var(--text-secondary);
  font-size: 14px;
}

.stat-value {
  margin-top: 8px;
  font-size: 42px;
  line-height: 1;
  font-weight: 700;
  letter-spacing: -0.05em;
}

.stat-trend {
  margin-top: 14px;
  color: var(--text-muted);
  font-size: 13px;
}

.insight-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 18px;
}

.chart-card,
.list-card {
  border-radius: var(--radius-xl);
  padding: 22px;
}

.section-header h3 {
  margin: 0;
  font-size: 18px;
}

.section-header p {
  margin: 6px 0 0;
  color: var(--text-muted);
  font-size: 13px;
}

.chart-box {
  height: 360px;
}

.chart-box.small {
  height: 320px;
}

.bottom-grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr 0.9fr;
  gap: 18px;
}

.list-body,
.volunteer-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: 18px;
}

.list-row,
.volunteer-row,
.animal-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 14px 16px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.66);
}

.row-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-main);
}

.row-meta {
  margin-top: 4px;
  font-size: 12px;
  color: var(--text-muted);
}

.animal-grid {
  margin-top: 18px;
  display: grid;
  gap: 12px;
}

.animal-item {
  justify-content: flex-start;
}

.animal-item img,
.volunteer-row img {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  object-fit: cover;
}

.volunteer-row img {
  border-radius: 50%;
}

.volunteer-info {
  flex: 1;
}

@media (max-width: 1400px) {
  .stat-grid,
  .bottom-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 1100px) {
  .insight-grid,
  .bottom-grid,
  .stat-grid {
    grid-template-columns: 1fr;
  }

  .hero {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
