import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const defaultAddress = (id, label, address, city, state, pincode) => ({
  id,
  addressType: 'OFFICE',
  addressLabel: label,
  address,
  pincode,
  country: 'India',
  state,
  city,
  dlNumber: '',
  dlNumberExpiry: '',
  fssai: '',
  fssaiExpiry: '',
  isPrimary: true,
})

/* Partner types: Organization and Third Party Partner. Multiple third party partners; each can have up to 3 vendor types (diagnostic, collection, processing). */
const initialPartners = [
  { id: 'p1', name: 'Infosys', partnerType: 'organization', contact: 'partners@infosys.com', phone: '9876543210', status: 'active', hrEmails: ['hr@infosys.com', 'admin@infosys.com'], addresses: [defaultAddress('addr-p1', 'Head Office', 'Electronics City, Phase 1', 'Bangalore', 'Karnataka', '560100')] },
  { id: 'p3', name: 'TCS', partnerType: 'organization', contact: 'bd@tcs.com', phone: '9876543212', status: 'active', hrEmails: ['hr@tcs.com'], addresses: [defaultAddress('addr-p3', 'Corporate Office', 'TCS Campus, Madhapur', 'Hyderabad', 'Telangana', '500081')] },
  { id: 'p5', name: 'Wipro', partnerType: 'organization', contact: 'bd@wipro.com', phone: '9876543214', status: 'active', hrEmails: ['hr@wipro.com'], addresses: [defaultAddress('addr-p5', 'HQ', 'Doddakannelli, Sarjapur Road', 'Bangalore', 'Karnataka', '560035')] },
  { id: 'p6', name: 'HCL Technologies', partnerType: 'organization', contact: 'bd@hcl.com', phone: '9876543215', status: 'active', hrEmails: ['hr@hcl.com'], addresses: [defaultAddress('addr-p6', 'Corporate Office', 'Elite Building, Sector 18', 'Noida', 'Uttar Pradesh', '201301')] },
  { id: 'p7', name: 'Tech Mahindra', partnerType: 'organization', contact: 'partners@techmahindra.com', phone: '9876543216', status: 'active', hrEmails: ['hr@techmahindra.com'], addresses: [defaultAddress('addr-p7', 'HQ', 'Plot 1-6, Raheja IT Park', 'Hyderabad', 'Telangana', '500081')] },
  { id: 'p2', name: 'Vijaya & Medquest Partner', partnerType: 'third_party_partner', contact: 'partners@vijayamedquest.com', phone: '9876543200', status: 'active', addresses: [defaultAddress('addr-p2', 'Head Office', 'Central Hub', 'Bangalore', 'Karnataka', '560001')] },
  { id: 'p4', name: 'HealthLabs Partner', partnerType: 'third_party_partner', contact: 'contact@healthlabs.com', phone: '9876543201', status: 'active', addresses: [defaultAddress('addr-p4', 'Main Lab', 'Sector 62', 'Noida', 'Uttar Pradesh', '201309')] },
  { id: 'p8', name: 'QuickCollect Partner', partnerType: 'third_party_partner', contact: 'info@quickcollect.com', phone: '9876543202', status: 'active', addresses: [defaultAddress('addr-p8', 'Collection Hub', 'Bandra East', 'Mumbai', 'Maharashtra', '400051')] },
  { id: 'p9', name: 'PathLabs Partner', partnerType: 'third_party_partner', contact: 'bd@pathlabs.com', phone: '9876543203', status: 'active', addresses: [defaultAddress('addr-p9', 'Central Lab', 'MG Road', 'Chennai', 'Tamil Nadu', '600001')] },
  { id: 'p10', name: 'MedScan Partner', partnerType: 'third_party_partner', contact: 'contact@medscan.com', phone: '9876543204', status: 'active', addresses: [defaultAddress('addr-p10', 'Diagnostic Center', 'Jubilee Hills', 'Hyderabad', 'Telangana', '500033')] },
  { id: 'p11', name: 'CareCollect Partner', partnerType: 'third_party_partner', contact: 'info@carecollect.com', phone: '9876543205', status: 'active', addresses: [defaultAddress('addr-p11', 'Collection Unit', 'Salt Lake', 'Kolkata', 'West Bengal', '700091')] },
  { id: 'p12', name: 'Wellness Labs Partner', partnerType: 'third_party_partner', contact: 'partners@wellnesslabs.com', phone: '9876543206', status: 'active', addresses: [defaultAddress('addr-p12', 'Wellness Hub', 'Viman Nagar', 'Pune', 'Maharashtra', '411014')] },
  { id: 'p13', name: 'City Diagnostics Partner', partnerType: 'third_party_partner', contact: 'bd@citydiagnostics.com', phone: '9876543207', status: 'active', addresses: [defaultAddress('addr-p13', 'City Lab', 'Anna Nagar', 'Chennai', 'Tamil Nadu', '600040')] },
]

const initialVendors = [
  { id: 'v1', partnerId: 'p2', name: 'Vijaya Diagnostic', type: 'diagnostic_vendor', status: 'active', contactName: 'Ops Team', email: 'ops@vijayadiagnostic.com', phone: '9876543211', loginEmails: ['ops@vijayadiagnostic.com', 'admin@vijayadiagnostic.com'] },
  { id: 'v2', partnerId: 'p2', name: 'Medquest Center', type: 'collection_vendor', status: 'active', contactName: 'Info', email: 'info@medquest.com', phone: '9876543213', loginEmails: ['info@medquest.com', 'admin@medquest.com'] },
  { id: 'v3', partnerId: 'p2', name: 'Vijaya & Medquest Partner', type: 'processing_vendor', status: 'active', contactName: 'Partners', email: 'partners@vijayamedquest.com', phone: '9876543200', loginEmails: ['partners@vijayamedquest.com'] },
  { id: 'v4', partnerId: 'p4', name: 'HealthLabs Partner', type: 'diagnostic_vendor', status: 'active', contactName: 'Contact', email: 'contact@healthlabs.com', phone: '9876543201', loginEmails: ['contact@healthlabs.com'] },
  { id: 'v5', partnerId: 'p4', name: 'HealthLabs Partner', type: 'collection_vendor', status: 'active', contactName: 'Contact', email: 'contact@healthlabs.com', phone: '9876543201', loginEmails: ['contact@healthlabs.com'] },
  { id: 'v6', partnerId: 'p8', name: 'QuickCollect Partner', type: 'diagnostic_vendor', status: 'active', contactName: 'Info', email: 'info@quickcollect.com', phone: '9876543202', loginEmails: ['info@quickcollect.com'] },
]

const initialClients = [
  { id: 'c1', partnerId: 'p1', companyName: 'Infosys', industry: 'Healthcare', gstNo: '29AABCM1234F1Z5', status: 'active', contactName: 'Partners', email: 'partners@infosys.com', phone: '9876543210', loginEmails: ['partners@infosys.com', 'hr@infosys.com'] },
  { id: 'c2', partnerId: 'p3', companyName: 'TCS', industry: 'Technology', gstNo: '36AACCW5678G2Z9', status: 'active', contactName: 'BD Team', email: 'bd@tcs.com', phone: '9876543212', loginEmails: ['bd@tcs.com', 'hr@tcs.com'] },
  { id: 'c3', partnerId: 'p5', companyName: 'Wipro', industry: 'Technology', gstNo: '27AAWPL9876K1Z3', status: 'active', contactName: 'BD Team', email: 'bd@wipro.com', phone: '9876543214', loginEmails: ['bd@wipro.com', 'hr@wipro.com'] },
]

const initialCenters = [
  {
    id: 'cc1',
    vendorId: 'v1',
    name: 'Vijaya Diagnostic Main Lab',
    state: 'Karnataka',
    city: 'Bangalore',
    address: '123, MG Road, Near Metro Station',
    slots: 200,
    workingHours: {
      Monday: { isOpen: true, openTime: '08:00', closeTime: '20:00' },
      Tuesday: { isOpen: true, openTime: '08:00', closeTime: '20:00' },
      Wednesday: { isOpen: true, openTime: '08:00', closeTime: '20:00' },
      Thursday: { isOpen: true, openTime: '08:00', closeTime: '20:00' },
      Friday: { isOpen: true, openTime: '08:00', closeTime: '20:00' },
      Saturday: { isOpen: true, openTime: '09:00', closeTime: '14:00' },
      Sunday: { isOpen: false, openTime: '09:00', closeTime: '18:00' }
    }
  },
  {
    id: 'cc2',
    vendorId: 'v1',
    name: 'Vijaya Diagnostic North Branch',
    state: 'Delhi',
    city: 'New Delhi',
    address: 'Plot 45, Sector 18, Connaught Place',
    slots: 80,
    workingHours: {
      Monday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
      Tuesday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
      Wednesday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
      Thursday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
      Friday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
      Saturday: { isOpen: true, openTime: '09:00', closeTime: '13:00' },
      Sunday: { isOpen: false, openTime: '09:00', closeTime: '18:00' }
    }
  },
  {
    id: 'cc3',
    vendorId: 'v2',
    name: 'Medquest Collection Center',
    state: 'Maharashtra',
    city: 'Mumbai',
    address: 'Block A, Hiranandani Business Park, Powai',
    slots: 120,
    workingHours: {
      Monday: { isOpen: true, openTime: '07:00', closeTime: '19:00' },
      Tuesday: { isOpen: true, openTime: '07:00', closeTime: '19:00' },
      Wednesday: { isOpen: true, openTime: '07:00', closeTime: '19:00' },
      Thursday: { isOpen: true, openTime: '07:00', closeTime: '19:00' },
      Friday: { isOpen: true, openTime: '07:00', closeTime: '19:00' },
      Saturday: { isOpen: true, openTime: '08:00', closeTime: '16:00' },
      Sunday: { isOpen: true, openTime: '08:00', closeTime: '12:00' }
    }
  },
  {
    id: 'cc4',
    vendorId: 'v3',
    name: 'Vijaya Processing Hub',
    state: 'Karnataka',
    city: 'Bangalore',
    address: '45, Industrial Area, Whitefield',
    slots: 100,
    workingHours: {
      Monday: { isOpen: true, openTime: '08:00', closeTime: '18:00' },
      Tuesday: { isOpen: true, openTime: '08:00', closeTime: '18:00' },
      Wednesday: { isOpen: true, openTime: '08:00', closeTime: '18:00' },
      Thursday: { isOpen: true, openTime: '08:00', closeTime: '18:00' },
      Friday: { isOpen: true, openTime: '08:00', closeTime: '18:00' },
      Saturday: { isOpen: true, openTime: '09:00', closeTime: '14:00' },
      Sunday: { isOpen: false, openTime: '09:00', closeTime: '18:00' }
    }
  }
]

// Default 1-year tenure: endDate = startDate + 1 year
const BENEFIT_DEFAULT_START = '2026-01-01'
const BENEFIT_DEFAULT_END = '2027-01-01'

const initialBenefits = [
  // Infosys (c1): health_care, pharma, combo — primary 1000–1500, add-on 250–500
  { id: 'b1', clientId: 'c1', name: 'Corporate Gold', status: 'Active', type: 'health_care', loyalty: '1-loyalty one', paymentType: 'Regular', description: 'Health care plan for Infosys. Provides various benefits.', priceConfiguration: [{ type: 'primary', mrp: 1500, price: 1350 }, { type: 'free_addon', maxMembers: 4 }, { type: 'addon', mrp: 500, price: 400, maxMembers: 5 }], startDate: BENEFIT_DEFAULT_START, endDate: BENEFIT_DEFAULT_END, primaryPrice: 1350, addOnPrice: 400, isRenewalAllowed: true, renewalDays: 30, isProRataAllowed: true },
  { id: 'b3', clientId: 'c1', name: 'Pharma Plus', status: 'Active', type: 'pharma', loyalty: '1-loyalty one', paymentType: 'Regular', description: 'Pharma benefit for Infosys.', priceConfiguration: [{ type: 'primary', mrp: 1200, price: 1200 }], startDate: BENEFIT_DEFAULT_START, endDate: BENEFIT_DEFAULT_END, primaryPrice: 1200, addOnPrice: 0, isRenewalAllowed: false, isProRataAllowed: false },
  { id: 'b4', clientId: 'c1', name: 'Gold Combo', status: 'Active', type: 'combo', comboPharmaBenefitId: 'b3', comboHealthCareBenefitId: 'b1', priceConfiguration: [], primaryPrice: 1300, addOnPrice: 400, description: 'Health Care + Pharma combo for Infosys.', startDate: BENEFIT_DEFAULT_START, endDate: BENEFIT_DEFAULT_END },
  // TCS (c2): health_care, pharma, combo
  { id: 'b2', clientId: 'c2', name: 'Employee Wallet Basic', status: 'Active', type: 'pharma', loyalty: '1-loyalty one', paymentType: 'employee_co_pay', description: 'Employee wallet for basic wellness benefits.', priceConfiguration: [{ type: 'primary', mrp: 1200, price: 1200 }], startDate: BENEFIT_DEFAULT_START, endDate: BENEFIT_DEFAULT_END, primaryPrice: 1200, addOnPrice: 0, isRenewalAllowed: false, isProRataAllowed: false, creditLimit: 5000 },
  { id: 'b5', clientId: 'c2', name: 'TCS Health Plus', status: 'Active', type: 'health_care', loyalty: '1-loyalty one', paymentType: 'Regular', description: 'Health care plan for TCS employees.', priceConfiguration: [{ type: 'primary', mrp: 1500, price: 1440 }, { type: 'free_addon', maxMembers: 3 }, { type: 'addon', mrp: 500, price: 400, maxMembers: 4 }], startDate: BENEFIT_DEFAULT_START, endDate: BENEFIT_DEFAULT_END, primaryPrice: 1440, addOnPrice: 400, isRenewalAllowed: true, renewalDays: 30, isProRataAllowed: true },
  { id: 'b6', clientId: 'c2', name: 'TCS Combo Plan', status: 'Active', type: 'combo', comboPharmaBenefitId: 'b2', comboHealthCareBenefitId: 'b5', priceConfiguration: [], primaryPrice: 1400, addOnPrice: 400, description: 'Health Care + Pharma combo for TCS.', startDate: BENEFIT_DEFAULT_START, endDate: BENEFIT_DEFAULT_END },
  // Wipro (c3): health_care, pharma, combo
  { id: 'b7', clientId: 'c3', name: 'Wipro Wellness', status: 'Active', type: 'health_care', loyalty: '1-loyalty one', paymentType: 'Regular', description: 'Health care plan for Wipro employees.', priceConfiguration: [{ type: 'primary', mrp: 1400, price: 1260 }, { type: 'free_addon', maxMembers: 5 }, { type: 'addon', mrp: 500, price: 350, maxMembers: 5 }], startDate: BENEFIT_DEFAULT_START, endDate: BENEFIT_DEFAULT_END, primaryPrice: 1260, addOnPrice: 350, isRenewalAllowed: true, renewalDays: 30, isProRataAllowed: true },
  { id: 'b8', clientId: 'c3', name: 'Wipro Pharma Care', status: 'Active', type: 'pharma', loyalty: '1-loyalty one', paymentType: 'Regular', description: 'Pharma benefit for Wipro.', priceConfiguration: [{ type: 'primary', mrp: 1100, price: 1100 }], startDate: BENEFIT_DEFAULT_START, endDate: BENEFIT_DEFAULT_END, primaryPrice: 1100, addOnPrice: 0, isRenewalAllowed: false, isProRataAllowed: false },
  { id: 'b9', clientId: 'c3', name: 'Wipro Combo', status: 'Active', type: 'combo', comboPharmaBenefitId: 'b8', comboHealthCareBenefitId: 'b7', priceConfiguration: [], primaryPrice: 1500, addOnPrice: 350, description: 'Health Care + Pharma combo for Wipro.', startDate: BENEFIT_DEFAULT_START, endDate: BENEFIT_DEFAULT_END },
]

const initialPackages = [
  { id: 'pk1', clientId: 'c1', name: 'Executive Health Check', tests: 25, price: '₹4,999', validMonths: 12 },
  { id: 'pk2', clientId: 'c1', name: 'Basic Screening', tests: 12, price: '₹1,999', validMonths: 6 },
  { id: 'pk3', clientId: 'c2', name: 'Employee Wellness Pack', tests: 18, price: '₹2,499', validMonths: 12 },
  { id: 'pk4', clientId: 'c2', name: 'TCS Full Body Check', tests: 22, price: '₹3,999', validMonths: 12 },
  { id: 'pk5', clientId: 'c3', name: 'Wipro Preventive Care', tests: 20, price: '₹3,499', validMonths: 12 },
  { id: 'pk6', clientId: 'c3', name: 'Wipro Basic Panel', tests: 14, price: '₹2,199', validMonths: 6 },
]

const initialTopUpRequests = [
  { id: '1', totalMembers: 50, estimatedPrice: 67500, status: 'initiated', clientId: 'c1', memberDetails: [{ planName: 'Corporate Gold', primaryCount: 30, addonCount: 20 }], paymentTransactionId: '', paymentReceipt: '', verifiedBy: '', verifiedDate: '', remarks: '', createdAt: '2025-02-01T10:00:00.000Z' },
  { id: '2', totalMembers: 80, estimatedPrice: 108000, status: 'payment_done', clientId: 'c1', memberDetails: [{ planName: 'Corporate Gold', primaryCount: 50, addonCount: 30 }], paymentTransactionId: 'TXN001', paymentReceipt: '', verifiedBy: '', verifiedDate: '', remarks: '', createdAt: '2025-02-02T11:00:00.000Z' },
  { id: '3', totalMembers: 100, estimatedPrice: 135000, status: 'payment_verified', clientId: 'c2', memberDetails: [{ planName: 'Employee Wallet Basic', primaryCount: 100, addonCount: 0 }], paymentTransactionId: 'TXN002', paymentReceipt: '', verifiedBy: 'Admin', verifiedDate: '2025-02-03T10:00:00.000Z', remarks: '', createdAt: '2025-02-03T09:00:00.000Z' },
  { id: '4', totalMembers: 30, estimatedPrice: 40500, status: 'payment_rejected', clientId: 'c1', memberDetails: [{ planName: 'Corporate Gold', primaryCount: 30, addonCount: 0 }], paymentTransactionId: 'TXN003', paymentReceipt: '', verifiedBy: 'Admin', verifiedDate: '2025-02-04T10:00:00.000Z', remarks: 'Invalid payment details', createdAt: '2025-02-04T08:00:00.000Z' },
  { id: '5', totalMembers: 20, estimatedPrice: 27000, status: 'cancelled', clientId: 'c2', memberDetails: [{ planName: 'Employee Wallet Basic', primaryCount: 20, addonCount: 0 }], paymentTransactionId: '', paymentReceipt: '', verifiedBy: '', verifiedDate: '', remarks: 'Cancelled by HR', createdAt: '2025-02-05T10:00:00.000Z' },
  { id: '6', totalMembers: 60, estimatedPrice: 86400, status: 'initiated', clientId: 'c2', memberDetails: [{ planName: 'TCS Health Plus', primaryCount: 40, addonCount: 20 }], paymentTransactionId: '', paymentReceipt: '', verifiedBy: '', verifiedDate: '', remarks: '', createdAt: '2025-02-06T10:00:00.000Z' },
  { id: '7', totalMembers: 45, estimatedPrice: 92700, status: 'payment_verified', clientId: 'c2', memberDetails: [{ planName: 'TCS Combo Plan', primaryCount: 45, addonCount: 0 }], paymentTransactionId: 'TXN004', paymentReceipt: '', verifiedBy: 'Admin', verifiedDate: '2025-02-07T10:00:00.000Z', remarks: '', createdAt: '2025-02-07T09:00:00.000Z' },
  { id: '8', totalMembers: 70, estimatedPrice: 144200, status: 'payment_done', clientId: 'c3', memberDetails: [{ planName: 'Wipro Combo', primaryCount: 50, addonCount: 20 }], paymentTransactionId: 'TXN005', paymentReceipt: '', verifiedBy: '', verifiedDate: '', remarks: '', createdAt: '2025-02-08T10:00:00.000Z' },
  { id: '9', totalMembers: 25, estimatedPrice: 31500, status: 'initiated', clientId: 'c3', memberDetails: [{ planName: 'Wipro Wellness', primaryCount: 25, addonCount: 0 }], paymentTransactionId: '', paymentReceipt: '', verifiedBy: '', verifiedDate: '', remarks: '', createdAt: '2025-02-09T10:00:00.000Z' },
]

const initialBenefitRequests = [
  { id: '1', planId: 'b1', planName: 'Corporate Gold', totalPrice: 135000, uploadedDocumentName: 'employees.xlsx', clientId: 'c1', status: 'initiated', responseDocument: '', modifiedBy: '', modifiedDate: '', remarks: '', createdAt: '2025-02-01T10:00:00.000Z' },
  { id: '2', planId: 'b1', planName: 'Corporate Gold', totalPrice: 67500, uploadedDocumentName: 'addon_members.xlsx', clientId: 'c1', status: 'approved', responseDocument: 'certificate.pdf', modifiedBy: 'Admin', modifiedDate: '2025-02-05T10:00:00.000Z', remarks: '', createdAt: '2025-02-03T09:00:00.000Z' },
  { id: '3', planId: 'b2', planName: 'Employee Wallet Basic', totalPrice: 24000, uploadedDocumentName: 'invalid.xlsx', clientId: 'c2', status: 'rejected', responseDocument: '', modifiedBy: 'Admin', modifiedDate: '2025-02-06T09:00:00.000Z', remarks: 'Rejected by admin', createdAt: '2025-02-04T14:00:00.000Z' },
  { id: '4', planId: 'b2', planName: 'Employee Wallet Basic', totalPrice: 36000, uploadedDocumentName: 'cancelled_enroll.xlsx', clientId: 'c2', status: 'cancelled', responseDocument: '', modifiedBy: '', modifiedDate: '', remarks: 'Cancelled by HR', createdAt: '2025-02-07T10:00:00.000Z' },
  { id: '5', planId: 'b5', planName: 'TCS Health Plus', totalPrice: 86400, uploadedDocumentName: 'tcs_employees.xlsx', clientId: 'c2', status: 'approved', responseDocument: 'tcs_cert.pdf', modifiedBy: 'Admin', modifiedDate: '2025-02-08T10:00:00.000Z', remarks: '', createdAt: '2025-02-07T11:00:00.000Z' },
  { id: '6', planId: 'b6', planName: 'TCS Combo Plan', totalPrice: 132000, uploadedDocumentName: 'tcs_combo_enroll.xlsx', clientId: 'c2', status: 'initiated', responseDocument: '', modifiedBy: '', modifiedDate: '', remarks: '', createdAt: '2025-02-09T10:00:00.000Z' },
  { id: '7', planId: 'b7', planName: 'Wipro Wellness', totalPrice: 63000, uploadedDocumentName: 'wipro_wellness.xlsx', clientId: 'c3', status: 'approved', responseDocument: 'wipro_cert.pdf', modifiedBy: 'Admin', modifiedDate: '2025-02-10T10:00:00.000Z', remarks: '', createdAt: '2025-02-09T14:00:00.000Z' },
  { id: '8', planId: 'b9', planName: 'Wipro Combo', totalPrice: 103000, uploadedDocumentName: 'wipro_combo.xlsx', clientId: 'c3', status: 'payment_done', responseDocument: '', modifiedBy: '', modifiedDate: '', remarks: '', createdAt: '2025-02-10T09:00:00.000Z' },
]

const formTypes = [
  'MRI',
  'CT SCAN',
  'X-RAY',
  'ULTRASOUND',
  'MAMMOGRAPHY',
  'TMT',
  'EEG / ENMG',
  'ECG',
  'BONE DENSITOMETRY',
  'DENTAL OPG / CBCT',
  'AUDIOMETRY',
  'VIDEO ENDOSCOPY',
  'PFT',
  'PATHOLOGY',
  '2D ECHO',
  'Doctors',
  'CONTRAST AND OTHER',
  'CLINICAL SERVICES',
  '1.5T MRI',
  'BODY VITALS',
  'ULTRASOUND PCPNDT',
]

const initialTests = [
  { id: 't1', partnerId: 'p2', testCode: 'VD-001', testName: 'Complete Blood Count (CBC)', category: 'Haematology', parameters: 'Hemoglobin, WBC, RBC, Platelets, PCV, MCV, MCH, MCHC', mrp: 600, price: 450, tat: '6 hours', sampleType: 'Blood', homeCollection: true, formType: 'PATHALOGY', status: 'active' },
  { id: 't2', partnerId: 'p2', testCode: 'VD-002', testName: 'Lipid Profile', category: 'Biochemistry', parameters: 'Total Cholesterol, HDL, LDL, Triglycerides, VLDL', mrp: 900, price: 700, tat: '12 hours', sampleType: 'Blood', homeCollection: true, formType: 'PATHALOGY', status: 'active' },
  { id: 't3', partnerId: 'p2', testCode: 'VD-003', testName: 'Thyroid Profile (T3, T4, TSH)', category: 'Endocrinology', parameters: 'T3, T4, TSH', mrp: 1200, price: 950, tat: '24 hours', sampleType: 'Blood', homeCollection: true, formType: 'PATHALOGY', status: 'active' },
  { id: 't4', partnerId: 'p2', testCode: 'VD-004', testName: 'Blood Glucose Fasting', category: 'Biochemistry', parameters: 'Blood Glucose', mrp: 200, price: 150, tat: '4 hours', sampleType: 'Blood', homeCollection: true, formType: 'PATHALOGY', status: 'active' },
  { id: 't5', partnerId: 'p2', testCode: 'MQ-001', testName: 'Urine Routine & Microscopy', category: 'Microbiology', parameters: 'Color, Transparency, pH, Protein, Glucose, WBCs, RBCs, Casts', mrp: 300, price: 220, tat: '6 hours', sampleType: 'Urine', homeCollection: false, formType: 'PATHALOGY', status: 'active' },
  { id: 't6', partnerId: 'p2', testCode: 'MQ-002', testName: 'Liver Function Test (LFT)', category: 'Biochemistry', parameters: 'Bilirubin, ALT, AST, ALP, Albumin, Total Protein', mrp: 1100, price: 850, tat: '12 hours', sampleType: 'Blood', homeCollection: true, formType: 'PATHALOGY', status: 'active' },
  { id: 't7', partnerId: 'p2', testCode: 'MQ-003', testName: 'Kidney Function Test (KFT)', category: 'Biochemistry', parameters: 'Creatinine, Urea, Uric Acid, Electrolytes', mrp: 850, price: 680, tat: '12 hours', sampleType: 'Blood', homeCollection: true, formType: 'PATHALOGY', status: 'active' },
]

const initialTestCenterMappings = [
  { id: 'tcm1', partnerId: 'p2', centerId: 'cc1', testId: 't1', testCode: 'VD-001', testName: 'Complete Blood Count (CBC)', category: 'Haematology', partnerPrice: 450, centerPrice: 420, status: 'active' },
  { id: 'tcm2', partnerId: 'p2', centerId: 'cc1', testId: 't2', testCode: 'VD-002', testName: 'Lipid Profile', category: 'Biochemistry', partnerPrice: 700, centerPrice: 670, status: 'active' },
  { id: 'tcm3', partnerId: 'p2', centerId: 'cc1', testId: 't3', testCode: 'VD-003', testName: 'Thyroid Profile (T3, T4, TSH)', category: 'Endocrinology', partnerPrice: 950, centerPrice: 900, status: 'active' },
  { id: 'tcm4', partnerId: 'p2', centerId: 'cc1', testId: 't4', testCode: 'VD-004', testName: 'Blood Glucose Fasting', category: 'Biochemistry', partnerPrice: 150, centerPrice: 140, status: 'active' },
  { id: 'tcm5', partnerId: 'p2', centerId: 'cc2', testId: 't1', testCode: 'VD-001', testName: 'Complete Blood Count (CBC)', category: 'Haematology', partnerPrice: 450, centerPrice: 440, status: 'active' },
  { id: 'tcm6', partnerId: 'p2', centerId: 'cc2', testId: 't2', testCode: 'VD-002', testName: 'Lipid Profile', category: 'Biochemistry', partnerPrice: 700, centerPrice: 690, status: 'active' },
  { id: 'tcm7', partnerId: 'p2', centerId: 'cc3', testId: 't5', testCode: 'MQ-001', testName: 'Urine Routine & Microscopy', category: 'Microbiology', partnerPrice: 220, centerPrice: 200, status: 'active' },
  { id: 'tcm8', partnerId: 'p2', centerId: 'cc3', testId: 't6', testCode: 'MQ-002', testName: 'Liver Function Test (LFT)', category: 'Biochemistry', partnerPrice: 850, centerPrice: 820, status: 'active' },
  { id: 'tcm9', partnerId: 'p2', centerId: 'cc3', testId: 't7', testCode: 'MQ-003', testName: 'Kidney Function Test (KFT)', category: 'Biochemistry', partnerPrice: 680, centerPrice: 650, status: 'active' },
]

// Wallet balance per client (credits when admin verifies top-up payment)
function computeInitialOrganizationWallets(requests) {
  const wallets = {}
  ;(requests || []).filter((r) => r.status === 'payment_verified').forEach((r) => {
    const cid = r.clientId || r.organizationId || ''
    if (cid) wallets[cid] = (wallets[cid] || 0) + (Number(r.estimatedPrice) || 0)
  })
  return wallets
}

const initialOrganizationWallets = computeInitialOrganizationWallets(initialTopUpRequests)

// Organization summary data (from dashboardStore.js)
const initialOrganizationSummaries = [
  {
    id: 'os1',
    clientId: 'c1',
    companyName: 'Infosys',
    healthcareSubscriptions: { active: 4, activeMembers: 10, serviced: 0, servicedMembers: 0, cancelled: 0 },
    pharmaSubscriptions: { active: 7, activeMembers: 7, serviced: 0, servicedMembers: 0, cancelled: 0 }, // activeMembers = active (1:1)
    revenue: [
      { category: 'Healthcare', mrpValue: 125000, purchaseValue: 95000, savings: 30000 },
      { category: 'Pharma', mrpValue: 85000, purchaseValue: 68000, savings: 17000 },
      { category: 'Diagnostics', mrpValue: 45000, purchaseValue: 36000, savings: 9000 },
    ],
    agreement: { startDate: '2026-02-17', endDate: '2026-03-31', status: 'Active' },
  },
  {
    id: 'os2',
    clientId: 'c2',
    companyName: 'TCS',
    healthcareSubscriptions: { active: 3, activeMembers: 7, serviced: 1, servicedMembers: 4, cancelled: 0 },
    pharmaSubscriptions: { active: 5, activeMembers: 5, serviced: 0, servicedMembers: 0, cancelled: 1 }, // activeMembers = active (1:1)
    revenue: [
      { category: 'Healthcare', mrpValue: 95000, purchaseValue: 75000, savings: 20000 },
      { category: 'Pharma', mrpValue: 65000, purchaseValue: 52000, savings: 13000 },
      { category: 'Diagnostics', mrpValue: 35000, purchaseValue: 28000, savings: 7000 },
    ],
    agreement: { startDate: '2026-01-01', endDate: '2026-12-31', status: 'Active' },
  },
  {
    id: 'os3',
    clientId: 'c3',
    companyName: 'Wipro',
    healthcareSubscriptions: { active: 0, activeMembers: 0, serviced: 0, servicedMembers: 0, cancelled: 0 },
    pharmaSubscriptions: { active: 8, activeMembers: 8, serviced: 2, servicedMembers: 2, cancelled: 0 }, // activeMembers = active (1:1), servicedMembers = serviced (1:1)
    revenue: [
      { category: 'Pharma', mrpValue: 110000, purchaseValue: 88000, savings: 22000 },
      { category: 'Diagnostics', mrpValue: 55000, purchaseValue: 44000, savings: 11000 },
    ],
    agreement: { startDate: '2026-02-01', endDate: '2027-01-31', status: 'Active' },
  },
]

// HR user to organization mapping (from dashboardStore.js)
const initialHrUsers = [
  { email: 'hr@infosys.com', clientId: 'c1', companyName: 'Infosys' },
  { email: 'admin@infosys.com', clientId: 'c1', companyName: 'Infosys' },
  { email: 'hr@tcs.com', clientId: 'c2', companyName: 'TCS' },
  { email: 'hr@wipro.com', clientId: 'c3', companyName: 'Wipro' },
]

// Subscription records (from dashboardStore.js) - abbreviated for brevity
const initialSubscriptionRecords = [
  // Healthcare subscriptions for Infosys (c1) - All active, none serviced
  { id: 'sub001', clientId: 'c1', type: 'healthcare', planId: 'b1', planName: 'Corporate Gold', subscriptionId: '10860678', createdOn: '2026-02-17', activedOn: '2026-02-17', expiryDate: '2026-02-24', status: 'active', customer: 'Pranay', mobileNo: '8460001456', members: 4, mrpSpends: 0, actualSpends: 0, savings: 0, mrpUsed: 0, mrpBalance: 1000, isServiced: false },
  { id: 'sub002', clientId: 'c1', type: 'healthcare', planId: 'b1', planName: 'Corporate Gold', subscriptionId: '10860679', createdOn: '2026-02-12', activedOn: '2026-02-12', expiryDate: '2026-02-24', status: 'active', customer: 'Jaikannan', mobileNo: '9000012345', members: 2, mrpSpends: 0, actualSpends: 0, savings: 0, mrpUsed: 0, mrpBalance: 1000, isServiced: false },
  { id: 'sub003', clientId: 'c1', type: 'healthcare', planId: 'b1', planName: 'Corporate Gold', subscriptionId: '10860680', createdOn: '2026-02-10', activedOn: '2026-02-10', expiryDate: '2026-02-22', status: 'active', customer: 'Ramesh', mobileNo: '9876543210', members: 3, mrpSpends: 0, actualSpends: 0, savings: 0, mrpUsed: 0, mrpBalance: 1000, isServiced: false },
  { id: 'sub004', clientId: 'c1', type: 'healthcare', planId: 'b1', planName: 'Corporate Gold', subscriptionId: '10860681', createdOn: '2026-02-08', activedOn: '2026-02-08', expiryDate: '2026-02-20', status: 'active', customer: 'Suresh', mobileNo: '9123456789', members: 1, mrpSpends: 0, actualSpends: 0, savings: 0, mrpUsed: 0, mrpBalance: 1000, isServiced: false },

  // Pharma subscriptions for Infosys (c1) - All active, none serviced
  { id: 'sub005', clientId: 'c1', type: 'pharma', planId: 'b3', planName: 'Pharma Plus', subscriptionId: '10860682', createdOn: '2026-02-17', activedOn: '2026-02-17', expiryDate: '2026-02-24', status: 'active', customer: 'Pranay', mobileNo: '8460001456', members: 1, mrpSpends: 0, actualSpends: 0, savings: 0, mrpUsed: 0, mrpBalance: 1000, isServiced: false },
  { id: 'sub006', clientId: 'c1', type: 'pharma', planId: 'b3', planName: 'Pharma Plus', subscriptionId: '10860683', createdOn: '2026-02-16', activedOn: '2026-02-16', expiryDate: '2026-02-23', status: 'active', customer: 'Jaikannan', mobileNo: '9000012345', members: 1, mrpSpends: 0, actualSpends: 0, savings: 0, mrpUsed: 0, mrpBalance: 1000, isServiced: false },
  { id: 'sub007', clientId: 'c1', type: 'pharma', planId: 'b3', planName: 'Pharma Plus', subscriptionId: '10860684', createdOn: '2026-02-15', activedOn: '2026-02-15', expiryDate: '2026-02-22', status: 'active', customer: 'Ramesh', mobileNo: '9876543210', members: 1, mrpSpends: 0, actualSpends: 0, savings: 0, mrpUsed: 0, mrpBalance: 1000, isServiced: false },
  { id: 'sub008', clientId: 'c1', type: 'pharma', planId: 'b3', planName: 'Pharma Plus', subscriptionId: '10860685', createdOn: '2026-02-14', activedOn: '2026-02-14', expiryDate: '2026-02-21', status: 'active', customer: 'Suresh', mobileNo: '9123456789', members: 1, mrpSpends: 0, actualSpends: 0, savings: 0, mrpUsed: 0, mrpBalance: 1000, isServiced: false },
  { id: 'sub009', clientId: 'c1', type: 'pharma', planId: 'b3', planName: 'Pharma Plus', subscriptionId: '10860686', createdOn: '2026-02-13', activedOn: '2026-02-13', expiryDate: '2026-02-20', status: 'active', customer: 'Vijay', mobileNo: '9988776655', members: 1, mrpSpends: 0, actualSpends: 0, savings: 0, mrpUsed: 0, mrpBalance: 1000, isServiced: false },
  { id: 'sub010', clientId: 'c1', type: 'pharma', planId: 'b3', planName: 'Pharma Plus', subscriptionId: '10860687', createdOn: '2026-02-12', activedOn: '2026-02-12', expiryDate: '2026-02-19', status: 'active', customer: 'Kumar', mobileNo: '9876512345', members: 1, mrpSpends: 0, actualSpends: 0, savings: 0, mrpUsed: 0, mrpBalance: 1000, isServiced: false },
  { id: 'sub011', clientId: 'c1', type: 'pharma', planId: 'b3', planName: 'Pharma Plus', subscriptionId: '10860688', createdOn: '2026-02-11', activedOn: '2026-02-11', expiryDate: '2026-02-18', status: 'active', customer: 'Arun', mobileNo: '9123498765', members: 1, mrpSpends: 0, actualSpends: 0, savings: 0, mrpUsed: 0, mrpBalance: 1000, isServiced: false },
  // Healthcare subscriptions for TCS (c2) - 3 active, 1 serviced
  { id: 'sub012', clientId: 'c2', type: 'healthcare', planId: 'b5', planName: 'TCS Health Plan', subscriptionId: '10860689', createdOn: '2026-02-10', activedOn: '2026-02-10', expiryDate: '2026-02-24', status: 'active', customer: 'Anita', mobileNo: '9876501234', members: 4, mrpSpends: 1200.00, actualSpends: 950.00, savings: 250.00, mrpUsed: 500, mrpBalance: 500, isServiced: true },
  { id: 'sub013', clientId: 'c2', type: 'healthcare', planId: 'b5', planName: 'TCS Health Plan', subscriptionId: '10860690', createdOn: '2026-02-09', activedOn: '2026-02-09', expiryDate: '2026-02-23', status: 'active', customer: 'Deepak', mobileNo: '9123450987', members: 2, mrpSpends: 0, actualSpends: 0, savings: 0, mrpUsed: 0, mrpBalance: 1000, isServiced: false },
  { id: 'sub014', clientId: 'c2', type: 'healthcare', planId: 'b5', planName: 'TCS Health Plan', subscriptionId: '10860691', createdOn: '2026-02-08', activedOn: '2026-02-08', expiryDate: '2026-02-22', status: 'active', customer: 'Priya', mobileNo: '9988001122', members: 1, mrpSpends: 0, actualSpends: 0, savings: 0, mrpUsed: 0, mrpBalance: 1000, isServiced: false },

  // Pharma subscriptions for TCS (c2) - 5 active, 0 serviced, 1 cancelled
  { id: 'sub015', clientId: 'c2', type: 'pharma', planId: 'b2', planName: 'Employee Wallet Basic', subscriptionId: '10860692', createdOn: '2026-02-15', activedOn: '2026-02-15', expiryDate: '2026-02-25', status: 'active', customer: 'Anita', mobileNo: '9876501234', members: 1, mrpSpends: 0, actualSpends: 0, savings: 0, mrpUsed: 0, mrpBalance: 1000, isServiced: false, creditLimit: 5000 },
  { id: 'sub016', clientId: 'c2', type: 'pharma', planId: 'b2', planName: 'Employee Wallet Basic', subscriptionId: '10860693', createdOn: '2026-02-14', activedOn: '2026-02-14', expiryDate: '2026-02-24', status: 'active', customer: 'Deepak', mobileNo: '9123450987', members: 1, mrpSpends: 0, actualSpends: 0, savings: 0, mrpUsed: 0, mrpBalance: 1000, isServiced: false, creditLimit: 5000 },
  { id: 'sub017', clientId: 'c2', type: 'pharma', planId: 'b2', planName: 'Employee Wallet Basic', subscriptionId: '10860694', createdOn: '2026-02-13', activedOn: '2026-02-13', expiryDate: '2026-02-23', status: 'active', customer: 'Priya', mobileNo: '9988001122', members: 1, mrpSpends: 0, actualSpends: 0, savings: 0, mrpUsed: 0, mrpBalance: 1000, isServiced: false, creditLimit: 5000 },
  { id: 'sub018', clientId: 'c2', type: 'pharma', planId: 'b2', planName: 'Employee Wallet Basic', subscriptionId: '10860695', createdOn: '2026-02-12', activedOn: '2026-02-12', expiryDate: '2026-02-22', status: 'active', customer: 'Ravi', mobileNo: '9876123450', members: 1, mrpSpends: 0, actualSpends: 0, savings: 0, mrpUsed: 0, mrpBalance: 1000, isServiced: false, creditLimit: 5000 },
  { id: 'sub019', clientId: 'c2', type: 'pharma', planId: 'b2', planName: 'Employee Wallet Basic', subscriptionId: '10860696', createdOn: '2026-02-11', activedOn: '2026-02-11', expiryDate: '2026-02-21', status: 'active', customer: 'Sanjay', mobileNo: '9123987654', members: 1, mrpSpends: 0, actualSpends: 0, savings: 0, mrpUsed: 0, mrpBalance: 1000, isServiced: false, creditLimit: 5000 },
  { id: 'sub019b', clientId: 'c2', type: 'pharma', planId: 'b2', planName: 'Employee Wallet Basic', subscriptionId: '10860696b', createdOn: '2026-01-11', activedOn: '2026-01-11', expiryDate: '2026-02-10', status: 'cancelled', customer: 'Mohan', mobileNo: '9123987655', members: 1, mrpSpends: 850.00, actualSpends: 720.00, savings: 130.00, mrpUsed: 300, mrpBalance: 700, isServiced: true, creditLimit: 5000 },
  // Pharma subscriptions for Wipro (c3) - 8 active, 2 serviced
  { id: 'sub020', clientId: 'c3', type: 'pharma', planId: 'b6', planName: 'Wipro Pharma Care', subscriptionId: '10860697', createdOn: '2026-02-16', activedOn: '2026-02-16', expiryDate: '2026-02-26', status: 'active', customer: 'Mohan', mobileNo: '9988112233', members: 1, mrpSpends: 1500.00, actualSpends: 1200.00, savings: 300.00, mrpUsed: 800, mrpBalance: 200, isServiced: true },
  { id: 'sub021', clientId: 'c3', type: 'pharma', planId: 'b6', planName: 'Wipro Pharma Care', subscriptionId: '10860698', createdOn: '2026-02-15', activedOn: '2026-02-15', expiryDate: '2026-02-25', status: 'active', customer: 'Lakshmi', mobileNo: '9876554321', members: 1, mrpSpends: 1800.00, actualSpends: 1500.00, savings: 300.00, mrpUsed: 600, mrpBalance: 400, isServiced: true },
  { id: 'sub022', clientId: 'c3', type: 'pharma', planId: 'b6', planName: 'Wipro Pharma Care', subscriptionId: '10860699', createdOn: '2026-02-14', activedOn: '2026-02-14', expiryDate: '2026-02-24', status: 'active', customer: 'Ganesh', mobileNo: '9123776655', members: 1, mrpSpends: 0, actualSpends: 0, savings: 0, mrpUsed: 0, mrpBalance: 1000, isServiced: false },
  { id: 'sub023', clientId: 'c3', type: 'pharma', planId: 'b6', planName: 'Wipro Pharma Care', subscriptionId: '10860700', createdOn: '2026-02-13', activedOn: '2026-02-13', expiryDate: '2026-02-23', status: 'active', customer: 'Karthik', mobileNo: '9988334455', members: 1, mrpSpends: 0, actualSpends: 0, savings: 0, mrpUsed: 0, mrpBalance: 1000, isServiced: false },
  { id: 'sub024', clientId: 'c3', type: 'pharma', planId: 'b6', planName: 'Wipro Pharma Care', subscriptionId: '10860701', createdOn: '2026-02-12', activedOn: '2026-02-12', expiryDate: '2026-02-22', status: 'active', customer: 'Naveen', mobileNo: '9876998877', members: 1, mrpSpends: 0, actualSpends: 0, savings: 0, mrpUsed: 0, mrpBalance: 1000, isServiced: false },
  { id: 'sub025', clientId: 'c3', type: 'pharma', planId: 'b6', planName: 'Wipro Pharma Care', subscriptionId: '10860702', createdOn: '2026-02-11', activedOn: '2026-02-11', expiryDate: '2026-02-21', status: 'active', customer: 'Rajesh', mobileNo: '9123665544', members: 1, mrpSpends: 0, actualSpends: 0, savings: 0, mrpUsed: 0, mrpBalance: 1000, isServiced: false },
  { id: 'sub026', clientId: 'c3', type: 'pharma', planId: 'b6', planName: 'Wipro Pharma Care', subscriptionId: '10860703', createdOn: '2026-02-10', activedOn: '2026-02-10', expiryDate: '2026-02-20', status: 'active', customer: 'Venkat', mobileNo: '9988223344', members: 1, mrpSpends: 0, actualSpends: 0, savings: 0, mrpUsed: 0, mrpBalance: 1000, isServiced: false },
  { id: 'sub027', clientId: 'c3', type: 'pharma', planId: 'b6', planName: 'Wipro Pharma Care', subscriptionId: '10860704', createdOn: '2026-02-09', activedOn: '2026-02-09', expiryDate: '2026-02-19', status: 'active', customer: 'Harish', mobileNo: '9876445566', members: 1, mrpSpends: 0, actualSpends: 0, savings: 0, mrpUsed: 0, mrpBalance: 1000, isServiced: false },
]

// Subscription members - maps subscriptionId to array of members
const initialSubscriptionMembers = [
  // Healthcare subscription 10860678 - Pranay with family (4 members)
  { subscriptionId: '10860678', name: 'Pranay', isPrimary: true, addedOn: '2026-02-17' },
  { subscriptionId: '10860678', name: 'Priya Pranay', isPrimary: false, addedOn: '2026-02-17' },
  { subscriptionId: '10860678', name: 'Aarav Pranay', isPrimary: false, addedOn: '2026-02-17' },
  { subscriptionId: '10860678', name: 'Ananya Pranay', isPrimary: false, addedOn: '2026-02-18' },

  // Healthcare subscription 10860679 - Jaikannan with spouse (2 members)
  { subscriptionId: '10860679', name: 'Jaikannan', isPrimary: true, addedOn: '2026-02-12' },
  { subscriptionId: '10860679', name: 'Lakshmi Jaikannan', isPrimary: false, addedOn: '2026-02-12' },

  // Healthcare subscription 10860680 - Ramesh with family (3 members)
  { subscriptionId: '10860680', name: 'Ramesh', isPrimary: true, addedOn: '2026-02-10' },
  { subscriptionId: '10860680', name: 'Kavitha Ramesh', isPrimary: false, addedOn: '2026-02-10' },
  { subscriptionId: '10860680', name: 'Rohan Ramesh', isPrimary: false, addedOn: '2026-02-11' },

  // Healthcare subscription 10860681 - Suresh (single member)
  { subscriptionId: '10860681', name: 'Suresh', isPrimary: true, addedOn: '2026-02-08' },

  // Pharma subscriptions (single members)
  { subscriptionId: '10860682', name: 'Pranay', isPrimary: true, addedOn: '2026-02-17' },
  { subscriptionId: '10860683', name: 'Jaikannan', isPrimary: true, addedOn: '2026-02-16' },
  { subscriptionId: '10860684', name: 'Ramesh', isPrimary: true, addedOn: '2026-02-15' },
  { subscriptionId: '10860685', name: 'Suresh', isPrimary: true, addedOn: '2026-02-14' },
  { subscriptionId: '10860686', name: 'Vijay', isPrimary: true, addedOn: '2026-02-13' },
  { subscriptionId: '10860687', name: 'Kumar', isPrimary: true, addedOn: '2026-02-12' },
  { subscriptionId: '10860688', name: 'Arun', isPrimary: true, addedOn: '2026-02-11' },

  // Healthcare subscription 10860689 - Anita with family (4 members) - TCS
  { subscriptionId: '10860689', name: 'Anita', isPrimary: true, addedOn: '2026-02-10' },
  { subscriptionId: '10860689', name: 'Rajesh Kumar', isPrimary: false, addedOn: '2026-02-10' },
  { subscriptionId: '10860689', name: 'Arjun Kumar', isPrimary: false, addedOn: '2026-02-10' },
  { subscriptionId: '10860689', name: 'Meera Kumar', isPrimary: false, addedOn: '2026-02-11' },

  // Healthcare subscription 10860690 - Deepak with spouse (2 members) - TCS
  { subscriptionId: '10860690', name: 'Deepak', isPrimary: true, addedOn: '2026-02-09' },
  { subscriptionId: '10860690', name: 'Sneha Deepak', isPrimary: false, addedOn: '2026-02-09' },

  // Healthcare subscription 10860691 - Priya (single member) - TCS
  { subscriptionId: '10860691', name: 'Priya', isPrimary: true, addedOn: '2026-02-08' },

  // Pharma subscriptions (single members)
  { subscriptionId: '10860692', name: 'Anita', isPrimary: true, addedOn: '2026-02-15' },
  { subscriptionId: '10860693', name: 'Deepak', isPrimary: true, addedOn: '2026-02-14' },
  { subscriptionId: '10860694', name: 'Priya', isPrimary: true, addedOn: '2026-02-13' },
  { subscriptionId: '10860695', name: 'Ravi', isPrimary: true, addedOn: '2026-02-12' },
  { subscriptionId: '10860696', name: 'Sanjay', isPrimary: true, addedOn: '2026-02-11' },
  { subscriptionId: '10860696b', name: 'Mohan', isPrimary: true, addedOn: '2026-01-11' },
  { subscriptionId: '10860697', name: 'Mohan', isPrimary: true, addedOn: '2026-02-16' },
  { subscriptionId: '10860698', name: 'Lakshmi', isPrimary: true, addedOn: '2026-02-15' },
  { subscriptionId: '10860699', name: 'Ganesh', isPrimary: true, addedOn: '2026-02-14' },
  { subscriptionId: '10860700', name: 'Karthik', isPrimary: true, addedOn: '2026-02-13' },
  { subscriptionId: '10860701', name: 'Naveen', isPrimary: true, addedOn: '2026-02-12' },
  { subscriptionId: '10860702', name: 'Rajesh', isPrimary: true, addedOn: '2026-02-11' },
  { subscriptionId: '10860703', name: 'Venkat', isPrimary: true, addedOn: '2026-02-10' },
  { subscriptionId: '10860704', name: 'Harish', isPrimary: true, addedOn: '2026-02-09' },
]

// Function to generate slots from active subscriptions
function generateSlotsFromSubscriptions() {
  const slots = []
  let healthcareSlotCounter = 1
  let pharmaSlotCounter = 1

  // Process all subscriptions (both active and cancelled)
  initialSubscriptionRecords.forEach((sub, index) => {
    // Find the benefit plan for this subscription
    const plan = initialBenefits.find(b => b.id === sub.planId)
    if (!plan) return

    // Extract addon limits from plan's priceConfiguration
    const freeAddonConfig = plan.priceConfiguration.find(pc => pc.type === 'free_addon')
    const paidAddonConfig = plan.priceConfiguration.find(pc => pc.type === 'addon')

    const maxFreeAddons = freeAddonConfig ? freeAddonConfig.maxMembers : 0
    const maxPaidAddons = paidAddonConfig ? paidAddonConfig.maxMembers : 0

    // Count members for this subscription
    const members = initialSubscriptionMembers.filter(m => m.subscriptionId === sub.subscriptionId)
    const totalMembers = members.length
    const addonMembers = totalMembers - 1 // Subtract 1 for primary member

    // Calculate current free and paid addons
    let currentFreeAddons = 0
    let currentPaidAddons = 0

    if (addonMembers > 0) {
      if (addonMembers <= maxFreeAddons) {
        currentFreeAddons = addonMembers
        currentPaidAddons = 0
      } else {
        currentFreeAddons = maxFreeAddons
        currentPaidAddons = addonMembers - maxFreeAddons
      }
    }

    // Generate slot ID
    const slotType = sub.type === 'healthcare' ? 'HC' : 'PH'
    const slotNumber = sub.type === 'healthcare' ? healthcareSlotCounter++ : pharmaSlotCounter++
    const slotId = `SL-${slotType}-${String(slotNumber).padStart(3, '0')}`

    // Determine slot status
    let status = 'active'
    if (sub.status === 'cancelled') {
      status = 'available'
    } else {
      // Check if slot is expired based on plan end date
      const today = new Date()
      const endDate = new Date(plan.endDate)
      if (today > endDate) {
        status = 'expired'
      }
    }

    // Create slot object; subscriptionIds array for combo support (one slot, multiple subscriptions)
    const slot = {
      id: `slot${String(index + 1).padStart(3, '0')}`,
      slotId,
      clientId: sub.clientId,
      planId: sub.planId,
      planName: sub.planName,
      type: sub.type,
      validFrom: plan.startDate,
      validTo: plan.endDate,
      status,
      subscriptionId: sub.status === 'cancelled' ? null : sub.subscriptionId,
      subscriptionIds: sub.status === 'cancelled' ? [] : [sub.subscriptionId],
      maxFreeAddons,
      maxPaidAddons,
      currentFreeAddons,
      currentPaidAddons,
    }

    slots.push(slot)
  })

  return slots
}

// Slots - Generated from active subscriptions
// When subscription is cancelled, slot becomes available for re-enrollment
const initialSlots = generateSlotsFromSubscriptions()

// City Catalogues - Seed data for different cities
// City Catalogues - Auto-generated when tests are mapped to collection centers
const initialCityCatalogues = [
  {
    id: 'ctlg_auto_1737800000000_abc123def',
    name: 'Bangalore Diagnostic Tests',
    state: 'Karnataka',
    city: 'Bangalore',
    description: 'Auto-generated catalogue for Bangalore, Karnataka',
    status: 'active',
    createdAt: '2026-01-15T10:00:00.000Z'
  },
  {
    id: 'ctlg_auto_1738232000000_xyz456ghi',
    name: 'New Delhi Diagnostic Tests',
    state: 'Delhi',
    city: 'New Delhi',
    description: 'Auto-generated catalogue for New Delhi, Delhi',
    status: 'active',
    createdAt: '2026-01-20T10:00:00.000Z'
  },
  {
    id: 'ctlg_auto_1738664000000_jkl789mno',
    name: 'Mumbai Diagnostic Tests',
    state: 'Maharashtra',
    city: 'Mumbai',
    description: 'Auto-generated catalogue for Mumbai, Maharashtra',
    status: 'active',
    createdAt: '2026-02-01T10:00:00.000Z'
  },
  {
    id: 'ctlg_auto_1739096000000_pqr012stu',
    name: 'Hyderabad Diagnostic Tests',
    state: 'Telangana',
    city: 'Hyderabad',
    description: 'Auto-generated catalogue for Hyderabad, Telangana',
    status: 'active',
    createdAt: '2026-02-10T10:00:00.000Z'
  }
]

// City Catalogue Test Mappings - Auto-generated when tests are mapped to collection centers
const initialCityCatalogueTestMappings = [
  // Bangalore Diagnostic Tests - All Vijaya Diagnostic tests
  { id: 'ctm_auto_1737800100000_aaa111bbb', catalogueId: 'ctlg_auto_1737800000000_abc123def', testId: 't1', testCode: 'VD-001', testName: 'Complete Blood Count (CBC)', category: 'Haematology', partnerId: 'p2', status: 'active' },
  { id: 'ctm_auto_1737800200000_ccc222ddd', catalogueId: 'ctlg_auto_1737800000000_abc123def', testId: 't2', testCode: 'VD-002', testName: 'Lipid Profile', category: 'Biochemistry', partnerId: 'p2', status: 'active' },
  { id: 'ctm_auto_1737800300000_eee333fff', catalogueId: 'ctlg_auto_1737800000000_abc123def', testId: 't3', testCode: 'VD-003', testName: 'Thyroid Profile (T3, T4, TSH)', category: 'Endocrinology', partnerId: 'p2', status: 'active' },
  { id: 'ctm_auto_1737800400000_ggg444hhh', catalogueId: 'ctlg_auto_1737800000000_abc123def', testId: 't4', testCode: 'VD-004', testName: 'Blood Glucose Fasting', category: 'Biochemistry', partnerId: 'p2', status: 'active' },

  // New Delhi Diagnostic Tests - Selected tests from Vijaya Diagnostic
  { id: 'ctm_auto_1738232100000_iii555jjj', catalogueId: 'ctlg_auto_1738232000000_xyz456ghi', testId: 't1', testCode: 'VD-001', testName: 'Complete Blood Count (CBC)', category: 'Haematology', partnerId: 'p2', status: 'active' },
  { id: 'ctm_auto_1738232200000_kkk666lll', catalogueId: 'ctlg_auto_1738232000000_xyz456ghi', testId: 't2', testCode: 'VD-002', testName: 'Lipid Profile', category: 'Biochemistry', partnerId: 'p2', status: 'active' },
  { id: 'ctm_auto_1738232300000_mmm777nnn', catalogueId: 'ctlg_auto_1738232000000_xyz456ghi', testId: 't4', testCode: 'VD-004', testName: 'Blood Glucose Fasting', category: 'Biochemistry', partnerId: 'p2', status: 'active' },

  // Mumbai Diagnostic Tests - All Medquest tests
  { id: 'ctm_auto_1738664100000_ooo888ppp', catalogueId: 'ctlg_auto_1738664000000_jkl789mno', testId: 't5', testCode: 'MQ-001', testName: 'Urine Routine & Microscopy', category: 'Microbiology', partnerId: 'p4', status: 'active' },
  { id: 'ctm_auto_1738664200000_qqq999rrr', catalogueId: 'ctlg_auto_1738664000000_jkl789mno', testId: 't6', testCode: 'MQ-002', testName: 'Liver Function Test (LFT)', category: 'Biochemistry', partnerId: 'p4', status: 'active' },
  { id: 'ctm_auto_1738664300000_sss000ttt', catalogueId: 'ctlg_auto_1738664000000_jkl789mno', testId: 't7', testCode: 'MQ-003', testName: 'Kidney Function Test (KFT)', category: 'Biochemistry', partnerId: 'p4', status: 'active' },

  // Hyderabad Diagnostic Tests - Mix of tests from both partners
  { id: 'ctm_auto_1739096100000_uuu111vvv', catalogueId: 'ctlg_auto_1739096000000_pqr012stu', testId: 't1', testCode: 'VD-001', testName: 'Complete Blood Count (CBC)', category: 'Haematology', partnerId: 'p2', status: 'active' },
  { id: 'ctm_auto_1739096200000_www222xxx', catalogueId: 'ctlg_auto_1739096000000_pqr012stu', testId: 't3', testCode: 'VD-003', testName: 'Thyroid Profile (T3, T4, TSH)', category: 'Endocrinology', partnerId: 'p2', status: 'active' },
  { id: 'ctm_auto_1739096300000_yyy333zzz', catalogueId: 'ctlg_auto_1739096000000_pqr012stu', testId: 't6', testCode: 'MQ-002', testName: 'Liver Function Test (LFT)', category: 'Biochemistry', partnerId: 'p4', status: 'active' },
  { id: 'ctm_auto_1739096400000_aaa444bbb', catalogueId: 'ctlg_auto_1739096000000_pqr012stu', testId: 't7', testCode: 'MQ-003', testName: 'Kidney Function Test (KFT)', category: 'Biochemistry', partnerId: 'p4', status: 'active' },
]

export const useDashboardStore = create(
  persist(
    (set) => ({
        partners: initialPartners,
        vendors: initialVendors,
        clients: initialClients,
        centers: initialCenters,
        benefits: initialBenefits,
        packages: initialPackages,
        tests: initialTests,
        testCenterMappings: initialTestCenterMappings,
        topUpRequests: initialTopUpRequests,
        benefitRequests: initialBenefitRequests,
        organizationWallets: initialOrganizationWallets,
        organizationSummaries: initialOrganizationSummaries,
        hrUsers: initialHrUsers,
        subscriptionRecords: initialSubscriptionRecords,
        subscriptionMembers: initialSubscriptionMembers,
        slots: initialSlots,
        formTypes: formTypes,
        slotConfigurations: [],
        cityCatalogues: initialCityCatalogues,
        cityCatalogueTestMappings: initialCityCatalogueTestMappings,

      addPartner: (partner) =>
        set((s) => {
          const existing = s.partners || []
          const nextNum = existing.length > 0
            ? Math.max(0, ...existing.map((p) => {
                const m = (p.id || '').match(/^p(\d+)$/)
                return m ? parseInt(m[1], 10) : 0
              })) + 1
            : 1
          const id = partner.id || 'p' + nextNum
          return { partners: [...existing, { ...partner, id }] }
        }),

      updatePartner: (id, updates) =>
        set((s) => {
          const updatedPartners = (s.partners || []).map((p) => (p.id === id ? { ...p, ...updates } : p))
          const partner = updatedPartners.find((p) => p.id === id)

          // If partner type is organization, also update the corresponding client
          if (partner && partner.partnerType === 'organization') {
            const client = (s.clients || []).find((c) => c.partnerId === id)

            if (client) {
              // Update existing client
              const updatedClients = (s.clients || []).map((c) =>
                c.partnerId === id
                  ? { ...c, companyName: updates.name || c.companyName }
                  : c
              )

              // Update HR users mapping if hrEmails changed (keep hrUsers as array)
              if (updates.hrEmails) {
                const existingHrArr = Array.isArray(s.hrUsers) ? s.hrUsers : []
                const withoutThisClient = existingHrArr.filter((hr) => hr.clientId !== client.id)
                const newEntries = updates.hrEmails.map((email) => ({
                  email: String(email || '').trim(),
                  clientId: client.id,
                  companyName: updates.name || partner.name || client.companyName || '',
                })).filter((e) => e.email)
                const updatedHrUsers = [...withoutThisClient, ...newEntries]
                return {
                  partners: updatedPartners,
                  clients: updatedClients,
                  hrUsers: updatedHrUsers
                }
              }

              return {
                partners: updatedPartners,
                clients: updatedClients
              }
            }
          }

          return { partners: updatedPartners }
        }),

      addClient: (client) =>
        set((s) => {
          const list = s.clients || []
          const nextNum = list.length ? Math.max(0, ...list.map((c) => {
            const m = (c.id || '').match(/^c(\d+)$/)
            return m ? parseInt(m[1], 10) : 0
          })) + 1 : 1
          const id = client.id || 'c' + nextNum
          const newClient = { ...client, id }
          let nextHrUsers = s.hrUsers || []
          if (newClient.loginEmails && newClient.loginEmails.length > 0) {
            const withoutThis = (s.hrUsers || []).filter((hr) => hr.clientId !== id)
            nextHrUsers = [...withoutThis, ...newClient.loginEmails.map((email) => ({
              email: String(email || '').trim(),
              clientId: id,
              companyName: newClient.companyName || newClient.clientName || '',
            })).filter((e) => e.email)]
          }
          return {
            clients: [...list, newClient],
            ...(nextHrUsers !== (s.hrUsers || []) ? { hrUsers: nextHrUsers } : {}),
          }
        }),

      updateClient: (id, updates) =>
        set((s) => {
          const updatedClients = (s.clients || []).map((c) => (c.id === id ? { ...c, ...updates } : c))
          const client = updatedClients.find((c) => c.id === id)
          if (client && updates.loginEmails) {
            const withoutThis = (s.hrUsers || []).filter((hr) => hr.clientId !== id)
            const newEntries = (updates.loginEmails || []).map((email) => ({
              email: String(email || '').trim(),
              clientId: id,
              companyName: client.companyName || client.clientName || '',
            })).filter((e) => e.email)
            return { clients: updatedClients, hrUsers: [...withoutThis, ...newEntries] }
          }
          return { clients: updatedClients }
        }),

      addVendor: (vendor) =>
        set((s) => {
          const list = s.vendors || []
          const nextNum = list.length ? Math.max(0, ...list.map((v) => {
            const m = (v.id || '').match(/^v(\d+)$/)
            return m ? parseInt(m[1], 10) : 0
          })) + 1 : 1
          const id = vendor.id || 'v' + nextNum
          return { vendors: [...list, { ...vendor, id }] }
        }),

      updateVendor: (id, updates) =>
        set((s) => ({
          vendors: (s.vendors || []).map((v) => (v.id === id ? { ...v, ...updates } : v)),
        })),

      addCenter: (center) =>
        set((s) => ({
          centers: [...s.centers, { ...center, id: center.id || 'cc' + Date.now() }],
        })),

      updateCenter: (id, updates) =>
        set((s) => ({
          centers: (s.centers || []).map((c) => (c.id === id ? { ...c, ...updates } : c)),
        })),

      addSlotConfiguration: (config) =>
        set((s) => ({
          slotConfigurations: [...(s.slotConfigurations || []), { ...config, id: config.id || 'sc' + Date.now() }],
        })),

      updateSlotConfiguration: (id, updates) =>
        set((s) => ({
          slotConfigurations: (s.slotConfigurations || []).map((sc) => (sc.id === id ? { ...sc, ...updates } : sc)),
        })),

      deleteSlotConfiguration: (id) =>
        set((s) => ({
          slotConfigurations: (s.slotConfigurations || []).filter((sc) => sc.id !== id),
        })),

      addCityCatalogue: (catalogue) =>
        set((s) => ({
          cityCatalogues: [...(s.cityCatalogues || []), { ...catalogue, id: catalogue.id || 'ctlg' + Date.now() }],
        })),

      updateCityCatalogue: (id, updates) =>
        set((s) => ({
          cityCatalogues: (s.cityCatalogues || []).map((c) => (c.id === id ? { ...c, ...updates } : c)),
        })),

      deleteCityCatalogue: (id) =>
        set((s) => ({
          cityCatalogues: (s.cityCatalogues || []).filter((c) => c.id !== id),
        })),

      addCityCatalogueTestMappings: (newMappings) =>
        set((s) => {
          const existingMappings = s.cityCatalogueTestMappings || []
          const updatedMappings = [...existingMappings]
          const addedMappings = []

          newMappings.forEach((newMapping) => {
            // Find existing mapping by testCode + catalogueId
            const existingIndex = updatedMappings.findIndex(
              (m) => m.testCode === newMapping.testCode && m.catalogueId === newMapping.catalogueId
            )

            if (existingIndex >= 0) {
              // Update existing mapping (preserve id, update all other fields)
              updatedMappings[existingIndex] = {
                ...updatedMappings[existingIndex],
                ...newMapping,
                id: updatedMappings[existingIndex].id, // Keep original id
              }
            } else {
              // Add new mapping
              addedMappings.push(newMapping)
            }
          })

          return {
            cityCatalogueTestMappings: [...updatedMappings, ...addedMappings],
          }
        }),

      deleteCityCatalogueTestMapping: (id) =>
        set((s) => ({
          cityCatalogueTestMappings: (s.cityCatalogueTestMappings || []).filter((m) => m.id !== id),
        })),

      addBenefit: (benefit) =>
        set((s) => {
          const list = s.benefits || []
          const maxNum = list.length ? Math.max(...list.map((b) => Number(String(b.id).replace(/^b/, '')) || 0)) : 0
          const isComboForm = Array.isArray(benefit.pharmaPriceConfiguration) && Array.isArray(benefit.healthCarePriceConfiguration)
          if (isComboForm) {
            const idPharma = 'b' + (maxNum + 1)
            const idHealth = 'b' + (maxNum + 2)
            const idCombo = 'b' + (maxNum + 3)
            const pharmaConfig = benefit.pharmaPriceConfiguration || []
            const healthConfig = benefit.healthCarePriceConfiguration || []
            const pharmaPrimary = pharmaConfig.find((p) => p.type === 'primary')
            const healthPrimary = healthConfig.find((p) => p.type === 'primary')
            const healthAddon = healthConfig.find((p) => p.type === 'addon')
            const pharmaBenefit = {
              id: idPharma,
              clientId: benefit.clientId || '',
              name: (benefit.name || '').trim() + ' Pharma',
              status: benefit.status || 'Active',
              type: 'pharma',
              loyalty: benefit.pharmaLoyalty || '',
              paymentType: benefit.paymentType || 'Regular',
              description: benefit.description || '',
              priceConfiguration: pharmaConfig,
              discountConfiguration: [],
              startDate: benefit.startDate || '',
              endDate: benefit.endDate || '',
              primaryPrice: pharmaPrimary ? Number(pharmaPrimary.price) || 0 : 0,
              addOnPrice: 0,
              isRenewalAllowed: false,
              isProRataAllowed: false,
              ...(benefit.pharmaCreditLimit != null && benefit.pharmaCreditLimit !== '' ? { creditLimit: benefit.pharmaCreditLimit } : {}),
            }
            const healthCareBenefit = {
              id: idHealth,
              clientId: benefit.clientId || '',
              name: (benefit.name || '').trim() + ' Health Care',
              status: benefit.status || 'Active',
              type: 'health_care',
              loyalty: benefit.healthCareLoyalty || '',
              paymentType: benefit.paymentType || 'Regular',
              description: benefit.description || '',
              priceConfiguration: healthConfig,
              discountConfiguration: benefit.healthCareDiscountConfiguration || [],
              startDate: benefit.startDate || '',
              endDate: benefit.endDate || '',
              primaryPrice: healthPrimary ? Number(healthPrimary.price) || 0 : 0,
              addOnPrice: healthAddon ? Number(healthAddon.price) || 0 : 0,
              isRenewalAllowed: true,
              renewalDays: 30,
              isProRataAllowed: true,
              ...(benefit.healthCareCreditLimit != null && benefit.healthCareCreditLimit !== '' ? { creditLimit: benefit.healthCareCreditLimit } : {}),
            }
            const comboBenefit = {
              id: idCombo,
              clientId: benefit.clientId || '',
              name: (benefit.name || '').trim(),
              status: benefit.status || 'Active',
              type: 'combo',
              comboPharmaBenefitId: idPharma,
              comboHealthCareBenefitId: idHealth,
              priceConfiguration: [],
              primaryPrice: (pharmaBenefit.primaryPrice || 0) + (healthCareBenefit.primaryPrice || 0),
              addOnPrice: healthCareBenefit.addOnPrice || 0,
              description: benefit.description || '',
              startDate: benefit.startDate || '',
              endDate: benefit.endDate || '',
            }
            return { benefits: [...list, pharmaBenefit, healthCareBenefit, comboBenefit] }
          }
          const id = 'b' + (maxNum + 1)
          if (benefit.type === 'combo') {
            const pharma = (s.benefits || []).find((b) => b.id === benefit.comboPharmaBenefitId)
            const healthCare = (s.benefits || []).find((b) => b.id === benefit.comboHealthCareBenefitId)
            const primaryPrice = (Number(pharma?.primaryPrice) || 0) + (Number(healthCare?.primaryPrice) || 0)
            const addOnPrice = Number(healthCare?.addOnPrice) || 0
            return {
              benefits: [...list, { ...benefit, id, primaryPrice, addOnPrice }],
            }
          }
          const config = benefit.priceConfiguration || []
          const primaryRow = config.find((p) => p.type === 'primary')
          const addonRow = config.find((p) => p.type === 'addon')
          return {
            benefits: [
              ...list,
              {
                ...benefit,
                id,
                primaryPrice: primaryRow ? Number(primaryRow.price) || 0 : benefit.primaryPrice || 0,
                addOnPrice: addonRow ? Number(addonRow.price) || 0 : benefit.addOnPrice || 0,
              },
            ],
          }
        }),

      updateBenefit: (id, updates) =>
        set((s) => {
          const list = s.benefits || []
          const isComboFormUpdate = Array.isArray(updates.pharmaPriceConfiguration) && Array.isArray(updates.healthCarePriceConfiguration)
          const combo = list.find((b) => b.id === id)
          if (isComboFormUpdate && combo && combo.type === 'combo' && combo.comboPharmaBenefitId && combo.comboHealthCareBenefitId) {
            const pharmaConfig = updates.pharmaPriceConfiguration || []
            const healthConfig = updates.healthCarePriceConfiguration || []
            const pharmaPrimary = pharmaConfig.find((p) => p.type === 'primary')
            const healthPrimary = healthConfig.find((p) => p.type === 'primary')
            const healthAddon = healthConfig.find((p) => p.type === 'addon')
            const pharmaUpdates = {
              name: (updates.name || '').trim() + ' Pharma',
              status: updates.status,
              loyalty: updates.pharmaLoyalty,
              paymentType: updates.paymentType,
              description: updates.description,
              priceConfiguration: pharmaConfig,
              startDate: updates.startDate,
              endDate: updates.endDate,
              primaryPrice: pharmaPrimary ? Number(pharmaPrimary.price) || 0 : 0,
              addOnPrice: 0,
              ...(updates.pharmaCreditLimit != null && updates.pharmaCreditLimit !== '' ? { creditLimit: updates.pharmaCreditLimit } : {}),
            }
            const healthUpdates = {
              name: (updates.name || '').trim() + ' Health Care',
              status: updates.status,
              loyalty: updates.healthCareLoyalty,
              paymentType: updates.paymentType,
              description: updates.description,
              priceConfiguration: healthConfig,
              discountConfiguration: updates.healthCareDiscountConfiguration || [],
              startDate: updates.startDate,
              endDate: updates.endDate,
              primaryPrice: healthPrimary ? Number(healthPrimary.price) || 0 : 0,
              addOnPrice: healthAddon ? Number(healthAddon.price) || 0 : 0,
              ...(updates.healthCareCreditLimit != null && updates.healthCareCreditLimit !== '' ? { creditLimit: updates.healthCareCreditLimit } : {}),
            }
            const comboUpdates = {
              name: (updates.name || '').trim(),
              status: updates.status,
              description: updates.description,
              startDate: updates.startDate,
              endDate: updates.endDate,
              primaryPrice: (pharmaUpdates.primaryPrice || 0) + (healthUpdates.primaryPrice || 0),
              addOnPrice: healthUpdates.addOnPrice || 0,
            }
            return {
              benefits: list.map((b) => {
                if (b.id === combo.comboPharmaBenefitId) return { ...b, ...pharmaUpdates }
                if (b.id === combo.comboHealthCareBenefitId) return { ...b, ...healthUpdates }
                if (b.id === id) return { ...b, ...comboUpdates }
                return b
              }),
            }
          }
          return { benefits: list.map((b) => (b.id === id ? { ...b, ...updates } : b)) }
        }),

      addPackage: (pkg) =>
        set((s) => ({
          packages: [...s.packages, { ...pkg, id: pkg.id || 'pk' + Date.now() }],
        })),

      addTests: (newTests) =>
        set((s) => {
          const existingTests = s.tests || []
          const updatedTests = [...existingTests]
          const addedTests = []

          newTests.forEach((newTest) => {
            // Find existing test by testCode + partnerId
            const existingIndex = updatedTests.findIndex(
              (t) => t.testCode === newTest.testCode && t.partnerId === newTest.partnerId
            )

            if (existingIndex >= 0) {
              // Update existing test (preserve id, update all other fields)
              updatedTests[existingIndex] = {
                ...updatedTests[existingIndex],
                ...newTest,
                id: updatedTests[existingIndex].id, // Keep original id
              }
            } else {
              // Add new test
              addedTests.push(newTest)
            }
          })

          return {
            tests: [...updatedTests, ...addedTests],
          }
        }),

      updateTest: (id, updates) =>
        set((s) => ({
          tests: (s.tests || []).map((t) => (t.id === id ? { ...t, ...updates } : t)),
        })),

      addTestCenterMappings: (newMappings) =>
        set((s) => {
          const existingMappings = s.testCenterMappings || []
          const updatedMappings = [...existingMappings]
          const addedMappings = []

          newMappings.forEach((newMapping) => {
            // Find existing mapping by testCode + centerId
            const existingIndex = updatedMappings.findIndex(
              (m) => m.testCode === newMapping.testCode && m.centerId === newMapping.centerId
            )

            if (existingIndex >= 0) {
              // Update existing mapping (preserve id, update all other fields)
              updatedMappings[existingIndex] = {
                ...updatedMappings[existingIndex],
                ...newMapping,
                id: updatedMappings[existingIndex].id, // Keep original id
              }
            } else {
              // Add new mapping
              addedMappings.push(newMapping)
            }
          })

          // AUTO-CREATE CITY CATALOGUES AND MAP TESTS
          // Group mappings by center to process city catalogues
          const centerIds = [...new Set(newMappings.map(m => m.centerId))]
          let cityCatalogues = [...(s.cityCatalogues || [])]
          let cityCatalogueTestMappings = [...(s.cityCatalogueTestMappings || [])]

          centerIds.forEach(centerId => {
            // Find the center
            const center = s.centers.find(c => c.id === centerId)
            if (!center || !center.city || !center.state) return

            // Check if city catalogue exists for this city
            let catalogue = cityCatalogues.find(
              cat => cat.city === center.city && cat.state === center.state
            )

            // If catalogue doesn't exist, create it
            if (!catalogue) {
              catalogue = {
                id: 'ctlg_auto_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11),
                name: `${center.city} Diagnostic Tests`,
                state: center.state,
                city: center.city,
                description: `Auto-generated catalogue for ${center.city}, ${center.state}`,
                status: 'active',
                createdAt: new Date().toISOString()
              }
              cityCatalogues.push(catalogue)
            }

            // Add test mappings to this city catalogue
            const centerMappings = newMappings.filter(m => m.centerId === centerId)
            centerMappings.forEach(mapping => {
              // Check if this test is already mapped to this catalogue
              const existingCatalogueMapping = cityCatalogueTestMappings.find(
                ctm => ctm.catalogueId === catalogue.id && ctm.testCode === mapping.testCode
              )

              if (!existingCatalogueMapping) {
                // Add new catalogue test mapping
                cityCatalogueTestMappings.push({
                  id: 'ctm_auto_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11),
                  catalogueId: catalogue.id,
                  testId: mapping.testId,
                  testCode: mapping.testCode,
                  testName: mapping.testName,
                  category: mapping.category,
                  partnerId: mapping.partnerId,
                  status: mapping.status || 'active'
                })
              }
            })
          })

          return {
            testCenterMappings: [...updatedMappings, ...addedMappings],
            cityCatalogues: cityCatalogues,
            cityCatalogueTestMappings: cityCatalogueTestMappings
          }
        }),

      addTopUpRequest: (payload) =>
        set((s) => {
          const list = s.topUpRequests || []
          const id = String(list.length ? Math.max(...list.map((r) => Number(r.id) || 0)) + 1 : 1)
          const clientId = payload.clientId ?? payload.organizationId ?? ''
          return {
            topUpRequests: [
              ...list,
              {
                id,
                totalMembers: payload.totalMembers ?? 0,
                estimatedPrice: payload.estimatedPrice ?? 0,
                status: 'initiated',
                clientId,
                memberDetails: payload.memberDetails ?? [],
                paymentTransactionId: '',
                paymentReceipt: '',
                verifiedBy: '',
                verifiedDate: '',
                remarks: '',
                createdAt: new Date().toISOString(),
              },
            ],
          }
        }),

      updateTopUpRequestStatus: (id, updates) =>
        set((s) => {
          const list = s.topUpRequests || []
          const request = list.find((r) => r.id === id)
          const clientId = request?.clientId ?? request?.organizationId
          const isNowVerified = updates.status === 'payment_verified'
          const wasNotVerified = request && request.status !== 'payment_verified'
          const shouldCreditWallet = isNowVerified && wasNotVerified && clientId
          const creditAmount = shouldCreditWallet ? (Number(request.estimatedPrice) || 0) : 0
          const newWallets = { ...(s.organizationWallets || {}) }
          if (creditAmount > 0 && clientId) {
            newWallets[clientId] = (newWallets[clientId] || 0) + creditAmount
          }
          return {
            ...s,
            topUpRequests: list.map((r) => (r.id === id ? { ...r, ...updates } : r)),
            organizationWallets: newWallets,
          }
        }),

      cancelTopUpRequest: (id) =>
        set((s) => ({
          topUpRequests: (s.topUpRequests || []).map((r) =>
            r.id === id ? { ...r, status: 'cancelled' } : r
          ),
        })),

      addBenefitRequest: (payload) =>
        set((s) => {
          const list = s.benefitRequests || []
          const id = String(list.length ? Math.max(...list.map((r) => Number(r.id) || 0)) + 1 : 1)
          const clientId = payload.clientId ?? payload.organizationId ?? ''
          return {
            benefitRequests: [
              ...list,
              {
                id,
                planId: payload.planId ?? '',
                planName: payload.planName ?? '',
                totalPrice: payload.totalPrice ?? 0,
                uploadedDocumentName: payload.uploadedDocumentName ?? '',
                uploadedDocumentContent: payload.uploadedDocumentContent ?? '',
                clientId,
                status: 'initiated',
                responseDocument: '',
                responseDocumentContent: payload.responseDocumentContent ?? '',
                modifiedBy: '',
                modifiedDate: '',
                remarks: '',
                createdAt: new Date().toISOString(),
              },
            ],
          }
        }),

      updateBenefitRequestStatus: (id, updates) =>
        set((s) => ({
          benefitRequests: (s.benefitRequests || []).map((r) =>
            r.id === id ? { ...r, ...updates } : r
          ),
        })),

      addSubscriptionRecords: (records) =>
        set((s) => {
          const list = s.subscriptionRecords || []
          let nextNum = list.length ? Math.max(...list.map((r) => Number(String(r.id).replace(/^sub/, '')) || 0)) + 1 : 1
          let nextSubId = list.length ? Math.max(...list.map((r) => Number(r.subscriptionId) || 0)) + 1 : 10860700
          const benefits = s.benefits || []
          const newRecords = (records || []).map((rec) => {
            const id = rec.id || 'sub' + String(nextNum++).padStart(3, '0')
            const subscriptionId = rec.subscriptionId || String(nextSubId++)
            const plan = benefits.find((b) => b.id === (rec.planId ?? ''))
            const creditLimit = rec.creditLimit != null && rec.creditLimit !== '' ? rec.creditLimit : (plan?.creditLimit != null && plan.creditLimit !== '' ? plan.creditLimit : undefined)
            return {
              id,
              subscriptionId,
              slotId: rec.slotId ?? undefined,
              clientId: rec.clientId ?? '',
              type: rec.type ?? 'healthcare',
              planId: rec.planId ?? '',
              planName: rec.planName ?? '',
              createdOn: rec.createdOn ?? new Date().toISOString().slice(0, 10),
              activedOn: rec.activedOn ?? new Date().toISOString().slice(0, 10),
              expiryDate: rec.expiryDate ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
              status: rec.status ?? 'active',
              customer: rec.customer ?? 'Enrolled',
              mobileNo: rec.mobileNo ?? '',
              members: rec.members ?? 1,
              mrpSpends: rec.mrpSpends ?? 0,
              actualSpends: rec.actualSpends ?? 0,
              savings: rec.savings ?? 0,
              mrpUsed: rec.mrpUsed ?? 0,
              mrpBalance: rec.mrpBalance ?? 1000,
              isServiced: rec.isServiced ?? false,
              ...(creditLimit != null ? { creditLimit } : {}),
            }
          })
          const summaries = s.organizationSummaries || []
          const updatedSummaries = newRecords.reduce((acc, rec) => {
            const clientId = rec.clientId || ''
            const type = (rec.type || 'healthcare').toLowerCase()
            const members = Number(rec.members) || 1
            const isHealthcare = type === 'healthcare'
            return acc.map((sum) => {
              if (sum.clientId !== clientId) return sum
              const clone = { ...sum }
              if (isHealthcare) {
                clone.healthcareSubscriptions = {
                  ...(sum.healthcareSubscriptions || { active: 0, activeMembers: 0, serviced: 0, servicedMembers: 0, cancelled: 0 }),
                  active: (sum.healthcareSubscriptions?.active || 0) + 1,
                  activeMembers: (sum.healthcareSubscriptions?.activeMembers || 0) + members,
                }
              } else {
                clone.pharmaSubscriptions = {
                  ...(sum.pharmaSubscriptions || { active: 0, activeMembers: 0, serviced: 0, servicedMembers: 0, cancelled: 0 }),
                  active: (sum.pharmaSubscriptions?.active || 0) + 1,
                  activeMembers: (sum.pharmaSubscriptions?.activeMembers || 0) + members,
                }
              }
              return clone
            })
          }, summaries)
          return {
            subscriptionRecords: [...list, ...newRecords],
            organizationSummaries: updatedSummaries,
          }
        }),

      addSlots: (newSlots) =>
        set((s) => {
          const list = s.slots || []
          const nextSlotNum = list.length ? Math.max(...list.map((sl) => Number(String(sl.id || '0').replace(/\D/g, '')) || 0)) + 1 : 1
          const slotsToAdd = (newSlots || []).map((sl, idx) => {
            const subIds = Array.isArray(sl.subscriptionIds) ? sl.subscriptionIds : (sl.subscriptionId ? [sl.subscriptionId] : [])
            return {
              id: sl.id || `slot${String(nextSlotNum + idx).padStart(3, '0')}`,
              slotId: sl.slotId ?? (subIds[0] || `SL-${(sl.type === 'pharma' ? 'PH' : sl.type === 'combo' ? 'COMBO' : 'HC')}-${String(nextSlotNum + idx).padStart(3, '0')}`),
              clientId: sl.clientId ?? '',
              planId: sl.planId ?? '',
              planName: sl.planName ?? '',
              type: sl.type ?? 'healthcare',
              validFrom: sl.validFrom ?? sl.activedOn ?? '',
              validTo: sl.validTo ?? sl.expiryDate ?? '',
              status: sl.status ?? 'active',
              subscriptionId: subIds[0] ?? null,
              subscriptionIds: subIds,
              maxFreeAddons: sl.maxFreeAddons ?? 0,
              maxPaidAddons: sl.maxPaidAddons ?? 0,
              currentFreeAddons: sl.currentFreeAddons ?? 0,
              currentPaidAddons: sl.currentPaidAddons ?? 0,
            }
          })
          return { slots: [...list, ...slotsToAdd] }
        }),

      updateSlot: (slotIdOrSlotIndex, updates) =>
        set((s) => ({
          slots: (s.slots || []).map((sl) =>
            (sl.slotId === slotIdOrSlotIndex || sl.id === slotIdOrSlotIndex)
              ? { ...sl, ...updates }
              : sl
          ),
        })),

      deductOrganizationWallet: (clientIdOrPartnerId, amount) =>
        set((s) => {
          const key = clientIdOrPartnerId
          const current = (s.organizationWallets || {})[key] ?? 0
          const next = Math.max(0, current - (Number(amount) || 0))
          return { organizationWallets: { ...(s.organizationWallets || {}), [key]: next } }
        }),

      cancelSubscription: (subscriptionId) =>
        set((s) => {
          // Find the subscription being cancelled
          const subscription = (s.subscriptionRecords || []).find(r => r.subscriptionId === subscriptionId)
          if (!subscription) return s

          // Find the benefit plan to get addon limits
          const plan = (s.benefits || []).find(b => b.id === subscription.planId)

          // Extract addon limits from plan's priceConfiguration
          let maxFreeAddons = 0
          let maxPaidAddons = 0

          if (plan && plan.priceConfiguration) {
            const freeAddonConfig = plan.priceConfiguration.find(pc => pc.type === 'free_addon')
            const paidAddonConfig = plan.priceConfiguration.find(pc => pc.type === 'addon')
            maxFreeAddons = freeAddonConfig ? freeAddonConfig.maxMembers : 0
            maxPaidAddons = paidAddonConfig ? paidAddonConfig.maxMembers : 0
          }

          // Count members for this subscription to calculate actual addon usage
          const members = (s.subscriptionMembers || []).filter(m => m.subscriptionId === subscriptionId)
          const totalMembers = members.length
          const addonMembers = totalMembers - 1 // Subtract 1 for primary member

          // Calculate current free and paid addons
          let currentFreeAddons = 0
          let currentPaidAddons = 0

          if (addonMembers > 0) {
            if (addonMembers <= maxFreeAddons) {
              currentFreeAddons = addonMembers
              currentPaidAddons = 0
            } else {
              currentFreeAddons = maxFreeAddons
              currentPaidAddons = addonMembers - maxFreeAddons
            }
          }

          // Find slot that contains this subscription (combo = one slot for both pharma + healthcare)
          const slot = (s.slots || []).find(
            (sl) => sl.subscriptionId === subscriptionId || (Array.isArray(sl.subscriptionIds) && sl.subscriptionIds.includes(subscriptionId))
          )
          const idsToCancel = slot && Array.isArray(slot.subscriptionIds) && slot.subscriptionIds.length > 0
            ? slot.subscriptionIds
            : [subscriptionId]

          // Cancel all subscriptions in this slot (both if combo)
          const updatedRecords = (s.subscriptionRecords || []).map((record) =>
            idsToCancel.includes(record.subscriptionId) ? { ...record, status: 'cancelled' } : record
          )

          // Free up the slot (mark as available, clear subscriptionIds); set addon counts from cancelled subscription so slot shows correct usage (e.g. 3/3, 0/4)
          const updatedSlots = (s.slots || []).map((sl) =>
            sl.slotId === slot?.slotId || sl.subscriptionId === subscriptionId || (Array.isArray(sl.subscriptionIds) && sl.subscriptionIds.includes(subscriptionId))
              ? {
                  ...sl,
                  status: 'available',
                  subscriptionId: null,
                  subscriptionIds: [],
                  currentFreeAddons,
                  currentPaidAddons,
                }
              : sl
          )

          // Update organization summary - decrement for all cancelled subscriptions in this slot
          const cancelledRecords = (s.subscriptionRecords || []).filter((r) => idsToCancel.includes(r.subscriptionId))
          const healthcareCancelled = cancelledRecords.filter((r) => r.type === 'healthcare').length
          const pharmaCancelled = cancelledRecords.filter((r) => r.type === 'pharma').length
          const healthcareMembersDelta = cancelledRecords.filter((r) => r.type === 'healthcare').reduce((sum, r) => sum + (r.members || 1), 0)
          const updatedSummaries = (s.organizationSummaries || []).map((summary) => {
            if (summary.clientId !== subscription.clientId) return summary
            const summaryClone = { ...summary }
            if (healthcareCancelled > 0) {
              summaryClone.healthcareSubscriptions = {
                ...summaryClone.healthcareSubscriptions,
                active: Math.max(0, (summaryClone.healthcareSubscriptions.active || 0) - healthcareCancelled),
                activeMembers: Math.max(0, (summaryClone.healthcareSubscriptions.activeMembers || 0) - healthcareMembersDelta),
                cancelled: (summaryClone.healthcareSubscriptions.cancelled || 0) + healthcareCancelled,
              }
            }
            if (pharmaCancelled > 0) {
              summaryClone.pharmaSubscriptions = {
                ...summaryClone.pharmaSubscriptions,
                active: Math.max(0, (summaryClone.pharmaSubscriptions.active || 0) - pharmaCancelled),
                activeMembers: Math.max(0, (summaryClone.pharmaSubscriptions.activeMembers || 0) - pharmaCancelled),
                cancelled: (summaryClone.pharmaSubscriptions.cancelled || 0) + pharmaCancelled,
              }
            }
            return summaryClone
          })

          return {
            ...s,
            subscriptionRecords: updatedRecords,
            slots: updatedSlots,
            organizationSummaries: updatedSummaries,
          }
        }),
    }),
    {
      name: 'bd-dashboard-store',
      merge: (persistedState, currentState) => {
        // If no persisted state, just return current state (initial state)
        if (!persistedState) {
          return currentState
        }

        const topUp = persistedState && Array.isArray(persistedState.topUpRequests)
          ? persistedState.topUpRequests
          : currentState.topUpRequests
        const benefit = persistedState && Array.isArray(persistedState.benefitRequests)
          ? persistedState.benefitRequests
          : currentState.benefitRequests
        const wallets = persistedState && persistedState.organizationWallets && typeof persistedState.organizationWallets === 'object'
          ? persistedState.organizationWallets
          : currentState.organizationWallets
        // Fall back to initial seed data if persisted array is missing or empty
        const tests = Array.isArray(persistedState?.tests) && persistedState.tests.length > 0
          ? persistedState.tests
          : currentState.tests
        const testCenterMappings = Array.isArray(persistedState?.testCenterMappings) && persistedState.testCenterMappings.length > 0
          ? persistedState.testCenterMappings
          : currentState.testCenterMappings

        // Use persisted subscription records if present (includes admin-created on approve), else initial
        const subscriptionRecords = Array.isArray(persistedState?.subscriptionRecords) && persistedState.subscriptionRecords.length > 0
          ? persistedState.subscriptionRecords
          : currentState.subscriptionRecords
        const subscriptionMembers = Array.isArray(persistedState?.subscriptionMembers) && persistedState.subscriptionMembers.length > 0
          ? persistedState.subscriptionMembers
          : currentState.subscriptionMembers
        const slots = Array.isArray(persistedState?.slots) && persistedState.slots.length > 0
          ? persistedState.slots
          : currentState.slots
        // hrUsers must be an array of { email, clientId, companyName }; fallback if persisted as object
        const hrUsers = Array.isArray(persistedState?.hrUsers)
          ? persistedState.hrUsers
          : currentState.hrUsers
        // Ensure partners have phone: merge persisted with initial so missing phone gets default from initialPartners
        const rawPartners = Array.isArray(persistedState?.partners) && persistedState.partners.length > 0 ? persistedState.partners : currentState.partners
        const initialPartnersList = currentState.partners || []
        const partners = rawPartners.map((p) => {
          if (p.phone != null && String(p.phone).trim() !== '') return p
          const initial = initialPartnersList.find((i) => i.id === p.id)
          return { ...p, phone: initial?.phone ?? '' }
        })

        // Ensure all benefits have startDate and endDate with 1-year tenure
        const rawBenefits = Array.isArray(persistedState?.benefits) && persistedState.benefits.length > 0 ? persistedState.benefits : currentState.benefits
        const benefits = rawBenefits.map((b) => {
          const start = b.startDate && String(b.startDate).trim() ? b.startDate : BENEFIT_DEFAULT_START
          let end = b.endDate && String(b.endDate).trim() ? b.endDate : BENEFIT_DEFAULT_END
          try {
            const startYear = new Date(start).getFullYear()
            const endYear = new Date(end).getFullYear()
            if (endYear - startYear !== 1) {
              const d = new Date(start)
              d.setFullYear(d.getFullYear() + 1)
              end = d.toISOString().slice(0, 10)
            }
          } catch (_) {
            end = BENEFIT_DEFAULT_END
          }
          return { ...b, startDate: start, endDate: end }
        })

        // Build merged state - custom values MUST come after persistedState spread
        // to avoid being overwritten by undefined values
        const vendors = Array.isArray(persistedState?.vendors) && persistedState.vendors.length > 0 ? persistedState.vendors : currentState.vendors
        return {
          ...currentState,
          ...persistedState,
          topUpRequests: topUp,
          benefitRequests: benefit,
          organizationWallets: wallets,
          tests,
          testCenterMappings,
          subscriptionRecords,
          subscriptionMembers,
          slots,
          hrUsers,
          partners,
          vendors,
          benefits,
        }
      },
    }
  )
);


