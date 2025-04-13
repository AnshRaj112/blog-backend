const { predefinedTags } = require("../utils/predefinedTags.js");

const getTags = (req, res) => {
  res.json(predefinedTags);
};

module.exports = { getTags };
