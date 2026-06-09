import React from 'react';
import Modal from '../../../shared/ui/Modal';

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
    <Modal
      size="lg"
      title={editId ? 'Edit Finance Record' : 'New Client Form'}
      subtitle="Please fill out the details below."
      onClose={handleCancel}
    >
      <div className="entry-form-grid" style={{ paddingTop: '10px' }}>
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

        <label className="span-2">
          Address
          <textarea 
            rows={2}
            placeholder="Residential/Business address" 
            value={address} 
            onChange={e => setAddress(e.target.value)} 
            style={{ resize: 'none' }}
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
              onClick={() => { if (googleDriveLink) window.open(googleDriveLink, '_blank', 'noopener,noreferrer'); }}
              disabled={!googleDriveLink}
              title="Open Drive"
              style={{ padding: '0 12px', height: '40px', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center', opacity: !googleDriveLink ? 0.5 : 1, cursor: !googleDriveLink ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
              Open Drive
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

      <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '24px', marginTop: 16, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
        <button type="button" className="admin-action-btn" onClick={handleCancel}>Cancel</button>
        <button type="button" className="data-btn data-btn-outline" onClick={handleResetForm}>Reset</button>
        <button type="button" className="admin-primary-btn" onClick={handleSaveEntry}>Save Entry</button>
      </div>
    </Modal>
  );
}
