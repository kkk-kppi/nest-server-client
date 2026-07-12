# Docker 部署与运行指南（Phase 3 / 3.2）

## 1. 目标

本文档用于帮助团队成员快速理解当前前端应用的容器化部署方式，包括：

- 多阶段构建流程
- Nginx 运行配置与安全基线
- 本地构建与运行命令
- 常见问题与排查方式

---

## 2. 当前容器化基线

### 2.1 关键文件

- 镜像构建文件：`Dockerfile`
- Web 服务配置：`nginx.conf`
- 构建上下文过滤：`.dockerignore`

### 2.2 多阶段构建说明

当前 `Dockerfile` 分为两个阶段：

1. `builder` 阶段（`node:22-alpine`）
   - 安装依赖：`pnpm install --frozen-lockfile`
   - 构建产物：`pnpm build`
2. `runner` 阶段（`nginx:1.28-alpine`）
   - 拷贝 `dist` 静态产物
   - 使用自定义 `nginx.conf`
   - 监听端口 `8080`
   - 以 `nginx` 非 root 用户运行

---

## 3. 本地构建与运行

### 3.1 构建镜像

```bash
docker build -t nest-server-client:latest .
```

### 3.2 启动容器

```bash
docker run --rm -p 8080:8080 nest-server-client:latest
```

### 3.3 验证服务

- 访问主页：`http://localhost:8080`
- 健康检查：`http://localhost:8080/healthz`（预期返回 `ok`）

---

## 4. Nginx 运行策略

当前配置重点如下：

- `try_files $uri $uri/ /index.html`：支持 SPA 路由回退
- `server_tokens off`：隐藏 Nginx 版本信息
- 已启用常见安全响应头：
  - `X-Content-Type-Options`
  - `X-Frame-Options`
  - `Referrer-Policy`
  - `X-XSS-Protection`
  - `Content-Security-Policy`
- 日志输出到容器标准输出/错误，便于平台采集

---

## 5. 环境变量与接口说明

容器镜像执行的是前端静态资源，不在容器运行时动态注入 Vite 变量。  
当前构建默认使用生产配置（见 `.env.production`）：

- `VITE_API_BASE_URL=https://api.example.com`
- `VITE_ENABLE_MOCK=false`

这意味着：

- 若未接入真实后端，登录接口会失败
- 点击 `Go Workspace` / `Go Admin` 会被鉴权守卫拦回首页（属于预期行为）

---

## 6. 常见问题排查

### 6.1 `docker build` 拉取基础镜像失败

典型现象：`failed to resolve reference ... registry-1.docker.io ...`

排查建议：

1. 先单独拉镜像确认网络
   - `docker pull node:22-alpine`
   - `docker pull nginx:1.28-alpine`
2. 检查 Docker Desktop 的代理设置与网络连通性
3. 重试 `docker build`

### 6.2 容器可访问但页面按钮无业务响应

优先检查浏览器控制台和 Network，确认登录接口是否失败。  
在无真实后端的情况下，这是当前生产构建配置下的预期现象。

---

## 7. 团队协作建议

- 镜像版本升级时优先使用明确 tag，避免 `latest` 漂移
- 每次调整 `Dockerfile` 或 `nginx.conf` 后，至少执行一次本地构建与健康检查
- 在 CI 中补充镜像安全扫描，作为 3.2 验收闭环的一部分
