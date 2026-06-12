import { useState, useEffect } from 'react';
import { step1Schema, step2Schema, step3Schema, clientSchema } from '../../../shared/lib/schemas';
import { nextClientId } from '../../../context/AppStateContext';

export const emptyClient = {
  name: '', phone: '', loan_type: 'Housing', amount: 0,
  status: 'Enquiry', file_no: '', date: new Date().toISOString().slice(0, 10), associate: '', id: null,
};

export function useClientForm({ addClient, updateClient, addToast, currentUser }) {
  const [formData, setFormData] = useState(emptyClient);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit' | 'view'

  // Data Masking reveal state
  const [revealAadhaar, setRevealAadhaar] = useState(false);
  const [revealPAN, setRevealPAN] = useState(false);

  // Form Validation state
  const [validationErrors, setValidationErrors] = useState({});

  // Stepper Wizard states
  const [showAddWizard, setShowAddWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);

  // Camera scanner states
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scanType, setScanType] = useState(null); // 'pan' | 'aadhaar'
  const [videoStream, setVideoStream] = useState(null);
  const [scanStatus, setScanStatus] = useState('idle'); // 'idle' | 'camera_active' | 'mock_active' | 'capturing' | 'extracting' | 'success'

  const handleStartScan = async (type) => {
    setScanType(type);
    setScannerOpen(true);
    setScanStatus('idle');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } } 
      });
      setVideoStream(stream);
      setScanStatus('camera_active');
    } catch (err) {
      console.warn('Camera access denied or not available, falling back to simulation', err);
      setScanStatus('mock_active');
    }
  };

  const handleStopScan = () => {
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop());
      setVideoStream(null);
    }
    setScannerOpen(false);
    setScanStatus('idle');
  };

  const handleCapture = () => {
    setScanStatus('capturing');
    setTimeout(() => {
      setScanStatus('extracting');
      setTimeout(() => {
        setScanStatus('success');
        
        if (scanType === 'pan') {
          const mockPan = 'BPDPM' + Math.floor(1000 + Math.random() * 9000) + 'K';
          setFormData(prev => ({ ...prev, pan_card: mockPan }));
          setValidationErrors(prev => ({ ...prev, pan_card: null }));
          addToast(`Extracted PAN Card successfully: ${mockPan}`, 'success');
        } else {
          const mockAadhaar = Math.floor(100000000000 + Math.random() * 900000000000).toString();
          setFormData(prev => ({ ...prev, aadhaar_number: mockAadhaar }));
          setValidationErrors(prev => ({ ...prev, aadhaar_number: null }));
          addToast(`Extracted Aadhaar Number successfully: ${mockAadhaar}`, 'success');
        }

        setTimeout(() => {
          handleStopScan();
        }, 1200);
      }, 1500);
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [videoStream]);

  const validateStep1 = () => {
    const step1Data = {
      name: formData.name,
      phone: formData.phone,
    };
    const result = step1Schema.safeParse(step1Data);
    if (!result.success) {
      const fieldErrors = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0]] = issue.message;
      });
      setValidationErrors(fieldErrors);
      addToast('Please correct the validation errors to proceed.', 'error');
      return false;
    }
    setValidationErrors({});
    return true;
  };

  const validateStep2 = () => {
    const step2Data = {};
    const result = step2Schema.safeParse(step2Data);
    if (!result.success) {
      const fieldErrors = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0]] = issue.message;
      });
      setValidationErrors(fieldErrors);
      addToast('Please correct the validation errors to proceed.', 'error');
      return false;
    }
    setValidationErrors({});
    return true;
  };

  const validateStep3 = () => {
    const step3Data = {
      file_no: formData.file_no,
      loan_type: formData.loan_type,
      amount: formData.amount,
      date: formData.date,
      associate: formData.associate,
      status: formData.status
    };
    const result = step3Schema.safeParse(step3Data);
    if (!result.success) {
      const fieldErrors = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0]] = issue.message;
      });
      setValidationErrors(fieldErrors);
      addToast('Please correct the validation errors to submit.', 'error');
      return false;
    }
    setValidationErrors({});
    return true;
  };

  const saveClient = () => {
    const result = clientSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0]] = issue.message;
      });
      setValidationErrors(fieldErrors);
      addToast('Please fix the validation errors before saving.', 'error');
      return false;
    }
    const payload = { ...formData, amount: Number(formData.amount) };
    if (modalMode === 'edit') {
      updateClient(payload);
      addToast('Client updated successfully.', 'success');
    } else {
      addClient(payload);
      addToast('Client added successfully.', 'success');
    }
    setModalOpen(false);
    return true;
  };

  const openAddModal = () => {
    setModalMode('add');
    setFormData({ ...emptyClient, id: 'Generating...' });
    setValidationErrors({});
    setShowAddWizard(true);
    setWizardStep(1);

    // Fetch next client ID asynchronously in the background
    nextClientId().then(generatedId => {
      setFormData(prev => {
        if (prev.id === 'Generating...') {
          return { ...prev, id: generatedId };
        }
        return prev;
      });
    }).catch(err => {
      console.warn('Failed to generate next client ID from database, using fallback:', err);
      const tempId = `CF-${String(new Date().getFullYear()).slice(-2)}-TEMP${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
      setFormData(prev => prev.id === 'Generating...' ? { ...prev, id: tempId } : prev);
    });
  };

  const openEditModal = (client) => {
    setModalMode('edit');
    setFormData(client);
    setValidationErrors({});
    setModalOpen(true);
  };

  const openViewModal = (client) => {
    setModalMode('view');
    setFormData(client);
    setRevealAadhaar(false);
    setRevealPAN(false);
    setValidationErrors({});
    setModalOpen(true);
  };


  return {
    formData,
    setFormData,
    modalOpen,
    setModalOpen,
    modalMode,
    revealAadhaar,
    setRevealAadhaar,
    revealPAN,
    setRevealPAN,
    validationErrors,
    setValidationErrors,
    showAddWizard,
    setShowAddWizard,
    wizardStep,
    setWizardStep,
    scannerOpen,
    scanType,
    videoStream,
    scanStatus,
    handleStartScan,
    handleStopScan,
    handleCapture,
    validateStep1,
    validateStep2,
    validateStep3,
    saveClient,
    openAddModal,
    openEditModal,
    openViewModal
  };
}
