import { z } from 'zod';

// File Upload validation
export const fileUploadSchema = z.object({
  fileSize: z.number().max(2 * 1024 * 1024, 'File size must be less than 2MB'),
  fileType: z.string().refine(
    (type) => ['image/jpeg', 'image/png', 'application/pdf'].includes(type),
    'File type must be JPEG, PNG, or PDF'
  ),
});

// Financial Amount validation
export const financialAmountSchema = z.preprocess(
  (val) => (val === '' || val === undefined ? undefined : Number(val)),
  z.number({ invalid_type_error: 'Amount must be a valid number' }).int().positive('Amount must be a positive integer')
);

// Client Record validation (from ClientRecordBook.jsx step forms)
export const step1Schema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters long'),
  phone: z.string().min(1, 'Phone number is required'),
});

export const step2Schema = z.object({
});

export const step3Schema = z.object({
});

export const clientSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters long'),
  phone: z.string().min(1, 'Phone number is required'),
});

// Partner Investment validation
export const investmentSchema = z.object({
  partner: z.string().min(3, 'Partner Name must be at least 3 characters long'),
  amount: z.preprocess(
    (val) => (val === '' || val === undefined ? undefined : Number(val)),
    z.number({ invalid_type_error: 'Amount must be a valid number' }).positive('Amount must be positive')
  ),
  duration: z.string().min(1, 'Duration is required'),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid start date format'),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid end date format').optional(),
  mobile: z.string().regex(/^\d{10}$/, 'Mobile number must be exactly 10 digits').or(z.literal('')),
  aadhaar_number: z.string().regex(/^\d{12}$/, 'Aadhaar Number must be exactly 12 digits').or(z.literal('')),
  pan_card: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i, 'Invalid PAN Card format').or(z.literal('')),
  nominee_name: z.string().optional(),
  remarks: z.string().optional(),
  nominee_aadhaar: z.string().regex(/^\d{12}$/, 'Nominee Aadhaar must be exactly 12 digits').or(z.literal('')),
  nominee_pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i, 'Invalid Nominee PAN format').or(z.literal('')),
  address: z.string().optional(),
  google_drive_link: z.string().url('Invalid Google Drive Link URL').regex(/drive\.google\.com/, 'Must be a valid Google Drive link').or(z.literal('')),
  status: z.string().min(1).optional()
});

// Transaction validation
export const transactionSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  type: z.enum(['Income', 'Expense']),
  name: z.string().min(1, 'Name/Payer/Payee is required'),
  particular: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  amount: z.preprocess(
    (val) => (val === '' || val === undefined ? undefined : Number(val)),
    z.number({ invalid_type_error: 'Amount must be a valid number' }).positive('Amount must be positive')
  ),
  status: z.string().optional(),
  remarks: z.string().optional()
});
