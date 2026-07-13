module.exports = {
  extends: ['stylelint-config-standard'],
  customSyntax: 'postcss-html',
  overrides: [
    {
      files: ['**/*.vue'],
      customSyntax: 'postcss-html',
    },
  ],
  rules: {
    'selector-class-pattern': null,
    'no-descending-specificity': null,
    'color-function-alias-notation': null,
    'color-function-notation': null,
    'alpha-value-notation': null,
    'custom-property-empty-line-before': null,
    'value-keyword-case': null,
    'media-feature-range-notation': null,
    'at-rule-empty-line-before': null,
    'rule-empty-line-before': null,
  },
}
