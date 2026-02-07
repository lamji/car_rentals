/* eslint-disable @typescript-eslint/no-explicit-any */
import { setBookingDetails } from '@/lib/slices/bookingSlice'
import { useAppDispatch, useAppSelector } from '@/lib/store'
import React from 'react'
import { useForm, useWatch } from 'react-hook-form'

// Array of valid ID types
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

export interface PersonalInfoData {
  firstName: string
  lastName: string
  middleName: string
  contactNumber: string
  email: string
  licenseNumber?: string
  licenseImage?: string // Changed from File to string (Cloudinary URL)
  ltoPortalScreenshot?: string // LTO Portal screenshot URL
  idType?: string
  dataConsent: boolean
}

interface UsePersonalInfoFormProps {
  onValidationChange?: (isValid: boolean, data?: PersonalInfoData) => void
}

/**
 * Custom hook for managing personal information form state and logic
 * Handles form validation, state management, and data consent modal
 * @param onValidationChange - Callback for validation changes
 * @returns Form state and handlers
 */
export function usePersonalInfoForm({ onValidationChange }: UsePersonalInfoFormProps) {
  const selectedCar = useAppSelector(state => state.booking.selectedCar)
  const bookingDetails = useAppSelector(state => state.booking.bookingDetails)
  const dispatch = useAppDispatch()
  const [showConsentModal, setShowConsentModal] = React.useState(false)
  const [modalAgreed, setModalAgreed] = React.useState(false)
  const [hasScrolledToBottom, setHasScrolledToBottom] = React.useState(false)

  /**
   * Handle field blur event - saves to Redux when user finishes typing
   * More practical than debouncing by keystrokes
   */
  const handleFieldBlur = React.useCallback((fieldName: keyof PersonalInfoData, value: any) => {
    dispatch(setBookingDetails({
      [fieldName]: value
    }))
  }, [dispatch])

  /**
   * Handle checkbox change for data consent
   * Opens modal when user tries to check, resets when unchecking
   */
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

  /**
   * Handle scroll detection for consent modal
   * Enables agreement button when user scrolls to bottom
   */
  const handleScroll = React.useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget
    const isAtBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 10 // 10px tolerance
    setHasScrolledToBottom(isAtBottom)
  }, [])

  /**
   * Default form values from Redux state
   */
  const defaultValues = React.useMemo<PersonalInfoData>(() => {
    return {
      firstName: bookingDetails.firstName ?? '',
      middleName: bookingDetails.middleName ?? '',
      lastName: bookingDetails.lastName ?? '',
      contactNumber: bookingDetails.contactNumber ?? '',
      email: bookingDetails.email ?? '',
      licenseNumber: bookingDetails.licenseNumber ?? '',
      licenseImage: bookingDetails.licenseImage ?? undefined,
      ltoPortalScreenshot: bookingDetails.ltoPortalScreenshot ?? undefined,
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
    bookingDetails.licenseImage,
    bookingDetails.ltoPortalScreenshot,
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
    watch,
    formState: { errors, isValid }
  } = useForm<PersonalInfoData>({
    mode: 'onChange',
    defaultValues,
    resolver: undefined
  })

  /**
   * Register additional form fields for validation
   */
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

  /**
   * Reset form when default values change
   */
  React.useEffect(() => {
    reset(defaultValues)
    trigger()
  }, [defaultValues, reset, trigger])

  /**
   * Watch form values and notify parent of validation changes
   */
  const formValues = useWatch({ control })

  /**
   * Dispatch non-input field changes (checkbox, image uploads) immediately
   * Input fields are handled via onBlur events for better performance
   */
  React.useEffect(() => {
    // Only dispatch checkbox and image upload changes immediately
    if (formValues.dataConsent !== undefined || formValues.licenseImage || formValues.ltoPortalScreenshot) {
      dispatch(setBookingDetails({
        dataConsent: formValues.dataConsent,
        licenseImage: formValues.licenseImage,
        ltoPortalScreenshot: formValues.ltoPortalScreenshot
      }))
    }
  }, [formValues.dataConsent, formValues.licenseImage, formValues.ltoPortalScreenshot, dispatch])

  /**
   * Notify parent component of validation changes
   */
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
  }, [isValid, formValues, onValidationChange, requiresId, selectedCar?.selfDrive])

  /**
   * Handle form submission
   */
  const onSubmit = (data: PersonalInfoData) => {
    console.log('Personal Info:', data)
    // TODO: Save to Redux state
  }

  /**
   * Reset scroll state when modal opens
   */
  React.useEffect(() => {
    if (showConsentModal) {
      setHasScrolledToBottom(false)
    }
  }, [showConsentModal])

  /**
   * Update checkbox when modal is agreed
   */
  React.useEffect(() => {
    if (modalAgreed) {
      setValue('dataConsent', true)
      trigger('dataConsent')
    }
  }, [modalAgreed, setValue, trigger])

  return {
    // Form state
    formValues,
    errors,
    isValid,
    isSelfDrive,
    requiresId,
    selectedCar,
    
    // Form handlers
    register,
    handleSubmit,
    control,
    reset,
    trigger,
    setValue,
    watch,
    onSubmit,
    
    // Modal state
    showConsentModal,
    setShowConsentModal,
    modalAgreed,
    setModalAgreed,
    hasScrolledToBottom,
    handleCheckboxChange,
    handleScroll,
    handleFieldBlur,
    
    // Constants
    VALID_ID_TYPES,
  }
}
