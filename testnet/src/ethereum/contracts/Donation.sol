// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @title DonationFactory - Deploys donation campaign contracts
contract DonationFactory {
    address[] public deployedCampaigns;

    /// Deploys a new campaign contract and saves its address
    function createCampaign(
        string memory _title,
        string memory _category,
        string memory _organizerName
    ) public {
        DonationCampaign newCampaign = new DonationCampaign(
            _title,
            _category,
            _organizerName
        );
        deployedCampaigns.push(address(newCampaign));
    }

    /// Returns all campaign addresses
    function getDeployedCampaigns() public view returns (address[] memory) {
        return deployedCampaigns;
    }
}

/// @title DonationCampaign - Records donations and spending for a single campaign
contract DonationCampaign {
    struct Donation {
        uint amount;
        uint timestamp;
    }

    struct Spending {
        string description;
        uint amount;
        uint timestamp;
        string receiptHash; // Optional IPFS link or file hash
    }

    string public title;
    string public category;       // e.g., Zakat, Waqf, General
    string public organizerName;  // NGO or institution name

    Donation[] public donations;
    Spending[] public spendings;
    uint public totalDonated;
    uint public totalSpent;
    event DonationRecorded(uint amount, uint timestamp);


    /// Initializes the campaign
    constructor(
        string memory _title,
        string memory _category,
        string memory _organizerName
    ) {
        title = _title;
        category = _category;
        organizerName = _organizerName;
    }

    /// Backend records a donation (from traditional payment)
    function recordDonation(uint _amount) public {
        donations.push(
            Donation({
                amount: _amount,
                timestamp: block.timestamp
            })
        );
        totalDonated += _amount;
        emit DonationRecorded(_amount, block.timestamp);
    }

    /// Organizer records spending
    function logSpending(
        string memory _description,
        uint _amount,
        string memory _receiptHash
    ) public {
        spendings.push(
            Spending({
                description: _description,
                amount: _amount,
                timestamp: block.timestamp,
                receiptHash: _receiptHash
            })
        );
        totalSpent += _amount;
    }

    // ===== Read-only helper functions =====

    function getDonationCount() public view returns (uint) {
        return donations.length;
    }

    function getSpendingCount() public view returns (uint) {
        return spendings.length;
    }

    function getDonation(uint index)
        public
        view
        returns (uint amount, uint timestamp)
    {
        Donation memory d = donations[index];
        return (d.amount, d.timestamp);
    }

    function getSpending(uint index)
        public
        view
        returns (string memory description, uint amount, uint timestamp, string memory receiptHash)
    {
        Spending memory s = spendings[index];
        return (s.description, s.amount, s.timestamp, s.receiptHash);
    }
}
