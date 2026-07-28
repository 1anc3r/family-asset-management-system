<template>
  <el-container class="layout-container">
    <!-- 左侧导航 -->
    <el-aside
      :width="isCollapse ? '64px' : '220px'"
      class="sidebar"
      :class="{ 'mobile-sidebar': isMobile, 'mobile-show': isMobile && mobileMenuVisible }"
    >
      <!-- Logo -->
      <div class="logo" :class="{ 'collapsed': isCollapse && !isMobile }">
        <el-icon size="28">
          <WalletFilled />
        </el-icon>
        <span v-show="!isCollapse || isMobile" class="logo-text">家庭资产管理系统</span>
      </div>

      <!-- 菜单 -->
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse && !isMobile"
        :collapse-transition="false"
        class="sidebar-menu"
        router
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
        @select="handleMenuSelect"
      >
        <el-menu-item v-for="item in menuItems" :key="item.path" :index="item.path">
          <el-icon>
            <component :is="item.icon" />
          </el-icon>
          <template #title>{{ item.title }}</template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 移动端遮罩层 -->
    <div
      v-if="isMobile && mobileMenuVisible"
      class="sidebar-mask"
      @click="mobileMenuVisible = false"
    ></div>

    <el-container class="main-wrapper" :class="{ 'has-tabbar': isMobile }">
      <!-- 顶部导航 -->
      <el-header class="header">
        <div class="header-left">
          <el-icon
            class="collapse-btn"
            @click="toggleSidebar"
          >
            <Fold v-if="!isCollapse || (isMobile && mobileMenuVisible)" />
            <Expand v-else />
          </el-icon>
          <breadcrumb v-if="!isMobile" />
          <span v-else class="mobile-page-title">{{ currentPageTitle }}</span>
        </div>

        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              <el-avatar :size="isMobile ? 28 : 32" :icon="UserFilled" />
              <span v-if="!isMobile" class="username">{{ userStore.userInfo?.nickname || '用户' }}</span>
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="settings">
                  <el-icon><Setting /></el-icon>个人设置
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <el-icon><SwitchButton /></el-icon>退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 主内容区 -->
      <el-main class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="fade-transform" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>

      <!-- 移动端底部Tab栏 -->
      <div v-if="isMobile" class="mobile-tabbar">
        <div
          v-for="item in tabbarItems"
          :key="item.path"
          class="tabbar-item"
          :class="{ active: activeMenu === item.path }"
          @click="router.push(item.path)"
        >
          <el-icon size="20"><component :is="item.icon" /></el-icon>
          <span class="tabbar-label">{{ item.title }}</span>
        </div>
      </div>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  HomeFilled,
  CirclePlusFilled,
  List,
  WalletFilled,
  Grid,
  TrendCharts,
  Setting,
  UserFilled,
  Fold,
  Expand,
  ArrowDown,
  SwitchButton
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const isCollapse = ref(false)
const isMobile = ref(false)
const mobileMenuVisible = ref(false)

// 侧边栏菜单项（完整菜单）
const menuItems = [
  { path: '/dashboard', title: '仪表盘', icon: 'HomeFilled' },
  { path: '/bill/add', title: '记一笔', icon: 'CirclePlusFilled' },
  { path: '/bills', title: '账单列表', icon: 'List' },
  { path: '/accounts', title: '资产管理', icon: 'WalletFilled' },
  { path: '/budget', title: '预算管理', icon: 'Aim' },
  { path: '/categories', title: '分类管理', icon: 'Grid' },
  { path: '/statistics', title: '统计分析', icon: 'TrendCharts' },
  { path: '/data-manage', title: '数据管理', icon: 'Setting' }
]

// 移动端底部Tab栏菜单项（5个常用入口）
const tabbarItems = [
  { path: '/dashboard', title: '首页', icon: 'HomeFilled' },
  { path: '/bill/add', title: '记账', icon: 'CirclePlusFilled' },
  { path: '/bills', title: '账单', icon: 'List' },
  { path: '/accounts', title: '资产', icon: 'WalletFilled' },
  { path: '/statistics', title: '统计', icon: 'TrendCharts' }
]

const activeMenu = computed(() => route.path)

// 计算当前页面标题
const currentPageTitle = computed(() => {
  const currentItem = menuItems.find(item => item.path === route.path)
  return currentItem ? currentItem.title : ''
})

const toggleSidebar = () => {
  if (isMobile.value) {
    mobileMenuVisible.value = !mobileMenuVisible.value
  } else {
    isCollapse.value = !isCollapse.value
  }
}

// 移动端菜单选中后自动关闭侧边栏
const handleMenuSelect = () => {
  if (isMobile.value) {
    mobileMenuVisible.value = false
  }
}

const handleCommand = (command) => {
  switch (command) {
    case 'settings':
      router.push('/settings')
      break
    case 'logout':
      ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        userStore.logout()
        ElMessage.success('已退出登录')
        router.push('/login')
      })
      break
  }
}

// 响应式处理
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
  if (isMobile.value) {
    isCollapse.value = true
    mobileMenuVisible.value = false
  } else {
    mobileMenuVisible.value = false
  }
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>

<style scoped lang="scss">
.layout-container {
  height: 100vh;        // 固定为视口高度
  overflow: hidden;     // 禁止外层滚动，滚动由内部子区域各自管理
}

/* ========== 侧边栏 ========== */
.sidebar {
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background-color: #304156;
  height: 100vh;        // 固定高度
  overflow-y: auto;     // 侧边栏独立滚动
  overflow-x: hidden;   // 禁止横向滚动

  .logo {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    border-bottom: 1px solid #1f2d3d;
    padding: 0 15px;
    transition: all 0.3s;
  }

  .logo.collapsed {
    padding: 0;
  }

  .logo-text {
    margin-left: 12px;
    font-size: 16px;
    font-weight: 600;
    white-space: nowrap;
  }

  .sidebar-menu {
    flex: 1;
    border-right: none;
  }

  :deep(.el-menu--collapse) {
    width: 64px;
  }

  :deep(.el-menu--collapse .el-sub-menu__title span) {
    display: none;
  }

  :deep(.el-menu--collapse .el-sub-menu__icon-arrow) {
    display: none;
  }
}

/* ========== 遮罩层 ========== */
.sidebar-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}

/* ========== 主内容区包裹 ========== */
.main-wrapper {
  display: flex;
  flex-direction: column;
  overflow: hidden;     // 确保内部滚动不溢出外层

  &.has-tabbar {
    /* 移动端有底部Tab栏时，主内容区底部留出空间 */
    .main-content {
      padding-bottom: calc(56px + env(safe-area-inset-bottom, 0px));
    }
  }
}

/* ========== 顶部导航 ========== */
.header {
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  position: sticky;
  top: 0;
  z-index: 999;

  .header-left {
    display: flex;
    align-items: center;

    .collapse-btn {
      font-size: 20px;
      cursor: pointer;
      margin-right: 15px;
      color: #606266;

      &:hover {
        color: #409EFF;
      }
    }
  }

  .header-right {
    .user-info {
      display: flex;
      align-items: center;
      cursor: pointer;

      .username {
        margin: 0 8px;
        color: #606266;
      }
    }
  }
}

/* 移动端页面标题 */
.mobile-page-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

/* ========== 主内容区 ========== */
.main-content {
  flex: 1;              // 占据剩余空间
  overflow-y: auto;     // 主内容区独立滚动
  padding: 15px;
  background-color: #f5f7fa;
}

/* ========== 移动端底部Tab栏 ========== */
.mobile-tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: calc(56px + env(safe-area-inset-bottom, 0px));
  background: #fff;
  border-top: 1px solid #e4e7ed;
  display: flex;
  justify-content: space-around;
  align-items: flex-start;
  padding-top: 6px;
  padding-bottom: env(safe-area-inset-bottom, 0px);
  z-index: 998;

  .tabbar-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 1;
    height: 44px;
    color: #909399;
    cursor: pointer;
    transition: all 0.2s;
    -webkit-tap-highlight-color: transparent;

    .el-icon {
      margin-bottom: 2px;
    }

    .tabbar-label {
      font-size: 10px;
      line-height: 1.2;
    }

    &:active {
      opacity: 0.7;
    }

    &.active {
      color: #409EFF;

      .tabbar-label {
        font-weight: 500;
      }
    }
  }
}

/* ========== 过渡动画 ========== */
.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all 0.3s;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

/* ========== 移动端H5适配 ========== */
@media (max-width: 768px) {
  /* 侧边栏改为 fixed 覆盖式 */
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    z-index: 1001;
    width: 220px !important;
    transform: translateX(-100%);
    transition: transform 0.3s ease;

    &.mobile-show {
      transform: translateX(0);
    }
  }

  .header {
    padding: 0 12px;

    .header-left .collapse-btn {
      margin-right: 10px;
    }
  }

  .main-content {
    padding: 10px;
    margin-left: 0 !important;
  }
}
</style>