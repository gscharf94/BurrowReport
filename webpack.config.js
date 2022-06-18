const path = require('path');

module.exports = {
  entry: {
    testing: __dirname + "/final/public/scripts/testing.js",
  },
  output: {
    path: __dirname + "/final/public/packed/"
  },
  optimization: {
    minimize: false,
  }
}
