module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  parserOptions: {
    parser: 'babel-eslint'
  },
  extends: [
    '@nuxtjs',
    'plugin:nuxt/recommended'
  ],
  rules: {
    'vue/no-v-html': 'off',
    'nuxt/no-cjs-in-config': 'off',
    'camelcase': 'off',
    'space-before-function-paren': ['warn', 'never']
  },
  globals: {
    _: true
  }
}
