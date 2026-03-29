<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getAdminDashboardData, getAuditLogPage } from '@/features/admin/api'
import {
  hasPageItems,
  resolvePageSize,
  useAsyncState,
  usePaginationState,
  useRoutePageQuery,
} from '@/shared'

const route = useRoute()
const router = useRouter()
const pageSizeOptions = [2, 5, 10]
const dashboardState = useAsyncState<Awaited<ReturnType<typeof getAdminDashboardData>>>()
const auditLogPageState = useAsyncState<Awaited<ReturnType<typeof getAuditLogPage>>>()
const pagination = usePaginationState({
  pageSizeOptions,
  initialPageSize: 2,
})
const pageQuery = useRoutePageQuery({
  route,
  router,
  pageKey: 'adminPage',
  pageSizeKey: 'adminPageSize',
})

const dashboard = dashboardState.data
const auditLogPage = auditLogPageState.data
const isLoading = dashboardState.isLoading
const isPageLoading = auditLogPageState.isLoading
const page = pagination.page
const pageSize = pagination.pageSize
const totalPages = pagination.totalPages
const canGoPrev = pagination.canGoPrev
const canGoNext = pagination.canGoNext
const errorMessage = computed(
  () => dashboardState.errorMessage.value || auditLogPageState.errorMessage.value,
)
const hasAuditData = computed(() => hasPageItems(auditLogPage.value?.items))

async function loadAdminDashboard() {
  await dashboardState.run(() => getAdminDashboardData(), '加载管理数据失败')
}

async function loadAuditPage(targetPage: number) {
  const safePage = targetPage > 0 ? targetPage : 1
  const result = await auditLogPageState.run(
    () => getAuditLogPage({ page: safePage, pageSize: pageSize.value }),
    '加载审计日志失败',
  )
  if (!result) {
    return
  }

  pagination.setTotal(result.meta.total)
  pagination.setPageSize(result.meta.pageSize)
  pagination.setPage(result.meta.page)
  await pageQuery.syncQuery({
    page: page.value,
    pageSize: pageSize.value,
  })
}

function goPrevPage() {
  if (!pagination.goPrevPage()) {
    return
  }

  void loadAuditPage(page.value)
}

function goNextPage() {
  if (!pagination.goNextPage()) {
    return
  }

  void loadAuditPage(page.value)
}

function onPageSizeChange(event: Event) {
  const target = event.target as HTMLSelectElement | null
  if (!target) {
    return
  }

  const parsed = Number.parseInt(target.value, 10)
  const nextPageSize = resolvePageSize(parsed, pageSizeOptions, pageSize.value)
  if (nextPageSize === pageSize.value) {
    return
  }

  pagination.setPageSizeAndReset(nextPageSize)
  void loadAuditPage(1)
}

onMounted(() => {
  const initialState = pageQuery.resolveInitialState({
    defaultPage: page.value,
    defaultPageSize: pageSize.value,
    pageSizeOptions,
  })
  pagination.setPageSize(initialState.pageSize)
  pagination.setPage(initialState.page)
  void loadAdminDashboard()
  void loadAuditPage(initialState.page)
})
</script>

<template>
  <main style="min-height: 100vh; display: grid; place-items: center">
    <section style="display: grid; gap: 10px; text-align: center; min-width: 420px">
      <h1>Admin</h1>
      <p v-if="isLoading">Loading...</p>
      <p v-else-if="errorMessage" style="color: #d33">{{ errorMessage }}</p>
      <template v-else-if="dashboard">
        <p>Online Users: {{ dashboard.onlineUsers }}</p>
        <p>Error Rate: {{ dashboard.errorRate }}%</p>
        <p>Release: {{ dashboard.releaseVersion }}</p>
      </template>
      <p style="font-weight: 700">Audit Logs</p>
      <div style="display: flex; align-items: center; justify-content: center; gap: 8px">
        <span>Page Size</span>
        <select :value="pageSize" :disabled="isPageLoading" @change="onPageSizeChange">
          <option v-for="size in pageSizeOptions" :key="size" :value="size">{{ size }}</option>
        </select>
      </div>
      <p v-if="isPageLoading">Loading logs...</p>
      <p v-else-if="!hasAuditData">暂无审计日志</p>
      <ul v-else style="list-style: none; padding: 0; margin: 0; display: grid; gap: 6px">
        <li
          v-for="item in auditLogPage?.items ?? []"
          :key="item.id"
          style="
            display: grid;
            gap: 4px;
            text-align: left;
            border: 1px solid #ddd;
            border-radius: 6px;
            padding: 8px 10px;
          "
        >
          <span>{{ item.operator }} - {{ item.action }}</span>
          <span>{{ item.createdAt }}</span>
        </li>
      </ul>
      <div style="display: flex; align-items: center; justify-content: center; gap: 8px">
        <button type="button" :disabled="!canGoPrev || isPageLoading" @click="goPrevPage">
          Prev
        </button>
        <span>{{ page }} / {{ totalPages }}</span>
        <button type="button" :disabled="!canGoNext || isPageLoading" @click="goNextPage">
          Next
        </button>
      </div>
    </section>
  </main>
</template>
