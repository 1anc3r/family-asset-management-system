<template>
  <div class="accounts-page">
    <!-- 资产概览 -->
    <el-row :gutter="isMobile ? 10 : 20" class="stat-cards">
      <el-col :xs="24" :sm="12" :lg="8">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon" style="background: #409EFF;">
              <el-icon>
                <Wallet />
              </el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">净资产</div>
              <div class="stat-value" :class="netWorth >= 0 ? 'amount-income' : 'amount-expense'">
                ¥{{ formatAmount(netWorth) }}
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :lg="8">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon" style="background: #67c23a;">
              <el-icon>
                <Money />
              </el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">总资产</div>
              <div class="stat-value amount-income">¥{{ formatAmount(totalAsset) }}</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :lg="8">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon" style="background: #f56c6c;">
              <el-icon>
                <DocumentChecked />
              </el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">总负债</div>
              <div class="stat-value amount-expense">¥{{ formatAmount(totalLiability) }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 资产账户 -->
    <el-card shadow="hover" class="section">
      <template #header>
        <div class="card-header">
          <span class="card-title">
            <el-icon>
              <Wallet />
            </el-icon>
            资产账户
          </span>
          <el-button type="primary" size="small" @click="handleAdd('asset')">
            <el-icon>
              <Plus />
            </el-icon>添加
          </el-button>
        </div>
      </template>

      <el-row :gutter="isMobile ? 10 : 15">
        <el-col v-for="account in assetAccounts" :key="account.id" :xs="12" :sm="12" :md="8" :lg="6">
          <div class="account-card asset">
            <div class="account-header">
              <span class="account-name">{{ account.name }}</span>
              <el-tag size="small" type="info">{{ account.currency }}</el-tag>
            </div>
            <div class="account-balance amount-income">
              {{ formatCurrency(account.balance, account.currency) }}
            </div>
            <div class="account-actions">
              <el-switch v-model="account.status" :active-value="1" :inactive-value="0"
                @change="(val) => handleStatusChange(account, val)" />
              <el-button type="primary" link size="small" @click="handleEdit(account)">
                <el-icon>
                  <Edit />
                </el-icon>编辑
              </el-button>
              <el-button type="danger" link size="small" @click="handleDelete(account)">
                <el-icon>
                  <Delete />
                </el-icon>删除
              </el-button>
            </div>
          </div>
        </el-col>
      </el-row>

      <el-empty v-if="assetAccounts.length === 0" description="暂无资产账户" />
    </el-card>

    <!-- 负债账户 -->
    <el-card shadow="hover" class="section">
      <template #header>
        <div class="card-header">
          <span class="card-title">
            <el-icon>
              <CreditCard />
            </el-icon>
            负债账户
          </span>
          <el-button type="danger" size="small" @click="handleAdd('liability')">
            <el-icon>
              <Plus />
            </el-icon>添加
          </el-button>
        </div>
      </template>

      <el-row :gutter="isMobile ? 10 : 15">
        <el-col v-for="account in liabilityAccounts" :key="account.id" :xs="12" :sm="12" :md="8" :lg="6">
          <div class="account-card liability">
            <div class="account-header">
              <span class="account-name">{{ account.name }}</span>
              <el-tag size="small" type="info">{{ account.currency }}</el-tag>
            </div>
            <div class="account-balance amount-expense">
              {{ formatCurrency(account.balance, account.currency) }}
            </div>
            <div class="account-actions">
              <el-switch v-model="account.status" :active-value="1" :inactive-value="0"
                @change="(val) => handleStatusChange(account, val)" />
              <el-button type="primary" link size="small" @click="handleEdit(account)">
                <el-icon>
                  <Edit />
                </el-icon>编辑
              </el-button>
              <el-button type="danger" link size="small" @click="handleDelete(account)">
                <el-icon>
                  <Delete />
                </el-icon>删除
              </el-button>
            </div>
          </div>
        </el-col>
      </el-row>

      <el-empty v-if="liabilityAccounts.length === 0" description="暂无负债账户" />
    </el-card>

    <!-- 币种分布 -->
    <el-card shadow="hover" class="section">
      <template #header>
        <div class="card-header">
          <span class="card-title">
            <el-icon><Money /></el-icon>
            币种分布
          </span>
        </div>
      </template>
      <el-row :gutter="10">
        <el-col
          v-for="item in currencyStats"
          :key="item.currency"
          :xs="12"
          :sm="8"
          :md="6"
        >
          <div class="currency-item">
            <div class="currency-code">{{ item.currency }}</div>
            <div class="currency-row">
              <span class="currency-label">资产</span>
              <span class="currency-value amount-income">{{ formatAmount(item.assetAmount) }}</span>
            </div>
            <div class="currency-row">
              <span class="currency-label">负债</span>
              <span class="currency-value amount-expense">{{ formatAmount(item.liabilityAmount) }}</span>
            </div>
            <div class="currency-row">
              <span class="currency-label">净额</span>
              <span class="currency-value" :class="item.netAmount >= 0 ? 'amount-income' : 'amount-expense'">
                {{ formatAmount(item.netAmount) }}
              </span>
            </div>
          </div>
        </el-col>
      </el-row>
      <el-empty v-if="currencyStats.length === 0" description="暂无币种数据" />
    </el-card>

    <!-- 添加/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑账户' : '添加账户'" :width="isMobile ? '92%' : '500px'"
      :close-on-click-modal="false">
      <el-form ref="formRef" :model="form" :rules="rules" :label-width="isMobile ? '80px' : '100px'"
        :label-position="isMobile ? 'top' : 'right'">
        <el-form-item label="类型">
          <el-radio-group v-model="form.type" :disabled="isEdit">
            <el-radio-button label="asset">资产</el-radio-button>
            <el-radio-button label="liability">负债</el-radio-button>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="如：招商银行、微信零钱" />
        </el-form-item>

        <el-form-item label="币种">
          <el-select v-model="form.currency" placeholder="选择币种" class="full-width">
            <el-option v-for="c in currencyList" :key="c.code" :label="`${c.code} - ${c.name}`" :value="c.code" />
          </el-select>
        </el-form-item>

        <el-form-item label="余额" prop="balance">
          <el-input-number v-model="form.balance" :precision="2" :step="100" style="width: 100%" />
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
import {
  getAccountList,
  getAccountStats,
  getCurrencyStats,
  createAccount,
  updateAccount,
  deleteAccount
} from '@/api/account'
import { getCurrencyList } from '@/api/currency'
import { formatAmount } from '@/utils/format'

// 移动端响应式检测
const isMobile = ref(false)
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

// 数据
const loading = ref(false)
const accounts = ref([])
const totalAsset = ref(0)
const totalLiability = ref(0)
const currencyList = ref([])
const currencyStats = ref([])

// 弹窗
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const formRef = ref(null)

const form = reactive({
  id: null,
  type: 'asset',
  name: '',
  currency: 'CNY',
  balance: 0,
  icon: ''
})

const rules = {
  name: [
    { required: true, message: '请输入账户名称', trigger: 'blur' }
  ]
}

// 计算属性
const assetAccounts = computed(() => accounts.value.filter(a => a.type === 'asset'))
const liabilityAccounts = computed(() => accounts.value.filter(a => a.type === 'liability'))
const netWorth = computed(() => totalAsset.value - totalLiability.value)

// 格式化币种金额
const formatCurrency = (amount, currency) => {
  const symbols = {
    'CNY': '¥',
    'USD': '$',
    'EUR': '€',
    'JPY': '¥',
    'HKD': 'HK$',
    'GBP': '£'
  }
  const symbol = symbols[currency] || currency
  return `${symbol}${formatAmount(amount)}`
}

// 获取账户列表
const fetchAccounts = async () => {
  loading.value = true
  try {
    const res = await getAccountList()
    if (res.code === 200) {
      accounts.value = res.data.list
    }
  } catch (error) {
    console.error('获取账户失败', error)
  } finally {
    loading.value = false
  }
}

// 获取资产统计
const fetchStats = async () => {
  try {
    const res = await getAccountStats()
    if (res.code === 200) {
      totalAsset.value = res.data.totalAsset
      totalLiability.value = res.data.totalLiability
      currencyStats.value = res.data.currencyStats || []
    }
  } catch (error) {
    console.error('获取统计失败', error)
  }
}

// 获取币种列表
const fetchCurrencyList = async () => {
  try {
    const res = await getCurrencyList()
    if (res.code === 200) {
      currencyList.value = res.data.list
    }
  } catch (error) {
    console.error('获取币种列表失败', error)
  }
}

// 获取币种分布 - 修复：新增调用
const fetchCurrencyStats = async () => {
  try {
    const res = await getCurrencyStats()
    if (res.code === 200) {
      currencyStats.value = res.data.list
    }
  } catch (error) {
    console.error('获取币种统计失败', error)
  }
}

// 添加账户
const handleAdd = (type) => {
  isEdit.value = false
  form.id = null
  form.type = type
  form.name = ''
  form.currency = 'CNY'
  form.balance = 0
  form.icon = ''
  dialogVisible.value = true
}

// 编辑账户
const handleEdit = (account) => {
  isEdit.value = true
  form.id = account.id
  form.type = account.type
  form.name = account.name
  form.currency = account.currency || 'CNY'
  form.balance = parseFloat(account.balance)
  form.icon = account.icon || 'WalletFilled'
  dialogVisible.value = true
}

// 提交表单
const handleSubmit = async () => {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    if (isEdit.value) {
      const res = await updateAccount(form.id, {
        name: form.name,
        currency: form.currency,
        balance: form.balance,
        icon: form.icon
      })
      if (res.code === 200) {
        ElMessage.success('更新成功')
      }
    } else {
      const res = await createAccount({
        name: form.name,
        type: form.type,
        currency: form.currency,
        balance: form.balance,
        icon: form.icon
      })
      if (res.code === 200) {
        ElMessage.success('创建成功')
      }
    }
    dialogVisible.value = false
    fetchAccounts()
    fetchStats()
    fetchCurrencyStats()
  } catch (error) {
    ElMessage.error(error.response?.data?.msg || '操作失败')
  } finally {
    submitting.value = false
  }
}

// 删除账户
const handleDelete = (account) => {
  ElMessageBox.confirm(`确定要删除账户「${account.name}」吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await deleteAccount(account.id)
      if (res.code === 200) {
        ElMessage.success('删除成功')
        fetchAccounts()
        fetchStats()
        fetchCurrencyStats()
      }
    } catch (error) {
      ElMessage.error(error.response?.data?.msg || '删除失败')
    }
  })
}

// 切换状态
const handleStatusChange = async (account, status) => {
  try {
    const res = await updateAccount(account.id, { status })
    if (res.code === 200) {
      ElMessage.success(status === 1 ? '已启用' : '已禁用')
    }
  } catch (error) {
    ElMessage.error('操作失败')
    account.status = status === 1 ? 0 : 1
  }
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  fetchAccounts()
  fetchStats()
  fetchCurrencyList()
  fetchCurrencyStats()
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>

<style scoped lang="scss">
.accounts-page {
  .stat-cards {
    margin-bottom: 20px;

    .stat-card {
      .stat-content {
        display: flex;
        align-items: center;

        .stat-icon {
          width: 60px;
          height: 60px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          color: #fff;
          margin-right: 15px;
        }

        .stat-info {
          .stat-value {
            font-size: 24px;
            font-weight: 600;
          }

          .stat-label {
            font-size: 14px;
            margin-top: 5px;
          }
        }
      }
    }
  }

  .section {
    margin-bottom: 20px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }

  .currency-item {
    background: #f5f7fa;
    border-radius: 10px;
    padding: 15px;
    margin-bottom: 10px;
    text-align: center;

    .currency-code {
      font-size: 18px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 10px;
    }

    .currency-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
      font-size: 13px;

      .currency-label {
        color: #909399;
      }

      .currency-value {
        font-weight: 500;
      }
    }
  }

  .account-card {
    background: #f5f7fa;
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 15px;
    border-left: 4px solid;

    &.asset {
      border-left-color: #67c23a;
    }

    &.liability {
      border-left-color: #f56c6c;
    }

    .account-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;

      .account-name {
        font-size: 16px;
        font-weight: 500;
        color: #303133;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    .account-balance {
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 10px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .account-actions {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }
  }

  .full-width {
    width: 100%;
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }
}

/* ========== 移动端H5适配 ========== */
@media (max-width: 768px) {
  .accounts-page {
    .stat-cards {
      margin-bottom: 10px;
    }

    .stat-card {
      padding: 8px;
      margin-bottom: 10px;

      .stat-icon {
        width: 44px;
        height: 44px;
        border-radius: 10px;
        margin-right: 10px;

        .el-icon {
          font-size: 24px;
        }
      }

      .stat-info {
        .stat-label {
          font-size: 12px;
        }

        .stat-value {
          font-size: 18px;
        }
      }
    }

    .section {
      margin-bottom: 10px;
    }

    .account-card {
      padding: 10px;
      margin-bottom: 10px;

      .account-header {
        margin-bottom: 6px;

        .account-name {
          font-size: 14px;
        }
      }

      .account-balance {
        font-size: 18px;
        margin-bottom: 6px;
      }

      .account-actions {
        gap: 6px;

        :deep(.el-switch) {
          transform: scale(0.85);
        }
      }
    }

    .currency-item {
      padding: 10px;
      margin-bottom: 10px;

      .currency-code {
        font-size: 12px;
      }

      .currency-amount {
        font-size: 18px;
      }

      .currency-label {
        font-size: 11px;
      }
    }
  }
}
</style>
