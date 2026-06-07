import { useState, useEffect, useMemo } from 'react';

export function getDaysRemainingInfo(endDateStr) {
  const today = new Date('2026-06-06'); // Reference system date
  const eDate = new Date(endDateStr || '2026-12-31');
  const diffTime = eDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let barColor = 'green';
  if (diffDays <= 30) {
    barColor = 'red';
  } else if (diffDays <= 90) {
    barColor = 'orange';
  }

  return { remainingDays: Math.max(0, diffDays), barColor };
}

export function useInvestment({ investments, addInvestment, updateInvestment, removeInvestment, addToast, confirm }) {
  // Form toggle states
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Form inputs state
  const [partnerName, setPartnerName] = useState('');
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [duration, setDuration] = useState('12 Months');
  const [mobileNumber, setMobileNumber] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [startDate, setStartDate] = useState('2026-06-06');
  const [endDate, setEndDate] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [nomineeName, setNomineeName] = useState('');
  const [remarks, setRemarks] = useState('');
  const [nomineeAadhaar, setNomineeAadhaar] = useState('');
  const [nomineePan, setNomineePan] = useState('');
  const [address, setAddress] = useState('');
  const [googleDriveLink, setGoogleDriveLink] = useState('');

  // Edit Mode state
  const [editId, setEditId] = useState(null);

  // Toolbar filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 8;

  // Details Modal
  const [viewRecord, setViewRecord] = useState(null);

  // Auto-calculate end date based on duration months
  useEffect(() => {
    if (!startDate) return;
    const sDate = new Date(startDate);
    let monthsToAdd = 12;

    if (duration === '6 Months') {
      monthsToAdd = 6;
    } else if (duration === '12 Months') {
      monthsToAdd = 12;
    } else if (duration === '24 Months') {
      monthsToAdd = 24;
    } else if (duration === '36 Months') {
      monthsToAdd = 36;
    }

    sDate.setMonth(sDate.getMonth() + monthsToAdd);
    setEndDate(sDate.toISOString().slice(0, 10));
  }, [startDate, duration]);

  // Reset pagination on filter updates
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  // KPI calculations
  const totalInvestmentAmount = useMemo(() => {
    const active = investments || [];
    return active.reduce((sum, inv) => sum + Number(inv.amount || 0), 0);
  }, [investments]);

  const activePartnersCount = useMemo(() => {
    const active = investments || [];
    return active.filter(inv => inv.status === 'Active').length;
  }, [investments]);

  const maturingThisMonthCount = useMemo(() => {
    const active = investments || [];
    return active.filter(inv => {
      const { remainingDays } = getDaysRemainingInfo(inv.end_date || inv.endDate);
      return remainingDays >= 0 && remainingDays <= 30;
    }).length;
  }, [investments]);

  // Map and sort investor rows
  const derivedRecordsList = useMemo(() => {
    const active = investments || [];
    return active.map(inv => {
      const start = inv.start_date || inv.startDate || '2026-06-06';
      const end = inv.end_date || inv.endDate || '2027-06-06';
      const amount = Number(inv.amount) || 0;

      // Calculate interest rate
      let rate = 0.08;
      if (inv.duration === '6 Months') rate = 0.07;
      else if (inv.duration === '12 Months') rate = 0.08;
      else if (inv.duration === '24 Months') rate = 0.09;
      else if (inv.duration === '36 Months') rate = 0.10;

      const interest = Math.round(amount * rate);
      const { remainingDays, barColor } = getDaysRemainingInfo(end);

      // Format end date for table display
      const eDateObj = new Date(end);
      const options = { day: '2-digit', month: 'short', year: 'numeric' };
      const formattedEndDate = eDateObj.toLocaleDateString('en-GB', options);

      return {
        id: inv.id,
        partner: inv.partner,
        amount,
        interest,
        duration: inv.duration || '12 Months',
        endDate: end,
        displayEndDate: formattedEndDate,
        remainingDays,
        barColor,
        status: inv.status || 'Active',
        originalInvestment: inv
      };
    }).sort((a, b) => a.remainingDays - b.remainingDays);
  }, [investments]);

  // Filter records
  const filteredRecords = useMemo(() => {
    return derivedRecordsList.filter(rec => {
      const query = searchQuery.toLowerCase().trim();
      const matchSearch = !query ||
        rec.partner.toLowerCase().includes(query) ||
        rec.id.toLowerCase().includes(query);

      const matchStatus = statusFilter === 'All' || rec.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [derivedRecordsList, searchQuery, statusFilter]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredRecords.length / PAGE_SIZE);
  const paginatedRecords = filteredRecords.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleResetForm = () => {
    setPartnerName('');
    setInvestmentAmount('');
    setDuration('12 Months');
    setMobileNumber('');
    setAadhaarNumber('');
    setStartDate('2026-06-06');
    setPanNumber('');
    setNomineeName('');
    setRemarks('');
    setNomineeAadhaar('');
    setNomineePan('');
    setAddress('');
    setGoogleDriveLink('');
  };

  const handleCancel = () => {
    handleResetForm();
    setEditId(null);
    setIsFormOpen(false);
  };

  const handleSaveInvestment = () => {
    if (!partnerName.trim() || !investmentAmount || !startDate) {
      addToast('Partner Name, Investment Amount, and Start Date are required.', 'error');
      return;
    }
    if (mobileNumber.trim() && !/^\d{10}$/.test(mobileNumber.trim())) {
      addToast('Mobile number must be exactly 10 digits.', 'error');
      return;
    }
    if (aadhaarNumber.trim() && !/^\d{12}$/.test(aadhaarNumber.trim())) {
      addToast('Aadhaar number must be exactly 12 digits.', 'error');
      return;
    }
    if (panNumber.trim() && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNumber.trim().toUpperCase())) {
      addToast('Invalid PAN Card format.', 'error');
      return;
    }

    const payload = {
      partner: partnerName,
      amount: Number(investmentAmount),
      duration,
      start_date: startDate,
      end_date: endDate,
      mobile: mobileNumber,
      aadhaar_number: aadhaarNumber,
      pan_card: panNumber.toUpperCase(),
      nominee_name: nomineeName,
      remarks,
      nominee_aadhaar: nomineeAadhaar,
      nominee_pan: nomineePan.toUpperCase(),
      address,
      google_drive_link: googleDriveLink,
      status: 'Active'
    };

    if (editId) {
      const original = investments.find(x => x.id === editId);
      updateInvestment({
        ...original,
        ...payload,
        id: editId
      });
      addToast('Partner investment record updated.', 'success');
    } else {
      addInvestment(payload);
      addToast('New partner investment recorded.', 'success');
    }

    handleCancel();
  };

  const handleEditRecord = (rec) => {
    const orig = rec.originalInvestment;
    setEditId(rec.id);
    setPartnerName(orig.partner);
    setInvestmentAmount(String(orig.amount));
    setDuration(orig.duration || '12 Months');
    setMobileNumber(orig.mobile || '');
    setAadhaarNumber(orig.aadhaar_number || '');
    setStartDate(orig.start_date || orig.startDate || '2026-06-06');
    setPanNumber(orig.pan_card || '');
    setNomineeName(orig.nominee_name || '');
    setRemarks(orig.remarks || '');
    setNomineeAadhaar(orig.nominee_aadhaar || '');
    setNomineePan(orig.nominee_pan || '');
    setAddress(orig.address || '');
    setGoogleDriveLink(orig.google_drive_link || '');

    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteRecord = async (rec) => {
    const confirmed = await confirm({
      title: 'Remove Investment Record',
      message: `Are you sure you want to permanently remove ${rec.partner}'s investment record?`
    });
    if (confirmed) {
      updateInvestment({
        ...rec.originalInvestment,
        status: 'Inactive'
      });
      addToast('Investment record set to Inactive.', 'success');
    }
  };

  const handleExportCSV = () => {
    const headers = ['Partner Name', 'Investment Amount', 'Interest Amount', 'Duration', 'End Date', 'Status'];
    const rows = filteredRecords.map(rec => [
      rec.partner,
      rec.amount,
      rec.interest,
      rec.duration,
      rec.endDate,
      rec.status
    ]);

    const csvContent = [headers, ...rows].map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Partner_Investments_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Records exported successfully.', 'success');
  };

  return {
    isFormOpen,
    setIsFormOpen,
    partnerName,
    setPartnerName,
    investmentAmount,
    setInvestmentAmount,
    duration,
    setDuration,
    mobileNumber,
    setMobileNumber,
    aadhaarNumber,
    setAadhaarNumber,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    panNumber,
    setPanNumber,
    nomineeName,
    setNomineeName,
    remarks,
    setRemarks,
    nomineeAadhaar,
    setNomineeAadhaar,
    nomineePan,
    setNomineePan,
    address,
    setAddress,
    googleDriveLink,
    setGoogleDriveLink,
    editId,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    currentPage,
    setCurrentPage,
    viewRecord,
    setViewRecord,
    totalInvestmentAmount,
    activePartnersCount,
    maturingThisMonthCount,
    derivedRecordsList,
    filteredRecords,
    paginatedRecords,
    totalPages,
    PAGE_SIZE,
    handleResetForm,
    handleCancel,
    handleSaveInvestment,
    handleEditRecord,
    handleDeleteRecord,
    handleExportCSV
  };
}
