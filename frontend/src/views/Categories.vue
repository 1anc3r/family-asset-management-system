<template>
  <div class="categories-page">
    <!-- 支出分类 -->
    <el-card shadow="hover" class="section">
      <template #header>
        <div class="card-header">
          <span class="card-title">
            <el-icon><Bottom /></el-icon>
            支出分类
          </span>
          <el-button type="primary" size="small" @click="handleAdd('expense')">
            <el-icon><Plus /></el-icon>添加
          </el-button>
        </div>
      </template>

      <div class="category-grid">
        <div
          v-for="category in expenseCategories"
          :key="category.id"
          class="category-item"
          :class="{ disabled: category.status === 0 }"
        >
          <div class="category-icon">
            <el-icon v-if="category.icon"><component :is="category.icon" /></el-icon>
            <el-icon v-else><Goods /></el-icon>
          </div>
          <div class="category-name">{{ category.name }}</div>
          <div class="category-actions">
            <el-switch
              v-model="category.status"
              :active-value="1"
              :inactive-value="0"
              @change="(val) => handleStatusChange(category, val)"
            />
            <el-button type="primary" link size="small" @click="handleEdit(category)">
              <el-icon><Edit /></el-icon>
            </el-button>
            <el-button type="danger" link size="small" @click="handleDelete(category)">
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
        </div>
      </div>

      <el-empty v-if="expenseCategories.length === 0" description="暂无支出分类" />
    </el-card>

    <!-- 收入分类 -->
    <el-card shadow="hover" class="section">
      <template #header>
        <div class="card-header">
          <span class="card-title">
            <el-icon><Top /></el-icon>
            收入分类
          </span>
          <el-button type="success" size="small" @click="handleAdd('income')">
            <el-icon><Plus /></el-icon>添加
          </el-button>
        </div>
      </template>

      <div class="category-grid">
        <div
          v-for="category in incomeCategories"
          :key="category.id"
          class="category-item"
          :class="{ disabled: category.status === 0 }"
        >
          <div class="category-icon income">
            <el-icon v-if="category.icon"><component :is="category.icon" /></el-icon>
            <el-icon v-else><Money /></el-icon>
          </div>
          <div class="category-name">{{ category.name }}</div>
          <div class="category-actions">
            <el-switch
              v-model="category.status"
              :active-value="1"
              :inactive-value="0"
              @change="(val) => handleStatusChange(category, val)"
            />
            <el-button type="primary" link size="small" @click="handleEdit(category)">
              <el-icon><Edit /></el-icon>
            </el-button>
            <el-button type="danger" link size="small" @click="handleDelete(category)">
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
        </div>
      </div>

      <el-empty v-if="incomeCategories.length === 0" description="暂无收入分类" />
    </el-card>

    <!-- 添加/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑分类' : '添加分类'"
      :width="isMobile ? '92%' : '500px'"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        :label-width="isMobile ? '80px' : '100px'"
        :label-position="isMobile ? 'top' : 'right'"
      >
        <el-form-item label="类型">
          <el-radio-group v-model="form.type" :disabled="isEdit">
            <el-radio-button label="expense">支出</el-radio-button>
            <el-radio-button label="income">收入</el-radio-button>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="如：餐饮、工资" />
        </el-form-item>

        <el-form-item label="图标">
          <el-input v-model="form.icon" placeholder="图标名称（可选）" />
        </el-form-item>

        <el-form-item label="排序">
          <el-input-number v-model="form.sort" :min="0" />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitting" @click="handleSubmit">
            保存
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getCategoryList, createCategory, updateCategory, deleteCategory } from '@/api/category'

// 移动端响应式检测
const isMobile = ref(false)
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

// 数据
const loading = ref(false)
const categories = ref([])

// 弹窗
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const formRef = ref(null)

const form = reactive({
  id: null,
  type: 'expense',
  name: '',
  icon: '',
  sort: 0
})

const rules = {
  name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' }
  ]
}

// 计算属性
const expenseCategories = computed(() => categories.value.filter(c => c.type === 'expense'))
const incomeCategories = computed(() => categories.value.filter(c => c.type === 'income'))

// 获取分类列表
const fetchCategories = async () => {
  loading.value = true
  try {
    const res = await getCategoryList()
    if (res.code === 200) {
      categories.value = res.data.list
    }
  } catch (error) {
    console.error('获取分类失败', error)
  } finally {
    loading.value = false
  }
}

// 添加分类
const handleAdd = (type) => {
  isEdit.value = false
  form.id = null
  form.type = type
  form.name = ''
  form.icon = ''
  form.sort = 0
  dialogVisible.value = true
}

// 编辑分类
const handleEdit = (category) => {
  isEdit.value = true
  form.id = category.id
  form.type = category.type
  form.name = category.name
  form.icon = category.icon || ''
  form.sort = category.sort || 0
  dialogVisible.value = true
}

// 提交表单
const handleSubmit = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    if (isEdit.value) {
      const res = await updateCategory(form.id, {
        name: form.name,
        icon: form.icon,
        sort: form.sort
      })
      if (res.code === 200) {
        ElMessage.success('更新成功')
      }
    } else {
      const res = await createCategory({
        name: form.name,
        type: form.type,
        icon: form.icon,
        sort: form.sort
      })
      if (res.code === 200) {
        ElMessage.success('创建成功')
      }
    }
    dialogVisible.value = false
    fetchCategories()
  } catch (error) {
    ElMessage.error(error.response?.data?.msg || '操作失败')
  } finally {
    submitting.value = false
  }
}

// 删除分类
const handleDelete = (category) => {
  ElMessageBox.confirm(`确定要删除分类「${category.name}」吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await deleteCategory(category.id)
      if (res.code === 200) {
        ElMessage.success('删除成功')
        fetchCategories()
      }
    } catch (error) {
      ElMessage.error(error.response?.data?.msg || '删除失败')
    }
  })
}

// 切换状态
const handleStatusChange = async (category, status) => {
  try {
    const res = await updateCategory(category.id, { status })
    if (res.code === 200) {
      ElMessage.success(status === 1 ? '已启用' : '已禁用')
    }
  } catch (error) {
    ElMessage.error('操作失败')
    category.status = status === 1 ? 0 : 1
  }
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  fetchCategories()
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>

<style scoped lang="scss">
.categories-page {
  .section {
    margin-bottom: 20px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }

  .category-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 15px;

    .category-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20px;
      background: #f5f7fa;
      border-radius: 8px;
      transition: all 0.3s;

      &:hover {
        background: #ecf5ff;
      }

      &.disabled {
        opacity: 0.5;
      }

      .category-icon {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: #fef0f0;
        color: #f56c6c;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 10px;

        .el-icon {
          font-size: 24px;
        }

        &.income {
          background: #f0f9eb;
          color: #67c23a;
        }
      }

      .category-name {
        font-size: 14px;
        color: #303133;
        margin-bottom: 10px;
        text-align: center;
        word-break: break-all;
      }

      .category-actions {
        display: flex;
        align-items: center;
        gap: 5px;
      }
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }
}

/* ========== 移动端H5适配 ========== */
@media (max-width: 768px) {
  .categories-page {
    .section {
      margin-bottom: 10px;
    }

    .category-grid {
      /* 移动端减小网格列宽，每行显示更多 */
      grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
      gap: 10px;

      .category-item {
        padding: 12px 8px;

        .category-icon {
          width: 40px;
          height: 40px;
          margin-bottom: 8px;

          .el-icon {
            font-size: 20px;
          }
        }

        .category-name {
          font-size: 12px;
          margin-bottom: 8px;
        }

        .category-actions {
          gap: 3px;

          :deep(.el-switch) {
            transform: scale(0.8);
          }

          .el-button {
            padding: 4px;
          }
        }
      }
    }
  }
}
</style>
