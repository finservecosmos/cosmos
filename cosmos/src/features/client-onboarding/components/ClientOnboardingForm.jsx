import React from 'react';
import { User, Briefcase, AlertTriangle } from 'lucide-react';
import { useAppState } from '../../../context/AppStateContext';

export default function ClientOnboardingForm({
  formData,
  setFormData,
  validationErrors = {},
  setValidationErrors = () => {},
  mode = 'wizard', // 'wizard' | 'modal'
  wizardStep = 1,
  modalMode = 'add', // 'add' | 'edit' | 'view'
}) {
  const { associates = [] } = useAppState();
  const disabled = modalMode === 'view';

  const updateField = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const updateExtended = (field, val) => {
    setFormData(prev => ({
      ...prev,
      extended_data: { ...(prev.extended_data || {}), [field]: val }
    }));
  };

  const profType = formData.extended_data?.professional_type || 'Job';

  const renderClientDetails = () => (
    <div className="form-grid">
      <label>Client Name
        <input type="text" value={formData.name || ''} disabled={disabled} onChange={(e) => updateField('name', e.target.value)} />
        {validationErrors.name && <span className="form-error">{validationErrors.name}</span>}
      </label>
      <label>Co-Applicant Name
        <input type="text" value={formData.extended_data?.co_applicate_name || ''} disabled={disabled} onChange={(e) => updateExtended('co_applicate_name', e.target.value)} />
      </label>
      <label>Type of Loan
        <select value={formData.loan_type || 'Housing'} disabled={disabled} onChange={(e) => updateField('loan_type', e.target.value)}>
          <option value="Housing">Housing</option>
          <option value="Business OD/CC">Business OD/CC</option>
          <option value="Loan Against Property">Loan Against Property</option>
          <option value="Others">Others</option>
        </select>
      </label>
      <label>Loan Amount
        <input type="number" min="0" value={formData.amount || ''} disabled={disabled} onChange={(e) => updateField('amount', e.target.value)} />
      </label>
      <label>Associate Name
        <select value={formData.associate || ''} disabled={disabled} onChange={(e) => updateField('associate', e.target.value)}>
          <option value="">Select Associate (None)</option>
          {associates.map(a => (
            <option key={a.id} value={a.name}>{a.name}</option>
          ))}
        </select>
      </label>
      <label>Client Mobile Number
        <input type="text" value={formData.phone || ''} disabled={disabled} onChange={(e) => updateField('phone', e.target.value)} />
        {validationErrors.phone && <span className="form-error">{validationErrors.phone}</span>}
      </label>
    </div>
  );

  const renderProfessionalDetails = () => (
    <div className="form-grid">
      <label className="form-grid-full">Professional Type
        <select value={profType} disabled={disabled} onChange={(e) => {
          updateExtended('professional_type', e.target.value);
          updateField('employment_status', e.target.value === 'Job' ? 'Salaried' : 'Self-Employed');
        }}>
          <option value="Job">Job</option>
          <option value="Self Employed">Self Employed</option>
        </select>
      </label>

      {profType === 'Job' && (<>
        <label>Name of Company
          <input type="text" value={formData.extended_data?.company_name || ''} disabled={disabled} onChange={(e) => updateExtended('company_name', e.target.value)} />
        </label>
        <label>Salary Type
          <select value={formData.extended_data?.salary_type || 'Account Credit'} disabled={disabled} onChange={(e) => updateExtended('salary_type', e.target.value)}>
            <option value="Account Credit">Account Credit</option>
            <option value="Cash on Hand">Cash on Hand</option>
          </select>
        </label>
        <label>Job Title
          <input type="text" value={formData.extended_data?.job_title || ''} disabled={disabled} onChange={(e) => updateExtended('job_title', e.target.value)} />
        </label>
        <label>Years in the Company
          <input type="text" value={formData.extended_data?.years_in_company || ''} disabled={disabled} onChange={(e) => updateExtended('years_in_company', e.target.value)} />
        </label>
        <label>ESI & PF
          <select value={formData.extended_data?.esi_pf || 'Yes'} disabled={disabled} onChange={(e) => updateExtended('esi_pf', e.target.value)}>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </label>
        <label>URN
          <input type="text" value={formData.extended_data?.urn || ''} disabled={disabled} onChange={(e) => updateExtended('urn', e.target.value)} />
        </label>
        <label>Manager Name
          <input type="text" value={formData.extended_data?.manager_name || ''} disabled={disabled} onChange={(e) => updateExtended('manager_name', e.target.value)} />
        </label>
        <label>Manager Mobile Number
          <input type="text" value={formData.extended_data?.manager_mobile || ''} disabled={disabled} onChange={(e) => updateExtended('manager_mobile', e.target.value)} />
        </label>
      </>)}
      
      {profType === 'Self Employed' && (<>
        <label>GST
          <input type="text" value={formData.extended_data?.gst || ''} disabled={disabled} onChange={(e) => updateExtended('gst', e.target.value)} />
        </label>
        <label>GST Total Year
          <input type="text" value={formData.extended_data?.gst_total_year || ''} disabled={disabled} onChange={(e) => updateExtended('gst_total_year', e.target.value)} />
        </label>
        <label>UDYAM
          <select value={formData.extended_data?.udyam || 'No'} disabled={disabled} onChange={(e) => updateExtended('udyam', e.target.value)}>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </label>
        <label>UDYAM Vintage
          <input type="text" value={formData.extended_data?.udyam_vintage || ''} disabled={disabled} onChange={(e) => updateExtended('udyam_vintage', e.target.value)} />
        </label>
        <label>Other Government Certificate
          <input type="text" value={formData.extended_data?.other_gov_cert || ''} disabled={disabled} onChange={(e) => updateExtended('other_gov_cert', e.target.value)} />
        </label>
        <label>Vintage Proof
          <input type="text" value={formData.extended_data?.vintage_proof || ''} disabled={disabled} onChange={(e) => updateExtended('vintage_proof', e.target.value)} />
        </label>
      </>)}
    </div>
  );

  const renderCommonDetails = () => (
    <div className="form-grid">
      <label>Proprietor Type
        <select value={formData.extended_data?.proprietor_type || 'Solo Proprietor'} disabled={disabled} onChange={(e) => updateExtended('proprietor_type', e.target.value)}>
          <option value="Solo Proprietor">Solo Proprietor</option>
          <option value="Partnership">Partnership</option>
        </select>
      </label>
      <label>Others
        <input type="text" value={formData.extended_data?.others || ''} disabled={disabled} onChange={(e) => updateExtended('others', e.target.value)} />
      </label>
      <label>Property Value
        <input type="text" value={formData.extended_data?.property_value || ''} disabled={disabled} onChange={(e) => updateExtended('property_value', e.target.value)} />
      </label>
      <label>Name of Banker
        <input type="text" value={formData.extended_data?.banker_name || ''} disabled={disabled} onChange={(e) => updateExtended('banker_name', e.target.value)} />
      </label>
      <label>CIBIL Score (Applicant)
        <input type="text" value={formData.extended_data?.cibil_applicant || ''} disabled={disabled} onChange={(e) => updateExtended('cibil_applicant', e.target.value)} />
      </label>
      <label>CIBIL Score (Co-Applicant)
        <input type="text" value={formData.extended_data?.cibil_co_applicant || ''} disabled={disabled} onChange={(e) => updateExtended('cibil_co_applicant', e.target.value)} />
      </label>
      <label>Applicant Number of Loan
        <input type="text" value={formData.extended_data?.applicant_total_loans || ''} disabled={disabled} onChange={(e) => updateExtended('applicant_total_loans', e.target.value)} />
      </label>
      <label>Co-Applicant Total Loan
        <input type="text" value={formData.extended_data?.co_applicant_total_loans || ''} disabled={disabled} onChange={(e) => updateExtended('co_applicant_total_loans', e.target.value)} />
      </label>
      <label className="form-grid-full">Applicant CIBIL Briefing
        <input type="text" value={formData.extended_data?.applicant_cibil_briefing || ''} disabled={disabled} onChange={(e) => updateExtended('applicant_cibil_briefing', e.target.value)} />
      </label>
      <label className="form-grid-full">Co-Applicant CIBIL Briefing
        <input type="text" value={formData.extended_data?.co_applicant_cibil_briefing || ''} disabled={disabled} onChange={(e) => updateExtended('co_applicant_cibil_briefing', e.target.value)} />
      </label>
      <label>Document Related Issues
        <select value={formData.extended_data?.document_issues || 'None'} disabled={disabled} onChange={(e) => updateExtended('document_issues', e.target.value)}>
          <option value="None">None</option>
          <option value="Private Finance Holding">Private Finance Holding</option>
          <option value="Relative Base Holding">Relative Base Holding</option>
          <option value="Join Family Issue">Join Family Issue</option>
          <option value="Document Not Available">Document Not Available</option>
          <option value="Other Issues">Other Issues</option>
        </select>
      </label>
      <label>Business Related Issues
        <select value={formData.extended_data?.business_issues || 'None'} disabled={disabled} onChange={(e) => updateExtended('business_issues', e.target.value)}>
          <option value="None">None</option>
          <option value="Partner Not Accepted">Partner Not Accepted</option>
          <option value="Vintage Proof Not Supported">Vintage Proof Not Supported</option>
          <option value="Others">Others</option>
        </select>
      </label>
      <label>Family Related Issues
        <select value={formData.extended_data?.family_issues || 'None'} disabled={disabled} onChange={(e) => updateExtended('family_issues', e.target.value)}>
          <option value="None">None</option>
          <option value="Wife Not Support">Wife Not Support</option>
          <option value="Parent Not Support">Parent Not Support</option>
          <option value="Others">Others</option>
        </select>
      </label>
      <label className="form-grid-full">Notes
        <textarea rows={3} value={formData.extended_data?.convert_notes || ''} disabled={disabled} onChange={(e) => updateExtended('convert_notes', e.target.value)} />
      </label>
    </div>
  );

  if (mode === 'wizard') {
    return (
      <div className="wizard-form-body">
        {wizardStep === 1 && (
          <div className="wizard-panel">
            <h3 className="wizard-panel-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><User size={18} /> Client Information</h3>
            {renderClientDetails()}
          </div>
        )}

        {wizardStep === 2 && (
          <div className="wizard-panel">
            <h3 className="wizard-panel-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Briefcase size={18} /> Professional Details</h3>
            {renderProfessionalDetails()}
          </div>
        )}

        {wizardStep === 3 && (
          <div className="wizard-panel">
            <h3 className="wizard-panel-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><AlertTriangle size={18} /> Common & Final Details</h3>
            {renderCommonDetails()}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h4 style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12, borderBottom: '1px solid var(--border)', paddingBottom: 6 }}>
          <User size={14} /> Client Information
        </h4>
        {renderClientDetails()}
      </div>

      <div>
        <h4 style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12, borderBottom: '1px solid var(--border)', paddingBottom: 6 }}>
          <Briefcase size={14} /> Professional Details
        </h4>
        {renderProfessionalDetails()}
      </div>

      <div>
        <h4 style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12, borderBottom: '1px solid var(--border)', paddingBottom: 6 }}>
          <AlertTriangle size={14} /> Common & Final Details
        </h4>
        {renderCommonDetails()}
      </div>
    </div>
  );
}
