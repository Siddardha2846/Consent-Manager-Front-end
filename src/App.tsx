import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AppLayout } from './layouts/AppLayout';

// Auth
import { LoginPage } from './pages/auth/LoginPage';

// Common
import ProfilePage from './pages/common/ProfilePage';
import ActivityPage from './pages/common/ActivityPage';

// Consent Manager
import CMDashboard from './pages/consent-manager/CMDashboard';
import CMOrganizations from './pages/consent-manager/CMOrganizations';
import CMOrganizationDetail from './pages/consent-manager/CMOrganizationDetail';
import CMUsers from './pages/consent-manager/CMUsers';
import CMRequests from './pages/consent-manager/CMRequests';
import { CMRequestDetail } from './pages/consent-manager/CMRequestDetail';
import CMConsentRequests from './pages/consent-manager/CMConsentRequests';
import CMConsents from './pages/consent-manager/CMConsents';
import CMConsentDetail from './pages/consent-manager/CMConsentDetail';
import CMGrants from './pages/consent-manager/CMGrants';
import CMActivity from './pages/consent-manager/CMActivity';
import CMResources from './pages/consent-manager/CMResources';
import CMSettings from './pages/consent-manager/CMSettings';

// Organization User
import OrgDashboard from './pages/organization/OrgDashboard';
import OrgRequests from './pages/organization/OrgRequests';
import CreateRequestWizard from './pages/organization/CreateRequestWizard';
import OrgRequestDetail from './pages/organization/OrgRequestDetail';
import OrgConsents from './pages/organization/OrgConsents';
import OrgConsentDetail from './pages/organization/OrgConsentDetail';
import OrgGrants from './pages/organization/OrgGrants';
import OrgHistory from './pages/organization/OrgHistory';

// Data Principal
import { DPDashboard } from './pages/principal/DPDashboard';
import { DPPending } from './pages/principal/DPPending';
import { ConsentReview } from './pages/principal/ConsentReview';
import { DPConsents } from './pages/principal/DPConsents';
import { DPConsentDetail } from './pages/principal/DPConsentDetail';
import { DPHistory } from './pages/principal/DPHistory';

// Org Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import { AdminInvitations } from './pages/admin/AdminInvitations';
import { AdminOrganization } from './pages/admin/AdminOrganization';
import AdminActivity from './pages/admin/AdminActivity';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Auth */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* App Shell */}
          <Route element={<AppLayout />}>
            {/* Common */}
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/notifications" element={<ActivityPage />} />

            {/* Consent Manager */}
            <Route path="/cm/dashboard" element={<CMDashboard />} />
            <Route path="/cm/organizations" element={<CMOrganizations />} />
            <Route path="/cm/organizations/:id" element={<CMOrganizationDetail />} />
            <Route path="/cm/users" element={<CMUsers />} />
            <Route path="/cm/requests" element={<CMRequests />} />
            <Route path="/cm/requests/:id" element={<CMRequestDetail />} />
            <Route path="/cm/consent-requests" element={<CMConsentRequests />} />
            <Route path="/cm/consents" element={<CMConsents />} />
            <Route path="/cm/consents/:id" element={<CMConsentDetail />} />
            <Route path="/cm/grants" element={<CMGrants />} />
            <Route path="/cm/activity" element={<CMActivity />} />
            <Route path="/cm/resources" element={<CMResources />} />
            <Route path="/cm/settings" element={<CMSettings />} />

            {/* Organization User */}
            <Route path="/org/dashboard" element={<OrgDashboard />} />
            <Route path="/org/requests" element={<OrgRequests />} />
            <Route path="/org/requests/new" element={<CreateRequestWizard />} />
            <Route path="/org/requests/:id" element={<OrgRequestDetail />} />
            <Route path="/org/consents" element={<OrgConsents />} />
            <Route path="/org/consents/:id" element={<OrgConsentDetail />} />
            <Route path="/org/grants" element={<OrgGrants />} />
            <Route path="/org/history" element={<OrgHistory />} />

            {/* Data Principal */}
            <Route path="/dp/dashboard" element={<DPDashboard />} />
            <Route path="/dp/pending" element={<DPPending />} />
            <Route path="/dp/review/:id" element={<ConsentReview />} />
            <Route path="/dp/consents" element={<DPConsents />} />
            <Route path="/dp/consents/:id" element={<DPConsentDetail />} />
            <Route path="/dp/history" element={<DPHistory />} />

            {/* Org Admin */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/invitations" element={<AdminInvitations />} />
            <Route path="/admin/organization" element={<AdminOrganization />} />
            <Route path="/admin/activity" element={<AdminActivity />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
