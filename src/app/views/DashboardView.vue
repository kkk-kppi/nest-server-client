<script setup lang="ts">
import { NCard, NGrid, NGi, NStatistic, NSpace } from 'naive-ui'
</script>

<template>
  <n-space vertical :size="16">
    <n-grid :cols="4" :x-gap="16" :y-gap="16">
      <n-gi>
        <n-card>
          <n-statistic label="用户数" :value="1024" />
        </n-card>
      </n-gi>
      <n-gi>
        <n-card>
          <n-statistic label="访问量" :value="56789" />
        </n-card>
      </n-gi>
      <n-gi>
        <n-card>
          <n-statistic label="订单数" :value="256" />
        </n-card>
      </n-gi>
      <n-gi>
        <n-card>
          <n-statistic label="收入" :value="123456" prefix="¥" />
        </n-card>
      </n-gi>
    </n-grid>

    <n-card title="欢迎使用">
      <p>这是一个通用后台管理系统底座，基于 Vue 3 + TypeScript + Naive UI 构建。</p>
      <p>请从左侧菜单选择功能模块。</p>
    </n-card>
  </n-space>
</template>
