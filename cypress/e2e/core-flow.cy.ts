describe('core flow', () => {
  function loginAs(label: 'Login Viewer' | 'Login Editor' | 'Login Admin') {
    cy.visit('/')
    cy.contains('button', label).click()
  }

  it('loads home and role login buttons', () => {
    cy.visit('/')
    cy.fixture('roles').then((roles) => {
      cy.contains('button', roles.viewer).should('be.visible')
      cy.contains('button', roles.editor).should('be.visible')
      cy.contains('button', roles.admin).should('be.visible')
    })
  })

  it('logs in as viewer and paginates workspace tasks', () => {
    loginAs('Login Viewer')
    cy.contains('a', 'Go Workspace').click()

    cy.url().should('include', '/workspace')
    cy.contains('h1', 'Workspace').should('be.visible')
    cy.contains('p', 'Project: Nest Server Client').should('be.visible')
    cy.contains('p', 'Owner: lazason').should('be.visible')
    cy.contains('span', '1 / 2').should('be.visible')

    cy.contains('button', 'Next').click()
    cy.url().should('include', 'workspacePage=2')
    cy.contains('span', '2 / 2').should('be.visible')
    cy.contains('span', '补充单元测试').should('be.visible')

    cy.get('select').select('5')
    cy.url().should('include', 'workspacePage=1')
    cy.url().should('include', 'workspacePageSize=5')
    cy.contains('span', '1 / 1').should('be.visible')
  })

  it('logs in as admin and validates admin dashboard pagination', () => {
    loginAs('Login Admin')
    cy.contains('a', 'Go Admin').click()

    cy.url().should('include', '/admin')
    cy.contains('h1', 'Admin').should('be.visible')
    cy.contains('p', 'Online Users: 18').should('be.visible')
    cy.contains('p', 'Release: v0.1.0').should('be.visible')
    cy.contains('span', '1 / 2').should('be.visible')

    cy.contains('button', 'Next').click()
    cy.url().should('include', 'adminPage=2')
    cy.contains('span', '2 / 2').should('be.visible')
    cy.contains('span', 'admin - 调整权限规则').should('be.visible')
  })

  it('redirects unauthenticated user from /workspace to home', () => {
    cy.visit('/workspace')
    cy.location('pathname').should('eq', '/')
    cy.contains('button', 'Login Viewer').should('be.visible')
  })

  it('redirects viewer from /admin to forbidden page', () => {
    loginAs('Login Viewer')
    cy.visit('/admin')
    cy.location('pathname').should('eq', '/forbidden')
    cy.contains('h1', '403 Forbidden').should('be.visible')
  })

  it('intercepts protected route again after logout', () => {
    loginAs('Login Viewer')
    cy.contains('button', 'Logout').click()
    cy.visit('/workspace')
    cy.location('pathname').should('eq', '/')
    cy.contains('button', 'Login Viewer').should('be.visible')
  })

  it('backfills workspace pagination from query', () => {
    loginAs('Login Viewer')
    cy.visit('/workspace?workspacePage=2&workspacePageSize=2')
    cy.location('search').should('include', 'workspacePage=2')
    cy.location('search').should('include', 'workspacePageSize=2')
    cy.contains('span', '2 / 2').should('be.visible')
    cy.get('select').should('have.value', '2')
    cy.contains('span', '补充单元测试').should('be.visible')
  })

  it('keeps workspace pagination query after reload', () => {
    loginAs('Login Viewer')
    cy.visit('/workspace?workspacePage=2&workspacePageSize=2')
    cy.reload()
    cy.location('search').should('include', 'workspacePage=2')
    cy.location('search').should('include', 'workspacePageSize=2')
    cy.contains('span', '2 / 2').should('be.visible')
  })

  it('backfills admin pagination from query', () => {
    loginAs('Login Admin')
    cy.visit('/admin?adminPage=2&adminPageSize=2')
    cy.location('search').should('include', 'adminPage=2')
    cy.location('search').should('include', 'adminPageSize=2')
    cy.contains('span', '2 / 2').should('be.visible')
    cy.get('select').should('have.value', '2')
    cy.contains('span', 'admin - 调整权限规则').should('be.visible')
  })

  it('keeps admin pagination query after reload', () => {
    loginAs('Login Admin')
    cy.visit('/admin?adminPage=2&adminPageSize=2')
    cy.reload()
    cy.location('search').should('include', 'adminPage=2')
    cy.location('search').should('include', 'adminPageSize=2')
    cy.contains('span', '2 / 2').should('be.visible')
  })

  it('shows error message when workspace task API fails', () => {
    loginAs('Login Viewer')
    cy.visit('/workspace?workspacePage=500&workspacePageSize=2')
    cy.contains('p', '500').should('be.visible')
  })
})
