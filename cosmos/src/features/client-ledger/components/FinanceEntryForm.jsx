import React from 'react';

export default function FinanceEntryForm({
  clientName,
  setClientName,
  mobileNumber,
  setMobileNumber,
  emailId,
  setEmailId,
  loanAmount,
  setLoanAmount,
  duration,
  setDuration,
  dueDate,
  setDueDate,
  interestAmount,
  setInterestAmount,
  aadhaarNumber,
  setAadhaarNumber,
  panNumber,
  setPanNumber,
  coApplicantName,
  setCoApplicantName,
  address,
  setAddress,
  coApplicantAadhaar,
  setCoApplicantAadhaar,
  ebNo,
  setEbNo,
  googleDriveLink,
  setGoogleDriveLink,
  remarks,
  setRemarks,
  editId,
  displayEntryId,
  handleCancel,
  handleResetForm,
  handleSaveEntry
}) {
  return (
    <div className="new-client-form-card">
      <div className="form-header-row">
        <div className="form-title-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" />
          </svg>
          <span>{editId ? 'Edit Finance Record' : 'New Client Form'}</span>
        </div>
        <span className="entry-id-badge">{displayEntryId}</span>
      </div>

      <div className="entry-form-grid">
        <label className="span-2">
          Client Name *
          <input 
            type="text" 
            placeholder="Full legal name" 
            value={clientName} 
            onChange={e => setClientName(e.target.value)} 
          />
        </label>

        <label>
          Mobile Number *
          <input 
            type="text" 
            placeholder="+91 XXXXX XXXXX" 
            value={mobileNumber} 
            onChange={e => setMobileNumber(e.target.value)} 
          />
        </label>

        <label>
          Email ID
          <input 
            type="email" 
            placeholder="client@example.com" 
            value={emailId} 
            onChange={e => setEmailId(e.target.value)} 
          />
        </label>

        <label>
          Loan Amount (₹) *
          <input 
            type="number" 
            placeholder="e.g. 50000" 
            value={loanAmount} 
            onChange={e => setLoanAmount(e.target.value)} 
          />
        </label>

        <label>
          Duration
          <select value={duration} onChange={e => setDuration(e.target.value)}>
            <option value="< 3 Days">&lt; 3 Days</option>
            <option value="< 7 Days">&lt; 7 Days</option>
            <option value="< 15 Days">&lt; 15 Days</option>
            <option value="< 30 Days">&lt; 30 Days</option>
            <option value="30+ Days">30+ Days</option>
          </select>
        </label>

        <label>
          Aadhaar Number
          <input 
            type="text" 
            placeholder="XXXX XXXX XXXX" 
            value={aadhaarNumber} 
            onChange={e => setAadhaarNumber(e.target.value)} 
          />
        </label>

        <label>
          PAN Number
          <input 
            type="text" 
            placeholder="ABCDE1234F" 
            value={panNumber} 
            onChange={e => setPanNumber(e.target.value)} 
          />
        </label>

        <label>
          Due Date (Calculated)
          <input 
            type="date" 
            value={dueDate} 
            onChange={e => setDueDate(e.target.value)} 
          />
        </label>

        <label>
          Interest Amount (₹)
          <input 
            type="number" 
            placeholder="Calculated interest" 
            value={interestAmount} 
            onChange={e => setInterestAmount(e.target.value)} 
          />
        </label>

        <label className="span-2">
          Co-Applicant Name
          <input 
            type="text" 
            placeholder="Secondary holder name" 
            value={coApplicantName} 
            onChange={e => setCoApplicantName(e.target.value)} 
          />
        </label>

        <label className="span-2 row-span-2">
          Address
          <textarea 
            rows={4}
            placeholder="Residential/Business address" 
            value={address} 
            onChange={e => setAddress(e.target.value)} 
            style={{ resize: 'none', height: '100%' }}
          />
        </label>

        <label className="span-2">
          Co-Applicant Aadhaar Number
          <input 
            type="text" 
            placeholder="XXXX XXXX XXXX" 
            value={coApplicantAadhaar} 
            onChange={e => setCoApplicantAadhaar(e.target.value)} 
          />
        </label>

        <label className="span-2">
          Google Drive Folder Link
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input 
              type="url" 
              placeholder="https://drive.google.com/..." 
              value={googleDriveLink} 
              onChange={e => setGoogleDriveLink(e.target.value)} 
              style={{ flex: 1, margin: 0 }}
            />
            <button 
              type="button" 
              className="data-btn data-btn-outline" 
              onClick={() => {
                if (googleDriveLink) {
                  navigator.clipboard.writeText(googleDriveLink);
                }
              }}
              title="Copy Link"
              style={{ padding: '0 12px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            </button>
          </div>
        </label>

        <label className="span-2">
          EB - No
          <input 
            type="text" 
            placeholder="XXXX XXXX XXXX" 
            value={ebNo} 
            onChange={e => setEbNo(e.target.value)} 
          />
        </label>

        <label className="span-2">
          Remarks
          <input 
            type="text" 
            placeholder="Any additional notes..." 
            value={remarks} 
            onChange={e => setRemarks(e.target.value)} 
          />
        </label>
      </div>

      <div className="modal-actions" style={{ marginTop: 24, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
        <button type="button" className="admin-action-btn" onClick={handleCancel}>Cancel</button>
        <button type="button" className="data-btn data-btn-outline" onClick={handleResetForm}>Reset</button>
        <button type="button" className="admin-primary-btn" onClick={handleSaveEntry}>Save Entry</button>
      </div>
    </div>
  );
}
