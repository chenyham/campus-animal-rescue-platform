<script setup>
import { computed, onMounted, ref } from 'vue'
import request from '../utils/request'
import { ElMessage } from 'element-plus'
import { uploadImage } from '../utils/upload'

const loading = ref(false)
const saving = ref(false)
const isUploading = ref(false)
const dialogVisible = ref(false)
const animalsList = ref([])
const keyword = ref('')
const statusFilter = ref('all')
const fileInput = ref(null)
const fallbackImage = 'https://images.unsplash.com/photo-1519052537078-e6302a4968d4?auto=format&fit=crop&w=900&q=80'

const initialForm = () => ({
  id: null,
  name: '',
  species: '猫',
  breed: '',
  age_estimate: '',
  health_status: '健康',
  nature_tags: '',
  location_info: '',
  main_pic_url: '',
  is_neutered: 0,
  is_vaccinated: 0,
  status: 1,
})

const form = ref(initialForm())

const fetchAnimals = async () => {
  loading.value = true
  try {
    animalsList.value = await request.get('/animals/')
  } finally {
    loading.value = false
  }
}

const filteredAnimals = computed(() => {
  return animalsList.value.filter(item => {
    const hitKeyword = [item.name, item.species, item.breed, item.location_info]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(keyword.value.trim().toLowerCase())
    const hitStatus = statusFilter.value === 'all' || String(item.status) === statusFilter.value
    return hitKeyword && hitStatus
  })
})

const statusLabel = status => ({ 0: '待救助', 1: '站内观察', 2: '开放领养', 3: '已领养', 4: '离世' }[status] || '未知')
const animalImage = animal => animal?.main_pic_url || fallbackImage

const openCreate = () => {
  form.value = initialForm()
  isUploading.value = false
  if (fileInput.value) fileInput.value.value = ''
  dialogVisible.value = true
}

const openEdit = row => {
  form.value = { ...row }
  isUploading.value = false
  if (fileInput.value) fileInput.value.value = ''
  dialogVisible.value = true
}

const chooseImage = () => {
  fileInput.value?.click()
}

const onFileChange = async event => {
  const file = event.target.files?.[0]
  if (!file) return

  isUploading.value = true
  try {
    const data = await uploadImage(file)
    form.value.main_pic_url = data.url
    ElMessage.success('图片上传成功')
  } catch (error) {
    ElMessage.error(error.message || '图片上传失败')
  } finally {
    isUploading.value = false
    if (fileInput.value) fileInput.value.value = ''
  }
}

const saveAnimal = async () => {
  if (isUploading.value) {
    ElMessage.warning('图片仍在上传，请稍后保存')
    return
  }

  const payload = { ...form.value }
  saving.value = true
  try {
    if (payload.id) {
      await request.put(`/animals/${payload.id}`, payload)
      ElMessage.success('动物档案已更新')
    } else {
      delete payload.id
      await request.post('/animals/', payload)
      ElMessage.success('新档案已创建')
    }
    dialogVisible.value = false
    await fetchAnimals()
  } catch (error) {
    console.error(error)
  } finally {
    saving.value = false
  }
}

onMounted(fetchAnimals)
</script>

<template>
  <div class="page-shell">
    <section class="hero glass-panel">
      <div>
        <h2 class="page-section-title">动物档案</h2>
        <p class="page-section-desc">维护在册动物信息、健康状态与领养准备度。</p>
      </div>
      <el-button type="primary" @click="openCreate">新增档案</el-button>
    </section>

    <section class="toolbar glass-panel">
      <el-input v-model="keyword" placeholder="搜索昵称、物种、地点" clearable />
      <el-select v-model="statusFilter">
        <el-option label="全部状态" value="all" />
        <el-option label="待救助" value="0" />
        <el-option label="站内观察" value="1" />
        <el-option label="开放领养" value="2" />
        <el-option label="已领养" value="3" />
      </el-select>
      <el-button @click="fetchAnimals">刷新</el-button>
    </section>

    <section class="card-grid">
      <article v-for="animal in filteredAnimals.slice(0, 3)" :key="animal.id" class="feature-card glass-panel">
        <img :src="animalImage(animal)" :alt="animal.name" />
        <div class="feature-content">
          <div class="feature-head">
            <div>
              <div class="feature-title">{{ animal.name || '未命名' }}</div>
              <div class="feature-meta">{{ animal.species }} · {{ animal.breed || '未标注品种' }}</div>
            </div>
            <el-tag>{{ statusLabel(animal.status) }}</el-tag>
          </div>
          <div class="feature-desc">{{ animal.health_status }} · {{ animal.location_info || '暂无地点信息' }}</div>
          <div class="feature-tags">
            <span v-if="animal.is_neutered">已绝育</span>
            <span v-if="animal.is_vaccinated">已免疫</span>
            <span>{{ animal.nature_tags || '性格待记录' }}</span>
          </div>
        </div>
      </article>
    </section>

    <section class="table-wrap glass-panel">
      <el-table v-loading="loading" :data="filteredAnimals">
        <el-table-column label="动物">
          <template #default="{ row }">
            <div class="animal-cell">
              <img :src="animalImage(row)" :alt="row.name" />
              <div>
                <div class="cell-title">{{ row.name || '未命名' }}</div>
                <div class="cell-meta">{{ row.species }} · {{ row.age_estimate || '年龄未知' }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="health_status" label="健康状态" />
        <el-table-column prop="location_info" label="位置" />
        <el-table-column label="档案状态">
          <template #default="{ row }">
            <el-tag>{{ statusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
    </section>

    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑动物档案' : '新增动物档案'" width="680px">
      <el-form :model="form" label-width="92px" class="form-grid">
        <el-form-item label="昵称"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="物种">
          <el-select v-model="form.species">
            <el-option label="猫" value="猫" />
            <el-option label="狗" value="狗" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="品种"><el-input v-model="form.breed" /></el-form-item>
        <el-form-item label="年龄"><el-input v-model="form.age_estimate" /></el-form-item>
        <el-form-item label="健康状态"><el-input v-model="form.health_status" /></el-form-item>
        <el-form-item label="档案状态">
          <el-select v-model="form.status">
            <el-option label="待救助" :value="0" />
            <el-option label="站内观察" :value="1" />
            <el-option label="开放领养" :value="2" />
            <el-option label="已领养" :value="3" />
            <el-option label="离世" :value="4" />
          </el-select>
        </el-form-item>
        <el-form-item label="地点"><el-input v-model="form.location_info" /></el-form-item>
        <el-form-item label="档案主图" class="full">
          <div class="upload-field">
            <input
              ref="fileInput"
              class="hidden-input"
              type="file"
              accept="image/*"
              @change="onFileChange"
            />
            <div class="upload-actions">
              <el-button :loading="isUploading" @click="chooseImage">上传图片</el-button>
              <el-button v-if="form.main_pic_url" text @click="form.main_pic_url = ''">清空图片</el-button>
              <span class="upload-hint">{{ isUploading ? '图片上传中...' : '支持 3MB 以内图片' }}</span>
            </div>
            <el-input v-model="form.main_pic_url" placeholder="也可直接填写图片 URL" />
            <div v-if="form.main_pic_url" class="upload-preview">
              <img :src="animalImage(form)" alt="动物主图预览" />
            </div>
          </div>
        </el-form-item>
        <el-form-item label="性格标签" class="full"><el-input v-model="form.nature_tags" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" :disabled="isUploading" @click="saveAnimal">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.hero,
.toolbar,
.table-wrap {
  border-radius: var(--radius-xl);
  padding: 20px 24px;
}

.hero,
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.toolbar {
  display: grid;
  grid-template-columns: 1fr 180px 120px;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.feature-card {
  overflow: hidden;
  border-radius: var(--radius-xl);
}

.feature-card img {
  width: 100%;
  height: 220px;
  object-fit: cover;
}

.feature-content {
  padding: 18px;
}

.feature-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.feature-title {
  font-size: 20px;
  font-weight: 700;
}

.feature-meta,
.feature-desc {
  margin-top: 6px;
  color: var(--text-muted);
  font-size: 13px;
}

.feature-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}

.feature-tags span {
  background: rgba(241, 245, 249, 0.92);
  padding: 8px 10px;
  border-radius: 999px;
  font-size: 12px;
  color: var(--text-secondary);
}

.animal-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.animal-cell img {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  object-fit: cover;
}

.cell-title {
  font-weight: 600;
}

.cell-meta {
  color: var(--text-muted);
  font-size: 12px;
  margin-top: 4px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px 18px;
}

.upload-field {
  display: grid;
  gap: 12px;
  width: 100%;
}

.upload-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.upload-hint {
  color: var(--text-muted);
  font-size: 12px;
}

.upload-preview {
  width: 180px;
  height: 180px;
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid var(--line);
  background: rgba(248, 250, 252, 0.92);
}

.upload-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hidden-input {
  display: none;
}

.full {
  grid-column: 1 / -1;
}

@media (max-width: 1200px) {
  .card-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 900px) {
  .hero {
    flex-direction: column;
    align-items: flex-start;
  }

  .toolbar,
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
