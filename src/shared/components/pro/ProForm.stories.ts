import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import { NButton, NSpace } from 'naive-ui'
import ProForm from './ProForm.vue'

const meta: Meta<typeof ProForm> = {
  title: 'Pro/ProForm',
  component: ProForm,
  argTypes: {
    labelWidth: { control: 'number' },
    labelPlacement: { control: 'select', options: ['left', 'top'] },
    cols: { control: 'number' },
    disabled: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof meta>

const basicFields = [
  { key: 'name', label: '姓名', placeholder: '请输入姓名' },
  { key: 'email', label: '邮箱', placeholder: '请输入邮箱' },
  { key: 'phone', label: '手机号', placeholder: '请输入手机号' },
]

export const Default: Story = {
  render: (args) => ({
    components: { ProForm, NButton, NSpace },
    setup() {
      const model = ref({ name: '', email: '', phone: '' })
      return { args, model }
    },
    template: `
      <ProForm v-bind="args" :fields="fields" v-model:model="model">
        <template #action>
          <n-space>
            <n-button type="primary">提交</n-button>
            <n-button>重置</n-button>
          </n-space>
        </template>
      </ProForm>
    `,
    data() {
      return {
        fields: basicFields,
      }
    },
  }),
  args: {
    labelWidth: 80,
    labelPlacement: 'left',
    cols: 1,
    disabled: false,
  },
}

export const MultiColumn: Story = {
  render: (args) => ({
    components: { ProForm, NButton, NSpace },
    setup() {
      const model = ref({ name: '', email: '', phone: '', address: '' })
      const fields = [
        { key: 'name', label: '姓名', placeholder: '请输入姓名' },
        { key: 'email', label: '邮箱', placeholder: '请输入邮箱' },
        { key: 'phone', label: '手机号', placeholder: '请输入手机号' },
        { key: 'address', label: '地址', placeholder: '请输入地址', span: 2 },
      ]
      return { args, model, fields }
    },
    template: `
      <ProForm v-bind="args" :fields="fields" v-model:model="model">
        <template #action>
          <n-space>
            <n-button type="primary">提交</n-button>
            <n-button>重置</n-button>
          </n-space>
        </template>
      </ProForm>
    `,
  }),
  args: {
    labelWidth: 80,
    labelPlacement: 'left',
    cols: 2,
    disabled: false,
  },
}

export const WithSelectAndSwitch: Story = {
  render: (args) => ({
    components: { ProForm, NButton, NSpace },
    setup() {
      const model = ref({ role: '', status: false })
      const fields = [
        {
          key: 'role',
          label: '角色',
          type: 'select' as const,
          options: [
            { label: '管理员', value: 'admin' },
            { label: '编辑者', value: 'editor' },
            { label: '查看者', value: 'viewer' },
          ],
        },
        { key: 'status', label: '启用', type: 'switch' as const },
      ]
      return { args, model, fields }
    },
    template: `
      <ProForm v-bind="args" :fields="fields" v-model:model="model">
        <template #action>
          <n-space>
            <n-button type="primary">提交</n-button>
            <n-button>重置</n-button>
          </n-space>
        </template>
      </ProForm>
    `,
  }),
  args: {
    labelWidth: 80,
    labelPlacement: 'left',
    cols: 1,
    disabled: false,
  },
}

export const Disabled: Story = {
  render: (args) => ({
    components: { ProForm },
    setup() {
      const model = ref({ name: '张三', email: 'zhangsan@example.com', phone: '13800000001' })
      return { args, model }
    },
    template: `<ProForm v-bind="args" :fields="fields" v-model:model="model" />`,
    data() {
      return {
        fields: basicFields,
      }
    },
  }),
  args: {
    labelWidth: 80,
    labelPlacement: 'left',
    cols: 1,
    disabled: true,
  },
}

export const WithValidation: Story = {
  render: (args) => ({
    components: { ProForm, NButton, NSpace },
    setup() {
      const model = ref({ name: '', email: '' })
      const fields = [
        { key: 'name', label: '姓名', placeholder: '请输入姓名', required: true },
        { key: 'email', label: '邮箱', placeholder: '请输入邮箱', required: true },
      ]
      const rules = {
        name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { type: 'email' as const, message: '请输入正确的邮箱格式', trigger: 'blur' },
        ],
      }
      return { args, model, fields, rules }
    },
    template: `
      <ProForm v-bind="args" :fields="fields" :rules="rules" v-model:model="model">
        <template #action>
          <n-space>
            <n-button type="primary">提交</n-button>
            <n-button>重置</n-button>
          </n-space>
        </template>
      </ProForm>
    `,
  }),
  args: {
    labelWidth: 80,
    labelPlacement: 'left',
    cols: 1,
    disabled: false,
  },
}
