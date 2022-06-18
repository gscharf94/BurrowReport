const path = require('path');

module.exports = {
  entry: {
    layout: __dirname + "/final/public/scripts/layout.js",
    index: __dirname + "/final/public/scripts/index.js",
  },
  output: {
    path: __dirname + "/final/public/packed/"
  },
  optimization: {
    minimize: false,
  }
}
