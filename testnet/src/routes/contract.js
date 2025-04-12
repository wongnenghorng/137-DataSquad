// src/routes/contract.js
const express = require("express");
const fs = require("fs");
const path = require("path");
const { ethers } = require("ethers");
require("dotenv").config();

const router = express.Router();

const factory = require("../models/deployedAddress.json");
const factoryJson = JSON.parse(
  fs.readFileSync(
    path.resolve(__dirname, "../build/DonationFactory.json"),
    "utf8"
  )
);
const campaignJson = JSON.parse(
  fs.readFileSync(
    path.resolve(__dirname, "../build/DonationCampaign.json"),
    "utf8"
  )
);

const provider = new ethers.JsonRpcProvider(process.env.ALCHEMY_API_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const factoryContract = new ethers.Contract(
  factory.address,
  factoryJson.abi,
  wallet
);

// Get deployed factory address and ABI
router.get("/", (req, res) => {
  res.json({ address: factory.address, abi: factoryJson.abi });
});

// Create a new campaign
router.post("/create", async (req, res) => {
  try {
    const { title, category, organizerName } = req.body;
    const before = await factoryContract.getDeployedCampaigns();

    const tx = await factoryContract.createCampaign(
      title,
      category,
      organizerName
    );
    await tx.wait();
    const after = await factoryContract.getDeployedCampaigns();
    const newCampaign = after[after.length - 1];

    res.json({
      message: "✅ Campaign created",
      txHash: tx.hash,
      newCampaignAddress: newCampaign,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all deployed campaign addresses
router.get("/campaigns", async (req, res) => {
  try {
    const campaigns = await factoryContract.getDeployedCampaigns();
    res.json({ count: campaigns.length, campaigns });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Record a donation to a campaign
router.post("/donate", async (req, res) => {
  try {
    const { campaignAddress, amount } = req.body;
    const contract = new ethers.Contract(
      campaignAddress,
      campaignJson.abi,
      wallet
    );

    // 🔥 Send the transaction
    const tx = await contract.recordDonation(amount);
    const receipt = await tx.wait(); // Wait for it to be mined
    console.log("✅ Status:", receipt.status); // Should be 1
    console.log("🔍 Receipt:", receipt);

    // 🔍 Check for the DonationRecorded event
    const event = receipt.logs
      .map((log) => {
        try {
          return contract.interface.parseLog(log);
        } catch (e) {
          return null;
        }
      })
      .filter((e) => e && e.name === "DonationRecorded")[0];

    if (event) {
      console.log("✅ Event emitted:", event.args);
    } else {
      console.warn("⚠️ No DonationRecorded event found in logs.");
    }

    res.json({
      message: "✅ Donation recorded",
      txHash: tx.hash,
      event: event
        ? {
            amount: event.args.amount.toString(),
            timestamp: event.args.timestamp.toString(),
          }
        : null,
    });
  } catch (err) {
    console.error("❌ Error donating:", err.message);
    res.status(500).json({ error: err.message });
  }
});

//test
// Log spending for a campaign
router.post("/spend", async (req, res) => {
  try {
    const { campaignAddress, description, amount, receiptHash } = req.body;
    const contract = new ethers.Contract(
      campaignAddress,
      campaignJson.abi,
      wallet
    );
    const tx = await contract.logSpending(description, amount, receiptHash);
    await tx.wait();
    res.json({ message: "✅ Spending logged", txHash: tx.hash });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get campaign summary info
router.get("/detail/:address", async (req, res) => {
  try {
    const address = req.params.address;
    const contract = new ethers.Contract(address, campaignJson.abi, provider);
    const title = await contract.title();
    const category = await contract.category();
    const organizer = await contract.organizerName();
    const totalDonated = await contract.totalDonated();
    const totalSpent = await contract.totalSpent();

    res.json({
      title,
      category,
      organizer,
      totalDonated: totalDonated.toString(),
      totalSpent: totalSpent.toString(),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get donation count
router.get("/donation-count/:address", async (req, res) => {
  try {
    const contract = new ethers.Contract(
      req.params.address,
      campaignJson.abi,
      provider
    );
    const count = await contract.getDonationCount();
    res.json({ count: count.toString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get spending count
router.get("/spending-count/:address", async (req, res) => {
  try {
    const contract = new ethers.Contract(
      req.params.address,
      campaignJson.abi,
      provider
    );
    const count = await contract.getSpendingCount();
    res.json({ count: count.toString() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get donation by index
router.get("/donation/:address/:index", async (req, res) => {
  try {
    const contract = new ethers.Contract(
      req.params.address,
      campaignJson.abi,
      provider
    );
    const [amount, timestamp] = await contract.getDonation(req.params.index);
    res.json({
      amount: amount.toString(),
      timestamp: timestamp.toString(),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get spending by index
router.get("/spending/:address/:index", async (req, res) => {
  try {
    const contract = new ethers.Contract(
      req.params.address,
      campaignJson.abi,
      provider
    );
    const [description, amount, timestamp, receiptHash] =
      await contract.getSpending(req.params.index);
    res.json({
      description,
      amount: amount.toString(),
      timestamp: timestamp.toString(),
      receiptHash,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/balance", async (req, res) => {
  try {
    const balance = await provider.getBalance(wallet.address);
    const ethBalance = ethers.formatEther(balance);

    res.json({
      address: wallet.address,
      balance: ethBalance + " ETH",
    });
  } catch (err) {
    console.error("❌ Error fetching balance:", err.message);
    res.status(500).json({ error: "Could not fetch wallet balance" });
  }
});
module.exports = router;
