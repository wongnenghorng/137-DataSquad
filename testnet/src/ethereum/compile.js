const path = require("path");
const fs = require("fs-extra");
const solc = require("solc");

const contractPath = path.resolve(__dirname, "contracts", "Donation.sol"); // lowercase 'd'
const source = fs.readFileSync(contractPath, "utf8");

const input = {
  language: "Solidity",
  sources: {
    "Donation.sol": {
      content: source,
    },
  },
  settings: {
    outputSelection: {
      "*": {
        "*": ["*"],
      },
    },
  },
};

const output = JSON.parse(solc.compile(JSON.stringify(input)));
const buildPath = path.resolve(__dirname, "../build");

fs.removeSync(buildPath);
fs.ensureDirSync(buildPath);

for (let contractName in output.contracts["Donation.sol"]) {
  fs.outputJsonSync(
    path.resolve(buildPath, `${contractName}.json`),
    output.contracts["Donation.sol"][contractName]
  );
}
