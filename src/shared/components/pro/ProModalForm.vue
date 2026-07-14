<script setup lang="ts">
import { ref, computed } from 'vue'
import { NModal, NSpace, NButton } from 'naive-ui'
import ProForm from './ProForm.vue'
import type { FormField } from './ProForm.vue'
import type { FormRules } from 'naive-ui'

interface FormSection {
  key: string
  title: string
  description?: string
  collapsible?: boolean
  defaultCollapsed?: boolean
}

interface Props {
  show: boolean
  title: string
  fields: FormField[]
  sections?: FormSection[]
  model: Record<string, unknown>
  rules?: FormRules
  loading?: boolean
  width?: number | string
  labelWidth?: number
  labelPlacement?: 'left' | 'top'
  cols?: number
  disabled?: boolean
  submitText?: string
  cancelText?: string
}

const props = withDefaults(defineProps<Props>(), {
  sections: () => [],
  rules: () => ({}),
  loading: false,
  width: 520,
  labelWidth: 100,
  labelPlacement: 'left',
  cols: 1,
  disabled: false,
  submitText: '确定',
  cancelText: '取消',
})

const emit = defineEmits<{
  'update:show': [value: boolean]
  'update:model': [value: Record<string, unknown>]
  submit: [model: Record<string, unknown>]
  cancel: []
}>()

const formRef = ref<InstanceType<typeof ProForm> | null>(null)

const modalWidth = computed(() => {
  if (typeof props.width === 'number') return `${props.width}px`
  return props.width
})

function handleClose() {
  emit('update:show', false)
  emit('cancel')
}

async function handleSubmit() {
  try {
    await formRef.value?.validate()
  } catch {
    return
  }
  emit('submit', props.model)
}

function handleUpdateModel(value: Record<string, unknown>) {
  emit('update:model', value)
}
</script>

<template>
  <n-modal
    :show="show"
    :title="title"
    preset="card"
    :style="{ width: modalWidth }"
    :bordered="false"
    :mask-closable="!loading"
    :close-on-esc="!loading"
    transform-origin="center"
    @update:show="(val) => emit('update:show', val)"
  >
    <ProForm
      ref="formRef"
      :fields="fields"
      :sections="sections"
      :model="model"
      :rules="rules"
      :label-width="labelWidth"
      :label-placement="labelPlacement"
      :cols="cols"
      :disabled="disabled"
      @update:model="handleUpdateModel"
    />

    <template #footer>
      <n-space justify="end">
        <n-button :disabled="loading" @click="handleClose">
          {{ cancelText }}
        </n-button>
        <n-button type="primary" :loading="loading" @click="handleSubmit">
          {{ submitText }}
        </n-button>
      </n-space>
    </template>
  </n-modal>
</template>
