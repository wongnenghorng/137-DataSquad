/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getAppointment = /* GraphQL */ `
  query GetAppointment($id: ID!) {
    getAppointment(id: $id) {
      id
      name
      ic
      age
      householdIncome
      householdSize
      isOku
      evidencePhoto
      amountNeeded
      purpose
      totalReceipt
      status
      email
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listAppointments = /* GraphQL */ `
  query ListAppointments(
    $filter: ModelAppointmentFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listAppointments(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
        ic
        age
        householdIncome
        householdSize
        isOku
        evidencePhoto
        amountNeeded
        purpose
        totalReceipt
        status
        email
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getProfile = /* GraphQL */ `
  query GetProfile($id: ID!) {
    getProfile(id: $id) {
      id
      name
      phoneNumber
      email
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listProfiles = /* GraphQL */ `
  query ListProfiles(
    $filter: ModelProfileFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listProfiles(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        name
        phoneNumber
        email
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getDonation = /* GraphQL */ `
  query GetDonation($id: ID!) {
    getDonation(id: $id) {
      id
      DonorName
      DonateAmount
      ReceiverName
      email
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listDonations = /* GraphQL */ `
  query ListDonations(
    $filter: ModelDonationFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listDonations(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        DonorName
        DonateAmount
        ReceiverName
        email
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getCampaign = /* GraphQL */ `
  query GetCampaign($id: ID!) {
    getCampaign(id: $id) {
      id
      organizerName
      title
      description
      category
      contractAddress
      status
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listCampaigns = /* GraphQL */ `
  query ListCampaigns(
    $filter: ModelCampaignFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listCampaigns(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        organizerName
        title
        description
        category
        contractAddress
        status
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getDonationCampaign = /* GraphQL */ `
  query GetDonationCampaign($id: ID!) {
    getDonationCampaign(id: $id) {
      id
      title
      donorName
      donateAmount
      contractAddress
      paymentId
      tx_hash
      blockchainTime
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listDonationCampaigns = /* GraphQL */ `
  query ListDonationCampaigns(
    $filter: ModelDonationCampaignFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listDonationCampaigns(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        title
        donorName
        donateAmount
        contractAddress
        paymentId
        tx_hash
        blockchainTime
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getCampaignSpending = /* GraphQL */ `
  query GetCampaignSpending($id: ID!) {
    getCampaignSpending(id: $id) {
      id
      spendPeopleName
      campaignName
      description
      spendAmount
      receiptPic
      contractAddress
      tx_hash
      blockchainTime
      createdAt
      updatedAt
      __typename
    }
  }
`;
export const listCampaignSpendings = /* GraphQL */ `
  query ListCampaignSpendings(
    $filter: ModelCampaignSpendingFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listCampaignSpendings(
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        spendPeopleName
        campaignName
        description
        spendAmount
        receiptPic
        contractAddress
        tx_hash
        blockchainTime
        createdAt
        updatedAt
        __typename
      }
      nextToken
      __typename
    }
  }
`;
