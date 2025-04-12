const express = require("express");
const router = express.Router();
const compiledDonation = require("../build/Donation.json");
const deployAddressModel = require("../models/deployedAddress");

router.get("/", async (req, res) => {
  try {
    const result = deployAddressModel.latest();
    return res.json({
      address: result.address,
      donation: {
        abi: compiledDonation.abi,
      },
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Could not fetch contract info" });
  }
});

module.exports = router;
