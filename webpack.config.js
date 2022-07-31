const path = require('path');

module.exports = {
  entry: {
    layout: __dirname + "/final/public/scripts/layout.js",
    index: __dirname + "/final/public/scripts/index.js",
    viewJobs: __dirname + "/final/public/scripts/viewJobs.js",
    inputProduction: __dirname + "/final/public/scripts/inputProduction.js",
    viewTickets: __dirname + "/final/public/scripts/viewTickets.js",
    viewProduction: __dirname + "/final/public/scripts/viewProduction.js",
    adminPage: __dirname + "/final/public/scripts/adminPage.js"
  },
  output: {
    path: __dirname + "/final/public/packed/"
  },
  optimization: {
    minimize: false,
  }
}
