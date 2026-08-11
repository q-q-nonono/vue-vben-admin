# 电商后台管理系统

基于 Vue Vben Admin 5.0 搭建的电商后台管理系统，包含商品管理、分类管理、订单管理等核心模块。

## 技术栈

| 层面 | 技术 |
|------|------|
| 前端框架 | Vue 3 + TypeScript |
| UI 组件库 | Ant Design Vue |
| 表格组件 | VxeTable（虚拟滚动、代理查询） |
| 工程化 | Vite + pnpm monorepo |
| Mock 服务 | Nitro（文件路由、自动注册 API） |

## 功能模块

### 商品管理
- 商品列表：搜索、分页、动态下拉筛选
- 新增/编辑商品：表单验证、回填、分类动态加载
- 删除商品：确认弹窗、级联刷新

### 分类管理
- 分类列表：搜索、分页、商品数量统计
- 分类 CRUD：含级联删除保护（有商品的分类不可删除）
- **数据关联**：商品通过 `categoryId` 外键关联分类，修改分类名称后所有商品自动同步

### 订单管理
- 订单列表：按订单号/状态/用户筛选，状态彩色标签
- **状态流转**：待付款 → 待发货 → 已发货 → 已完成（含流转规则校验，非法状态变更被拒绝）
- 订单详情页：基本信息 + 商品明细 + 进度时间线

## 快速启动

```bash
# 安装依赖
pnpm install

# 启动开发服务器（web-antd 版本）
pnpm --filter @vben/web-antd dev
```

访问 `http://localhost:5666` 登录（账号：`vben` / 密码：`123456`）。

## 项目结构

```
├── apps/
│   ├── web-antd/                # 前端应用（Ant Design Vue）
│   │   ├── src/
│   │   │   ├── api/ecommerce/   # API 接口层
│   │   │   ├── views/ecommerce/ # 页面组件
│   │   │   └── router/routes/   # 路由配置
│   └── backend-mock/            # Mock 后端
│       ├── api/ecommerce/       # 接口定义（Nitro 文件路由）
│       └── utils/               # 共享数据
└── packages/                    # 共享组件库
```

## 知识点总结

- **Monorepo 架构**：pnpm workspace 管理多应用 + 多包
- **Nitro 文件路由**：文件名决定 HTTP 方法和路径（`list.get.ts` → GET `/list`）
- **VxeGrid 代理查询**：自动管理分页、搜索、排序，无需手动写 loading 逻辑
- **表单验证**：Ant Design Form + 动态下拉选项响应式更新
- **状态机模式**：订单状态流转路径限定，防止非法变更