/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createAppointment = /* GraphQL */ `
  mutation CreateAppointment(
    $input: CreateAppointmentInput!
    $condition: ModelAppointmentConditionInput
  ) {
    createAppointment(input: $input, condition: $condition) {
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
export const updateAppointment = /* GraphQL */ `
  mutation UpdateAppointment(
    $input: UpdateAppointmentInput!
    $condition: ModelAppointmentConditionInput
  ) {
    updateAppointment(input: $input, condition: $condition) {
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
export const deleteAppointment = /* GraphQL */ `
  mutation DeleteAppointment(
    $input: DeleteAppointmentInput!
    $condition: ModelAppointmentConditionInput
  ) {
    deleteAppointment(input: $input, condition: $condition) {
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
export const createProfile = /* GraphQL */ `
  mutation CreateProfile(
    $input: CreateProfileInput!
    $condition: ModelProfileConditionInput
  ) {
    createProfile(input: $input, condition: $condition) {
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
export const updateProfile = /* GraphQL */ `
  mutation UpdateProfile(
    $input: UpdateProfileInput!
    $condition: ModelProfileConditionInput
  ) {
    updateProfile(input: $input, condition: $condition) {
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
export const deleteProfile = /* GraphQL */ `
  mutation DeleteProfile(
    $input: DeleteProfileInput!
    $condition: ModelProfileConditionInput
  ) {
    deleteProfile(input: $input, condition: $condition) {
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
export const createDonation = /* GraphQL */ `
  mutation CreateDonation(
    $input: CreateDonationInput!
    $condition: ModelDonationConditionInput
  ) {
    createDonation(input: $input, condition: $condition) {
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
export const updateDonation = /* GraphQL */ `
  mutation UpdateDonation(
    $input: UpdateDonationInput!
    $condition: ModelDonationConditionInput
  ) {
    updateDonation(input: $input, condition: $condition) {
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
export const deleteDonation = /* GraphQL */ `
  mutation DeleteDonation(
    $input: DeleteDonationInput!
    $condition: ModelDonationConditionInput
  ) {
    deleteDonation(input: $input, condition: $condition) {
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
export const createCampaign = /* GraphQL */ `
  mutation CreateCampaign(
    $input: CreateCampaignInput!
    $condition: ModelCampaignConditionInput
  ) {
    createCampaign(input: $input, condition: $condition) {
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
export const updateCampaign = /* GraphQL */ `
  mutation UpdateCampaign(
    $input: UpdateCampaignInput!
    $condition: ModelCampaignConditionInput
  ) {
    updateCampaign(input: $input, condition: $condition) {
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
export const deleteCampaign = /* GraphQL */ `
  mutation DeleteCampaign(
    $input: DeleteCampaignInput!
    $condition: ModelCampaignConditionInput
  ) {
    deleteCampaign(input: $input, condition: $condition) {
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
export const createDonationCampaign = /* GraphQL */ `
  mutation CreateDonationCampaign(
    $input: CreateDonationCampaignInput!
    $condition: ModelDonationCampaignConditionInput
  ) {
    createDonationCampaign(input: $input, condition: $condition) {
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
export const updateDonationCampaign = /* GraphQL */ `
  mutation UpdateDonationCampaign(
    $input: UpdateDonationCampaignInput!
    $condition: ModelDonationCampaignConditionInput
  ) {
    updateDonationCampaign(input: $input, condition: $condition) {
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
export const deleteDonationCampaign = /* GraphQL */ `
  mutation DeleteDonationCampaign(
    $input: DeleteDonationCampaignInput!
    $condition: ModelDonationCampaignConditionInput
  ) {
    deleteDonationCampaign(input: $input, condition: $condition) {
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
export const createCampaignSpending = /* GraphQL */ `
  mutation CreateCampaignSpending(
    $input: CreateCampaignSpendingInput!
    $condition: ModelCampaignSpendingConditionInput
  ) {
    createCampaignSpending(input: $input, condition: $condition) {
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
export const updateCampaignSpending = /* GraphQL */ `
  mutation UpdateCampaignSpending(
    $input: UpdateCampaignSpendingInput!
    $condition: ModelCampaignSpendingConditionInput
  ) {
    updateCampaignSpending(input: $input, condition: $condition) {
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
export const deleteCampaignSpending = /* GraphQL */ `
  mutation DeleteCampaignSpending(
    $input: DeleteCampaignSpendingInput!
    $condition: ModelCampaignSpendingConditionInput
  ) {
    deleteCampaignSpending(input: $input, condition: $condition) {
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
