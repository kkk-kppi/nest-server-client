<script setup lang="ts">
import { ref } from 'vue'
import { useLayoutSetting } from '@/core/theme/useLayoutSetting'
import AdminSidebar from './components/AdminSidebar.vue'
import AdminTopbar from './components/AdminTopbar.vue'
import AdminTabs from './components/AdminTabs.vue'

const { setting } = useLayoutSetting()

const menuOptions = ref([])
</script>

<template>
  <n-layout has-sider style="height: 100vh">
    <n-layout-sider
      v-if="setting.mode !== 'top'"
      :collapsed="setting.sidebarCollapsed"
      :width="setting.sidebarWidth"
      :collapsed-width="64"
      show-trigger
      collapse-mode="width"
      bordered
      @collapse="setting.sidebarCollapsed = true"
      @expand="setting.sidebarCollapsed = false"
    >
      <AdminSidebar :menu-options="menuOptions" :collapsed="setting.sidebarCollapsed" />
    </n-layout-sider>

    <n-layout>
      <n-layout-header :bordered="false" style="padding: 0 16px">
        <AdminTopbar :layout-mode="setting.mode" />
      </n-layout-header>

      <n-layout-header v-if="setting.showTabs" :bordered="false" style="padding: 0 16px">
        <AdminTabs />
      </n-layout-header>

      <n-layout-content
        :content-style="
          setting.fixedHeader ? 'padding: 16px; flex: 1; overflow: auto;' : 'padding: 16px;'
        "
      >
        <router-view />
      </n-layout-content>
    </n-layout>
  </n-layout>
</template>
