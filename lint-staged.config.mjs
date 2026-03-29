export default {
  '*.{js,mjs,cjs,ts,tsx,vue}': ['eslint --fix'],
  '*.{css,scss}': ['stylelint --fix'],
  '*.{json,md,yml,yaml}': ['prettier --write'],
}
