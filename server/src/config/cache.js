const NodeCache = require("node-cache");

// Cache with default TTL of 5 minutes
const cache = new NodeCache({ stdTTL: 300, checkperiod: 600 });

module.exports = cache;
