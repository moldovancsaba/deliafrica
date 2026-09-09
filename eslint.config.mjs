import gdsConfig from '@sovereignsquad/gds-eslint-config';
export default [
 {ignores:['node_modules/**','.next/**','test-results/**','playwright-report/**']},
 ...gdsConfig,
 {files:['app/**/*.js'],languageOptions:{ecmaVersion:'latest',sourceType:'module',parserOptions:{ecmaFeatures:{jsx:true}}}},
];
