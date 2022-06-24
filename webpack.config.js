const path = require('path');

module.exports = {
  entry: {
    layout: __dirname + "/final/public/scripts/layout.js",
    index: __dirname + "/final/public/scripts/index.js",
    viewJobs: __dirname + "/final/public/scripts/viewJobs.js"
  },
  output: {
    path: __dirname + "/final/public/packed/"
  },
  optimization: {
    minimize: false,
  }
}
