const fs = require("fs");
const path = require("path");

const latest = () => {
  const filePath = path.resolve(__dirname, "deployedAddress.json");
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw);
};

module.exports = { latest };
