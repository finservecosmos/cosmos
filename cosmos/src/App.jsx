import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ErrorBoundary      from './frontend/components/ErrorBoundary'
import LoginPage          from './frontend/pages/LoginPage'
import Dashboard          from './frontend/pages/Dashboard'
import ClientRecordBook   from './frontend/pages/ClientRecordBook'
import AssociatesBook     from './frontend/pages/AssociatesBook'
import Payments           from './frontend/pages/Payments'
import Invoice            from './frontend/pages/Invoice'
import ProductServiceBook from './frontend/pages/ProductServiceBook'
import BackupData         from './frontend/pages/BackupData'
import ProfilePage        from './frontend/pages/ProfilePage'
import NotificationsPage  from './frontend/pages/NotificationsPage'
import NotFoundPage       from './frontend/pages/NotFoundPage'
import EnquiryStatus      from './frontend/pages/dashboard/EnquiryStatus'
import LoginFile          from './frontend/pages/dashboard/LoginFile'
import PaymentStatus      from './frontend/pages/dashboard/PaymentStatus'
import Reminders          from './frontend/pages/dashboard/Reminders'
import UserManagement     from './frontend/pages/admin/UserManagement'
import RolesAccess        from './frontend/pages/admin/RolesAccess'
import AuditLog           from './frontend/pages/admin/AuditLog'
import SystemSettings     from './frontend/pages/admin/SystemSettings'
import ProtectedRoute     from './frontend/components/ProtectedRoute'
import FinanceOverview    from './frontend/pages/FinanceOverview'
import FinanceEntry       from './frontend/pages/FinanceEntry'
import FinanceInvestment  from './frontend/pages/FinanceInvestment'

const PR = ({ roles, children }) => <ProtectedRoute allowedRoles={roles}>{children}</ProtectedRoute>

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<LoginPage />} />

          {/* Dashboard tabs */}
          <Route path="/dashboard"                  element={<PR roles={['admin','advisor','staff']}><Dashboard /></PR>} />
          <Route path="/dashboard/enquiries"        element={<PR roles={['admin','advisor','staff']}><EnquiryStatus /></PR>} />
          <Route path="/dashboard/login-file"       element={<PR roles={['admin','advisor','staff']}><LoginFile /></PR>} />
          <Route path="/dashboard/payment-status"   element={<PR roles={['admin','advisor']}><PaymentStatus /></PR>} />
          <Route path="/dashboard/reminders"        element={<PR roles={['admin','advisor','staff']}><Reminders /></PR>} />

          {/* Main pages */}
          <Route path="/clients"           element={<PR roles={['admin','advisor','staff']}><ClientRecordBook /></PR>} />
          <Route path="/associates"        element={<PR roles={['admin','advisor','staff']}><AssociatesBook /></PR>} />
          <Route path="/payments"          element={<PR roles={['admin','advisor']}><Payments /></PR>} />
           <Route path="/payments/invoice"  element={<PR roles={['admin','advisor']}><Invoice /></PR>} />
          <Route path="/payments/products" element={<PR roles={['admin','advisor']}><ProductServiceBook /></PR>} />
          <Route path="/finance/overview"  element={<PR roles={['admin','advisor','staff']}><FinanceOverview /></PR>} />
          <Route path="/finance/entry"     element={<PR roles={['admin','advisor','staff']}><FinanceEntry /></PR>} />
          <Route path="/finance/investment" element={<PR roles={['admin','advisor','staff']}><FinanceInvestment /></PR>} />
          <Route path="/backup"            element={<PR roles={['admin']}><BackupData /></PR>} />
          <Route path="/profile"           element={<PR roles={['admin','advisor','staff']}><ProfilePage /></PR>} />
          <Route path="/notifications"     element={<PR roles={['admin','advisor','staff']}><NotificationsPage /></PR>} />

          {/* Admin */}
          <Route path="/admin/users"     element={<PR roles={['admin']}><UserManagement /></PR>} />
          <Route path="/admin/roles"     element={<PR roles={['admin']}><RolesAccess /></PR>} />
          <Route path="/admin/audit-log" element={<PR roles={['admin']}><AuditLog /></PR>} />
          <Route path="/admin/settings"  element={<PR roles={['admin']}><SystemSettings /></PR>} />

          {/* Fallbacks */}
          <Route path="/unauthorized" element={<div style={{ padding: 40, fontFamily: 'system-ui', color: '#c0392b', fontSize: 18 }}>Access denied.</div>} />
          <Route path="*"             element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
