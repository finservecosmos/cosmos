import React from 'react';

const MAJOR_LOCATIONS = [
  'Mumbai, MH', 'Delhi NCR', 'Bengaluru, KA', 'Kolkata, WB', 
  'Chennai, TN', 'Hyderabad, TG', 'Pune, MH', 'Ahmedabad, GJ',
  'Jaipur, RJ', 'Lucknow, UP', 'Indore, MP', 'Kochi, KL', 'Patna, BR'
];

export function HybridLocationPicker({ value, onChange, disabled }) {
  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <input
        type="text"
        list="indian-major-cities"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="Type custom or choose major city..."
        style={{ width: '100%' }}
      />
      <datalist id="indian-major-cities">
        {MAJOR_LOCATIONS.map((loc) => (
          <option key={loc} value={loc} />
        ))}
      </datalist>
    </div>
  );
}

export default function ClientOnboardingForm({
  formData,
  setFormData,
  validationErrors,
  setValidationErrors,
  handleStartScan,
  mode = 'wizard', // 'wizard' | 'modal'
  wizardStep = 1,
  modalMode = 'add', // 'add' | 'edit' | 'view'
  revealPAN,
  setRevealPAN,
  revealAadhaar,
  setRevealAadhaar,
  currentUser,
  addToast,
  maskPAN,
  maskAadhaar,
  LOAN_TYPES,
  STATUSES
}) {
  const disabled = modalMode === 'view';

  const updateField = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const renderPersonalDetails = () => (
    <div className="form-grid">
      <label>
        Client Name *
        <input 
          type="text" 
          placeholder="Full Name"
          className={validationErrors.name ? 'error' : ''}
          value={formData.name || ''} 
          disabled={disabled}
          onChange={(e) => updateField('name', e.target.value)} 
        />
        {validationErrors.name && <span className="form-error">{validationErrors.name}</span>}
      </label>
      <label>
        Phone Number *
        <input 
          type="text" 
          placeholder="Mobile Number" 
          className={validationErrors.phone ? 'error' : ''}
          value={formData.phone || ''} 
          disabled={disabled}
          onChange={(e) => updateField('phone', e.target.value)} 
        />
        {validationErrors.phone && <span className="form-error">{validationErrors.phone}</span>}
      </label>
      <label className="form-grid-full">
        Email Address
        <input 
          type="email" 
          placeholder="client@email.com" 
          className={validationErrors.email ? 'error' : ''}
          value={formData.email || ''} 
          disabled={disabled}
          onChange={(e) => updateField('email', e.target.value)} 
        />
        {validationErrors.email && <span className="form-error">{validationErrors.email}</span>}
      </label>
    </div>
  );

  const renderKycProfile = () => (
    <div className="form-grid">
      <label>
        <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          PAN Card Number *
          {mode === 'wizard' && (
            <button type="button" className="scanner-trigger-btn" onClick={() => handleStartScan('pan')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12 }}>
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              Scan Card
            </button>
          )}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
          <input 
            type="text" 
            placeholder="ABCDE1234F" 
            className={validationErrors.pan_card ? 'error' : ''}
            value={
              disabled
                ? (revealPAN ? (formData.pan_card || '') : maskPAN(formData.pan_card))
                : (formData.pan_card || '')
            } 
            disabled={disabled}
            onChange={(e) => updateField('pan_card', e.target.value.toUpperCase())} 
            style={{ flex: 1 }}
          />
          {disabled && (
            <button
              type="button"
              onClick={() => {
                if (currentUser?.role === 'admin' || currentUser?.role === 'advisor') {
                  setRevealPAN(!revealPAN);
                } else {
                  addToast('Access Denied: Only Admins and Advisors can view sensitive details.', 'error');
                }
              }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title={revealPAN ? "Hide sensitive details" : "Reveal sensitive details"}
            >
              {revealPAN ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              )}
            </button>
          )}
        </div>
        {validationErrors.pan_card && <span className="form-error">{validationErrors.pan_card}</span>}
      </label>

      <label>
        <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          Aadhaar Number *
          {mode === 'wizard' && (
            <button type="button" className="scanner-trigger-btn" onClick={() => handleStartScan('aadhaar')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12 }}>
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              Scan Card
            </button>
          )}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
          <input 
            type="text" 
            placeholder="12-digit Aadhaar number" 
            className={validationErrors.aadhaar_number ? 'error' : ''}
            value={
              disabled
                ? (revealAadhaar ? (formData.aadhaar_number || '') : maskAadhaar(formData.aadhaar_number))
                : (formData.aadhaar_number || '')
            } 
            disabled={disabled}
            onChange={(e) => updateField('aadhaar_number', e.target.value)} 
            style={{ flex: 1 }}
          />
          {disabled && (
            <button
              type="button"
              onClick={() => {
                if (currentUser?.role === 'admin' || currentUser?.role === 'advisor') {
                  setRevealAadhaar(!revealAadhaar);
                } else {
                  addToast('Access Denied: Only Admins and Advisors can view sensitive details.', 'error');
                }
              }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title={revealAadhaar ? "Hide sensitive details" : "Reveal sensitive details"}
            >
              {revealAadhaar ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              )}
            </button>
          )}
        </div>
        {validationErrors.aadhaar_number && <span className="form-error">{validationErrors.aadhaar_number}</span>}
      </label>

      <label>
        Residential Status
        <select 
          value={formData.residential_status || 'Resident Indian'} 
          disabled={disabled}
          onChange={(e) => updateField('residential_status', e.target.value)}
        >
          <option value="Resident Indian">Resident Indian</option>
          <option value="NRI">NRI</option>
          <option value="PIO">PIO</option>
          <option value="Foreign National">Foreign National</option>
        </select>
      </label>

      <label>
        Location / City *
        <div className={validationErrors.location ? 'error' : ''}>
          <HybridLocationPicker 
            value={formData.location || ''} 
            disabled={disabled}
            onChange={(value) => updateField('location', value)} 
          />
        </div>
        {validationErrors.location && <span className="form-error">{validationErrors.location}</span>}
      </label>
    </div>
  );

  const renderFinancialProfile = () => (
    <div className="form-grid">
      <label>
        Employment Status
        <select 
          value={formData.employment_status || 'Salaried'} 
          disabled={disabled}
          onChange={(e) => updateField('employment_status', e.target.value)}
        >
          <option value="Salaried">Salaried</option>
          <option value="Self-Employed">Self-Employed</option>
          <option value="Professional">Professional</option>
          <option value="Business Owner">Business Owner</option>
          <option value="Retired">Retired</option>
        </select>
      </label>
      <label>
        Monthly Net Income (₹)
        <input 
          type="number" 
          min="0" 
          placeholder="Monthly Take Home" 
          className={validationErrors.monthly_net_income ? 'error' : ''}
          value={formData.monthly_net_income || ''} 
          disabled={disabled}
          onChange={(e) => updateField('monthly_net_income', e.target.value)} 
        />
        {validationErrors.monthly_net_income && <span className="form-error">{validationErrors.monthly_net_income}</span>}
      </label>
      <label>
        Co-Applicant Net Income (₹)
        <input 
          type="number" 
          min="0" 
          placeholder="Co-Applicant Monthly Take Home" 
          className={validationErrors.co_applicant_income ? 'error' : ''}
          value={formData.co_applicant_income || ''} 
          disabled={disabled}
          onChange={(e) => updateField('co_applicant_income', e.target.value)} 
        />
        {validationErrors.co_applicant_income && <span className="form-error">{validationErrors.co_applicant_income}</span>}
      </label>
      <label>
        Dwelling Ownership Status
        <select 
          value={formData.dwelling_status || 'Owned'} 
          disabled={disabled}
          onChange={(e) => updateField('dwelling_status', e.target.value)}
        >
          <option value="Owned">Owned</option>
          <option value="Rented">Rented</option>
          <option value="Company Provided">Company Provided</option>
          <option value="Mortgaged">Mortgaged</option>
        </select>
      </label>
      <label className="form-grid-full">
        Tenure at Current Address (Years)
        <input 
          type="number" 
          min="0" 
          placeholder="Years of occupancy" 
          className={validationErrors.tenure_at_address ? 'error' : ''}
          value={formData.tenure_at_address || ''} 
          disabled={disabled}
          onChange={(e) => updateField('tenure_at_address', e.target.value)} 
        />
        {validationErrors.tenure_at_address && <span className="form-error">{validationErrors.tenure_at_address}</span>}
      </label>
    </div>
  );

  const renderLendingParameters = () => (
    <div className="form-grid">
      <label>
        File No. *
        <input 
          type="text" 
          placeholder="e.g. F-983" 
          className={validationErrors.file_no ? 'error' : ''}
          value={formData.file_no || ''} 
          disabled={disabled}
          onChange={(e) => updateField('file_no', e.target.value)} 
        />
        {validationErrors.file_no && <span className="form-error">{validationErrors.file_no}</span>}
      </label>
      <label>
        Loan Type
        <select 
          value={formData.loan_type || 'Home Loan'} 
          disabled={disabled}
          onChange={(e) => updateField('loan_type', e.target.value)}
        >
          {LOAN_TYPES.filter(t => t !== 'All').map((loan) => (
            <option key={loan} value={loan}>{loan}</option>
          ))}
        </select>
      </label>
      <label>
        Amount (₹) *
        <input 
          type="number" 
          min="0" 
          placeholder="Requested Amount" 
          className={validationErrors.amount ? 'error' : ''}
          value={formData.amount || ''} 
          disabled={disabled}
          onChange={(e) => updateField('amount', e.target.value)} 
        />
        {validationErrors.amount && <span className="form-error">{validationErrors.amount}</span>}
      </label>
      <label>
        Application Date *
        <input 
          type="date" 
          className={validationErrors.date ? 'error' : ''}
          value={formData.date || ''} 
          disabled={disabled}
          onChange={(e) => updateField('date', e.target.value)} 
        />
        {validationErrors.date && <span className="form-error">{validationErrors.date}</span>}
      </label>
    </div>
  );

  const renderStatusAssignment = () => (
    <div className="form-grid">
      <label>
        Assigned Associate
        <input 
          type="text" 
          placeholder="Associate Name"
          value={formData.associate || ''} 
          disabled={disabled}
          onChange={(e) => updateField('associate', e.target.value)} 
        />
      </label>
      <label>
        Workflow Status
        <select 
          value={formData.status || 'Enquiry'} 
          disabled={disabled}
          onChange={(e) => updateField('status', e.target.value)}
        >
          {STATUSES.filter(s => s !== 'All').map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </label>
    </div>
  );

  if (mode === 'wizard') {
    return (
      <div className="wizard-form-body">
        {wizardStep === 1 && (
          <div className="wizard-panel">
            <h3 className="wizard-panel-title">👤 Verify Identity & Setup Contacts</h3>
            {renderPersonalDetails()}
            <div style={{ marginTop: 20 }}>
              <h4 style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 12, borderBottom: '1px solid var(--border)', paddingBottom: 6 }}>
                📋 Identification Keys
              </h4>
              {renderKycProfile()}
            </div>
          </div>
        )}

        {wizardStep === 2 && (
          <div className="wizard-panel">
            <h3 className="wizard-panel-title">💼 Employment, Income & Stability Profile</h3>
            {renderFinancialProfile()}
          </div>
        )}

        {wizardStep === 3 && (
          <div className="wizard-panel">
            <h3 className="wizard-panel-title">💰 Lending Parameters & Office Assignment</h3>
            {renderLendingParameters()}
            <div style={{ marginTop: 20 }}>
              <h4 style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 12, borderBottom: '1px solid var(--border)', paddingBottom: 6 }}>
                🏢 Workflow Management
              </h4>
              {renderStatusAssignment()}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Otherwise, render full form layout inside modals
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h4 style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12, borderBottom: '1px solid var(--border)', paddingBottom: 6 }}>
          👤 Personal Details
        </h4>
        {renderPersonalDetails()}
      </div>

      <div>
        <h4 style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12, borderBottom: '1px solid var(--border)', paddingBottom: 6 }}>
          📋 KYC & Identification Profile
        </h4>
        {renderKycProfile()}
      </div>

      <div>
        <h4 style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12, borderBottom: '1px solid var(--border)', paddingBottom: 6 }}>
          💼 Employment & Financial Profile
        </h4>
        {renderFinancialProfile()}
      </div>

      <div>
        <h4 style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12, borderBottom: '1px solid var(--border)', paddingBottom: 6 }}>
          💰 Lending Parameters
        </h4>
        {renderLendingParameters()}
      </div>

      <div>
        <h4 style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12, borderBottom: '1px solid var(--border)', paddingBottom: 6 }}>
          🏢 Status & Assignment
        </h4>
        {renderStatusAssignment()}
      </div>
    </div>
  );
}
