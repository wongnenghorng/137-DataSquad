import './assets/css/App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from './layouts/auth';
import AdminLayout from './layouts/admin';
import RTLLayout from './layouts/rtl';
import { ChakraProvider } from '@chakra-ui/react';
import initialTheme from './theme/theme';
import { useState } from 'react';

import { Amplify } from 'aws-amplify';
import awsExports from './aws-exports';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import AppointmentForm from 'views/admin/marketplace/components/appointment';
import DonationRecommendationList from 'views/admin/marketplace/components/donaterecommendationlist';
import Campaign from 'views/admin/campaign/Campaign'; // ✅ 确保 C 是大写
import PersonalDonation from 'views/admin/personaldonation/personaldonation';
import ManageAppointmentPage from 'views/admin/manageappoinment/manageappointment';
import CampaignDonationPage from 'views/admin/donationCampaign/donationCampaign';

Amplify.configure(awsExports);

export default function App() {
  const [currentTheme, setCurrentTheme] = useState(initialTheme);

  return (
    <ChakraProvider theme={currentTheme}>
      <Authenticator.Provider>
        <Routes>
          <Route path="auth/*" element={<AuthLayout />} />
          <Route
            path="admin/*"
            element={
              <AdminLayout theme={currentTheme} setTheme={setCurrentTheme} />
            }
          />
          <Route
            path="rtl/*"
            element={
              <RTLLayout theme={currentTheme} setTheme={setCurrentTheme} />
            }
          />
          <Route path="/" element={<Navigate to="/admin" replace />} />
        </Routes>
        <Routes>
          <Route path="appointment" element={<AppointmentForm />} />
          <Route
            path="donaterecommendationlist"
            element={<DonationRecommendationList />}
          />
          <Route path="Campain" element={<Campaign />} />
          <Route path="personaldonation" element={<PersonalDonation />} />
          <Route path="manageappointment" element={<ManageAppointmentPage />} />
          <Route path="donationcampaign" element={<CampaignDonationPage />} />
          {/* 可以继续加更多路由 */}
        </Routes>
      </Authenticator.Provider>
    </ChakraProvider>
  );
}
