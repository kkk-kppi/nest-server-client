<script setup lang="ts">
import {
  NCard,
  NGrid,
  NGi,
  NStatistic,
  NSpace,
  NIcon,
  NTag,
  NList,
  NListItem,
  NThing,
} from 'naive-ui'
import {
  PeopleOutline,
  EyeOutline,
  CartOutline,
  CashOutline,
  TrendingUpOutline,
  TimeOutline,
  CheckmarkCircleOutline,
  InformationCircleOutline,
} from '@vicons/ionicons5'

const recentActivities = [
  { id: 1, user: 'admin', action: '创建了新用户', time: '2分钟前', type: 'success' as const },
  { id: 2, user: 'editor', action: '发布了文章', time: '15分钟前', type: 'info' as const },
  { id: 3, user: 'admin', action: '修改了权限配置', time: '1小时前', type: 'warning' as const },
  { id: 4, user: 'viewer', action: '登录系统', time: '2小时前', type: 'info' as const },
]
</script>

<template>
  <n-space vertical :size="16">
    <!-- 统计卡片 -->
    <n-grid :cols="4" :x-gap="16" :y-gap="16">
      <n-gi>
        <n-card>
          <template #header-extra>
            <n-icon size="24" color="var(--color-primary)"><PeopleOutline /></n-icon>
          </template>
          <n-statistic label="用户总数" :value="1024">
            <template #suffix>
              <n-tag type="success" size="small" class="ml-2">+12%</n-tag>
            </template>
          </n-statistic>
        </n-card>
      </n-gi>
      <n-gi>
        <n-card>
          <template #header-extra>
            <n-icon size="24" color="var(--color-success)"><EyeOutline /></n-icon>
          </template>
          <n-statistic label="今日访问" :value="56789">
            <template #suffix>
              <n-tag type="info" size="small" class="ml-2">+8%</n-tag>
            </template>
          </n-statistic>
        </n-card>
      </n-gi>
      <n-gi>
        <n-card>
          <template #header-extra>
            <n-icon size="24" color="var(--color-warning)"><CartOutline /></n-icon>
          </template>
          <n-statistic label="订单数量" :value="256">
            <template #suffix>
              <n-tag type="warning" size="small" class="ml-2">+5%</n-tag>
            </template>
          </n-statistic>
        </n-card>
      </n-gi>
      <n-gi>
        <n-card>
          <template #header-extra>
            <n-icon size="24" color="var(--color-error)"><CashOutline /></n-icon>
          </template>
          <n-statistic label="总收入">
            <template #default>
              <span class="text-error">¥123,456</span>
            </template>
            <template #suffix>
              <n-tag type="error" size="small" class="ml-2">+15%</n-tag>
            </template>
          </n-statistic>
        </n-card>
      </n-gi>
    </n-grid>

    <n-grid :cols="2" :x-gap="16">
      <!-- 欢迎信息 -->
      <n-gi>
        <n-card title="欢迎使用">
          <template #header-extra>
            <n-icon size="20" color="var(--color-primary)"><InformationCircleOutline /></n-icon>
          </template>
          <n-space vertical :size="12">
            <p>
              这是一个通用后台管理系统底座，基于 <n-tag type="info" size="small">Vue 3</n-tag> +
              <n-tag type="success" size="small">TypeScript</n-tag> +
              <n-tag type="warning" size="small">Naive UI</n-tag> 构建。
            </p>
            <p>系统功能包括：</p>
            <n-list bordered>
              <n-list-item>
                <n-thing title="用户管理" description="管理系统用户、角色和权限" />
              </n-list-item>
              <n-list-item>
                <n-thing title="工作空间" description="项目任务管理和协作" />
              </n-list-item>
              <n-list-item>
                <n-thing title="字典管理" description="系统配置和数据字典维护" />
              </n-list-item>
              <n-list-item>
                <n-thing title="审计日志" description="系统操作记录和追踪" />
              </n-list-item>
            </n-list>
          </n-space>
        </n-card>
      </n-gi>

      <!-- 最近活动 -->
      <n-gi>
        <n-card title="最近活动">
          <template #header-extra>
            <n-icon size="20" color="var(--color-success)"><TimeOutline /></n-icon>
          </template>
          <n-list bordered>
            <n-list-item v-for="activity in recentActivities" :key="activity.id">
              <n-thing>
                <template #avatar>
                  <n-icon
                    size="20"
                    :color="
                      activity.type === 'success'
                        ? 'var(--color-success)'
                        : activity.type === 'warning'
                          ? 'var(--color-warning)'
                          : 'var(--color-primary)'
                    "
                  >
                    <CheckmarkCircleOutline v-if="activity.type === 'success'" />
                    <TrendingUpOutline v-else-if="activity.type === 'warning'" />
                    <InformationCircleOutline v-else />
                  </n-icon>
                </template>
                <template #header>
                  <span class="font-medium">{{ activity.user }}</span>
                </template>
                <template #description>
                  <span>{{ activity.action }}</span>
                  <n-tag :type="activity.type" size="small" class="ml-2">{{ activity.time }}</n-tag>
                </template>
              </n-thing>
            </n-list-item>
          </n-list>
        </n-card>
      </n-gi>
    </n-grid>
  </n-space>
</template>
