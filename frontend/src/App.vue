<template>
  <router-view v-slot="{ Component }">
    <transition name="fade" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
</template>

<script setup>
import { onMounted } from 'vue'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()

onMounted(() => {
  // 初始化时检查登录状态
  userStore.checkLogin()
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB',
    'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
  background-color: #f5f7fa;
  /* 移动端禁止弹性滚动 */
  -webkit-overflow-scrolling: touch;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* ========== 全局样式 ========== */
.page-container {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.stat-card {
  .stat-value {
    font-size: 28px;
    font-weight: 600;
    margin-top: 10px;
  }
  .stat-label {
    font-size: 14px;
    color: #909399;
    margin-top: 5px;
  }
}

.amount-income {
  color: #67c23a;
}

.amount-expense {
  color: #f56c6c;
}

/* ========== 移动端H5全局适配 ========== */
@media (max-width: 768px) {
  /* 页面容器缩小内边距 */
  .page-container {
    padding: 10px;
  }

  .el-card {
    margin-bottom: 10px;
    border-radius: 8px;
  }

  /* 卡片头部标题字号缩小 */
  .card-title {
    font-size: 15px;
  }

  /* 统计数值缩小 */
  .stat-card .stat-value {
    font-size: 20px;
  }

  /* 表格横向滚动，不超出视口 */
  .el-table {
    width: 100%;
  }

  /* 弹窗宽度适配 */
  .el-dialog {
    width: 92vw !important;
    margin: 0 auto !important;
    border-radius: 12px !important;
  }

  /* 移动端表单垂直排列 */
  .el-form--inline .el-form-item {
    margin-right: 0;
    width: 100%;
  }

  .el-form--inline .el-form-item__content {
    width: 100%;
  }

  .el-form--inline .el-input,
  .el-form--inline .el-select,
  .el-form--inline .el-date-editor {
    width: 100% !important;
  }

  /* 分页组件简化显示 */
  .el-pagination {
    justify-content: center;
    flex-wrap: wrap;
    gap: 5px;
  }

  /* 按钮触控区域优化 */
  .el-button {
    min-height: 36px;
    min-width: 56px;
  }

  /* 表格单元格内边距缩小 */
  .el-table .cell {
    padding: 6px 8px;
  }

  /* 图表容器最小高度保证可点击 */
  .chart-container {
    min-height: 200px;
  }
}
</style>
