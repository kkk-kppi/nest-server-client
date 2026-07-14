<script setup lang="ts">
import { ref, computed, watch, type Component } from 'vue'
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
  NGrid,
  NGi,
  NDivider,
  NIcon,
} from 'naive-ui'
import {
  ChevronDownOutline,
  ChevronForwardOutline,
  InformationCircleOutline,
} from '@vicons/ionicons5'
import type { FormInst, FormRules, SelectOption } from 'naive-ui'

interface FormSection {
  key: string
  title: string
  description?: string
  collapsible?: boolean
  defaultCollapsed?: boolean
}

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
  icon?: Component
  help?: string
  description?: string
  visible?: boolean | ((model: Record<string, unknown>) => boolean)
  group?: string
}

interface Props {
  fields: FormField[]
  sections?: FormSection[]
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
  sections: () => [],
})

const emit = defineEmits<{
  'update:model': [value: Record<string, unknown>]
}>()

const formRef = ref<FormInst | null>(null)

const autoRules = computed<FormRules>(() => {
  const rules: FormRules = {}
  for (const field of props.fields) {
    if (field.required) {
      rules[field.key] = {
        required: true,
        message: `请输入${field.label}`,
        trigger: ['input', 'blur'],
      }
    }
  }
  return rules
})

const mergedRules = computed<FormRules>(() => ({
  ...autoRules.value,
  ...props.rules,
}))

async function validate() {
  if (!formRef.value) return
  return formRef.value.validate()
}

function reset() {
  if (!formRef.value) return
  formRef.value.restoreValidation()
}

function restoreValidation() {
  if (!formRef.value) return
  formRef.value.restoreValidation()
}

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

const collapsedSections = ref<Record<string, boolean>>({})

watch(
  () => props.sections,
  (sections) => {
    for (const section of sections) {
      if (section.collapsible && section.defaultCollapsed) {
        collapsedSections.value[section.key] = true
      }
    }
  },
  { immediate: true },
)

const sectionMap = computed(() => {
  const map = new Map<string, FormSection>()
  for (const section of props.sections) {
    map.set(section.key, section)
  }
  return map
})

interface FieldGroup {
  key: string
  section?: FormSection
  fields: FormField[]
}

const fieldGroups = computed<FieldGroup[]>(() => {
  if (!props.sections.length) {
    return [{ key: '__default__', fields: props.fields }]
  }

  const groups = new Map<string, FormField[]>()
  const ungrouped: FormField[] = []

  for (const field of props.fields) {
    const isVisible =
      typeof field.visible === 'function' ? field.visible(props.model) : field.visible !== false

    if (!isVisible) continue

    if (field.group && groups.has(field.group)) {
      groups.get(field.group)!.push(field)
    } else if (field.group) {
      groups.set(field.group, [field])
    } else {
      ungrouped.push(field)
    }
  }

  const result: FieldGroup[] = []

  if (ungrouped.length) {
    result.push({ key: '__default__', fields: ungrouped })
  }

  for (const section of props.sections) {
    const fields = groups.get(section.key) || []
    const sectionData = sectionMap.value.get(section.key)
    if (fields.length) {
      result.push({ key: section.key, section: sectionData, fields })
    }
  }

  return result
})

function toggleSection(key: string) {
  collapsedSections.value[key] = !collapsedSections.value[key]
}

defineExpose({
  validate,
  reset,
  restoreValidation,
})
</script>

<template>
  <n-form
    ref="formRef"
    :model="model"
    :rules="mergedRules"
    :label-width="labelWidth"
    :label-placement="labelPlacement"
  >
    <template v-for="group in fieldGroups" :key="group.key">
      <!-- Section header -->
      <template v-if="group.section">
        <n-divider v-if="group.key !== '__default__'" />
        <div class="form-section-header">
          <div
            class="form-section-title"
            :class="{ 'form-section-title--collapsible': group.section?.collapsible }"
            @click="group.section?.collapsible && toggleSection(group.key)"
          >
            <span>{{ group.section?.title }}</span>
            <n-icon v-if="group.section?.collapsible" size="16" class="form-section-arrow">
              <ChevronDownOutline v-if="!collapsedSections[group.key]" />
              <ChevronForwardOutline v-else />
            </n-icon>
          </div>
          <p v-if="group.section?.description" class="form-section-description">
            {{ group.section?.description }}
          </p>
        </div>
      </template>

      <!-- Fields grid -->
      <n-grid
        v-show="!group.section?.collapsible || !collapsedSections[group.key]"
        :cols="cols"
        :x-gap="16"
      >
        <n-gi v-for="field in group.fields" :key="field.key" :span="field.span || 1">
          <n-form-item :label="field.label" :path="field.key">
            <!-- Icon prefix -->
            <template v-if="field.icon" #label>
              <n-icon :size="16" class="form-field-icon">
                <component :is="field.icon" />
              </n-icon>
              <span>{{ field.label }}</span>
            </template>

            <!-- Input -->
            <n-input
              v-if="!field.type || field.type === 'input'"
              :value="getStringValue(field.key)"
              :placeholder="field.placeholder || `请输入${field.label}`"
              :disabled="field.disabled || disabled"
              v-bind="field.props"
              @update:value="updateField(field.key, $event)"
            />

            <!-- Textarea -->
            <n-input
              v-else-if="field.type === 'textarea'"
              type="textarea"
              :value="getStringValue(field.key)"
              :placeholder="field.placeholder || `请输入${field.label}`"
              :disabled="field.disabled || disabled"
              v-bind="field.props"
              @update:value="updateField(field.key, $event)"
            />

            <!-- Number -->
            <n-input-number
              v-else-if="field.type === 'number'"
              :value="getNumberValue(field.key)"
              :placeholder="field.placeholder"
              :disabled="field.disabled || disabled"
              class="full-width"
              v-bind="field.props"
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
              v-bind="field.props"
              @update:value="updateField(field.key, $event)"
            />

            <!-- Switch -->
            <n-switch
              v-else-if="field.type === 'switch'"
              :value="getBooleanValue(field.key)"
              :disabled="field.disabled || disabled"
              v-bind="field.props"
              @update:value="updateField(field.key, $event)"
            />

            <!-- Radio -->
            <n-radio-group
              v-else-if="field.type === 'radio'"
              :value="getSelectValue(field.key)"
              :disabled="field.disabled || disabled"
              v-bind="field.props"
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
              v-bind="field.props"
              @update:checked="updateField(field.key, $event)"
            />

            <!-- Date -->
            <n-date-picker
              v-else-if="field.type === 'date'"
              :value="getNumberValue(field.key)"
              :disabled="field.disabled || disabled"
              class="full-width"
              v-bind="field.props"
              @update:value="updateField(field.key, $event)"
            />

            <!-- Time -->
            <n-time-picker
              v-else-if="field.type === 'time'"
              :value="getNumberValue(field.key)"
              :disabled="field.disabled || disabled"
              class="full-width"
              v-bind="field.props"
              @update:value="updateField(field.key, $event)"
            />

            <!-- Help text -->
            <div v-if="field.help" class="form-field-help">
              <n-icon :size="14"><InformationCircleOutline /></n-icon>
              <span>{{ field.help }}</span>
            </div>
          </n-form-item>
        </n-gi>
      </n-grid>
    </template>

    <!-- Action slot -->
    <slot name="action" />
  </n-form>
</template>

<style scoped>
.full-width {
  width: 100%;
}

.form-section-header {
  margin-bottom: var(--space-3);
}

.form-section-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-color-1);
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.form-section-title--collapsible {
  cursor: pointer;
}

.form-section-description {
  font-size: 13px;
  color: var(--text-color-3);
  margin-top: var(--space-1);
}

.form-field-icon {
  margin-right: var(--space-1);
  vertical-align: middle;
}

.form-field-help {
  font-size: 12px;
  color: var(--text-color-3);
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
}

@media (max-width: 767px) {
  :deep(.n-grid) {
    grid-template-columns: 1fr !important;
  }

  :deep(.n-form-item-label) {
    text-align: left;
  }
}
</style>
