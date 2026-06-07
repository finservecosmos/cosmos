import { useState, useEffect, useMemo } from 'react';

// Helper to calculate due date and urgency dynamically
export function getDueInfo(clientDateStr) {
  const today = new Date('2026-06-06'); // Reference system date
  const cDate = new Date(clientDateStr || '2026-06-01');
  const day = cDate.getDate() || 15;
  
  // Create due date in June 2026
  let dueYear = 2026;
  let dueMonth = 5; // June is 5 (0-indexed)
  
  // If today (June 6) is past the due day (e.g., day is 5), then due date is in July
  if (day < 6) {
    dueMonth = 6; // July
  }
  
  const dueDate = new Date(dueYear, dueMonth, day);
  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  let dueIn = '';
  let dueClass = 'gray';
  
  if (diffDays <= 0) {
    dueIn = 'Due Today';
    dueClass = 'red';
  } else if (diffDays === 1) {
    dueIn = '1 Day Left';
    dueClass = 'red';
  } else if (diffDays <= 3) {
    dueIn = `${diffDays} Days Left`;
    dueClass = 'orange';
  } else if (diffDays <= 7) {
    dueIn = `${diffDays} Days Left`;
    dueClass = 'yellow';
  } else if (diffDays <= 15) {
    dueIn = `${diffDays} Days Left`;
    dueClass = 'green';
  } else if (diffDays <= 30) {
    dueIn = `${diffDays} Days Left`;
    dueClass = 'blue';
  } else {
    dueIn = '30+ Days Left';
    dueClass = 'gray';
  }
  
  const yyyy = dueDate.getFullYear();
  const mm = String(dueDate.getMonth() + 1).padStart(2, '0');
  const dd = String(dueDate.getDate()).padStart(2, '0');
  const dateStr = `${yyyy}-${mm}-${dd}`;
  
  return { dueIn, dueClass, date: dateStr, diffDays };
}

export function useFinanceEntry({ clients, addClient, updateClient, addToast, confirm }) {
  // Collapsible Form State
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Form Fields State
  const [clientName, setClientName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [emailId, setEmailId] = useState('');
  const [loanAmount, setLoanAmount] = useState('');
  const [duration, setDuration] = useState('< 3 Days');
  const [dueDate, setDueDate] = useState('');
  const [interestAmount, setInterestAmount] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [coApplicantName, setCoApplicantName] = useState('');
  const [address, setAddress] = useState('');
  const [coApplicantAadhaar, setCoApplicantAadhaar] = useState('');
  const [ebNo, setEbNo] = useState('');
  const [remarks, setRemarks] = useState('');

  // Edit Mode state
  const [editId, setEditId] = useState(null);

  // Filter toolbar states
  const [searchQuery, setSearchQuery] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 8;

  // Detail Modal views
  const [viewRecord, setViewRecord] = useState(null);

  // Automatically calculate interest and due date on duration/loan amount updates
  useEffect(() => {
    if (!loanAmount || isNaN(Number(loanAmount))) {
      setInterestAmount('');
      setDueDate('');
      return;
    }
    
    let interestPct = 0.01;
    let daysToAdd = 15;

    if (duration === '< 3 Days') {
      interestPct = 0.005;
      daysToAdd = 2;
    } else if (duration === '< 7 Days') {
      interestPct = 0.01;
      daysToAdd = 5;
    } else if (duration === '< 15 Days') {
      interestPct = 0.015;
      daysToAdd = 12;
    } else if (duration === '< 30 Days') {
      interestPct = 0.02;
      daysToAdd = 25;
    } else {
      interestPct = 0.03;
      daysToAdd = 45;
    }

    setInterestAmount(String(Math.round(Number(loanAmount) * interestPct)));
    
    const calculatedDate = new Date();
    calculatedDate.setDate(calculatedDate.getDate() + daysToAdd);
    setDueDate(calculatedDate.toISOString().slice(0, 10));
  }, [loanAmount, duration]);

  // Reset pagination on filter updates
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, fromDate, toDate]);

  // Derive dynamic client lists
  const activeClients = useMemo(() => {
    return (clients || []).filter(c => ['Approved', 'Processing'].includes(c.status));
  }, [clients]);

  // KPI calculations
  const totalInvestments = useMemo(() => {
    return (clients || []).reduce((sum, c) => sum + Number(c.amount || 0), 0);
  }, [clients]);

  const dueThisWeekCount = useMemo(() => {
    return activeClients.filter(c => {
      const { diffDays } = getDueInfo(c.date);
      return diffDays >= 0 && diffDays <= 7;
    }).length;
  }, [activeClients]);

  const totalInterestPayable = useMemo(() => {
    return activeClients.reduce((sum, c) => {
      const interest = c.interest_amount || Math.round(c.amount * 0.01);
      return sum + interest;
    }, 0);
  }, [activeClients]);

  // Reactive derived list representing the design's Table Row items
  const derivedRecordsList = useMemo(() => {
    return activeClients.map(c => {
      const { dueIn, dueClass, date, diffDays } = getDueInfo(c.date);
      const principal = c.amount;
      const interest = c.interest_amount || Math.round(c.amount * 0.01);
      const total = principal + interest;
      
      return {
        id: c.id,
        name: c.name,
        phone: c.phone,
        email: c.email || '',
        principal,
        interest,
        total,
        dueDate: date,
        daysRemaining: dueIn,
        dueClass,
        diffDays,
        status: c.status,
        originalClient: c
      };
    }).sort((a, b) => a.diffDays - b.diffDays);
  }, [activeClients]);

  // Filter list by searchQuery and from/to date ranges
  const filteredRecords = useMemo(() => {
    return derivedRecordsList.filter(rec => {
      const query = searchQuery.toLowerCase().trim();
      const matchSearch = !query ||
        rec.name.toLowerCase().includes(query) ||
        rec.phone.includes(query) ||
        rec.id.toLowerCase().includes(query);
        
      const matchFrom = !fromDate || rec.dueDate >= fromDate;
      const matchTo = !toDate || rec.dueDate <= toDate;
      
      return matchSearch && matchFrom && matchTo;
    });
  }, [derivedRecordsList, searchQuery, fromDate, toDate]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredRecords.length / PAGE_SIZE);
  const paginatedRecords = filteredRecords.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const displayEntryId = useMemo(() => {
    if (editId) return `ENTRY ID: ${editId}`;
    return `ENTRY ID: CF-2026-${String((clients || []).length + 1).padStart(3, '0')}`;
  }, [editId, clients]);

  // Resets all form fields
  const handleResetForm = () => {
    setClientName('');
    setMobileNumber('');
    setEmailId('');
    setLoanAmount('');
    setDuration('< 3 Days');
    setAadhaarNumber('');
    setPanNumber('');
    setDueDate('');
    setInterestAmount('');
    setCoApplicantName('');
    setAddress('');
    setCoApplicantAadhaar('');
    setEbNo('');
    setRemarks('');
  };

  // Cancel and close form
  const handleCancel = () => {
    handleResetForm();
    setEditId(null);
    setIsFormOpen(false);
  };

  // Save the form entry
  const handleSaveEntry = () => {
    if (!clientName.trim() || !mobileNumber.trim() || !loanAmount) {
      addToast('Client Name, Mobile Number, and Loan Amount are required.', 'error');
      return;
    }
    if (!/^\d{10}$/.test(mobileNumber.trim())) {
      addToast('Mobile number must be exactly 10 digits.', 'error');
      return;
    }
    if (aadhaarNumber.trim() && !/^\d{12}$/.test(aadhaarNumber.trim())) {
      addToast('Aadhaar number must be exactly 12 digits.', 'error');
      return;
    }
    if (panNumber.trim() && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNumber.trim().toUpperCase())) {
      addToast('Invalid PAN Card format (e.g. ABCDE1234F).', 'error');
      return;
    }

    const payload = {
      name: clientName,
      phone: mobileNumber,
      email: emailId || `${clientName.toLowerCase().replace(/\s+/g, '')}@example.com`,
      amount: Number(loanAmount),
      date: dueDate || new Date().toISOString().slice(0, 10),
      loan_type: 'Home Loan',
      status: 'Approved',
      associate: 'Unassigned',
      pan_card: panNumber.toUpperCase(),
      aadhaar_number: aadhaarNumber,
      residential_status: 'Resident Indian',
      employment_status: 'Salaried',
      monthly_net_income: '',
      co_applicant_income: '',
      dwelling_status: 'Owned',
      tenure_at_address: '',
      location: 'Mumbai, MH',
      // Custom entry meta attributes
      duration,
      interest_amount: Number(interestAmount) || Math.round(Number(loanAmount) * 0.01),
      co_applicant_name: coApplicantName,
      address,
      co_applicant_aadhaar: coApplicantAadhaar,
      eb_no: ebNo,
      remarks
    };

    if (editId) {
      const original = clients.find(c => c.id === editId);
      updateClient({
        ...original,
        ...payload,
        id: editId
      });
      addToast('Finance entry updated successfully.', 'success');
    } else {
      addClient(payload);
      addToast('New finance entry recorded successfully.', 'success');
    }

    handleCancel();
  };

  // Export records to CSV
  const handleExportCSV = () => {
    const headers = ['Client Name', 'Mobile Number', 'Principal Amount', 'Interest', 'Total Payable', 'Due Date', 'Status'];
    const rows = filteredRecords.map(rec => [
      rec.name,
      rec.phone,
      rec.principal,
      rec.interest,
      rec.total,
      rec.dueDate,
      rec.status
    ]);

    const csvContent = [headers, ...rows].map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Finance_Entry_Records_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Records exported to CSV successfully.', 'success');
  };

  // Loading client details back into the form editor
  const handleEditRecord = (rec) => {
    const orig = rec.originalClient;
    setEditId(rec.id);
    setClientName(rec.name);
    setMobileNumber(rec.phone);
    setEmailId(rec.email);
    setLoanAmount(String(rec.principal));
    setDuration(orig.duration || '< 3 Days');
    setAadhaarNumber(orig.aadhaar_number || '');
    setPanNumber(orig.pan_card || '');
    setDueDate(rec.dueDate);
    setInterestAmount(String(rec.interest));
    setCoApplicantName(orig.co_applicant_name || '');
    setAddress(orig.address || '');
    setCoApplicantAadhaar(orig.co_applicant_aadhaar || '');
    setEbNo(orig.eb_no || '');
    setRemarks(orig.remarks || '');
    
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Record deletions
  const handleDeleteRecord = async (rec) => {
    const confirmed = await confirm({
      title: 'Remove Finance Entry',
      message: `Are you sure you want to permanently remove ${rec.name}'s finance record? This action cannot be undone.`
    });
    if (confirmed) {
      updateClient({
        ...rec.originalClient,
        status: 'Closed' // Transition to Closed so it is hidden from active lists
      });
      addToast('Finance record removed successfully.', 'success');
    }
  };

  return {
    isFormOpen,
    setIsFormOpen,
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
    remarks,
    setRemarks,
    editId,
    displayEntryId,
    searchQuery,
    setSearchQuery,
    fromDate,
    setFromDate,
    toDate,
    setToDate,
    currentPage,
    setCurrentPage,
    viewRecord,
    setViewRecord,
    totalInvestments,
    activeClients,
    dueThisWeekCount,
    totalInterestPayable,
    derivedRecordsList,
    filteredRecords,
    paginatedRecords,
    totalPages,
    PAGE_SIZE,
    handleResetForm,
    handleCancel,
    handleSaveEntry,
    handleEditRecord,
    handleDeleteRecord,
    handleExportCSV
  };
}
