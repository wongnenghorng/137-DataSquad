/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateAppointment = /* GraphQL */ `
  subscription OnCreateAppointment(
    $filter: ModelSubscriptionAppointmentFilterInput
  ) {
    onCreateAppointment(filter: $filter) {
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
export const onUpdateAppointment = /* GraphQL */ `
  subscription OnUpdateAppointment(
    $filter: ModelSubscriptionAppointmentFilterInput
  ) {
    onUpdateAppointment(filter: $filter) {
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
export const onDeleteAppointment = /* GraphQL */ `
  subscription OnDeleteAppointment(
    $filter: ModelSubscriptionAppointmentFilterInput
  ) {
    onDeleteAppointment(filter: $filter) {
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
export const onCreateProfile = /* GraphQL */ `
  subscription OnCreateProfile($filter: ModelSubscriptionProfileFilterInput) {
    onCreateProfile(filter: $filter) {
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
export const onUpdateProfile = /* GraphQL */ `
  subscription OnUpdateProfile($filter: ModelSubscriptionProfileFilterInput) {
    onUpdateProfile(filter: $filter) {
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
export const onDeleteProfile = /* GraphQL */ `
  subscription OnDeleteProfile($filter: ModelSubscriptionProfileFilterInput) {
    onDeleteProfile(filter: $filter) {
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
export const onCreateDonation = /* GraphQL */ `
  subscription OnCreateDonation($filter: ModelSubscriptionDonationFilterInput) {
    onCreateDonation(filter: $filter) {
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
export const onUpdateDonation = /* GraphQL */ `
  subscription OnUpdateDonation($filter: ModelSubscriptionDonationFilterInput) {
    onUpdateDonation(filter: $filter) {
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
export const onDeleteDonation = /* GraphQL */ `
  subscription OnDeleteDonation($filter: ModelSubscriptionDonationFilterInput) {
    onDeleteDonation(filter: $filter) {
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
export const onCreateCampaign = /* GraphQL */ `
  subscription OnCreateCampaign($filter: ModelSubscriptionCampaignFilterInput) {
    onCreateCampaign(filter: $filter) {
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
export const onUpdateCampaign = /* GraphQL */ `
  subscription OnUpdateCampaign($filter: ModelSubscriptionCampaignFilterInput) {
    onUpdateCampaign(filter: $filter) {
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
export const onDeleteCampaign = /* GraphQL */ `
  subscription OnDeleteCampaign($filter: ModelSubscriptionCampaignFilterInput) {
    onDeleteCampaign(filter: $filter) {
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
export const onCreateDonationCampaign = /* GraphQL */ `
  subscription OnCreateDonationCampaign(
    $filter: ModelSubscriptionDonationCampaignFilterInput
  ) {
    onCreateDonationCampaign(filter: $filter) {
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
export const onUpdateDonationCampaign = /* GraphQL */ `
  subscription OnUpdateDonationCampaign(
    $filter: ModelSubscriptionDonationCampaignFilterInput
  ) {
    onUpdateDonationCampaign(filter: $filter) {
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
export const onDeleteDonationCampaign = /* GraphQL */ `
  subscription OnDeleteDonationCampaign(
    $filter: ModelSubscriptionDonationCampaignFilterInput
  ) {
    onDeleteDonationCampaign(filter: $filter) {
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
export const onCreateCampaignSpending = /* GraphQL */ `
  subscription OnCreateCampaignSpending(
    $filter: ModelSubscriptionCampaignSpendingFilterInput
  ) {
    onCreateCampaignSpending(filter: $filter) {
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
export const onUpdateCampaignSpending = /* GraphQL */ `
  subscription OnUpdateCampaignSpending(
    $filter: ModelSubscriptionCampaignSpendingFilterInput
  ) {
    onUpdateCampaignSpending(filter: $filter) {
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
export const onDeleteCampaignSpending = /* GraphQL */ `
  subscription OnDeleteCampaignSpending(
    $filter: ModelSubscriptionCampaignSpendingFilterInput
  ) {
    onDeleteCampaignSpending(filter: $filter) {
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
