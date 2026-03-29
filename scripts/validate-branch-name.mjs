const allowedPatterns = [
  /^(main|master|develop)$/,
  /^release\/[a-z0-9._-]+$/,
  /^(feature|fix|hotfix|chore|refactor|docs|test)\/[a-z0-9._-]+$/,
]

const branchName = process.env.BRANCH_NAME

if (!branchName) {
  console.error('BRANCH_NAME is required')
  process.exit(1)
}

const isValid = allowedPatterns.some((pattern) => pattern.test(branchName))

if (!isValid) {
  console.error(`Invalid branch name: ${branchName}`)
  console.error(
    'Expected: main|master|develop|release/*|feature/*|fix/*|hotfix/*|chore/*|refactor/*|docs/*|test/*',
  )
  process.exit(1)
}

console.log(`Branch name valid: ${branchName}`)
