<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getWorkspaceSummary, getWorkspaceTaskPage } from '@/features/workspace/api'
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
const summaryState = useAsyncState<Awaited<ReturnType<typeof getWorkspaceSummary>>>()
const taskPageState = useAsyncState<Awaited<ReturnType<typeof getWorkspaceTaskPage>>>()
const pagination = usePaginationState({
  pageSizeOptions,
  initialPageSize: 2,
})
const pageQuery = useRoutePageQuery({
  route,
  router,
  pageKey: 'workspacePage',
  pageSizeKey: 'workspacePageSize',
})

const summary = summaryState.data
const taskPage = taskPageState.data
const isLoading = summaryState.isLoading
const isPageLoading = taskPageState.isLoading
const page = pagination.page
const pageSize = pagination.pageSize
const totalPages = pagination.totalPages
const canGoPrev = pagination.canGoPrev
const canGoNext = pagination.canGoNext
const errorMessage = computed(
  () => summaryState.errorMessage.value || taskPageState.errorMessage.value,
)
const hasTaskData = computed(() => hasPageItems(taskPage.value?.items))

async function loadWorkspaceSummary() {
  await summaryState.run(() => getWorkspaceSummary(), '加载工作区数据失败')
}

async function loadTaskPage(targetPage: number) {
  const safePage = targetPage > 0 ? targetPage : 1
  const result = await taskPageState.run(
    () => getWorkspaceTaskPage({ page: safePage, pageSize: pageSize.value }),
    '加载任务列表失败',
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

  void loadTaskPage(page.value)
}

function goNextPage() {
  if (!pagination.goNextPage()) {
    return
  }

  void loadTaskPage(page.value)
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
  void loadTaskPage(1)
}

onMounted(() => {
  const initialState = pageQuery.resolveInitialState({
    defaultPage: page.value,
    defaultPageSize: pageSize.value,
    pageSizeOptions,
  })
  pagination.setPageSize(initialState.pageSize)
  pagination.setPage(initialState.page)
  void loadWorkspaceSummary()
  void loadTaskPage(initialState.page)
})
</script>

<template>
  <main style="min-height: 100vh; display: grid; place-items: center">
    <section style="display: grid; gap: 10px; text-align: center; min-width: 360px">
      <h1>Workspace</h1>
      <p v-if="isLoading">Loading...</p>
      <p v-else-if="errorMessage" style="color: #d33">{{ errorMessage }}</p>
      <template v-else-if="summary">
        <p>Project: {{ summary.projectName }}</p>
        <p>Owner: {{ summary.owner }}</p>
        <p>Tasks: {{ summary.taskCount }}</p>
      </template>
      <p style="font-weight: 700">Task List</p>
      <div style="display: flex; align-items: center; justify-content: center; gap: 8px">
        <span>Page Size</span>
        <select :value="pageSize" :disabled="isPageLoading" @change="onPageSizeChange">
          <option v-for="size in pageSizeOptions" :key="size" :value="size">{{ size }}</option>
        </select>
      </div>
      <p v-if="isPageLoading">Loading tasks...</p>
      <p v-else-if="!hasTaskData">暂无任务</p>
      <ul v-else style="list-style: none; padding: 0; margin: 0; display: grid; gap: 6px">
        <li
          v-for="item in taskPage?.items ?? []"
          :key="item.id"
          style="
            display: flex;
            justify-content: space-between;
            border: 1px solid #ddd;
            border-radius: 6px;
            padding: 8px 10px;
          "
        >
          <span>{{ item.name }}</span>
          <span>{{ item.status }}</span>
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
