import React from 'react';
import { Icon } from '@chakra-ui/react';
import {
  MdBarChart,
  MdPerson,
  MdHome,
  MdLock,
  MdOutlineShoppingCart,
} from 'react-icons/md';

// Admin Imports
import MainDashboard from 'views/admin/default';
import AppointmentForm from 'views/admin/marketplace/components/appointment';
import RTL from 'views/admin/rtl';
import DonationRecommendationList from 'views/admin/marketplace/components/donaterecommendationlist';
import Campaign from 'views/admin/campaign/Campaign'; // ✅ 确保 C 是大写

// Auth Imports
import SignInCentered from 'views/auth/signIn';
import PersonalDonation from 'views/admin/personaldonation/personaldonation';
import ManageAppointmentPage from 'views/admin/manageappoinment/manageappointment';
import CampaignDonationPage from 'views/admin/donationCampaign/donationCampaign';

const routes = [
  {
    name: 'Main Dashboard',
    layout: '/admin',
    path: '/default',
    icon: <Icon as={MdHome} width="20px" height="20px" color="inherit" />,
    component: <MainDashboard />,
  },
  {
    name: 'Donation Request',
    layout: '/admin',
    path: '/appointment',
    icon: (
      <Icon
        as={MdOutlineShoppingCart}
        width="20px"
        height="20px"
        color="inherit"
      />
    ),
    component: <AppointmentForm />,
    secondary: true,
  },
  {
    name: 'Manage Appointment (Admin)',
    layout: '/admin',
    icon: <Icon as={MdBarChart} width="20px" height="20px" color="inherit" />,
    path: '/manageappointment',
    component: <ManageAppointmentPage />,
  },

  {
    name: 'Personal Donation',
    layout: '/admin',
    path: '/donaterecommendationlist',
    icon: <Icon as={MdPerson} width="20px" height="20px" color="inherit" />,
    component: <DonationRecommendationList />,
  },
  {
    name: 'Personal Donation Transaction List',
    layout: '/admin',
    path: '/personaldonation',
    icon: <Icon as={MdPerson} width="20px" height="20px" color="inherit" />,
    component: <PersonalDonation />,
  },
  {
    name: 'Campaign', // ✅ 新增项
    layout: '/admin',
    path: '/campaign',
    icon: <Icon as={MdPerson} width="20px" height="20px" color="inherit" />,
    component: <Campaign />,
  },
  {
    name: 'Campaign Donation', // ✅ 新增项
    layout: '/admin',
    path: '/donationcampaign',
    icon: <Icon as={MdPerson} width="20px" height="20px" color="inherit" />,
    component: <CampaignDonationPage />,
  },
];

export default routes;
