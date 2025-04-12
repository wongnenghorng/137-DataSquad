require("dotenv").config();
const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

const contractJson = JSON.parse(
  fs.readFileSync(
    path.resolve(__dirname, "../build/DonationFactory.json"),
    "utf8"
  )
);
const abi = contractJson.abi;
const bytecode = contractJson.evm.bytecode.object;

const provider = new ethers.JsonRpcProvider(process.env.ALCHEMY_API_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const deploy = async () => {
  try {
    const factory = new ethers.ContractFactory(abi, bytecode, wallet);

    // ✅ Factory has no constructor arguments
    const contract = await factory.deploy();
    await contract.waitForDeployment();

    const contractAddress = await contract.getAddress();
    console.log("✅ Factory deployed to:", contractAddress);

    // Save deployed address to file
    fs.writeFileSync(
      path.resolve(__dirname, "../models/deployedAddress.json"),
      JSON.stringify(
        {
          address: contractAddress,
          created_at: new Date().toISOString(),
        },
        null,
        2
      )
    );
  } catch (err) {
    console.error("Deployment failed:", err);
  }
};

deploy();
