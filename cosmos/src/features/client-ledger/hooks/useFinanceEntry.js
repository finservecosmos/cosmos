import { useState, useEffect, useMemo } from 'react';

// Helper to calculate due date and urgency dynamically
export function getDueInfo(clientDateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const cDate = new Date(clientDateStr || new Date());
  const day = cDate.getDate() || 1;
  
  let dueYear = today.getFullYear();
  let dueMonth = today.getMonth();
  
  // If today is past the due day, the next due date is next month
  if (today.getDate() > day) {
    dueMonth += 1;
    if (dueMonth > 11) {
      dueMonth = 0;
      dueYear += 1;
    }
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

export function useFinanceEntry({ financeEntries, addFinanceEntry, updateFinanceEntry, investments, transactions, clients, addToast, confirm, addTransaction, addPayment }) {
  // Collapsible Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);

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
  const [googleDriveLink, setGoogleDriveLink] = useState('');
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

  // Repayment States
  const [repaymentRecord, setRepaymentRecord] = useState(null);
  const [repayPrincipalPaid, setRepayPrincipalPaid] = useState('');
  const [repayInterestPaid, setRepayInterestPaid] = useState('');
  const [repayDate, setRepayDate] = useState(new Date().toISOString().slice(0, 10));
  const [repayRemarks, setRepayRemarks] = useState('');

  // Populate repayment inputs when a record is selected
  useEffect(() => {
    if (repaymentRecord) {
      setRepayPrincipalPaid(String(repaymentRecord.principal || ''));
      setRepayInterestPaid(String(repaymentRecord.interest || ''));
      setRepayDate(new Date().toISOString().slice(0, 10));
      setRepayRemarks('');
    }
  }, [repaymentRecord]);

  // Automatically calculate due date on duration updates
  useEffect(() => {
    if (!loanAmount || isNaN(Number(loanAmount))) {
      setDueDate('');
      return;
    }
    
    let daysToAdd = 15;

    if (duration === '< 3 Days') {
      daysToAdd = 2;
    } else if (duration === '< 7 Days') {
      daysToAdd = 5;
    } else if (duration === '< 15 Days') {
      daysToAdd = 12;
    } else if (duration === '< 30 Days') {
      daysToAdd = 25;
    } else {
      daysToAdd = 45;
    }
    
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
    return (financeEntries || []).filter(c => !c.status || ['Approved', 'Processing', 'Paid', 'Active'].includes(c.status));
  }, [financeEntries]);

  // KPI calculations
  const totalInvestments = useMemo(() => {
    const totalPartnerAmount = (investments || [])
      .filter(inv => inv.status !== 'Inactive')
      .reduce((sum, inv) => sum + Number(inv.amount || 0), 0);
    const totalLent = (financeEntries || [])
      .filter(c => ['Approved', 'Processing', 'Active', 'Disbursed', 'Paid'].includes(c.status))
      .reduce((sum, c) => sum + Number(c.loan_amount || c.amount || 0), 0);

    const allTimeIncome = (transactions || [])
      .filter(t => t.type === 'Income' && t.status === 'Received')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);
    const allTimeExpense = (transactions || [])
      .filter(t => t.type === 'Expense')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);
    const netProfit = allTimeIncome - allTimeExpense;

    return totalPartnerAmount - totalLent + netProfit;
  }, [investments, clients, financeEntries, transactions]);

  const dueThisWeekCount = useMemo(() => {
    return activeClients.filter(c => {
      if (c.status === 'Paid') return false;
      const { diffDays } = getDueInfo(c.due_date || c.date);
      return diffDays >= 0 && diffDays <= 7;
    }).length;
  }, [activeClients]);

  const totalInterestPayable = useMemo(() => {
    return activeClients.reduce((sum, c) => {
      if (c.status === 'Paid') return sum;
      const principal = Number(c.loan_amount || c.amount || 0);
      const interest = c.interest_amount !== undefined && c.interest_amount !== null ? Number(c.interest_amount) : Math.round(principal * 0.01);
      return sum + interest;
    }, 0);
  }, [activeClients]);

  // Reactive derived list representing the design's Table Row items
  const derivedRecordsList = useMemo(() => {
    return activeClients.map(c => {
      const { dueIn, dueClass, date, diffDays } = getDueInfo(c.due_date || c.date);
      const principal = Number(c.loan_amount || c.amount || 0);
      const interest = c.interest_amount !== undefined && c.interest_amount !== null ? Number(c.interest_amount) : Math.round(principal * 0.01);
      const total = principal + interest;
      
      return {
        id: c.id,
        name: c.client_name || c.name || '',
        phone: c.mobile_number || c.phone || '',
        email: c.email_id || c.email || '',
        principal,
        interest,
        total,
        dueDate: date,
        daysRemaining: c.status === 'Paid' ? '-' : dueIn,
        dueClass: c.status === 'Paid' ? 'paid' : dueClass,
        diffDays,
        status: c.status || 'Active',
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
    return `ENTRY ID: FE-2026-${String((financeEntries || []).length + 1).padStart(3, '0')}`;
  }, [editId, financeEntries]);

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
    setGoogleDriveLink('');
    setRemarks('');
  };

  // Cancel and close form
  const handleCancel = () => {
    handleResetForm();
    setEditId(null);
    setIsFormOpen(false);
  };

  // Save the form entry
  const handleSaveEntry = async () => {
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
      client_name: clientName,
      mobile_number: mobileNumber,
      email_id: emailId || `${clientName.toLowerCase().replace(/\s+/g, '')}@example.com`,
      loan_amount: Number(loanAmount),
      due_date: dueDate || new Date().toISOString().slice(0, 10),
      status: 'Active',
      pan_number: panNumber ? panNumber.toUpperCase() : '',
      aadhaar_number: aadhaarNumber || '',
      duration,
      interest_amount: Number(interestAmount),
      co_applicant_name: coApplicantName,
      address,
      co_applicant_aadhaar: coApplicantAadhaar,
      eb_no: ebNo,
      google_drive_link: googleDriveLink,
      remarks
    };

    if (editId) {
      const original = financeEntries.find(c => c.id === editId);
      const res = await updateFinanceEntry({
        ...original,
        ...payload,
        id: editId
      });
      if (res?.error) {
        addToast(`Failed: ${res.error}`, 'error');
        return;
      }
      addToast('Finance entry updated successfully.', 'success');
    } else {
      const res = await addFinanceEntry(payload);
      if (res?.error) {
        addToast(`Failed: ${res.error}`, 'error');
        return;
      }
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
    setPanNumber(orig.pan_number || orig.pan_card || '');
    setDueDate(rec.dueDate);
    setInterestAmount(String(rec.interest));
    setCoApplicantName(orig.co_applicant_name || '');
    setAddress(orig.address || '');
    setCoApplicantAadhaar(orig.co_applicant_aadhaar || '');
    setEbNo(orig.eb_no || '');
    setGoogleDriveLink(orig.google_drive_link || '');
    setRemarks(orig.remarks || '');
    
    setIsFormOpen(true);
    setIsViewMode(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewRecord = (rec) => {
    handleEditRecord(rec);
    setIsViewMode(true);
  };

  // Record deletions
  const handleDeleteRecord = async (rec) => {
    const confirmed = await confirm({
      title: 'Remove Finance Entry',
      message: `Are you sure you want to permanently remove ${rec.name}'s finance record? This action cannot be undone.`
    });
    if (confirmed) {
      updateFinanceEntry({
        ...rec.originalClient,
        status: 'Closed' // Transition to Closed so it is hidden from active lists
      });
      addToast('Finance record removed successfully.', 'success');
    }
  };

  // Save Repayment Entry
  const handleSaveRepayment = async () => {
    if (!repaymentRecord) return;
    const client = repaymentRecord.originalClient;
    const principalPaid = Number(repayPrincipalPaid || 0);
    const interestPaid = Number(repayInterestPaid || 0);

    if (isNaN(principalPaid) || isNaN(interestPaid) || principalPaid < 0 || interestPaid < 0) {
      addToast('Please enter valid non-negative numbers for amounts.', 'error');
      return;
    }

    if (principalPaid === 0 && interestPaid === 0) {
      addToast('Please enter a principal or interest amount to record repayment.', 'error');
      return;
    }

    const currentPrincipal = Number(client.loan_amount || client.amount || 0);
    const currentInterest = client.interest_amount !== undefined && client.interest_amount !== null ? Number(client.interest_amount) : Math.round(currentPrincipal * 0.01);

    if (principalPaid > currentPrincipal) {
      addToast(`Principal paid cannot exceed outstanding principal (₹${currentPrincipal.toLocaleString('en-IN')}).`, 'error');
      return;
    }

    if (interestPaid > currentInterest) {
      addToast(`Interest paid cannot exceed outstanding interest (₹${currentInterest.toLocaleString('en-IN')}).`, 'error');
      return;
    }

    const remainingPrincipal = Math.max(0, currentPrincipal - principalPaid);
    const remainingInterest = Math.max(0, currentInterest - interestPaid);

    // Update client record
    const { amount, ...restClient } = client;
    const updatedClient = {
      ...restClient,
      loan_amount: remainingPrincipal,
      interest_amount: remainingInterest,
      status: remainingPrincipal === 0 && remainingInterest === 0 ? 'Paid' : 'Active'
    };

    try {
      const res = await updateFinanceEntry(updatedClient);
      if (res?.error) {
        addToast(`Failed: ${res.error}`, 'error');
        return;
      }

      // Insert transaction if interest is paid
      if (interestPaid > 0) {
        await addTransaction({
          date: repayDate || new Date().toISOString().slice(0, 10),
          type: 'Income',
          name: client.client_name || client.name,
          particular: `Interest Collection from ${client.client_name || client.name}`,
          category: 'Interest Collection',
          amount: interestPaid,
          status: 'Received',
          remarks: repayRemarks || 'Client interest repayment'
        });
      }

      addToast('Repayment recorded successfully.', 'success');
      // Reset repayment states
      setRepaymentRecord(null);
      setRepayPrincipalPaid('');
      setRepayInterestPaid('');
      setRepayRemarks('');
    } catch (err) {
      console.error(err);
      addToast('Failed to record repayment.', 'error');
    }
  };

  return {
    isFormOpen,
    setIsFormOpen,
    isViewMode,
    setIsViewMode,
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
    handleViewRecord,
    handleDeleteRecord,
    handleExportCSV,
    repaymentRecord,
    setRepaymentRecord,
    repayPrincipalPaid,
    setRepayPrincipalPaid,
    repayInterestPaid,
    setRepayInterestPaid,
    repayDate,
    setRepayDate,
    repayRemarks,
    setRepayRemarks,
    handleSaveRepayment
  };
}
