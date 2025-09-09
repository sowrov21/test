module.exports = {
  extends: 'airbnb-base',
  rules: {
    // 'linebreak-style': 0,
    'no-underscore-dangle': 0,
    'no-param-reassign': 0,
    'import/no-unresolved': [2, { ignore: ['fabric'] }],
    'prefer-destructuring': ['error', { object: true, array: false }],
    'no-console': ['warn', { allow: ['warn', 'error', 'log'] }],
    'function-paren-newline': ['off'],
    'function-call-argument-newline': ['off'],
    'no-restricted-exports': ['off'],
    'no-use-before-define': ['error', { functions: false, classes: false }],
    'object-curly-newline': 'off',
    'linebreak-style': 'off',
  },
  env: {
    browser: true,
  },
};
