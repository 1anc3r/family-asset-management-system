<template>
  <div class="statistics-page">
    <!-- 日期筛选 -->
    <el-card shadow="hover" class="filter-card">
      <el-form :inline="!isMobile" :label-position="isMobile ? 'top' : 'right'">
        <el-form-item label="时间范围">
          <el-radio-group v-model="timeRange" size="small" @change="handleTimeRangeChange">
            <el-radio-button label="month">本月</el-radio-button>
            <el-radio-button label="lastMonth">上月</el-radio-button>
            <el-radio-button label="quarter">本季</el-radio-button>
            <el-radio-button label="year">本年</el-radio-button>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="自定义">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            @change="handleDateChange"
            :style="isMobile ? { width: '100%' } : {}"
          />
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 收支概览 -->
    <el-row :gutter="isMobile ? 10 : 20" class="section">
      <el-col :xs="24" :sm="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="card-title">总收入</span>
            </div>
          </template>
          <div class="overview-value amount-income">
            +¥{{ formatAmount(totalIncome) }}
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="card-title">总支出</span>
            </div>
          </template>
          <div class="overview-value amount-expense">
            -¥{{ formatAmount(totalExpense) }}
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 支出分类统计 -->
    <el-row :gutter="isMobile ? 10 : 20" class="section">
      <el-col :xs="24" :lg="12">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">
                <el-icon><PieChart /></el-icon>
                支出分类占比
              </span>
            </div>
          </template>
          <div ref="expenseChartRef" class="chart-container"></div>
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="12">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">
                <el-icon><TrendCharts /></el-icon>
                月度收支趋势
              </span>
            </div>
          </template>
          <div ref="trendChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 支出分类排行 -->
    <el-card shadow="hover" class="section">
      <template #header>
        <div class="card-header">
          <span class="card-title">
            <el-icon><List /></el-icon>
            支出分类排行
          </span>
        </div>
      </template>

      <!-- 桌面端使用表格 -->
      <div v-if="!isMobile" class="table-wrapper">
        <el-table :data="expenseCategoryList" stripe>
          <el-table-column type="index" width="50" />
          <el-table-column label="分类" width="150">
            <template #default="{ row }">
              <div class="category-cell">
                <el-icon v-if="row.category_icon"><component :is="row.category_icon" /></el-icon>
                <span>{{ row.category_name || '未分类' }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="金额" width="150">
            <template #default="{ row }">
              <span class="amount-expense">¥{{ formatAmount(row.total_amount) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="笔数" width="100">
            <template #default="{ row }">
              {{ row.bill_count }}笔
            </template>
          </el-table-column>
          <el-table-column label="占比">
            <template #default="{ row }">
              <el-progress
                :percentage="getPercentage(row.total_amount, totalExpense)"
                :color="'#f56c6c'"
              />
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 移动端使用卡片列表 -->
      <div v-else class="mobile-rank-list">
        <div
          v-for="(item, index) in expenseCategoryList"
          :key="index"
          class="mobile-rank-item"
        >
          <div class="rank-index">{{ index + 1 }}</div>
          <div class="rank-info">
            <div class="rank-name">
              <el-icon v-if="item.category_icon"><component :is="item.category_icon" /></el-icon>
              <span>{{ item.category_name || '未分类' }}</span>
            </div>
            <div class="rank-progress">
              <el-progress
                :percentage="getPercentage(item.total_amount, totalExpense)"
                :color="'#f56c6c'"
                :stroke-width="8"
              />
            </div>
          </div>
          <div class="rank-amount">
            <div class="amount-text amount-expense">¥{{ formatAmount(item.total_amount) }}</div>
            <div class="count-text">{{ item.bill_count }}笔</div>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'
import { getCategoryStats, getMonthlyTrend } from '@/api/statistics'
import { formatAmount } from '@/utils/format'
import moment from 'moment'

// 移动端响应式检测
const isMobile = ref(false)
const checkMobile = () => {
  const newIsMobile = window.innerWidth <= 768
  // 如果移动端状态发生变化，需要重新渲染图表
  if (isMobile.value !== newIsMobile) {
    isMobile.value = newIsMobile
    nextTick(() => {
      initExpenseChart()
      initTrendChart()
    })
  } else {
    isMobile.value = newIsMobile
  }
}

// 数据
const loading = ref(false)
const timeRange = ref('month')
const dateRange = ref([])
const totalIncome = ref(0)
const totalExpense = ref(0)
const expenseCategoryList = ref([])

// 图表引用
const expenseChartRef = ref(null)
const trendChartRef = ref(null)
let expenseChart = null
let trendChart = null

// 初始化支出分类图表
const initExpenseChart = () => {
  if (!expenseChartRef.value) return

  // 清理旧图表实例
  if (expenseChart) {
    expenseChart.dispose()
  }

  if (expenseCategoryList.value.length === 0) {
    expenseChartRef.value.innerHTML = '<div class="empty-chart">暂无支出数据</div>'
    return
  }

  expenseChart = echarts.init(expenseChartRef.value)

  const isMobileView = isMobile.value

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: ¥{c} ({d}%)'
    },
    legend: {
      orient: isMobileView ? 'horizontal' : 'vertical',
      right: isMobileView ? 'auto' : 10,
      bottom: isMobileView ? 0 : 'auto',
      top: isMobileView ? 'auto' : 'center',
      itemWidth: 10,
      itemHeight: 10,
      textStyle: {
        fontSize: isMobileView ? 11 : 12
      }
    },
    series: [
      {
        name: '支出分类',
        type: 'pie',
        radius: isMobileView ? ['35%', '60%'] : ['40%', '70%'],
        center: isMobileView ? ['50%', '42%'] : ['35%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false
        },
        emphasis: {
          label: {
            show: true,
            fontSize: isMobileView ? 13 : 14,
            fontWeight: 'bold'
          }
        },
        data: expenseCategoryList.value.map(item => ({
          value: parseFloat(item.total_amount),
          name: item.category_name || '未分类'
        }))
      }
    ]
  }

  expenseChart.setOption(option)
}

// 初始化趋势图表
const initTrendChart = async () => {
  if (!trendChartRef.value) return

  // 清理旧图表实例
  if (trendChart) {
    trendChart.dispose()
  }

  trendChart = echarts.init(trendChartRef.value)

  const isMobileView = isMobile.value

  try {
    const res = await getMonthlyTrend(6)
    if (res.code === 200) {
      const data = res.data.list

      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross'
          }
        },
        legend: {
          data: ['收入', '支出'],
          bottom: 0,
          itemWidth: 12,
          itemHeight: 12,
          textStyle: {
            fontSize: isMobileView ? 11 : 12
          }
        },
        grid: {
          left: isMobileView ? '2%' : '3%',
          right: isMobileView ? '2%' : '4%',
          bottom: isMobileView ? '18%' : '15%',
          top: '10%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: data.map(item => item.month),
          axisLabel: {
            rotate: isMobileView ? 30 : 45,
            fontSize: isMobileView ? 10 : 11
          }
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            fontSize: isMobileView ? 10 : 11
          }
        },
        series: [
          {
            name: '收入',
            type: 'bar',
            data: data.map(item => item.income),
            itemStyle: {
              color: '#67c23a'
            }
          },
          {
            name: '支出',
            type: 'bar',
            data: data.map(item => item.expense),
            itemStyle: {
              color: '#f56c6c'
            }
          }
        ]
      }

      trendChart.setOption(option)
    }
  } catch (error) {
    console.error('获取趋势数据失败', error)
  }
}

// 获取统计数据
const fetchStatistics = async () => {
  loading.value = true
  try {
    const params = {
      type: 'expense',
      start_date: dateRange.value[0],
      end_date: dateRange.value[1]
    }

    const res = await getCategoryStats(params)
    if (res.code === 200) {
      expenseCategoryList.value = res.data.list
      totalExpense.value = res.data.total

      // 同时获取收入数据
      const incomeRes = await getCategoryStats({
        type: 'income',
        start_date: dateRange.value[0],
        end_date: dateRange.value[1]
      })
      if (incomeRes.code === 200) {
        totalIncome.value = incomeRes.data.total
      }

      // 初始化图表
      nextTick(() => {
        initExpenseChart()
      })
    }
  } catch (error) {
    ElMessage.error('获取统计数据失败')
  } finally {
    loading.value = false
  }
}

// 计算百分比
const getPercentage = (amount, total) => {
  if (!total) return 0
  return Math.round((amount / total) * 100)
}

// 时间范围切换
const handleTimeRangeChange = (val) => {
  const now = moment()

  switch (val) {
    case 'month':
      dateRange.value = [
        now.startOf('month').format('YYYY-MM-DD'),
        now.endOf('month').format('YYYY-MM-DD')
      ]
      break
    case 'lastMonth':
      const lastMonth = now.subtract(1, 'month')
      dateRange.value = [
        lastMonth.startOf('month').format('YYYY-MM-DD'),
        lastMonth.endOf('month').format('YYYY-MM-DD')
      ]
      break
    case 'quarter':
      dateRange.value = [
        now.startOf('quarter').format('YYYY-MM-DD'),
        now.endOf('quarter').format('YYYY-MM-DD')
      ]
      break
    case 'year':
      dateRange.value = [
        now.startOf('year').format('YYYY-MM-DD'),
        now.endOf('year').format('YYYY-MM-DD')
      ]
      break
  }

  fetchStatistics()
}

// 自定义日期变化
const handleDateChange = () => {
  timeRange.value = ''
  fetchStatistics()
}

// 窗口大小改变时重新渲染图表
const handleResize = () => {
  checkMobile()
  expenseChart && expenseChart.resize()
  trendChart && trendChart.resize()
}

onMounted(() => {
  checkMobile()
  // 默认本月
  handleTimeRangeChange('month')
  initTrendChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (expenseChart) {
    expenseChart.dispose()
  }
  if (trendChart) {
    trendChart.dispose()
  }
})
</script>

<style scoped lang="scss">
.statistics-page {
  .filter-card {
    margin-bottom: 20px;
  }

  .section {
    margin-bottom: 20px;
  }

  .overview-value {
    font-size: 36px;
    font-weight: 600;
    text-align: center;
    padding: 20px 0;
  }

  .chart-card {
    .chart-container {
      height: 350px;

      .empty-chart {
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #909399;
      }
    }
  }

  .category-cell {
    display: flex;
    align-items: center;
    gap: 8px;

    .el-icon {
      font-size: 18px;
      color: #409EFF;
    }
  }

  .table-wrapper {
    overflow-x: auto;
  }

  /* 移动端排行列表 */
  .mobile-rank-list {
    .mobile-rank-item {
      display: flex;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #ebeef5;

      &:last-child {
        border-bottom: none;
      }

      .rank-index {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: #f5f7fa;
        color: #606266;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 13px;
        font-weight: 600;
        flex-shrink: 0;
        margin-right: 10px;
      }

      .rank-info {
        flex: 1;
        min-width: 0;
        margin-right: 10px;

        .rank-name {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          color: #303133;
          margin-bottom: 6px;

          .el-icon {
            font-size: 16px;
            color: #409EFF;
          }
        }

        .rank-progress {
          :deep(.el-progress__text) {
            font-size: 11px;
          }
        }
      }

      .rank-amount {
        text-align: right;
        flex-shrink: 0;

        .amount-text {
          font-size: 14px;
          font-weight: 600;
        }

        .count-text {
          font-size: 11px;
          color: #909399;
        }
      }
    }
  }
}

/* ========== 移动端H5适配 ========== */
@media (max-width: 768px) {
  .statistics-page {
    .filter-card {
      margin-bottom: 10px;

      .el-radio-group {
        display: flex;
        flex-wrap: wrap;

        .el-radio-button {
          flex: 1;

          .el-radio-button__inner {
            padding: 6px 10px;
            font-size: 12px;
          }
        }
      }
    }

    .section {
      margin-bottom: 10px;
    }

    .overview-value {
      font-size: 24px;
      padding: 15px 0;
    }

    .chart-card .chart-container {
      height: 260px;
    }
  }
}
</style>
