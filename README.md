# 家庭资产管理记账系统

一个面向个人/家庭的轻量级资产管理工具，支持日常记账、资产统计、收支分析、资产负债管理、预算管理、多币种支持，无需复杂配置，开箱即用。

## 技术栈

### 前端
- **Vue 3** (`^3.3.4`) — 渐进式 JavaScript 框架
- **Vite** (`^4.4.9`) — 下一代前端构建工具
- **Element Plus** (`^2.3.14`) — 基于 Vue 3 的组件库
- **Pinia** (`^2.1.6`) — Vue 状态管理方案
- **ECharts** (`^5.4.3`) + **vue-echarts** (`^6.6.1`) — 数据可视化图表库
- **Axios** (`^1.5.0`) — HTTP 客户端
- **Vue Router** (`^4.2.4`) — 前端路由
- **Moment** (`^2.29.4`) — 日期处理库
- **js-cookie** (`^3.0.5`) — Cookie 操作

### 后端
- **Node.js** — JavaScript 运行时
- **Express** — Web 应用框架
- **MySQL 8.0+** — 关系型数据库
- **mysql2** — MySQL 连接驱动
- **JWT** — JSON Web Token 身份验证
- **bcryptjs** — 密码加密
- **json2csv** — CSV 导出
- **multer** — 文件上传
- **dotenv** — 环境变量管理

## 功能特性

### 核心功能
1. **用户管理** — 注册、登录、个人信息管理、修改密码
2. **记账功能** — 支持收入、支出、转账三种类型
3. **资产管理** — 现金、银行卡、理财、负债等账户管理，支持多币种
4. **分类管理** — 自定义收支分类，支持图标和排序，启用/禁用管理
5. **账单管理** — 查看、筛选、编辑、删除账单记录，分页展示
6. **统计分析** — 收支图表、分类占比、月度趋势、账户统计
7. **仪表盘** — 资产概览、今日/本月收支、近期账单、资产分布饼图

### 新增高级功能
8. **预算管理** — 设置月度/年度预算，实时监控预算执行情况，超支预警，支持复制上月预算
9. **多币种支持** — 支持人民币(CNY)、美元(USD)、欧元(EUR)、日元(JPY)、港币(HKD)、英镑(GBP)等币种
10. **数据导入导出** — 导出 CSV 格式数据（账单、账户、分类），JSON 备份恢复
11. **数据备份恢复** — 一键备份和恢复所有数据，备份历史管理

### 特色功能
- 响应式设计，支持 PC 和移动端 H5 页面展示
- 快捷金额选择，快速记账
- 账户余额自动同步
- 分类启用/禁用管理
- 多维度数据筛选
- 预算超支预警
- 汇率实时转换
- 自动汇率更新（每6小时从 exchangerate-api.com 获取最新汇率）

## 项目结构

```
family-asset-app/
├── backend/                 # 后端项目
│   ├── config/             # 配置文件
│   │   ├── database.js     # MySQL 连接池配置
│   │   └── jwt.js          # JWT 密钥配置
│   ├── controllers/         # 控制器（11个模块）
│   │   ├── userController.js
│   │   ├── accountController.js
│   │   ├── categoryController.js
│   │   ├── billController.js
│   │   ├── dashboardController.js
│   │   ├── statisticsController.js
│   │   ├── budgetController.js
│   │   ├── currencyController.js
│   │   ├── exportController.js
│   │   └── backupController.js
│   ├── middleware/          # 中间件
│   │   ├── auth.js          # JWT 认证
│   │   └── validate.js      # 请求参数验证
│   ├── models/              # 数据模型（11个模块）
│   │   ├── user.js
│   │   ├── account.js
│   │   ├── category.js
│   │   ├── bill.js
│   │   ├── statistics.js
│   │   ├── budget.js
│   │   ├── currency.js
│   │   └── backup.js
│   ├── routes/              # 路由（11个模块）
│   │   ├── user.js
│   │   ├── account.js
│   │   ├── category.js
│   │   ├── bill.js
│   │   ├── dashboard.js
│   │   ├── statistics.js
│   │   ├── budget.js
│   │   ├── currency.js
│   │   ├── export.js
│   │   └── backup.js
│   ├── utils/               # 工具函数
│   │   ├── autoUpdateRates.js   # 自动汇率更新服务
│   │   ├── format.js            # 数据格式化
│   │   └── response.js          # 统一响应格式
│   ├── backups/             # 备份文件目录
│   ├── uploads/             # 上传文件目录
│   ├── app.js               # 后端入口文件
│   ├── database.sql         # 数据库初始化脚本
│   └── package.json
│
├── frontend/                # 前端项目
│   ├── src/
│   │   ├── api/            # API 接口层（10个模块）
│   │   │   ├── user.js
│   │   │   ├── account.js
│   │   │   ├── category.js
│   │   │   ├── bill.js
│   │   │   ├── dashboard.js
│   │   │   ├── statistics.js
│   │   │   ├── budget.js
│   │   │   ├── currency.js
│   │   │   ├── export.js
│   │   │   └── backup.js
│   │   ├── views/          # 页面组件
│   │   │   ├── Dashboard.vue
│   │   │   ├── AddBill.vue
│   │   │   ├── Bills.vue
│   │   │   ├── Accounts.vue
│   │   │   ├── Categories.vue
│   │   │   ├── Statistics.vue
│   │   │   ├── Budget.vue
│   │   │   ├── DataManage.vue
│   │   │   ├── Settings.vue
│   │   │   ├── Login.vue
│   │   │   ├── Register.vue
│   │   │   └── Layout.vue
│   │   ├── store/          # Pinia 状态管理
│   │   │   └── user.js
│   │   ├── utils/          # 工具函数
│   │   │   ├── request.js      # Axios 封装
│   │   │   └── format.js       # 数据格式化
│   │   ├── App.vue         # 根组件
│   │   └── main.js         # 入口文件
│   ├── public/
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

## 快速开始

### 环境要求
- Node.js 16+
- MySQL 8.0+
- npm 或 yarn

### 1. 克隆项目

```bash
git clone https://github.com/1anc3r/family_asset_management_system.git
cd family_asset_management_system
```

### 2. 数据库配置

1. 创建数据库
```bash
mysql -u root -p
CREATE DATABASE family_asset_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. 导入 SQL 文件
```bash
mysql -u root -p family_asset_management < backend/database.sql
```

### 3. 后端配置

1. 进入后端目录
```bash
cd backend
```

2. 安装依赖
```bash
npm install
```

3. 配置数据库连接
编辑 `.env` 文件：
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=family_asset_management
JWT_SECRET=your_jwt_secret_key
PORT=3000
```

> **JWT_SECRET 生成建议**：打开浏览器控制台（F12 → Console），运行：
> ```javascript
crypto.randomUUID().replaceAll('-', '') + crypto.randomUUID().replaceAll('-', '')
> ```

4. 启动后端服务
```bash
npm start
# 或开发模式
npm run dev
```

后端服务默认运行在 http://localhost:3000

### 4. 前端配置

1. 进入前端目录
```bash
cd frontend
```

2. 安装依赖
```bash
npm install
```

3. 启动前端服务
```bash
npm run dev
```

前端服务默认运行在 http://localhost:5174

### 5. 访问应用

打开浏览器访问 http://localhost:5174

首次使用需要注册账号。

---

## 前端 API 接口

### 用户模块（`frontend/src/api/user.js`）

| API | 方法 | 路径 | 说明 |
|-----|------|------|------|
| `register` | POST | `/api/user/register` | 用户注册 |
| `login` | POST | `/api/user/login` | 用户登录 |
| `getProfile` | GET | `/api/user/profile` | 获取用户信息 |
| `updateProfile` | PUT | `/api/user/profile` | 更新用户信息 |
| `changePassword` | PUT | `/api/user/password` | 修改密码 |

### 账户模块（`frontend/src/api/account.js`）

| API | 方法 | 路径 | 说明 |
|-----|------|------|------|
| `getAccountList` | GET | `/api/account/list` | 获取账户列表 |
| `getAccountStats` | GET | `/api/account/stats` | 获取资产统计 |
| `getCurrencyStats` | GET | `/api/account/currency-stats` | 获取币种资产统计 |
| `createAccount` | POST | `/api/account/add` | 创建账户 |
| `updateAccount` | PUT | `/api/account/:id` | 更新账户 |
| `deleteAccount` | DELETE | `/api/account/:id` | 删除账户 |

### 分类模块（`frontend/src/api/category.js`）

| API | 方法 | 路径 | 说明 |
|-----|------|------|------|
| `getCategoryList` | GET | `/api/category/list` | 获取分类列表 |
| `createCategory` | POST | `/api/category/add` | 创建分类 |
| `updateCategory` | PUT | `/api/category/:id` | 更新分类 |
| `deleteCategory` | DELETE | `/api/category/:id` | 删除分类 |

### 账单模块（`frontend/src/api/bill.js`）

| API | 方法 | 路径 | 说明 |
|-----|------|------|------|
| `getBillList` | GET | `/api/bill/list` | 获取账单列表 |
| `getBillDetail` | GET | `/api/bill/:id` | 获取账单详情 |
| `createBill` | POST | `/api/bill/add` | 创建账单 |
| `updateBill` | PUT | `/api/bill/:id` | 更新账单 |
| `deleteBill` | DELETE | `/api/bill/:id` | 删除账单 |
| `getTodayStats` | GET | `/api/bill/today` | 获取今日收支 |
| `getMonthStats` | GET | `/api/bill/month` | 获取本月收支 |

### 预算模块（`frontend/src/api/budget.js`）

| API | 方法 | 路径 | 说明 |
|-----|------|------|------|
| `getBudgetList` | GET | `/api/budget/list` | 获取预算列表 |
| `getBudgetExecution` | GET | `/api/budget/execution` | 获取预算执行情况 |
| `createBudget` | POST | `/api/budget/add` | 创建预算 |
| `updateBudget` | PUT | `/api/budget/:id` | 更新预算 |
| `deleteBudget` | DELETE | `/api/budget/:id` | 删除预算 |
| `copyFromLastMonth` | POST | `/api/budget/copy-from-last-month` | 复制上月预算 |

### 币种模块（`frontend/src/api/currency.js`）

| API | 方法 | 路径 | 说明 |
|-----|------|------|------|
| `getCurrencyList` | GET | `/api/currency/list` | 获取币种列表 |
| `getExchangeRates` | GET | `/api/currency/rates` | 获取汇率列表 |
| `convertCurrency` | GET | `/api/currency/convert` | 汇率转换 |
| `getExchangeRate` | GET | `/api/currency/rate` | 获取汇率 |
| `refreshExchangeRates` | POST | `/api/currency/refresh` | 手动刷新汇率 |

### 导出模块（`frontend/src/api/export.js`）

| API | 方法 | 路径 | 说明 |
|-----|------|------|------|
| `exportBills` | GET | `/api/export/bills` | 导出账单（CSV） |
| `exportAccounts` | GET | `/api/export/accounts` | 导出账户（CSV） |
| `exportCategories` | GET | `/api/export/categories` | 导出分类（CSV） |

### 备份模块（`frontend/src/api/backup.js`）

| API | 方法 | 路径 | 说明 |
|-----|------|------|------|
| `createBackup` | POST | `/api/backup/create` | 创建备份（JSON） |
| `getBackupLogs` | GET | `/api/backup/logs` | 获取备份记录 |
| `restoreData` | POST | `/api/backup/restore` | 恢复数据 |
| `deleteBackupLog` | DELETE | `/api/backup/logs/:id` | 删除备份记录 |

### 仪表盘模块（`frontend/src/api/dashboard.js`）

| API | 方法 | 路径 | 说明 |
|-----|------|------|------|
| `getDashboard` | GET | `/api/dashboard` | 获取仪表盘数据 |
| `getAssetDistribution` | GET | `/api/dashboard/asset-distribution` | 获取资产分布 |

### 统计模块（`frontend/src/api/statistics.js`）

| API | 方法 | 路径 | 说明 |
|-----|------|------|------|
| `getCategoryStats` | GET | `/api/statistics/category` | 获取分类统计 |
| `getMonthlyTrend` | GET | `/api/statistics/monthly` | 获取月度趋势 |
| `getAccountStats` | GET | `/api/statistics/account` | 获取账户统计 |

---

## 后端路由结构

后端路由按模块划分，以 `/api` 为前缀：

| 路由前缀 | 对应文件 | 说明 |
|----------|----------|------|
| `/api/user` | `routes/user.js` | 用户认证与管理 |
| `/api/account` | `routes/account.js` | 资产账户管理 |
| `/api/category` | `routes/category.js` | 收支分类管理 |
| `/api/bill` | `routes/bill.js` | 账单记录管理 |
| `/api/dashboard` | `routes/dashboard.js` | 仪表盘数据 |
| `/api/statistics` | `routes/statistics.js` | 统计分析数据 |
| `/api/budget` | `routes/budget.js` | 预算管理 |
| `/api/currency` | `routes/currency.js` | 币种与汇率 |
| `/api/export` | `routes/export.js` | 数据导出（CSV） |
| `/api/backup` | `routes/backup.js` | 数据备份与恢复 |

---

## 数据库表结构

### 1. users — 用户表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键，自增 |
| username | VARCHAR(50) | 用户名 |
| password | VARCHAR(100) | 密码（bcryptjs 加密） |
| nickname | VARCHAR(50) | 昵称 |
| base_currency | VARCHAR(10) | 基础币种（默认 CNY） |
| create_time | DATETIME | 创建时间 |

### 2. accounts — 资产账户表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键，自增 |
| user_id | INT | 用户ID |
| name | VARCHAR(50) | 账户名称 |
| type | VARCHAR(20) | 类型：asset（资产）/ liability（负债） |
| balance | DECIMAL(12,2) | 余额 |
| currency | VARCHAR(10) | 币种（CNY/USD/EUR/JPY/HKD/GBP） |
| icon | VARCHAR(50) | 图标标识 |
| status | INT | 状态：1启用 / 0禁用 |
| create_time | DATETIME | 创建时间 |

### 3. categories — 收支分类表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键，自增 |
| user_id | INT | 用户ID |
| name | VARCHAR(50) | 分类名称 |
| type | VARCHAR(20) | 类型：income（收入）/ expense（支出） |
| icon | VARCHAR(50) | 图标标识 |
| sort | INT | 排序序号 |
| status | INT | 状态：1启用 / 0禁用 |
| create_time | DATETIME | 创建时间 |

### 4. bills — 账单表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键，自增 |
| user_id | INT | 用户ID |
| type | VARCHAR(20) | 类型：income / expense / transfer |
| amount | DECIMAL(12,2) | 金额 |
| currency | VARCHAR(10) | 币种 |
| account_id | INT | 账户ID |
| to_account_id | INT | 目标账户ID（转账时使用） |
| category_id | INT | 分类ID |
| remark | VARCHAR(200) | 备注 |
| bill_time | DATETIME | 账单时间 |
| create_time | DATETIME | 创建时间 |

### 5. budgets — 预算表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键，自增 |
| user_id | INT | 用户ID |
| category_id | INT | 分类ID（NULL 表示总预算） |
| amount | DECIMAL(12,2) | 预算金额 |
| period_type | VARCHAR(20) | 周期类型：month / year |
| year_month | VARCHAR(7) | 预算年月（格式：YYYY-MM） |
| alert_threshold | INT | 预警阈值（百分比，如 80 表示 80%） |
| status | INT | 状态：1启用 / 0禁用 |
| create_time | DATETIME | 创建时间 |

### 6. exchange_rates — 汇率表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键，自增 |
| from_currency | VARCHAR(10) | 源币种 |
| to_currency | VARCHAR(10) | 目标币种 |
| rate | DECIMAL(15,6) | 汇率值 |
| update_time | DATETIME | 更新时间 |

### 7. backup_logs — 备份记录表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT | 主键，自增 |
| user_id | INT | 用户ID |
| file_name | VARCHAR(200) | 备份文件名 |
| file_size | INT | 文件大小（字节） |
| data_count | INT | 数据条数 |
| backup_type | VARCHAR(20) | 备份类型 |
| remark | VARCHAR(200) | 备注 |
| create_time | DATETIME | 创建时间 |

---

## 界面预览

### 登录/注册页面
简洁的登录注册界面，支持新用户快速注册。

### 首页仪表盘（Dashboard）
- 净资产、总资产、总负债卡片展示
- 今日/本月收支概览
- 资产分布饼图
- 账户余额列表
- 近期账单记录

### 记账页面（AddBill）
- 类型选择（收入/支出/转账）
- 金额输入，支持快捷金额按钮
- 账户选择（支持多币种账户）
- 分类选择（按收入/支出筛选）
- 日期选择器和备注输入

### 账单列表（Bills）
- 多条件筛选（类型、账户、分类、日期范围）
- 分页展示
- 编辑和删除操作
- 月度收支汇总

### 资产管理（Accounts）
- 资产和负债分开展示
- 多币种账户管理
- 账户启用/禁用控制
- 余额实时显示
- 币种分布统计

### 分类管理（Categories）
- 收入/支出分类分开展示
- 自定义图标和排序
- 启用/禁用管理

### 预算管理（Budget）
- 设置总预算和分类预算
- 预算执行进度可视化
- 超支预警提示
- 复制上月预算功能

### 统计分析（Statistics）
- 支出分类占比饼图
- 月度收支趋势柱状图
- 账户统计图表
- 分类排行表格

### 数据管理（DataManage）
- 数据导出（CSV 格式）
- 数据导入（JSON 备份恢复）
- 一键备份和恢复
- 备份历史管理
- 汇率查询和转换

---

## 开发计划

- [x] 基础架构搭建
- [x] 用户认证模块
- [x] 记账核心功能
- [x] 资产管理功能
- [x] 分类管理功能
- [x] 统计分析功能
- [x] 响应式界面（PC + 移动端 H5）
- [x] 预算管理
- [x] 多币种支持
- [x] 数据导入导出
- [x] 数据备份恢复
- [x] 自动汇率更新

---

## 贡献指南

欢迎提交 Issue 和 Pull Request。

## 许可证

MIT License

## 联系方式

如有问题或建议，欢迎反馈。

---

**家庭资产管理记账系统** — 让家庭财务管理更简单！
