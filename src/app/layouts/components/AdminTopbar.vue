<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  SunnyOutline,
  MoonOutline,
  ExpandOutline,
  ContractOutline,
  SettingsOutline,
  MenuOutline,
  SearchOutline,
  NotificationsOutline,
  MailOutline,
  HelpCircleOutline,
} from '@vicons/ionicons5'
import { NIcon, NBadge, NPopover, NList, NListItem, NThing, NEmpty, NSpace } from 'naive-ui'
import { useTheme } from '@/core/theme/useTheme'
import { useLayoutSetting } from '@/core/theme/useLayoutSetting'
import AdminBreadcrumb from './AdminBreadcrumb.vue'
import AdminUserMenu from './AdminUserMenu.vue'
import AdminSettingPanel from './AdminSettingPanel.vue'
import type { MenuOption } from 'naive-ui'

const props = defineProps<{
  layoutMode: 'side' | 'top' | 'mix'
  menuOptions?: MenuOption[]
  selectedTopKey?: string
  isMobile?: boolean
}>()

const emit = defineEmits<{
  'update:selectedTop-key': [key: string]
  'toggle-mobile-sidebar': []
}>()

const router = useRouter()
const { isDark, toggleDark } = useTheme()
const { setting, toggleSidebar } = useLayoutSetting()

const isFullscreen = ref(false)
const showSettingPanel = ref(false)
const showSearch = ref(false)
const searchQuery = ref('')

// Mock data for notifications
const notifications = ref([
  {
    id: 1,
    title: '系统更新',
    description: '系统将于今晚进行维护更新',
    time: '10分钟前',
    read: false,
  },
  {
    id: 2,
    title: '新用户注册',
    description: '用户 editor 已成功注册',
    time: '1小时前',
    read: false,
  },
  { id: 3, title: '任务完成', description: '项目 Alpha 已完成部署', time: '2小时前', read: true },
])

// Mock data for messages
const messages = ref([
  { id: 1, title: '来自 admin', description: '请查看最新的需求文档', time: '5分钟前', read: false },
  { id: 2, title: '来自 editor', description: '文章已提交审核', time: '30分钟前', read: false },
  { id: 3, title: '系统通知', description: '您的密码即将过期', time: '1天前', read: true },
])

const unreadNotifications = ref(2)
const unreadMessages = ref(2)

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
    isFullscreen.value = true
  } else {
    document.exitFullscreen()
    isFullscreen.value = false
  }
}

function handleToggleSidebar() {
  if (props.isMobile) {
    emit('toggle-mobile-sidebar')
  } else {
    toggleSidebar()
  }
}

function handleTopMenuClick(key: string) {
  if (props.layoutMode === 'mix') {
    emit('update:selectedTop-key', key)
    const option = props.menuOptions?.find((item) => item.key === key)
    if (option?.children?.length) {
      const firstChild = option.children[0]
      if (firstChild?.key) {
        router.push({ name: firstChild.key as string })
      }
    }
  } else if (props.layoutMode === 'top') {
    router.push({ name: key })
  }
}

function handleSearch() {
  if (searchQuery.value.trim()) {
    showSearch.value = false
    searchQuery.value = ''
  }
}

function markAllNotificationsRead() {
  notifications.value.forEach((n) => (n.read = true))
  unreadNotifications.value = 0
}

function markAllMessagesRead() {
  messages.value.forEach((m) => (m.read = true))
  unreadMessages.value = 0
}
</script>

<template>
  <header class="topbar" role="banner">
    <div class="topbar-left">
      <n-button
        quaternary
        circle
        aria-label="切换侧边栏"
        :aria-expanded="!setting.sidebarCollapsed"
        @click="handleToggleSidebar"
      >
        <template #icon>
          <n-icon :size="20">
            <MenuOutline />
          </n-icon>
        </template>
      </n-button>
      <AdminBreadcrumb v-if="layoutMode === 'side' && setting.showBreadcrumb && !isMobile" />
      <n-menu
        v-if="(layoutMode === 'top' || layoutMode === 'mix') && menuOptions && !isMobile"
        mode="horizontal"
        :options="menuOptions"
        :value="layoutMode === 'mix' ? selectedTopKey : ($route.name as string)"
        @update:value="handleTopMenuClick"
      />
    </div>

    <div class="topbar-right">
      <!-- 全局搜索 -->
      <n-popover
        v-model:show="showSearch"
        trigger="click"
        placement="bottom"
        :width="400"
        :show-arrow="false"
      >
        <template #trigger>
          <n-button quaternary circle aria-label="全局搜索">
            <template #icon>
              <n-icon :size="18">
                <SearchOutline />
              </n-icon>
            </template>
          </n-button>
        </template>
        <div class="search-popover">
          <n-input
            v-model:value="searchQuery"
            placeholder="搜索菜单、功能..."
            clearable
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <n-icon :size="18">
                <SearchOutline />
              </n-icon>
            </template>
          </n-input>
          <div class="search-hints">
            <p class="search-hint-title">快捷搜索</p>
            <n-space>
              <n-tag
                v-for="hint in ['用户管理', '工作空间', '系统设置', '审计日志']"
                :key="hint"
                size="small"
              >
                {{ hint }}
              </n-tag>
            </n-space>
          </div>
        </div>
      </n-popover>

      <!-- 通知中心 -->
      <n-popover trigger="click" placement="bottom" :width="320" :show-arrow="false">
        <template #trigger>
          <n-button quaternary circle aria-label="通知中心">
            <template #icon>
              <n-badge :value="unreadNotifications" :max="99">
                <n-icon :size="18">
                  <NotificationsOutline />
                </n-icon>
              </n-badge>
            </template>
          </n-button>
        </template>
        <div class="notification-popover">
          <div class="notification-header">
            <span class="notification-title">通知</span>
            <n-button text size="small" @click="markAllNotificationsRead">全部已读</n-button>
          </div>
          <n-list v-if="notifications.length" hoverable clickable>
            <n-list-item v-for="item in notifications" :key="item.id">
              <n-thing :title="item.title" :description="item.description">
                <template #header-extra>
                  <span class="notification-time">{{ item.time }}</span>
                </template>
                <template #avatar>
                  <div :class="['notification-dot', { unread: !item.read }]" />
                </template>
              </n-thing>
            </n-list-item>
          </n-list>
          <n-empty v-else description="暂无通知" />
        </div>
      </n-popover>

      <!-- 消息提醒 -->
      <n-popover trigger="click" placement="bottom" :width="320" :show-arrow="false">
        <template #trigger>
          <n-button quaternary circle aria-label="消息提醒">
            <template #icon>
              <n-badge :value="unreadMessages" :max="99">
                <n-icon :size="18">
                  <MailOutline />
                </n-icon>
              </n-badge>
            </template>
          </n-button>
        </template>
        <div class="notification-popover">
          <div class="notification-header">
            <span class="notification-title">消息</span>
            <n-button text size="small" @click="markAllMessagesRead">全部已读</n-button>
          </div>
          <n-list v-if="messages.length" hoverable clickable>
            <n-list-item v-for="item in messages" :key="item.id">
              <n-thing :title="item.title" :description="item.description">
                <template #header-extra>
                  <span class="notification-time">{{ item.time }}</span>
                </template>
                <template #avatar>
                  <div :class="['notification-dot', { unread: !item.read }]" />
                </template>
              </n-thing>
            </n-list-item>
          </n-list>
          <n-empty v-else description="暂无消息" />
        </div>
      </n-popover>

      <!-- 帮助入口 -->
      <n-button
        v-if="!isMobile"
        quaternary
        circle
        aria-label="帮助中心"
        tag="a"
        href="https://github.com/your-repo/wiki"
        target="_blank"
      >
        <template #icon>
          <n-icon :size="18">
            <HelpCircleOutline />
          </n-icon>
        </template>
      </n-button>

      <n-divider v-if="!isMobile" vertical />

      <!-- 主题切换 -->
      <n-button
        quaternary
        circle
        :aria-label="isDark ? '切换到浅色模式' : '切换到深色模式'"
        :aria-pressed="isDark"
        @click="toggleDark"
      >
        <template #icon>
          <n-icon :size="18">
            <MoonOutline v-if="!isDark" />
            <SunnyOutline v-else />
          </n-icon>
        </template>
      </n-button>

      <!-- 全屏切换 -->
      <n-button
        v-if="!isMobile"
        quaternary
        circle
        :aria-label="isFullscreen ? '退出全屏' : '进入全屏'"
        :aria-pressed="isFullscreen"
        @click="toggleFullscreen"
      >
        <template #icon>
          <n-icon :size="18">
            <ContractOutline v-if="isFullscreen" />
            <ExpandOutline v-else />
          </n-icon>
        </template>
      </n-button>

      <!-- 设置 -->
      <n-button quaternary circle aria-label="打开设置" @click="showSettingPanel = true">
        <template #icon>
          <n-icon :size="18">
            <SettingsOutline />
          </n-icon>
        </template>
      </n-button>

      <n-divider v-if="!isMobile" vertical />

      <!-- 用户菜单 -->
      <AdminUserMenu />
    </div>
  </header>

  <AdminSettingPanel v-model:show="showSettingPanel" />
</template>

<style scoped>
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--topbar-height);
  padding: 0 var(--space-4);
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-light);
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.search-popover {
  padding: var(--space-3);
}

.search-hints {
  margin-top: var(--space-3);
}

.search-hint-title {
  font-size: var(--text-sm);
  color: var(--text-tertiary);
  margin-bottom: var(--space-2);
}

.notification-popover {
  max-height: 400px;
  overflow-y: auto;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-3) var(--space-3) var(--space-2);
}

.notification-title {
  font-weight: 600;
  font-size: var(--text-base);
}

.notification-time {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

.notification-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--border-base);
}

.notification-dot.unread {
  background: var(--color-primary);
}

@media (max-width: 767px) {
  .topbar {
    height: 48px;
    padding: 0 var(--space-3);
  }

  .topbar-right {
    gap: 0;
  }
}
</style>
