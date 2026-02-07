import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { setBookingDetails } from '@/lib/slices/bookingSlice'
import { useAppDispatch, useAppSelector } from '@/lib/store'
import { AlertCircle, Database, Eye, FileText, Lock, Shield, User } from 'lucide-react'
import React from 'react'
import { useForm, useWatch } from 'react-hook-form'

// Array of valid ID types
const VALID_ID_TYPES = [
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

export interface PersonalInfoData {
  firstName: string
  lastName: string
  middleName: string
  contactNumber: string
  email: string
  licenseNumber?: string
  idType?: string
  dataConsent: boolean
}

interface PersonalInfoFormProps {
  onValidationChange?: (isValid: boolean, data?: PersonalInfoData) => void
}

export function PersonalInfoForm({ onValidationChange }: PersonalInfoFormProps) {
  const selectedCar = useAppSelector(state => state.booking.selectedCar)
  const bookingDetails = useAppSelector(state => state.booking.bookingDetails)
  const dispatch = useAppDispatch()
  const [showConsentModal, setShowConsentModal] = React.useState(false)
  const [modalAgreed, setModalAgreed] = React.useState(false)
  const [hasScrolledToBottom, setHasScrolledToBottom] = React.useState(false)



  // Handle checkbox change
  const handleCheckboxChange = (checked: boolean) => {
    if (checked) {
      // User is trying to check - open modal
      setShowConsentModal(true)
    } else {
      // User is unchecking - reset modal state and uncheck
      setModalAgreed(false)
      setValue('dataConsent', false)
      trigger('dataConsent')
    }
  }

  // Handle scroll detection
  const handleScroll = React.useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget
    const isAtBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 10 // 10px tolerance
    setHasScrolledToBottom(isAtBottom)
  }, [])

  const defaultValues = React.useMemo<PersonalInfoData>(() => {
    return {
      firstName: bookingDetails.firstName ?? '',
      middleName: bookingDetails.middleName ?? '',
      lastName: bookingDetails.lastName ?? '',
      contactNumber: bookingDetails.contactNumber ?? '',
      email: bookingDetails.email ?? '',
      licenseNumber: bookingDetails.licenseNumber ?? '',
      idType: bookingDetails.idType ?? '',
      dataConsent: bookingDetails.dataConsent ?? false
    }
  }, [
    bookingDetails.firstName,
    bookingDetails.middleName,
    bookingDetails.lastName,
    bookingDetails.contactNumber,
    bookingDetails.email,
    bookingDetails.licenseNumber,
    bookingDetails.idType,
    bookingDetails.dataConsent
  ])

  const {
    register,
    handleSubmit,
    control,
    reset,
    trigger,
    setValue,
    formState: { errors, isValid }
  } = useForm<PersonalInfoData>({
    mode: 'onChange',
    defaultValues,
    resolver: undefined
  })

  // Register idType field for validation
  React.useEffect(() => {
    register('idType', {
      required: 'ID type is required for self-drive rental'
    })
    register('dataConsent', {
      required: 'You must agree to the data consent to proceed'
    })
  }, [register])

  const isSelfDrive = selectedCar?.selfDrive || false
  const requiresId = isSelfDrive

  React.useEffect(() => {
    reset(defaultValues)
    trigger()
  }, [defaultValues, reset, trigger])

  // Watch form values and notify parent of validation changes
  const formValues = useWatch({ control })

  // Dispatch form changes to Redux in real-time
  React.useEffect(() => {
    if (formValues.firstName || formValues.lastName || formValues.contactNumber ||
      formValues.email || formValues.licenseNumber || formValues.idType || formValues.dataConsent) {
      dispatch(setBookingDetails({
        firstName: formValues.firstName,
        middleName: formValues.middleName,
        lastName: formValues.lastName,
        contactNumber: formValues.contactNumber,
        email: formValues.email,
        licenseNumber: formValues.licenseNumber,
        idType: formValues.idType,
        dataConsent: formValues.dataConsent
      }))
    }
  }, [formValues, dispatch])

  React.useEffect(() => {
    // Only pass form data if all required fields have values
    const requiresId = selectedCar?.selfDrive

    const completeData = formValues.firstName &&
      formValues.lastName &&
      formValues.contactNumber &&
      formValues.email &&
      formValues.dataConsent &&
      (!requiresId || (formValues.licenseNumber && formValues.idType)) ? {
      firstName: formValues.firstName,
      middleName: formValues.middleName || '',
      lastName: formValues.lastName,
      contactNumber: formValues.contactNumber,
      email: formValues.email,
      licenseNumber: formValues.licenseNumber || '',
      idType: formValues.idType || '',
      dataConsent: formValues.dataConsent
    } : undefined

    onValidationChange?.(isValid, completeData)
  }, [isValid, formValues, onValidationChange, requiresId, selectedCar?.selfDrive]) // Include formValues with useWatch for stability

  const onSubmit = (data: PersonalInfoData) => {
    console.log('Personal Info:', data)
    // TODO: Save to Redux state
  }

  // Reset scroll state when modal opens
  React.useEffect(() => {
    if (showConsentModal) {
      setHasScrolledToBottom(false)
    }
  }, [showConsentModal])

  // Update checkbox when modal is agreed
  React.useEffect(() => {
    if (modalAgreed) {
      setValue('dataConsent', true)
      trigger('dataConsent')
    }
  }, [modalAgreed, setValue, trigger])

  return (
    <div className="space-y-6" data-testid="personal-info-form">
      {/* Header */}
      <Card className="border-blue-200 bg-blue-50" data-testid="personal-info-header">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-blue-600" />
            <div>
              <h3 className="font-semibold text-blue-900">Personal Information</h3>
              <p className="text-sm text-blue-700">Enter your details to complete the booking</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Self-Drive Indicator */}
      {isSelfDrive && (
        <Card className="border-green-200 bg-green-50" data-testid="self-drive-indicator">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-green-600" />
              <span className="sm font-medium text-green-900">Self-Drive Rental</span>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                License Required
              </Badge>
            </div>
            <p className="text-xs text-green-700 mt-1">
              Valid driver&apos;s license needed for garage pickup verification
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded p-2 mt-2">
              <p className="text-xs text-blue-700" data-testid="lto-portal-info">
                <strong>Important:</strong> You will be required to open the LTO portal for license verification and deposit one ID at the garage.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form */}
      <Card className="shadow-none border-0 bg-transparent p-0" data-testid="personal-info-form-card">
        <CardHeader className="p-0">
          <CardTitle className="text-lg">Your Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-0">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" data-testid="personal-info-form-element">
            {/* First Name */}
            <div className="space-y-2" data-testid="first-name-field">
              <Label htmlFor="firstName" className="font-medium">
                First Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="firstName"
                data-testid="first-name-input"
                {...register('firstName', {
                  required: 'First name is required',
                  minLength: {
                    value: 2,
                    message: 'First name must be at least 2 characters'
                  },
                  pattern: {
                    value: /^[a-zA-Z\s]+$/,
                    message: 'First name can only contain letters'
                  }
                })}
                placeholder="Enter your first name"
                className={`border-primary ${errors.firstName ? 'border-red-300' : ''}`}
              />
              {errors.firstName && (
                <p className="text-xs text-red-500 flex items-center gap-1" data-testid="first-name-error">
                  <AlertCircle className="h-3 w-3" />
                  {errors.firstName.message}
                </p>
              )}
            </div>

            {/* Middle Name */}
            <div className="space-y-2" data-testid="middle-name-field">
              <Label htmlFor="middleName" className="font-medium">
                Middle Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="middleName"
                data-testid="middle-name-input"
                {...register('middleName', {
                  required: 'Middle name is required',
                  pattern: {
                    value: /^[a-zA-Z\s]+$/,
                    message: 'Middle name can only contain letters'
                  }
                })}
                placeholder="Enter your middle name"
                className={`border-primary ${errors.middleName ? 'border-red-300' : ''}`}
              />
              {errors.middleName && (
                <p className="text-xs text-red-500 flex items-center gap-1" data-testid="middle-name-error">
                  <AlertCircle className="h-3 w-3" />
                  {errors.middleName.message}
                </p>
              )}
            </div>

            {/* Last Name */}
            <div className="space-y-2" data-testid="last-name-field">
              <Label htmlFor="lastName" className="font-medium">
                Last Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="lastName"
                data-testid="last-name-input"
                {...register('lastName', {
                  required: 'Last name is required',
                  minLength: {
                    value: 2,
                    message: 'Last name must be at least 2 characters'
                  },
                  pattern: {
                    value: /^[a-zA-Z\s]+$/,
                    message: 'Last name can only contain letters'
                  }
                })}
                placeholder="Enter your last name"
                className={`border-primary ${errors.lastName ? 'border-red-300' : ''}`}
              />
              {errors.lastName && (
                <p className="text-xs text-red-500 flex items-center gap-1" data-testid="last-name-error">
                  <AlertCircle className="h-3 w-3" />
                  {errors.lastName.message}
                </p>
              )}
            </div>

            {/* Contact Number */}
            <div className="space-y-2" data-testid="contact-number-field">
              <Label htmlFor="contactNumber" className="font-medium">
                Contact Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="contactNumber"
                data-testid="contact-number-input"
                {...register('contactNumber', {
                  required: 'Contact number is required',
                  pattern: {
                    value: /^[0-9+\-\s()]+$/,
                    message: 'Please enter a valid contact number'
                  },
                  minLength: {
                    value: 10,
                    message: 'Contact number must be at least 10 digits'
                  }
                })}
                placeholder="Enter your contact number (e.g., +63-912-345-6789)"
                className={`border-primary ${errors.contactNumber ? 'border-red-300' : ''}`}
              />
              {errors.contactNumber && (
                <p className="text-xs text-red-500 flex items-center gap-1" data-testid="contact-number-error">
                  <AlertCircle className="h-3 w-3" />
                  {errors.contactNumber.message}
                </p>
              )}
              <p className="text-xs text-gray-500" data-testid="contact-help-text">
                Include country code for international numbers
              </p>
            </div>

            {/* Email */}
            <div className="space-y-2" data-testid="email-field">
              <Label htmlFor="email" className="font-medium">
                Email Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                data-testid="email-input"
                {...register('email', {
                  required: 'Email address is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Please enter a valid email address'
                  }
                })}
                placeholder="Enter your email address (e.g., juan.dela.cruz@email.com)"
                className={`border-primary ${errors.email ? 'border-red-300' : ''}`}
              />
              {errors.email && (
                <p className="text-xs text-red-500 flex items-center gap-1" data-testid="email-error">
                  <AlertCircle className="h-3 w-3" />
                  {errors.email.message}
                </p>
              )}
              <p className="text-xs text-gray-500" data-testid="email-help-text">
                We&apos;ll send booking confirmation and updates to this email
              </p>
            </div>

            {/* License Number - Only for Self-Drive */}
            {requiresId && (
              <>
                {/* ID Type Selection */}
                <div className="space-y-2" data-testid="id-type-field">
                  <Label htmlFor="idType" className="font-medium">
                    ID Type <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formValues.idType || ''}
                    onValueChange={(value) => {
                      setValue('idType', value);
                      trigger('idType');
                    }}
                  >
                    <SelectTrigger
                      className={`w-full border-primary ${errors.idType ? 'border-red-300' : ''}`}
                      data-testid="id-type-select"
                    >
                      <SelectValue placeholder="Select your ID type" />
                    </SelectTrigger>
                    <SelectContent>
                      {VALID_ID_TYPES.map((idType) => (
                        <SelectItem
                          key={idType.value}
                          value={idType.value}
                          data-testid={`id-type-option-${idType.value}`}
                        >
                          {idType.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.idType && (
                    <p className="text-xs text-red-500 flex items-center gap-1" data-testid="id-type-error">
                      <AlertCircle className="h-3 w-3" />
                      {errors.idType.message}
                    </p>
                  )}
                  <p className="text-xs text-gray-500" data-testid="id-type-help-text">
                    Select the type of valid ID you will present
                  </p>
                </div>

                {/* License Number Input */}
                <div className="space-y-2" data-testid="license-number-field">
                  <Label htmlFor="licenseNumber" className="font-medium">
                    License Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="licenseNumber"
                    data-testid="license-number-input"
                    {...register('licenseNumber', {
                      required: 'ID number is required for self-drive rental',
                      minLength: {
                        value: 8,
                        message: 'ID number must be at least 8 characters'
                      }
                    })}
                    placeholder="Enter your ID number"
                    className={`border-primary ${errors.licenseNumber ? 'border-red-300' : ''}`}
                  />
                  {errors.licenseNumber && (
                    <p className="text-xs text-red-500 flex items-center gap-1" data-testid="license-number-error">
                      <AlertCircle className="h-3 w-3" />
                      {errors.licenseNumber.message}
                    </p>
                  )}
                  <p className="text-xs text-gray-500" data-testid="license-help-text">
                    Please provide your valid License number for verification
                  </p>
                </div>
              </>
            )}
          </form>

          {/* Data Consent Checkbox */}
          <div className="space-y-2" data-testid="data-consent-field">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="dataConsent"
                checked={formValues.dataConsent || false}
                onCheckedChange={handleCheckboxChange}
                data-testid="data-consent-checkbox"
                className='border-primary text-primary'
              />
              <div className="flex-1">
                <Label htmlFor="dataConsent" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  I agree to the Data Privacy Consent terms and conditions.
                  <span className="text-red-500">*</span>
                </Label>
                <p className="text-xs text-gray-500 mt-1" data-testid="data-consent-help-text">
                  Click to review and agree to our comprehensive data privacy policy.
                </p>
              </div>
            </div>
            {errors.dataConsent && (
              <p className="text-xs text-red-500 flex items-center gap-1" data-testid="data-consent-error">
                <AlertCircle className="h-3 w-3" />
                {errors.dataConsent.message}
              </p>
            )}
          </div>

          {/* Data Privacy Consent Modal */}
          <Dialog open={showConsentModal} onOpenChange={setShowConsentModal}>
            <DialogContent className="w-screen h-screen max-w-none max-h-none flex flex-col m-0 rounded-none overflow-hidden">
              <DialogHeader className="shrink-0 px-6 py-4 border-b">
                <DialogTitle className="flex items-center gap-2 text-xl">
                  <Shield className="h-6 w-6" />
                  Data Privacy Consent Agreement
                </DialogTitle>
                <DialogDescription className="text-base">
                  Please read and review our comprehensive data privacy policy below.
                </DialogDescription>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto px-6 py-4" onScroll={handleScroll}>
                <div className="max-w-4xl mx-auto space-y-6">
                  {/* Introduction */}
                  <div>
                    <h3 className="font-semibold text-xl mb-3">Data Privacy Act Compliance</h3>
                    <p className="text-base text-gray-600">
                      In compliance with the Republic Act No. 10173 (Data Privacy Act of 2012) of the Philippines,
                      we are committed to protecting your personal data and ensuring transparency in our data processing practices.
                    </p>
                  </div>

                  <Separator />

                  {/* Data Collection */}
                  <div>
                    <h4 className="font-semibold flex items-center gap-2 mb-3 text-lg">
                      <Database className="h-5 w-5" />
                      Data Collection
                    </h4>
                    <p className="text-base text-gray-600 mb-3">
                      We collect the following personal information for legitimate business purposes:
                    </p>
                    <ul className="text-base text-gray-600 space-y-2 list-disc list-inside">
                      <li>Full name (first, middle, last name)</li>
                      <li>Contact number and email address</li>
                      <li>Valid government-issued ID and ID number</li>
                      <li>Driver&apos;s license information (for self-drive rentals)</li>
                      <li>Home and office addresses</li>
                      <li>Rental history and payment information</li>
                    </ul>
                  </div>

                  <Separator />

                  {/* Purpose of Processing */}
                  <div>
                    <h4 className="font-semibold flex items-center gap-2 mb-3 text-lg">
                      <Eye className="h-5 w-5" />
                      Purpose of Data Processing
                    </h4>
                    <p className="text-base text-gray-600 mb-3">
                      Your personal data will be processed for the following specific purposes:
                    </p>
                    <ul className="text-base text-gray-600 space-y-2 list-disc list-inside">
                      <li>Vehicle rental booking and reservation processing</li>
                      <li>Identity verification and background checks</li>
                      <li>Payment processing and financial transactions</li>
                      <li>Insurance coverage and claims processing</li>
                      <li>Legal compliance with government regulations</li>
                      <li>Customer service and support</li>
                      <li>Marketing communications (with your consent)</li>
                    </ul>
                  </div>

                  <Separator />

                  {/* Data Protection */}
                  <div>
                    <h4 className="font-semibold flex items-center gap-2 mb-3 text-lg">
                      <Lock className="h-5 w-5" />
                      Data Protection Measures
                    </h4>
                    <p className="text-base text-gray-600 mb-3">
                      We implement appropriate security measures to protect your personal data:
                    </p>
                    <ul className="text-base text-gray-600 space-y-2 list-disc list-inside">
                      <li>Encrypted data storage and transmission</li>
                      <li>Restricted access to authorized personnel only</li>
                      <li>Regular security audits and updates</li>
                      <li>Secure disposal of data after retention period</li>
                      <li>Compliance with international security standards</li>
                    </ul>
                  </div>

                  <Separator />

                  {/* Data Retention */}
                  <div>
                    <h4 className="font-semibold mb-3 text-lg">Data Retention Period</h4>
                    <p className="text-base text-gray-600">
                      Your personal data will be retained for a maximum period of five (5) years from the date of
                      your last transaction, unless required by law to be retained for a longer period. After the
                      retention period, your data will be securely destroyed or anonymized.
                    </p>
                  </div>

                  <Separator />

                  {/* Your Rights */}
                  <div>
                    <h4 className="font-semibold mb-3 text-lg">Your Data Privacy Rights</h4>
                    <p className="text-base text-gray-600 mb-3">
                      Under the Data Privacy Act, you have the following rights:
                    </p>
                    <ul className="text-base text-gray-600 space-y-2 list-disc list-inside">
                      <li>Right to be informed of personal data processing</li>
                      <li>Right to access your personal data</li>
                      <li>Right to correct inaccurate data</li>
                      <li>Right to erasure or blocking of data</li>
                      <li>Right to object to processing</li>
                      <li>Right to data portability</li>
                      <li>Right to file a complaint with the National Privacy Commission</li>
                    </ul>
                  </div>

                  <Separator />

                  {/* Contact Information */}
                  <div>
                    <h4 className="font-semibold mb-3 text-lg">Data Privacy Contact</h4>
                    <p className="text-base text-gray-600">
                      For any data privacy concerns or to exercise your rights, please contact our
                      Data Protection Officer at privacy@carrentals.ph or call (02) 123-4567.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 px-6 py-4 border-t bg-white shrink-0">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    setShowConsentModal(false)
                    setValue('dataConsent', false)
                    trigger('dataConsent')
                  }}
                  data-testid="decline-consent-button"
                >
                  Decline
                </Button>
                <Button
                  size="lg"
                  disabled={!hasScrolledToBottom}
                  onClick={() => {
                    setModalAgreed(true)
                    setShowConsentModal(false)
                  }}
                  data-testid="agree-consent-button"
                >
                  I Agree
                </Button>

              </div>
              {!hasScrolledToBottom && (
                <p className="text-xs text-gray-500 self-center">
                  Please scroll to the bottom to enable agreement
                </p>
              )}
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  )
}
