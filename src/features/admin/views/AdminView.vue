<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getAdminDashboardData, getAuditLogPage } from '@/features/admin/api'
import { clampPage, getTotalPages, hasPageItems, parsePositiveInt, resolvePageSize } from '@/shared'

const isLoading = ref(false)
const errorMessage = ref('')
const dashboard = ref<Awaited<ReturnType<typeof getAdminDashboardData>> | null>(null)
const auditLogPage = ref<Awaited<ReturnType<typeof getAuditLogPage>> | null>(null)
const page = ref(1)
const route = useRoute()
const router = useRouter()
const pageSizeOptions = [2, 5, 10]
const pageSize = ref(2)
const isPageLoading = ref(false)

const totalPages = computed(() =>
  getTotalPages(auditLogPage.value?.meta.total ?? 0, pageSize.value),
)
const canGoPrev = computed(() => page.value > 1)
const canGoNext = computed(() => page.value < totalPages.value)
const hasAuditData = computed(() => hasPageItems(auditLogPage.value?.items))

async function loadAdminDashboard() {
  isLoading.value = true
  errorMessage.value = ''
  try {
    dashboard.value = await getAdminDashboardData()
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '加载管理数据失败'
  } finally {
    isLoading.value = false
  }
}

async function loadAuditPage(targetPage: number) {
  isPageLoading.value = true
  errorMessage.value = ''
  try {
    const safePage = clampPage(targetPage, totalPages.value)
    const result = await getAuditLogPage({ page: safePage, pageSize: pageSize.value })
    auditLogPage.value = result
    page.value = clampPage(result.meta.page, getTotalPages(result.meta.total, result.meta.pageSize))
    await router.replace({
      query: {
        ...route.query,
        page: String(page.value),
        pageSize: String(pageSize.value),
      },
    })
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '加载审计日志失败'
  } finally {
    isPageLoading.value = false
  }
}

function goPrevPage() {
  if (!canGoPrev.value) {
    return
  }

  void loadAuditPage(page.value - 1)
}

function goNextPage() {
  if (!canGoNext.value) {
    return
  }

  void loadAuditPage(page.value + 1)
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

  pageSize.value = nextPageSize
  void loadAuditPage(1)
}

onMounted(() => {
  const initPageSize = resolvePageSize(
    parsePositiveInt(route.query.pageSize, pageSize.value),
    pageSizeOptions,
    pageSize.value,
  )
  const initPage = parsePositiveInt(route.query.page, page.value)
  pageSize.value = initPageSize
  page.value = initPage
  void loadAdminDashboard()
  void loadAuditPage(initPage)
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
