import type { Meta, StoryObj } from '@storybook/vue3-vite'
import CounterButton from './CounterButton.vue'

const meta: Meta<typeof CounterButton> = {
  title: 'Atoms/CounterButton',
  component: CounterButton,
  argTypes: {
    label: { control: 'text' },
    onClick: { action: 'clicked' },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    label: 'Count is 0',
  },
}

export const HighCount: Story = {
  args: {
    label: 'Count is 999',
  },
}
