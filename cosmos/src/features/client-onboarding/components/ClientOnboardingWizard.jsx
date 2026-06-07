import React, { useEffect } from 'react';
import DashboardLayout from '../../../widgets/DashboardLayout';
import Modal from '../../../shared/ui/Modal';
import ClientOnboardingForm from './ClientOnboardingForm';

export default function ClientOnboardingWizard({
  clientFormState, // returned from useClientForm
  LOAN_TYPES,
  STATUSES,
  maskPAN,
  maskAadhaar
}) {
  const {
    formData,
    setFormData,
    validationErrors,
    setValidationErrors,
    wizardStep,
    setWizardStep,
    scannerOpen,
    scanType,
    scanStatus,
    handleStartScan,
    handleStopScan,
    handleCapture,
    validateStep1,
    validateStep2,
    validateStep3,
    saveClient,
    setShowAddWizard
  } = clientFormState;

  // Mount scanner video element ref reactively when stream is loaded
  useEffect(() => {
    if (scannerOpen && clientFormState.videoStream) {
      const videoEl = document.getElementById('scanner-video-feed');
      if (videoEl) {
        videoEl.srcObject = clientFormState.videoStream;
        videoEl.play().catch(err => console.warn('Video playback interrupted:', err));
      }
    }
  }, [scannerOpen, clientFormState.videoStream]);

  return (
    <DashboardLayout>
      <div className="data-page">
        <div className="data-page-header">
          <div>
            <h2 className="data-page-title">Onboard New Client</h2>
            <p className="data-page-sub">Step-by-step institutional compliance and profiling wizard</p>
          </div>
          <button className="data-btn data-btn-outline" onClick={() => setShowAddWizard(false)}>Cancel Onboarding</button>
        </div>

        <div className="wizard-container">
          <div className="wizard-steps-header">
            <div className={`wizard-step-indicator ${wizardStep === 1 ? 'active' : wizardStep > 1 ? 'completed' : ''}`}>
              <span className="wizard-step-label-num">Step 1</span>
              <span className="wizard-step-label-title">Identity & Contacts</span>
            </div>
            <div className={`wizard-step-indicator ${wizardStep === 2 ? 'active' : wizardStep > 2 ? 'completed' : ''}`}>
              <span className="wizard-step-label-num">Step 2</span>
              <span className="wizard-step-label-title">Financial & Income Profile</span>
            </div>
            <div className={`wizard-step-indicator ${wizardStep === 3 ? 'active' : ''}`}>
              <span className="wizard-step-label-num">Step 3</span>
              <span className="wizard-step-label-title">Lending & Assignment</span>
            </div>
          </div>

          <ClientOnboardingForm
            formData={formData}
            setFormData={setFormData}
            validationErrors={validationErrors}
            setValidationErrors={setValidationErrors}
            handleStartScan={handleStartScan}
            mode="wizard"
            wizardStep={wizardStep}
            maskPAN={maskPAN}
            maskAadhaar={maskAadhaar}
            LOAN_TYPES={LOAN_TYPES}
            STATUSES={STATUSES}
          />

          <div className="wizard-actions">
            <button
              type="button"
              className="data-btn data-btn-outline"
              disabled={wizardStep === 1}
              onClick={() => setWizardStep(s => s - 1)}
            >
              Back
            </button>
            {wizardStep < 3 ? (
              <button
                type="button"
                className="data-btn data-btn-primary"
                onClick={() => {
                  if (wizardStep === 1 && !validateStep1()) return;
                  if (wizardStep === 2 && !validateStep2()) return;
                  setWizardStep(s => s + 1);
                }}
              >
                Continue
              </button>
            ) : (
              <button
                type="button"
                className="data-btn data-btn-primary"
                style={{ background: '#10b981' }}
                onClick={() => {
                  if (!validateStep3()) return;
                  const success = saveClient();
                  if (success) {
                    setShowAddWizard(false);
                  }
                }}
              >
                Complete Onboarding & Save
              </button>
            )}
          </div>
        </div>
      </div>

      {scannerOpen && (
        <Modal 
          title={`KYC ${scanType === 'pan' ? 'PAN Card' : 'Aadhaar Card'} Camera Scanner`} 
          onClose={handleStopScan} 
          size="md"
        >
          <div className="camera-scanner-modal-body">
            <div className="camera-feed-container">
              <div className="scanner-frame-overlay">
                <div className="scanner-corner corner-tl" />
                <div className="scanner-corner corner-tr" />
                <div className="scanner-corner corner-bl" />
                <div className="scanner-corner corner-br" />
                <div className="scanner-identity-guide">
                  Align {scanType === 'pan' ? 'PAN Card' : 'Aadhaar Card'} within this frame
                </div>
                {['capturing', 'extracting'].includes(scanStatus) && (
                  <div className="scanner-processing-overlay">
                    <div className="spinner" />
                    <span>
                      {scanStatus === 'capturing' ? 'Capturing image...' : 'Running OCR text extraction...'}
                    </span>
                  </div>
                )}
                {scanStatus === 'success' && (
                  <div className="scanner-success-overlay">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="scanner-success-check">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>Verification Match Found!</span>
                  </div>
                )}
              </div>

              {scanStatus === 'mock_active' ? (
                <div className="mock-camera-feed">
                  <div className="mock-card-graphic">
                    <span className="mock-card-title">{scanType === 'pan' ? 'INCOME TAX DEPARTMENT' : 'UNIQUE IDENTIFICATION AUTHORITY OF INDIA'}</span>
                    <div className="mock-card-avatar" />
                    <div className="mock-card-text-lines">
                      <span className="line-sm" />
                      <span className="line-md" />
                      <span className="line-lg" />
                    </div>
                  </div>
                  <div className="mock-camera-badge">Simulated Camera Stream Active</div>
                </div>
              ) : (
                <video 
                  id="scanner-video-feed" 
                  className="camera-video-element" 
                  muted 
                  playsInline 
                />
              )}
            </div>

            <div className="camera-scanner-controls">
              <button 
                type="button" 
                className="data-btn data-btn-outline" 
                onClick={handleStopScan}
              >
                Cancel
              </button>
              {['camera_active', 'mock_active'].includes(scanStatus) && (
                <button 
                  type="button" 
                  className="data-btn data-btn-primary" 
                  onClick={handleCapture}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14, marginRight: 6, display: 'inline-block', verticalAlign: 'middle' }}>
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                  Capture & Autofill
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  );
}
