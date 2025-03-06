module.exports = {
    extends: [
      'stylelint-config-standard',
      'stylelint-config-recommended-scss',
    ],
    plugins: ['stylelint-scss'],
    rules: {
      'at-rule-no-unknown': null,
      'scss/at-rule-no-unknown': true,
    },
  };