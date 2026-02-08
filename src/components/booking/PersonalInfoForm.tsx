import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ImageUpload } from '@/components/ui/image-upload'
import { usePersonalInfoForm, type PersonalInfoData } from '@/hooks/usePersonalInfoForm'
import { AlertCircle } from 'lucide-react'
import { DataPrivacyModal } from './DataPrivacyModal'
import { CheckboxField } from './form/CheckboxField'
import { FormField } from './form/FormField'
import { SelectField } from './form/SelectField'
import { SelfDriveIndicator } from './SelfDriveIndicator'

interface PersonalInfoFormProps {
  onValidationChange?: (isValid: boolean, data?: PersonalInfoData) => void
}

export function PersonalInfoForm({ onValidationChange }: PersonalInfoFormProps) {
  const {
    formValues,
    errors,
    isSelfDrive,
    requiresId,
    selectedCar,
    register,
    handleSubmit,
    trigger,
    setValue,
    watch,
    onSubmit,
    showConsentModal,
    setShowConsentModal,
    setModalAgreed,
    hasScrolledToBottom,
    handleCheckboxChange,
    handleScroll,
    handleFieldBlur,
    VALID_ID_TYPES,
  } = usePersonalInfoForm({ onValidationChange })

  return (
    <div className="space-y-6" data-testid="personal-info-form">


      {/* Self-Drive Indicator */}
      {isSelfDrive && <SelfDriveIndicator />}

      {/* Form */}
      {selectedCar && (
        <Card className="shadow-none border-0 bg-transparent p-0" data-testid="personal-info-form-card">
          <CardHeader className="p-0">
            <CardTitle className="text-lg">Your Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-0">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" data-testid="personal-info-form-element">
              {/* Name Fields - Desktop: Row, Mobile: Column */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-2">
                {/* First Name */}
                <FormField
                  name="firstName"
                  label="First Name"
                  register={register}
                  errors={errors}
                  required
                  placeholder="Enter your first name"
                  onBlur={handleFieldBlur}
                  validation={{
                    minLength: { value: 2, message: 'First name must be at least 2 characters' },
                    pattern: { value: /^[a-zA-Z\s]+$/, message: 'First name can only contain letters' }
                  }}
                />

                {/* Middle Name */}
                <FormField
                  name="middleName"
                  label="Middle Name"
                  register={register}
                  errors={errors}
                  placeholder="Enter your middle name (optional)"
                  onBlur={handleFieldBlur}
                  validation={{
                    pattern: { value: /^[a-zA-Z\s]+$/, message: 'Middle name can only contain letters' }
                  }}
                />

                {/* Last Name */}
                <FormField
                  name="lastName"
                  label="Last Name"
                  register={register}
                  errors={errors}
                  required
                  placeholder="Enter your last name"
                  onBlur={handleFieldBlur}
                  validation={{
                    minLength: { value: 2, message: 'Last name must be at least 2 characters' },
                    pattern: { value: /^[a-zA-Z\s]+$/, message: 'Last name can only contain letters' }
                  }}
                />
              </div>

              {/* Contact and Email Fields - Desktop: Row, Mobile: Column */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Contact Number */}
                <div>
                  <FormField
                    name="contactNumber"
                    label="Contact Number"
                    type="tel"
                    register={register}
                    errors={errors}
                    required
                    placeholder="Enter your contact number"
                    className="mb-0"
                    onBlur={handleFieldBlur}
                    validation={{
                      pattern: { value: /^[0-9+\-\s()]+$/, message: 'Please enter a valid contact number' },
                      minLength: { value: 10, message: 'Contact number must be at least 10 digits' }
                    }}
                  />
                  <p className="text-xs text-gray-500" data-testid="contact-help-text">
                    Include country code for international numbers
                  </p>
                </div>

                {/* Email */}
                <div>
                  <FormField
                    name="email"
                    label="Email Address"
                    type="email"
                    register={register}
                    errors={errors}
                    required
                    placeholder="e.g., juan.dela.cruz@email.com"
                    className="custom-email-field mb-0"
                    onBlur={handleFieldBlur}
                    validation={{
                      pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Please enter a valid email address' }
                    }}
                  />
                  <p className="text-xs text-gray-500" data-testid="email-help-text">
                    We&apos;ll send booking confirmation and updates to this email
                  </p>
                </div>
              </div>

              {/* License Number - Only for Self-Drive */}
              {requiresId && (
                <>
                  {/* ID Fields - Desktop: Row, Mobile: Column */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* ID Type Selection */}
                    <div>
                      <SelectField
                        name="idType"
                        label="ID Type"
                        value={formValues.idType || ''}
                        options={VALID_ID_TYPES.map(({ value, label }) => ({ value, label }))}
                        setValue={setValue}
                        trigger={trigger}
                        errors={errors}
                        required
                        placeholder="Select your ID type"
                        optionTestIdPrefix="id-type-option"
                        className="mb-0"
                        onBlur={handleFieldBlur}
                      />
                      <p className="text-xs text-gray-500" data-testid="id-type-help-text">
                        Select the type of valid ID you will present. The original ID will be surrendered at the garage for verification during vehicle pickup.
                      </p>
                    </div>

                    {/* License Number Input */}
                    <div>
                      <FormField
                        name="licenseNumber"
                        label="License Number"
                        register={register}
                        errors={errors}
                        required
                        placeholder="Enter your ID number"
                        className="mb-0"
                        onBlur={handleFieldBlur}
                        validation={{
                          minLength: { value: 8, message: 'ID number must be at least 8 characters' }
                        }}
                      />
                      <p className="text-xs text-gray-500" data-testid="license-help-text">
                        Please provide your valid License number for verification
                      </p>
                    </div>
                  </div>

                  {/* Image Upload Fields - Desktop: Row, Mobile: Column */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Driver's License Image Upload */}
                    <div>
                      <ImageUpload
                        value={watch('licenseImage')}
                        onChange={(url) => setValue('licenseImage', url)}
                        required
                        label="Upload DL Image"
                        helpText="PNG, JPG up to 10MB"
                        placeholder="Upload Driver's License Image"
                        testId="license-image-field"
                        inputTestId="license-image"
                        error={errors.licenseImage?.message}
                      />

                      {errors.licenseImage && (
                        <p className="text-xs text-red-500 flex items-center gap-1" data-testid="license-image-error">
                          <AlertCircle className="h-3 w-3" />
                          {errors.licenseImage.message}
                        </p>
                      )}
                      <p className="text-xs text-gray-500" data-testid="license-image-help-text">
                        Please upload a clear photo of your driver&apos;s license for verification
                      </p>
                    </div>

                    {/* Screen shots of LTO Portal */}
                    <div>
                      <ImageUpload
                        value={watch('ltoPortalScreenshot')}
                        onChange={(url) => setValue('ltoPortalScreenshot', url)}
                        required
                        label="Upload LTO Portal Screenshot"
                        helpText="PNG, JPG up to 10MB"
                        placeholder="Upload LTO Portal Screenshot"
                        testId="lto-portal-screenshot-field"
                        inputTestId="lto-portal-screenshot"
                        error={errors.ltoPortalScreenshot?.message}
                      />

                      {errors.ltoPortalScreenshot && (
                        <p className="text-xs text-red-500 flex items-center gap-1" data-testid="lto-portal-screenshot-error">
                          <AlertCircle className="h-3 w-3" />
                          {errors.ltoPortalScreenshot.message}
                        </p>
                      )}
                      <p className="text-xs text-gray-500" data-testid="lto-portal-screenshot-help-text">
                        Please upload a screenshot of the LTO portal verification
                      </p>
                    </div>
                  </div>

                  {/* Data Consent Checkbox */}
                  <CheckboxField
                    name="dataConsent"
                    label="I agree to the Data Privacy Consent terms and conditions."
                    helpText="Click to review and agree to our comprehensive data privacy policy."
                    checked={formValues.dataConsent || false}
                    onCheckedChange={handleCheckboxChange}
                    errors={errors}
                    required
                  />

                  {/* Data Privacy Consent Modal */}
                  <DataPrivacyModal
                    open={showConsentModal}
                    onOpenChange={setShowConsentModal}
                    onScroll={handleScroll}
                    hasScrolledToBottom={hasScrolledToBottom}
                    onDecline={() => {
                      setShowConsentModal(false)
                      setValue('dataConsent', false)
                      trigger('dataConsent')
                    }}
                    onAgree={() => {
                      setModalAgreed(true)
                      setShowConsentModal(false)
                    }}
                  />
                </>
              )}
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
