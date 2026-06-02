// ── Dummy data for developer preview ────────────────────────
// Replace with real Supabase queries in production

// ── Dashboard ────────────────────────────────────────────────
export const dummyStats = {
  newEnquiries: 124,
  newEnquiriesLastPeriod: 108,
  loginFiles: 89,
  loginFilesLastPeriod: 82,
  totalCollections: 12500000,
  totalCollectionsLastPeriod: 11600000,
}

export const dummyLoanBreakdown = [
  { type: 'Home Loans',     count: 45, percent: 45 },
  { type: 'Business Loans', count: 25, percent: 25 },
  { type: 'Personal Loans', count: 20, percent: 20 },
  { type: 'Gold Loans',     count: 10, percent: 10 },
]

export const dummyActivities = [
  { id: 1, type: 'approval', title: 'Home Loan Approved',   description: 'Client: Rajesh Kumar (File #8821)',         created_at: new Date(Date.now() - 2*60*60*1000).toISOString() },
  { id: 2, type: 'file',     title: 'New File Logged',       description: 'Associate: Meena Sharma (Business Loan)',   created_at: new Date(Date.now() - 5*60*60*1000).toISOString() },
  { id: 3, type: 'payment',  title: 'Payment Disbursed',     description: 'Amount: ₹15,00,000 (ICICI Payout)',         created_at: new Date(Date.now() - 26*60*60*1000).toISOString() },
  { id: 4, type: 'query',    title: 'Query Raised',          description: 'File #7729 requires further documentation', created_at: new Date(Date.now() - 72*60*60*1000).toISOString() },
  { id: 5, type: 'approval', title: 'Gold Loan Sanctioned',  description: 'Client: Priya Nair (File #9102)',           created_at: new Date(Date.now() - 96*60*60*1000).toISOString() },
]

export const dummyFollowUps = [
  { id: 1, client_name: 'Amitabh S.',      loan_type: 'Mortgage', last_contact: 'Oct 20', priority: 'high',   contact_method: 'phone'   },
  { id: 2, client_name: 'Priya V.',         loan_type: 'Personal', last_contact: 'Oct 22', priority: 'medium', contact_method: 'email'   },
  { id: 3, client_name: 'Vikram Malhotra', loan_type: 'Business', last_contact: 'Oct 23', priority: 'low',    contact_method: 'message' },
  { id: 4, client_name: 'Sunita Rao',      loan_type: 'Home',     last_contact: 'Oct 24', priority: 'high',   contact_method: 'phone'   },
]

export const dummySchedule = [
  { id: 1, time: '09:30 AM', title: 'Internal Team Sync',        description: 'Daily operations & targets',    highlight: true  },
  { id: 2, time: '11:00 AM', title: 'HDFC Bank Review',          description: 'Q3 Payout verification meeting', highlight: false },
  { id: 3, time: '02:30 PM', title: 'New Associate Onboarding',  description: '5 New partners from Pune region',highlight: true  },
  { id: 4, time: '04:00 PM', title: 'Daily Data Backup',         description: 'Automated system process',       highlight: false },
]

// ── Clients ──────────────────────────────────────────────────
export const dummyClients = [
  { id: 'C001', name: 'Rajesh Kumar',    phone: '9876543210', email: 'rajesh@email.com',  loan_type: 'Home Loan',     amount: 2500000,  status: 'Approved',    file_no: '#8821', date: '2023-10-15', associate: 'Meena Sharma' },
  { id: 'C002', name: 'Priya Nair',      phone: '9845012345', email: 'priya@email.com',   loan_type: 'Gold Loan',     amount: 500000,   status: 'Disbursed',   file_no: '#9102', date: '2023-10-18', associate: 'Ravi Patel'   },
  { id: 'C003', name: 'Amitabh S.',      phone: '9812345678', email: 'amitabh@email.com', loan_type: 'Mortgage',      amount: 7500000,  status: 'Processing',  file_no: '#7801', date: '2023-10-10', associate: 'Meena Sharma' },
  { id: 'C004', name: 'Vikram Malhotra', phone: '9867890123', email: 'vikram@email.com',  loan_type: 'Business Loan', amount: 3000000,  status: 'Enquiry',     file_no: '#9201', date: '2023-10-20', associate: 'Sunita Rao'   },
  { id: 'C005', name: 'Anita Desai',     phone: '9823456789', email: 'anita@email.com',   loan_type: 'Home Loan',     amount: 1800000,  status: 'Enquiry',     file_no: '#9301', date: '2023-10-22', associate: 'Ravi Patel'   },
  { id: 'C006', name: 'Sunita Rao',      phone: '9834567890', email: 'sunita@email.com',  loan_type: 'Personal Loan', amount: 400000,   status: 'Approved',    file_no: '#8901', date: '2023-10-12', associate: 'Meena Sharma' },
  { id: 'C007', name: 'Kiran Mehta',     phone: '9856789012', email: 'kiran@email.com',   loan_type: 'Business Loan', amount: 5000000,  status: 'Closed',      file_no: '#7201', date: '2023-09-05', associate: 'Sunita Rao'   },
  { id: 'C008', name: 'Deepa Iyer',      phone: '9890123456', email: 'deepa@email.com',   loan_type: 'Gold Loan',     amount: 250000,   status: 'Disbursed',   file_no: '#9401', date: '2023-10-25', associate: 'Ravi Patel'   },
  { id: 'C009', name: 'Manikandan K.',    phone: '9812233445', email: 'manikandan@email.com',  loan_type: 'Home Loan',     amount: 150000,   status: 'Processing',  file_no: '#CF-78220', date: '2023-10-20', associate: 'Meena Sharma' },
  { id: 'C010', name: 'Blue Bells Enterprise', phone: '9845566778', email: 'bluebells@email.com', loan_type: 'Business Loan', amount: 60000,    status: 'Processing',  file_no: '#CF-78225', date: '2023-10-22', associate: 'Ravi Patel'   },
  { id: 'C011', name: 'Malar',            phone: '9867788990', email: 'malar@email.com',      loan_type: 'Personal Loan', amount: 100000,   status: 'Processing',  file_no: '#CF-78229', date: '2023-10-24', associate: 'Meena Sharma' },
  { id: 'C012', name: 'Selvam Retailers', phone: '9890011223', email: 'selvam@email.com',     loan_type: 'Gold Loan',     amount: 20000,    status: 'Disbursed',   file_no: '#CF-78231', date: '2023-10-25', associate: 'Ravi Patel'   },
]

// ── Associates ───────────────────────────────────────────────
export const dummyAssociates = [
  { id: 'A001', name: 'Meena Sharma',  phone: '9811122233', email: 'meena@cosmos.local',  region: 'Mumbai',    clients: 18, disbursed: 12500000, commission: 62500,  status: 'active',   joined: '2022-03-10' },
  { id: 'A002', name: 'Ravi Patel',    phone: '9822233344', email: 'ravi@cosmos.local',   region: 'Pune',      clients: 12, disbursed: 8200000,  commission: 41000,  status: 'active',   joined: '2022-06-15' },
  { id: 'A003', name: 'Sunita Rao',    phone: '9833344455', email: 'sunita@cosmos.local', region: 'Bangalore', clients: 9,  disbursed: 5600000,  commission: 28000,  status: 'inactive', joined: '2021-11-20' },
  { id: 'A004', name: 'Arjun Singh',   phone: '9844455566', email: 'arjun@cosmos.local',  region: 'Delhi',     clients: 22, disbursed: 18000000, commission: 90000,  status: 'active',   joined: '2021-08-01' },
  { id: 'A005', name: 'Kavita Joshi',  phone: '9855566677', email: 'kavita@cosmos.local', region: 'Hyderabad', clients: 7,  disbursed: 3200000,  commission: 16000,  status: 'active',   joined: '2023-01-12' },
]

// ── Payments ─────────────────────────────────────────────────
export const dummyPayments = [
  { id: 'P001', client: 'Rajesh Kumar',    file_no: '#8821', type: 'Disbursement', amount: 2500000, bank: 'ICICI Bank',  date: '2023-10-15', status: 'Completed' },
  { id: 'P002', client: 'Priya Nair',      file_no: '#9102', type: 'Collection',   amount: 500000,  bank: 'SBI',         date: '2023-10-18', status: 'Completed' },
  { id: 'P003', client: 'Amitabh S.',      file_no: '#7801', type: 'EMI',          amount: 45000,   bank: 'HDFC Bank',   date: '2023-10-20', status: 'Pending'   },
  { id: 'P004', client: 'Vikram Malhotra', file_no: '#9201', type: 'Disbursement', amount: 3000000, bank: 'Axis Bank',   date: '2023-10-22', status: 'Processing'},
  { id: 'P005', client: 'Anita Desai',     file_no: '#9301', type: 'Collection',   amount: 180000,  bank: 'Kotak Bank',  date: '2023-10-23', status: 'Completed' },
  { id: 'P006', client: 'Kiran Mehta',     file_no: '#7201', type: 'EMI',          amount: 85000,   bank: 'ICICI Bank',  date: '2023-10-24', status: 'Failed'    },
  { id: 'P007', client: 'Deepa Iyer',      file_no: '#9401', type: 'Disbursement', amount: 250000,  bank: 'SBI',         date: '2023-10-25', status: 'Completed' },
  { id: 'P008', client: 'Sunita Rao',      file_no: '#8901', type: 'EMI',          amount: 12000,   bank: 'HDFC Bank',   date: '2023-10-26', status: 'Pending'   },
  { id: 'P009', client: 'Manikandan K.',    file_no: '#CF-78220', type: 'Collection',   amount: 80000,   bank: 'ICICI Bank',  date: '2023-10-24', status: 'Completed' },
  { id: 'P010', client: 'Manikandan K.',    file_no: '#CF-78220', type: 'Collection',   amount: 70000,   bank: 'ICICI Bank',  date: '2023-10-25', status: 'Pending'   },
  { id: 'P011', client: 'Blue Bells Enterprise', file_no: '#CF-78225', type: 'Collection', amount: 60000,  bank: 'SBI',        date: '2023-10-25', status: 'Pending'   },
  { id: 'P012', client: 'Malar',            file_no: '#CF-78229', type: 'Collection',   amount: 50000,   bank: 'HDFC Bank',   date: '2023-10-26', status: 'Completed' },
  { id: 'P013', client: 'Malar',            file_no: '#CF-78229', type: 'Collection',   amount: 50000,   bank: 'HDFC Bank',   date: '2023-10-26', status: 'Pending'   },
  { id: 'P014', client: 'Selvam Retailers', file_no: '#CF-78231', type: 'Collection',   amount: 20000,   bank: 'Axis Bank',   date: '2023-10-27', status: 'Completed' },
]

// ── Invoices ─────────────────────────────────────────────────
export const dummyInvoices = [
  { id: 'INV-001', client: 'Rajesh Kumar',    file_no: '#8821', service: 'Home Loan Processing',    amount: 25000,  date: '2023-10-15', due: '2023-11-15', status: 'Paid'    },
  { id: 'INV-002', client: 'Priya Nair',      file_no: '#9102', service: 'Gold Loan Processing',    amount: 5000,   date: '2023-10-18', due: '2023-11-18', status: 'Paid'    },
  { id: 'INV-003', client: 'Amitabh S.',      file_no: '#7801', service: 'Mortgage Consultation',   amount: 15000,  date: '2023-10-10', due: '2023-11-10', status: 'Pending' },
  { id: 'INV-004', client: 'Vikram Malhotra', file_no: '#9201', service: 'Business Loan Advisory',  amount: 30000,  date: '2023-10-20', due: '2023-11-20', status: 'Pending' },
  { id: 'INV-005', client: 'Kiran Mehta',     file_no: '#7201', service: 'Business Loan Processing', amount: 50000, date: '2023-09-05', due: '2023-10-05', status: 'Overdue' },
]

// ── Products & Services ──────────────────────────────────────
export const dummyProducts = [
  { id: 'PS001', name: 'Home Loan Processing',     category: 'Loan',        fee: 10000, gst: 18, description: 'End-to-end home loan file processing', active: true  },
  { id: 'PS002', name: 'Business Loan Advisory',   category: 'Advisory',    fee: 15000, gst: 18, description: 'Business loan structuring and advisory', active: true  },
  { id: 'PS003', name: 'Gold Loan Processing',     category: 'Loan',        fee: 2500,  gst: 18, description: 'Gold loan documentation and processing', active: true  },
  { id: 'PS004', name: 'Mortgage Consultation',    category: 'Consultation',fee: 5000,  gst: 18, description: 'Mortgage planning and consultation',     active: true  },
  { id: 'PS005', name: 'Personal Loan Processing', category: 'Loan',        fee: 3000,  gst: 18, description: 'Personal loan file processing',          active: false },
  { id: 'PS006', name: 'Credit Score Advisory',    category: 'Advisory',    fee: 1500,  gst: 18, description: 'Credit score improvement advisory',      active: true  },
]

// ── Enquiries (for dashboard tab) ────────────────────────────
export const dummyEnquiries = [
  {
    id: 'E001',
    client_name: 'Anita Desai',
    co_applicate_name: 'Ramesh Desai',
    loan_type: 'Home Loan',
    loan_amount: 1800000,
    associate_name: 'Meena Sharma',
    client_mobile_number: 9823456789,
    status: 'New',
    note: 'First-time home buyer, paperwork pre-vetted.',
    profession: 'Salaried',
    created_at: '2023-10-22T10:00:00Z',
  },
  {
    id: 'E002',
    client_name: 'Suresh Pillai',
    co_applicate_name: '',
    loan_type: 'Business Loan',
    loan_amount: 5000000,
    associate_name: 'Ravi Patel',
    client_mobile_number: 9834567891,
    status: 'Contacted',
    note: 'Expanding local retail franchise shop.',
    profession: 'Self Employed',
    created_at: '2023-10-21T11:30:00Z',
  },
  {
    id: 'E003',
    client_name: 'Nisha Gupta',
    co_applicate_name: 'Vijay Gupta',
    loan_type: 'Personal Loan',
    loan_amount: 300000,
    associate_name: 'Unassigned',
    client_mobile_number: 9845678902,
    status: 'New',
    note: 'Requires immediate personal loan for education.',
    profession: 'Salaried',
    created_at: '2023-10-20T14:15:00Z',
  },
  {
    id: 'E004',
    client_name: 'Mohan Das',
    co_applicate_name: '',
    loan_type: 'Gold Loan',
    loan_amount: 150000,
    associate_name: 'Sunita Rao',
    client_mobile_number: 9856789013,
    status: 'Processing',
    note: 'Collateral verified, waiting on final approval.',
    profession: 'Professional',
    created_at: '2023-10-19T09:00:00Z',
  },
  {
    id: 'E005',
    client_name: 'Lakshmi Iyer',
    co_applicate_name: 'Subramanian Iyer',
    loan_type: 'Home Loan',
    loan_amount: 3200000,
    associate_name: 'Arjun Singh',
    client_mobile_number: 9867890124,
    status: 'Contacted',
    note: 'Co-applicant joint income check complete.',
    profession: 'Salaried',
    created_at: '2023-10-18T16:45:00Z',
  },
  {
    id: 'E006',
    client_name: 'Prakash Reddy',
    co_applicate_name: '',
    loan_type: 'Business Loan',
    loan_amount: 8000000,
    associate_name: 'Unassigned',
    client_mobile_number: 9878901235,
    status: 'New',
    note: 'Manufacturing unit setup loan enquiry.',
    profession: 'Self Employed',
    created_at: '2023-10-17T12:00:00Z',
  },
]

// ── Login Files (for dashboard tab) ──────────────────────────
export const dummyLoginFiles = [
  { id: 'LF001', client: 'Rajesh Kumar',    file_no: '#8821', loan_type: 'Home Loan',     bank: 'ICICI Bank', submitted: '2023-10-10', status: 'Approved',   stage: 'Disbursement' },
  { id: 'LF002', client: 'Amitabh S.',      file_no: '#7801', loan_type: 'Mortgage',      bank: 'HDFC Bank',  submitted: '2023-10-08', status: 'Processing', stage: 'Verification' },
  { id: 'LF003', client: 'Vikram Malhotra', file_no: '#9201', loan_type: 'Business Loan', bank: 'Axis Bank',  submitted: '2023-10-15', status: 'Processing', stage: 'Credit Check' },
  { id: 'LF004', client: 'Anita Desai',     file_no: '#9301', loan_type: 'Home Loan',     bank: 'Kotak Bank', submitted: '2023-10-18', status: 'Pending',    stage: 'Document Review' },
  { id: 'LF005', client: 'Suresh Pillai',   file_no: '#9401', loan_type: 'Business Loan', bank: 'SBI',        submitted: '2023-10-20', status: 'Pending',    stage: 'Submission' },
]

// ── Reminders ────────────────────────────────────────────────
export const dummyReminders = [
  { id: 'R001', title: 'EMI Due — Amitabh S.',       description: 'File #7801 EMI of ₹45,000 due today',         date: 'Today',     priority: 'high',   done: false },
  { id: 'R002', title: 'Follow-up — Anita Desai',    description: 'Home loan enquiry follow-up pending',          date: 'Today',     priority: 'medium', done: false },
  { id: 'R003', title: 'Document Collection',         description: 'Collect KYC docs from Vikram Malhotra',       date: 'Tomorrow',  priority: 'high',   done: false },
  { id: 'R004', title: 'Bank Visit — HDFC',           description: 'Visit HDFC Andheri branch for file #7801',    date: 'Tomorrow',  priority: 'medium', done: false },
  { id: 'R005', title: 'Commission Payout',           description: 'Process commission for Meena Sharma',         date: 'Oct 28',    priority: 'low',    done: true  },
  { id: 'R006', title: 'Quarterly Report',            description: 'Prepare Q3 disbursement report for management',date: 'Oct 30',   priority: 'medium', done: false },
]

// ── Backup history ───────────────────────────────────────────
export const dummyBackups = [
  { id: 'B001', type: 'Automatic', size: '2.4 MB', date: new Date(Date.now() - 2*60*60*1000).toISOString(),   status: 'Success' },
  { id: 'B002', type: 'Automatic', size: '2.3 MB', date: new Date(Date.now() - 26*60*60*1000).toISOString(),  status: 'Success' },
  { id: 'B003', type: 'Manual',    size: '2.3 MB', date: new Date(Date.now() - 48*60*60*1000).toISOString(),  status: 'Success' },
  { id: 'B004', type: 'Automatic', size: '2.2 MB', date: new Date(Date.now() - 72*60*60*1000).toISOString(),  status: 'Failed'  },
  { id: 'B005', type: 'Automatic', size: '2.2 MB', date: new Date(Date.now() - 96*60*60*1000).toISOString(),  status: 'Success' },
]

// ── Notifications ────────────────────────────────────────────
export const dummyNotifications = [
  { id: 1, type: 'payment',  title: 'Payment Received',   description: '₹2,50,000 received from Rajesh Kumar',      time: new Date(Date.now() - 30*60*1000).toISOString(),    read: false },
  { id: 2, type: 'enquiry',  title: 'New Loan Enquiry',   description: 'Home loan enquiry from Anita Desai',         time: new Date(Date.now() - 2*60*60*1000).toISOString(),  read: false },
  { id: 3, type: 'system',   title: 'Backup Completed',   description: 'Daily data backup completed successfully',   time: new Date(Date.now() - 5*60*60*1000).toISOString(),  read: true  },
  { id: 4, type: 'enquiry',  title: 'Follow-up Due',      description: 'Amitabh S. follow-up is overdue by 2 days', time: new Date(Date.now() - 8*60*60*1000).toISOString(),  read: false },
  { id: 5, type: 'payment',  title: 'EMI Alert',          description: 'File #7201 EMI due tomorrow',               time: new Date(Date.now() - 24*60*60*1000).toISOString(), read: true  },
]

// ── User ─────────────────────────────────────────────────────
export const dummyUser = {
  name: 'Dev User',
  email: 'dev@cosmos.local',
  role: 'admin',
  initials: 'DU',
}

// ── Search index ─────────────────────────────────────────────
export const dummySearchIndex = [
  { id: 'c1', category: 'Clients',    label: 'Rajesh Kumar',    sub: 'Home Loan · File #8821',    path: '/clients' },
  { id: 'c2', category: 'Clients',    label: 'Priya Nair',      sub: 'Gold Loan · File #9102',    path: '/clients' },
  { id: 'c3', category: 'Clients',    label: 'Amitabh S.',      sub: 'Mortgage · Follow-up due',  path: '/clients' },
  { id: 'c4', category: 'Clients',    label: 'Vikram Malhotra', sub: 'Business Loan',             path: '/clients' },
  { id: 'c5', category: 'Clients',    label: 'Anita Desai',     sub: 'Home Loan · Enquiry',       path: '/clients' },
  { id: 'e1', category: 'Enquiries',  label: 'Anita Desai',     sub: 'Home Loan · New',           path: '/dashboard/enquiries' },
  { id: 'e2', category: 'Enquiries',  label: 'Suresh Pillai',   sub: 'Business Loan · Contacted', path: '/dashboard/enquiries' },
  { id: 'p1', category: 'Payments',   label: 'ICICI Payout',    sub: '₹15,00,000 · Disbursed',    path: '/payments' },
  { id: 'p2', category: 'Payments',   label: 'HDFC Collection', sub: '₹2,50,000 · Received',      path: '/payments' },
  { id: 'a1', category: 'Associates', label: 'Meena Sharma',    sub: 'Mumbai · 18 clients',       path: '/associates' },
  { id: 'a2', category: 'Associates', label: 'Arjun Singh',     sub: 'Delhi · 22 clients',        path: '/associates' },
]
