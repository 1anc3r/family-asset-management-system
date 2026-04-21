<template>
  <div class="bills-page">
    <!-- 筛选条件 -->
    <el-card shadow="hover" class="filter-card">
      <el-form :model="filterForm" :inline="!isMobile" :label-position="isMobile ? 'top' : 'right'" class="filter-form">
        <el-form-item label="账户">
          <el-select v-model="filterForm.account_id" placeholder="全部账户" clearable class="filter-select">
            <el-option v-for="account in accounts" :key="account.id" :label="account.name" :value="account.id" />
          </el-select>
        </el-form-item>

        <el-form-item label="类型">
          <el-select v-model="filterForm.type" placeholder="全部类型" clearable class="filter-select">
            <el-option label="支出" value="expense" />
            <el-option label="收入" value="income" />
            <el-option label="转账" value="transfer" />
          </el-select>
        </el-form-item>

        <el-form-item label="分类">
          <el-select v-model="filterForm.category_id" placeholder="全部分类" clearable class="filter-select">
            <el-option-group label="支出">
              <el-option v-for="cat in expenseCategories" :key="cat.id" :label="cat.name" :value="cat.id" />
            </el-option-group>
            <el-option-group label="收入">
              <el-option v-for="cat in incomeCategories" :key="cat.id" :label="cat.name" :value="cat.id" />
            </el-option-group>
          </el-select>
        </el-form-item>

        <el-form-item label="日期">
          <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期"
            end-placeholder="结束日期" value-format="YYYY-MM-DD" class="filter-date" />
        </el-form-item>

        <el-form-item label="关键词">
          <el-input v-model="filterForm.keyword" placeholder="搜索备注" clearable class="filter-input" />
        </el-form-item>

        <el-form-item>
          <div class="filter-actions">
            <el-button type="primary" @click="handleSearch">
              <el-icon>
                <Search />
              </el-icon>查询
            </el-button>
            <el-button @click="handleReset">
              <el-icon>
                <RefreshRight />
              </el-icon>重置
            </el-button>
          </div>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 账单列表 -->
    <el-card shadow="hover" class="list-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">账单列表</span>
          <el-button type="primary" @click="$router.push('/bill/add')">
            <el-icon>
              <Plus />
            </el-icon>记一笔
          </el-button>
        </div>
      </template>

      <!-- 桌面端：表格展示 -->
      <div v-if="!isMobile" class="table-wrapper">
        <el-table v-loading="loading" :data="billList" stripe style="width: 100%">
          <el-table-column label="类型" width="80">
            <template #default="{ row }">
              <el-tag :type="getTypeTagType(row.type)" size="small">
                {{ getTypeText(row.type) }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column label="分类" width="120">
            <template #default="{ row }">
              {{ row.category_name || '-' }}
            </template>
          </el-table-column>

          <el-table-column label="金额" width="120">
            <template #default="{ row }">
              <span :class="getAmountClass(row.type)">
                {{ getAmountPrefix(row.type) }}¥{{ formatAmount(row.amount) }}
              </span>
            </template>
          </el-table-column>

          <el-table-column label="账户" min-width="150">
            <template #default="{ row }">
              <div v-if="row.type === 'transfer'">
                {{ row.account_name }} → {{ row.to_account_name }}
              </div>
              <div v-else>
                {{ row.account_name }}
              </div>
            </template>
          </el-table-column>

          <el-table-column label="备注" min-width="150">
            <template #default="{ row }">
              {{ row.remark || '-' }}
            </template>
          </el-table-column>

          <el-table-column label="时间" width="150">
            <template #default="{ row }">
              {{ formatDateTime(row.bill_time) }}
            </template>
          </el-table-column>

          <el-table-column label="操作" width="150" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link @click="handleEdit(row)">
                <el-icon>
                  <Edit />
                </el-icon>编辑
              </el-button>
              <el-button type="danger" link @click="handleDelete(row)">
                <el-icon>
                  <Delete />
                </el-icon>删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 移动端：卡片列表展示 -->
      <div v-else class="mobile-bill-list">
        <div v-if="billList.length === 0" class="empty-data">
          <el-empty description="暂无账单" />
        </div>
        <div v-for="bill in billList" :key="bill.id" class="mobile-bill-item">
          <div class="mobile-bill-main">
            <div class="mobile-bill-left">
              <el-tag :type="getTypeTagType(bill.type)" size="small" class="type-tag">
                {{ getTypeText(bill.type) }}
              </el-tag>
              <div class="mobile-bill-category">{{ bill.category_name || '-' }}</div>
            </div>
            <div class="mobile-bill-amount" :class="getAmountClass(bill.type)">
              {{ getAmountPrefix(bill.type) }}¥{{ formatAmount(bill.amount) }}
            </div>
          </div>
          <div class="mobile-bill-detail">
            <div v-if="bill.type === 'transfer'" class="detail-item">
              {{ bill.account_name }} → {{ bill.to_account_name }}
            </div>
            <div v-else class="detail-item">
              {{ bill.account_name }}
            </div>
            <div v-if="bill.remark" class="detail-item remark">备注：{{ bill.remark }}</div>
            <div class="detail-item time">{{ formatDateTime(bill.bill_time) }}</div>
          </div>
          <div class="mobile-bill-actions">
            <el-button type="primary" link size="small" @click="handleEdit(bill)">
              <el-icon>
                <Edit />
              </el-icon>编辑
            </el-button>
            <el-button type="danger" link size="small" @click="handleDelete(bill)">
              <el-icon>
                <Delete />
              </el-icon>删除
            </el-button>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination v-model:current-page="pagination.page" v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]" :total="pagination.total"
          :layout="isMobile ? 'total, prev, pager, next' : 'total, sizes, prev, pager, next, jumper'" :small="isMobile"
          @size-change="handleSizeChange" @current-change="handlePageChange" />
      </div>
    </el-card>

    <!-- 编辑弹窗 -->
    <el-dialog v-model="editDialogVisible" title="编辑账单" :width="isMobile ? '92%' : '600px'"
      :close-on-click-modal="false">
      <el-form ref="editFormRef" :model="editForm" :rules="editRules" :label-width="isMobile ? '80px' : '100px'"
        :label-position="isMobile ? 'top' : 'right'">
        <el-form-item label="类型">
          <el-radio-group v-model="editForm.type" disabled>
            <el-radio-button label="expense">支出</el-radio-button>
            <el-radio-button label="income">收入</el-radio-button>
            <el-radio-button label="transfer">转账</el-radio-button>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="金额" prop="amount">
          <el-input-number v-model="editForm.amount" :min="0.01" :precision="2" style="width: 100%" />
        </el-form-item>

        <el-form-item label="账户" prop="account_id">
          <el-select v-model="editForm.account_id" class="full-width">
            <el-option v-for="account in accounts" :key="account.id" :label="account.name" :value="account.id" />
          </el-select>
        </el-form-item>

        <el-form-item v-if="editForm.type === 'transfer'" label="目标账户" prop="to_account_id">
          <el-select v-model="editForm.to_account_id" class="full-width">
            <el-option v-for="account in accounts.filter(a => a.id !== editForm.account_id)" :key="account.id"
              :label="account.name" :value="account.id" />
          </el-select>
        </el-form-item>

        <el-form-item v-if="editForm.type !== 'transfer'" label="分类" prop="category_id">
          <el-select v-model="editForm.category_id" class="full-width">
            <el-option v-for="cat in editForm.type === 'expense' ? expenseCategories : incomeCategories" :key="cat.id"
              :label="cat.name" :value="cat.id" />
          </el-select>
        </el-form-item>

        <el-form-item label="日期" prop="bill_time">
          <el-date-picker v-model="editForm.bill_time" type="datetime" class="full-width" format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DD HH:mm:ss" />
        </el-form-item>

        <el-form-item label="备注">
          <el-input v-model="editForm.remark" type="textarea" :rows="isMobile ? 2 : 3" maxlength="200"
            show-word-limit />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="editLoading" @click="handleEditSubmit">
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
import { getBillList, deleteBill, updateBill } from '@/api/bill'
import { getAccountList } from '@/api/account'
import { getCategoryList } from '@/api/category'
import { formatAmount, formatDateTime } from '@/utils/format'

// 移动端响应式检测
const isMobile = ref(false)
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

// 数据
const loading = ref(false)
const billList = ref([])
const accounts = ref([])
const categories = ref([])
const dateRange = ref([])

// 筛选表单
const filterForm = reactive({
  type: '',
  account_id: null,
  category_id: null,
  keyword: ''
})

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

// 编辑弹窗
const editDialogVisible = ref(false)
const editLoading = ref(false)
const editFormRef = ref(null)
const editForm = reactive({
  id: null,
  type: '',
  amount: 0,
  account_id: null,
  to_account_id: null,
  category_id: null,
  bill_time: '',
  remark: ''
})

const editRules = {
  amount: [
    { required: true, message: '请输入金额', trigger: 'blur' }
  ],
  account_id: [
    { required: true, message: '请选择账户', trigger: 'change' }
  ],
  bill_time: [
    { required: true, message: '请选择日期', trigger: 'change' }
  ]
}

// 计算属性
const expenseCategories = computed(() => categories.value.filter(c => c.type === 'expense'))
const incomeCategories = computed(() => categories.value.filter(c => c.type === 'income'))

// 获取类型标签样式
const getTypeTagType = (type) => {
  const map = {
    income: 'success',
    expense: 'danger',
    transfer: 'info'
  }
  return map[type] || 'info'
}

// 获取类型文本
const getTypeText = (type) => {
  const map = {
    income: '收入',
    expense: '支出',
    transfer: '转账'
  }
  return map[type] || type
}

// 获取金额样式
const getAmountClass = (type) => {
  return type === 'income' ? 'amount-income' : type === 'expense' ? 'amount-expense' : ''
}

// 获取金额前缀
const getAmountPrefix = (type) => {
  return type === 'income' ? '+' : type === 'expense' ? '-' : ''
}

// 获取账单列表
const fetchBills = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...filterForm
    }

    if (dateRange.value && dateRange.value.length === 2) {
      params.start_date = dateRange.value[0]
      params.end_date = dateRange.value[1]
    }

    const res = await getBillList(params)
    if (res.code === 200) {
      billList.value = res.data.list
      pagination.total = res.data.pagination.total
    }
  } catch (error) {
    console.error('获取账单失败', error)
  } finally {
    loading.value = false
  }
}

// 获取账户列表
const fetchAccounts = async () => {
  try {
    const res = await getAccountList()
    if (res.code === 200) {
      accounts.value = res.data.list
    }
  } catch (error) {
    console.error('获取账户失败', error)
  }
}

// 获取分类列表
const fetchCategories = async () => {
  try {
    const res = await getCategoryList()
    if (res.code === 200) {
      categories.value = res.data.list
    }
  } catch (error) {
    console.error('获取分类失败', error)
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  fetchBills()
}

// 重置
const handleReset = () => {
  filterForm.type = ''
  filterForm.account_id = null
  filterForm.category_id = null
  filterForm.keyword = ''
  dateRange.value = []
  pagination.page = 1
  fetchBills()
}

// 分页
const handleSizeChange = (size) => {
  pagination.pageSize = size
  fetchBills()
}

const handlePageChange = (page) => {
  pagination.page = page
  fetchBills()
}

// 编辑
const handleEdit = (row) => {
  editForm.id = row.id
  editForm.type = row.type
  editForm.amount = parseFloat(row.amount)
  editForm.account_id = row.account_id
  editForm.to_account_id = row.to_account_id
  editForm.category_id = row.category_id
  editForm.bill_time = row.bill_time
  editForm.remark = row.remark
  editDialogVisible.value = true
}

// 提交编辑
const handleEditSubmit = async () => {
  const valid = await editFormRef.value.validate().catch(() => false)
  if (!valid) return

  editLoading.value = true
  try {
    const res = await updateBill(editForm.id, {
      amount: editForm.amount,
      account_id: editForm.account_id,
      to_account_id: editForm.to_account_id,
      category_id: editForm.category_id,
      bill_time: editForm.bill_time,
      remark: editForm.remark
    })

    if (res.code === 200) {
      ElMessage.success('更新成功')
      editDialogVisible.value = false
      fetchBills()
    }
  } catch (error) {
    ElMessage.error(error.response?.data?.msg || '更新失败')
  } finally {
    editLoading.value = false
  }
}

// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除这条账单吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await deleteBill(row.id)
      if (res.code === 200) {
        ElMessage.success('删除成功')
        fetchBills()
      }
    } catch (error) {
      ElMessage.error(error.response?.data?.msg || '删除失败')
    }
  })
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  fetchBills()
  fetchAccounts()
  fetchCategories()
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>

<style scoped lang="scss">
.bills-page {
  .filter-card {
    margin-bottom: 20px;
  }

  .filter-form {
    margin-top: 20px;

    .filter-select,
    .filter-input,
    .filter-date {
      width: 100px;
    }

    .filter-actions {
      display: flex;
      gap: 10px;
    }
  }

  .list-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .table-wrapper {
      overflow-x: auto;
    }

    .pagination {
      margin-top: 20px;
      display: flex;
      justify-content: flex-end;
    }
  }

  /* 移动端卡片式账单列表 */
  .mobile-bill-list {
    .mobile-bill-item {
      padding: 12px 0;
      border-bottom: 1px solid #ebeef5;

      &:last-child {
        border-bottom: none;
      }

      .mobile-bill-main {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;

        .mobile-bill-left {
          display: flex;
          align-items: center;
          gap: 8px;

          .type-tag {
            flex-shrink: 0;
          }

          .mobile-bill-category {
            font-size: 14px;
            color: #303133;
          }
        }

        .mobile-bill-amount {
          font-size: 16px;
          font-weight: 600;
          flex-shrink: 0;
        }
      }

      .mobile-bill-detail {
        padding-left: 4px;
        margin-bottom: 8px;

        .detail-item {
          font-size: 12px;
          color: #909399;
          margin-bottom: 4px;

          &.remark {
            color: #606266;
          }

          &.time {
            font-size: 11px;
          }
        }
      }

      .mobile-bill-actions {
        display: flex;
        gap: 10px;
        padding-left: 4px;
      }
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }

  .full-width {
    width: 100%;
  }
}

/* ========== 移动端H5适配 ========== */
@media (max-width: 768px) {
  .bills-page {
    .filter-card {
      margin-bottom: 10px;

      .filter-select,
      .filter-input,
      .filter-date {
        width: 100%;
      }

      .filter-actions {
        width: 100%;
        justify-content: flex-end;
      }
    }

    .list-card {
      .pagination {
        justify-content: center;
      }
    }
  }
}
</style>
