const { resolve } = require("path");

module.exports = dirname => (...pathSegments) => 
  resolve(dirname, ...pathSegments)