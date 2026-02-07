// Array of valid ID types (same as in PersonalInfoForm)
export const VALID_ID_TYPES = [
  { value: 'drivers_license', label: "Driver's License" },
  { value: 'passport', label: 'Passport' },
  { value: 'national_id', label: 'National ID' },
  { value: 'postal_id', label: 'Postal ID' },
  { value: 'sss_id', label: 'SSS ID' },
  { value: 'gsis_id', label: 'GSIS ID' },
  { value: 'philhealth_id', label: 'PhilHealth ID' },
  { value: 'pagibig_id', label: 'Pag-IBIG ID' },
  { value: 'prc_license', label: 'PRC License' },
  { value: 'senior_citizen_id', label: 'Senior Citizen ID' },
  { value: 'voters_id', label: "Voter's ID" },
  { value: 'student_id', label: 'Student ID' }
] as const