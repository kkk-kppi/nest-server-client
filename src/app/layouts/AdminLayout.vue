<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useLayoutSetting } from '@/core/theme/useLayoutSetting'
import AdminSidebar from './components/AdminSidebar.vue'
import AdminTopbar from './components/AdminTopbar.vue'
import AdminTabs from './components/AdminTabs.vue'
import { useMenuRoutes } from './composables/useMenuRoutes'

const { setting } = useLayoutSetting()
const { menuOptions, topMenuOptions, subMenuOptions, selectedTopKey, setSelectedTopKey } =
  useMenuRoutes()

const isMobile = ref(false)
const showMobileSidebar = ref(false)

function checkMobile() {
  isMobile.value = window.innerWidth < 768
  if (isMobile.value) {
    setting.value.sidebarCollapsed = true
    showMobileSidebar.value = false
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

<template>
  <n-layout has-sider class="admin-layout">
    <!-- Skip Navigation 链接 -->
    <a href="#main-content" class="skip-link">跳到主内容</a>

    <!-- 移动端遮罩 -->
    <div
      v-if="isMobile && showMobileSidebar"
      class="mobile-overlay"
      @click="showMobileSidebar = false"
    />

    <aside v-if="setting.mode === 'side'" aria-label="侧边栏导航">
      <n-layout-sider
        :collapsed="isMobile ? !showMobileSidebar : setting.sidebarCollapsed"
        :width="isMobile ? 240 : setting.sidebarWidth"
        :collapsed-width="isMobile ? 0 : 64"
        :show-trigger="!isMobile"
        collapse-mode="width"
        bordered
        :class="{ 'mobile-sidebar': isMobile }"
        @collapse="isMobile ? (showMobileSidebar = false) : (setting.sidebarCollapsed = true)"
        @expand="isMobile ? (showMobileSidebar = true) : (setting.sidebarCollapsed = false)"
      >
        <AdminSidebar
          :menu-options="menuOptions"
          :collapsed="!showMobileSidebar && !isMobile ? setting.sidebarCollapsed : false"
        />
      </n-layout-sider>
    </aside>

    <aside v-if="setting.mode === 'mix'" aria-label="侧边栏导航">
      <n-layout-sider
        :collapsed="isMobile ? !showMobileSidebar : setting.sidebarCollapsed"
        :width="isMobile ? 240 : setting.sidebarWidth"
        :collapsed-width="isMobile ? 0 : 64"
        :show-trigger="!isMobile"
        collapse-mode="width"
        bordered
        :class="{ 'mobile-sidebar': isMobile }"
        @collapse="isMobile ? (showMobileSidebar = false) : (setting.sidebarCollapsed = true)"
        @expand="isMobile ? (showMobileSidebar = true) : (setting.sidebarCollapsed = false)"
      >
        <AdminSidebar
          :menu-options="subMenuOptions"
          :collapsed="!showMobileSidebar && !isMobile ? setting.sidebarCollapsed : false"
        />
      </n-layout-sider>
    </aside>

    <n-layout>
      <n-layout-header :bordered="false" class="admin-header">
        <AdminTopbar
          :layout-mode="setting.mode"
          :menu-options="setting.mode === 'top' ? menuOptions : topMenuOptions"
          :selected-top-key="selectedTopKey"
          :is-mobile="isMobile"
          @update:selected-top-key="setSelectedTopKey"
          @toggle-mobile-sidebar="showMobileSidebar = !showMobileSidebar"
        />
      </n-layout-header>

      <n-layout-header v-if="setting.showTabs" :bordered="false" class="admin-header">
        <AdminTabs />
      </n-layout-header>

      <main id="main-content">
        <n-layout-content
          :content-style="
            setting.fixedHeader
              ? 'padding: var(--space-4); flex: 1; overflow: auto;'
              : 'padding: var(--space-4);'
          "
        >
          <router-view />
        </n-layout-content>
      </main>
    </n-layout>
  </n-layout>
</template>

<style scoped>
.admin-layout {
  height: 100vh;
}

aside {
  height: 100%;
}

.admin-header {
  padding: 0;
}

.mobile-overlay {
  position: fixed;
  inset: 0;
  background: var(--bg-overlay);
  z-index: var(--z-modal-backdrop);
}

.mobile-sidebar {
  position: fixed !important;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: var(--z-modal);
}

@media (max-width: 767px) {
  .admin-header {
    padding: 0 var(--space-3);
  }
}
</style>
