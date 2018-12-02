require('babel-polyfill');
require('@babel/register')({
  presets: ['@babel/env'],
  plugins: [
    '@babel/plugin-proposal-optional-chaining',
    '@babel/plugin-proposal-object-rest-spread'
  ]
});
require('dotenv').config();
require('./src/server').default();
