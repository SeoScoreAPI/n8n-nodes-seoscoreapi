"use strict";
const { SeoScoreApiCredentials } = require("./credentials/SeoScoreApi.credentials");
const { nodeClass: SeoScoreApi } = require("./nodes/SeoScoreApi/SeoScoreApi.node");
module.exports = { SeoScoreApiCredentials, SeoScoreApi };
