import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ErrorBoundary      from './shared/ui/ErrorBoundary'
import ProtectedRoute     from './app/providers/ProtectedRoute'

const LoginPage          = lazy(() => import('./pages/LoginPage'))
const Dashboard          = lazy(() => import('./pages/dashboard/Dashboard'))
const ClientRecordBook   = lazy(() => import('./pages/ClientRecordBook'))
const AssociatesBook     = lazy(() => import('./pages/AssociatesBook'))
const Payments           = lazy(() => import('./pages/Payments'))
const Invoice            = lazy(() => import('./pages/Invoice'))
const BackupData         = lazy(() => import('./pages/BackupData'))
const ProfilePage        = lazy(() => import('./pages/ProfilePage'))
const NotFoundPage       = lazy(() => import('./pages/NotFoundPage'))
const EnquiryStatus      = lazy(() => import('./pages/dashboard/EnquiryStatus'))
const LoginFile          = lazy(() => import('./pages/dashboard/LoginFile'))
const PaymentStatus      = lazy(() => import('./pages/dashboard/PaymentStatus'))
const Reminders          = lazy(() => import('./pages/dashboard/Reminders'))
const UserManagement     = lazy(() => import('./pages/admin/UserManagement'))
const RolesAccess        = lazy(() => import('./pages/admin/RolesAccess'))
const AuditLog           = lazy(() => import('./pages/admin/AuditLog'))
const SystemSettings     = lazy(() => import('./pages/admin/SystemSettings'))
const AdminSettingsHub   = lazy(() => import('./pages/admin/AdminSettingsHub'))
const FinanceOverview    = lazy(() => import('./pages/finance/FinanceOverview'))
const FinanceEntry       = lazy(() => import('./pages/finance/FinanceEntry'))
const FinanceInvestment  = lazy(() => import('./pages/finance/FinanceInvestment'))
const FinanceIncomeExpenses = lazy(() => import('./pages/finance/FinanceIncomeExpenses'))
const FinanceInvoice     = lazy(() => import('./pages/finance/FinanceInvoice'))

const PR = ({ roles, children }) => <ProtectedRoute allowedRoles={roles}>{children}</ProtectedRoute>

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', flexDirection: 'column', gap: 12 }}>
            <div className="spinner" style={{ width: 40, height: 40, border: '4px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <p style={{ color: 'var(--text-secondary)', fontFamily: 'system-ui', fontSize: 14, fontWeight: 600 }}>Loading page...</p>
          </div>
        }>
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
            <Route path="/finance/overview"  element={<PR roles={['admin','advisor','staff']}><FinanceOverview /></PR>} />
            <Route path="/finance/entry"     element={<PR roles={['admin','advisor','staff']}><FinanceEntry /></PR>} />
            <Route path="/finance/investment" element={<PR roles={['admin','advisor','staff']}><FinanceInvestment /></PR>} />
            <Route path="/finance/income-expenses" element={<PR roles={['admin','advisor','staff']}><FinanceIncomeExpenses /></PR>} />
            <Route path="/finance/invoice"   element={<PR roles={['admin','advisor','staff']}><FinanceInvoice /></PR>} />
            <Route path="/backup"            element={<PR roles={['admin']}><BackupData /></PR>} />
            <Route path="/profile"           element={<PR roles={['admin','advisor','staff']}><ProfilePage /></PR>} />

            {/* Admin */}
            <Route path="/admin"           element={<PR roles={['admin']}><AdminSettingsHub /></PR>} />
            <Route path="/admin/users"     element={<PR roles={['admin']}><UserManagement /></PR>} />
            <Route path="/admin/roles"     element={<PR roles={['admin']}><RolesAccess /></PR>} />
            <Route path="/admin/audit-log" element={<PR roles={['admin']}><AuditLog /></PR>} />
            <Route path="/admin/settings"  element={<PR roles={['admin']}><SystemSettings /></PR>} />

            {/* Fallbacks */}
            <Route path="/unauthorized" element={<div style={{ padding: 40, fontFamily: 'system-ui', color: '#c0392b', fontSize: 18 }}>Access denied.</div>} />
            <Route path="*"             element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
