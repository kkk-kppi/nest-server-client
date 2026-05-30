<script setup lang="ts">
import {
  NForm,
  NFormItem,
  NInput,
  NInputNumber,
  NSwitch,
  NSelect,
  NRadioGroup,
  NRadio,
  NCheckbox,
  NDatePicker,
  NTimePicker,
  NSpace,
} from 'naive-ui'
import type { FormRules, SelectOption } from 'naive-ui'

interface FormField {
  key: string
  label: string
  type?:
    | 'input'
    | 'number'
    | 'select'
    | 'switch'
    | 'radio'
    | 'checkbox'
    | 'date'
    | 'time'
    | 'textarea'
  placeholder?: string
  options?: SelectOption[]
  required?: boolean
  disabled?: boolean
  span?: number
  props?: Record<string, unknown>
}

interface Props {
  fields: FormField[]
  model: Record<string, unknown>
  rules?: FormRules
  labelWidth?: number
  labelPlacement?: 'left' | 'top'
  cols?: number
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  labelWidth: 100,
  labelPlacement: 'left',
  cols: 1,
  disabled: false,
  rules: () => ({}),
})

const emit = defineEmits<{
  'update:model': [value: Record<string, unknown>]
}>()

function updateField(key: string, value: unknown) {
  emit('update:model', { ...props.model, [key]: value })
}

function getStringValue(key: string): string {
  return (props.model[key] as string) ?? ''
}

function getNumberValue(key: string): number | undefined {
  return props.model[key] as number | undefined
}

function getBooleanValue(key: string): boolean {
  return (props.model[key] as boolean) ?? false
}

function getSelectValue(key: string): string | number | undefined {
  const val = props.model[key]
  if (val === undefined || val === null) return undefined
  return val as string | number
}
</script>

<template>
  <n-form :model="model" :rules="rules" :label-width="labelWidth" :label-placement="labelPlacement">
    <n-grid :cols="cols" :x-gap="16">
      <n-gi v-for="field in fields" :key="field.key" :span="field.span || 1">
        <n-form-item :label="field.label" :path="field.key">
          <!-- Input -->
          <n-input
            v-if="!field.type || field.type === 'input'"
            :value="getStringValue(field.key)"
            :placeholder="field.placeholder || `请输入${field.label}`"
            :disabled="field.disabled || disabled"
            @update:value="updateField(field.key, $event)"
          />

          <!-- Textarea -->
          <n-input
            v-else-if="field.type === 'textarea'"
            type="textarea"
            :value="getStringValue(field.key)"
            :placeholder="field.placeholder || `请输入${field.label}`"
            :disabled="field.disabled || disabled"
            @update:value="updateField(field.key, $event)"
          />

          <!-- Number -->
          <n-input-number
            v-else-if="field.type === 'number'"
            :value="getNumberValue(field.key)"
            :placeholder="field.placeholder"
            :disabled="field.disabled || disabled"
            style="width: 100%"
            @update:value="updateField(field.key, $event)"
          />

          <!-- Select -->
          <n-select
            v-else-if="field.type === 'select'"
            :value="getSelectValue(field.key)"
            :placeholder="field.placeholder || `请选择${field.label}`"
            :options="field.options"
            :disabled="field.disabled || disabled"
            clearable
            @update:value="updateField(field.key, $event)"
          />

          <!-- Switch -->
          <n-switch
            v-else-if="field.type === 'switch'"
            :value="getBooleanValue(field.key)"
            :disabled="field.disabled || disabled"
            @update:value="updateField(field.key, $event)"
          />

          <!-- Radio -->
          <n-radio-group
            v-else-if="field.type === 'radio'"
            :value="getSelectValue(field.key)"
            :disabled="field.disabled || disabled"
            @update:value="updateField(field.key, $event)"
          >
            <n-space>
              <n-radio v-for="opt in field.options" :key="String(opt.value)" :value="opt.value">
                {{ opt.label }}
              </n-radio>
            </n-space>
          </n-radio-group>

          <!-- Checkbox -->
          <n-checkbox
            v-else-if="field.type === 'checkbox'"
            :checked="getBooleanValue(field.key)"
            :disabled="field.disabled || disabled"
            @update:checked="updateField(field.key, $event)"
          />

          <!-- Date -->
          <n-date-picker
            v-else-if="field.type === 'date'"
            :value="getNumberValue(field.key)"
            :disabled="field.disabled || disabled"
            style="width: 100%"
            @update:value="updateField(field.key, $event)"
          />

          <!-- Time -->
          <n-time-picker
            v-else-if="field.type === 'time'"
            :value="getNumberValue(field.key)"
            :disabled="field.disabled || disabled"
            style="width: 100%"
            @update:value="updateField(field.key, $event)"
          />
        </n-form-item>
      </n-gi>
    </n-grid>

    <!-- Action slot -->
    <slot name="action" />
  </n-form>
</template>
