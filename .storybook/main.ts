import type { StorybookConfig } from '@storybook/vue3-vite'

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  framework: {
    name: '@storybook/vue3-vite',
    options: {},
  },
  viteFinal: (config) => {
    if (config.plugins) {
      config.plugins = (config.plugins as any[]).filter(
        (plugin: any) => !plugin?.name?.includes('bundle-budget'),
      )
    }
    return config
  },
}

export default config
