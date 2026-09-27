const { join } = require('path');

/** @type {import('puppeteer').Configuration} */
module.exports = {
  // Chrome'un bulut sunucusunda nereye kurulacağını söyler
  cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
};