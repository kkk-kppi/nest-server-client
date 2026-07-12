import { test, expect } from '@playwright/test'

const roleOptions = [
  { label: '管理员', value: 'admin' },
  { label: '编辑者', value: 'editor' },
  { label: '查看者', value: 'viewer' },
]

async function loginAs(page: import('@playwright/test').Page, role: string) {
  await page.goto('/login')
  // 选择角色 - Naive UI 的 select 需要点击触发器打开下拉菜单
  await page.locator('.n-select').click()
  // 等待下拉菜单出现并选择选项
  // Naive UI 的下拉选项使用 .n-base-select-option__content 类
  const optionLabel = roleOptions.find((r) => r.value === role)?.label ?? ''
  await page.locator('.n-base-select-option__content', { hasText: optionLabel }).click()
  // 点击登录按钮
  await page.getByRole('button', { name: '登录' }).click()
  // 等待导航完成
  await page.waitForURL(/\/dashboard/)
}

test.describe('core flow', () => {
  test('loads login page with form', async ({ page }) => {
    await page.goto('/login')
    // Naive UI card 有两个 heading，使用 first()
    await expect(page.getByRole('heading', { name: '登录' }).first()).toBeVisible()
    await expect(page.getByText('角色')).toBeVisible()
    // 使用 exact: true 精确匹配，避免匹配到 placeholder
    await expect(page.getByText('用户名', { exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: '登录' })).toBeVisible()
  })

  test('logs in as viewer and navigates to workspace', async ({ page }) => {
    await loginAs(page, 'viewer')
    // 验证登录成功后在 dashboard
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('logs in as admin and navigates to workspace', async ({ page }) => {
    await loginAs(page, 'admin')
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('redirects unauthenticated user from /workspace to login', async ({ page }) => {
    await page.goto('/workspace')
    await expect(page).toHaveURL(/\/login/)
    await expect(page.getByRole('heading', { name: '登录' }).first()).toBeVisible()
  })

  test('redirects viewer from /admin to not-found page', async ({ page }) => {
    await loginAs(page, 'viewer')
    await page.goto('/admin')
    // viewer 没有 /admin 路由权限，访问会进入 not-found 页面
    await expect(page).toHaveURL(/\/admin/)
    await expect(page.getByText('404')).toBeVisible()
  })

  test('logs out and redirects to login', async ({ page }) => {
    await loginAs(page, 'viewer')
    // 点击用户菜单
    await page.locator('.n-avatar').click()
    // 点击退出登录
    await page.getByText('退出登录').click()
    // 验证跳转到登录页
    await expect(page).toHaveURL(/\/login/)
    await expect(page.getByRole('heading', { name: '登录' }).first()).toBeVisible()
  })
})
