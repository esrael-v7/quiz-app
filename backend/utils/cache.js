const NodeCache = require('node-cache');
// Cache for 1 hour by default. This satisfies the "caching strategy (valcay local open source)" constraint
const myCache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });

module.exports = myCache;
