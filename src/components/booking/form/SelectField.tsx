import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PersonalInfoData } from '@/hooks/usePersonalInfoForm'
import { AlertCircle } from 'lucide-react'
import { FieldErrors, UseFormSetValue, UseFormTrigger } from 'react-hook-form'

interface SelectOption {
  value: string
  label: string
}

interface SelectFieldProps {
  /** Field name (key from PersonalInfoData) */
  name: keyof PersonalInfoData
  /** Field label */
  label: string
  /** Current form value */
  value: string
  /** Available options */
  options: SelectOption[]
  /** setValue function from react-hook-form */
  setValue: UseFormSetValue<PersonalInfoData>
  /** trigger function from react-hook-form */
  trigger: UseFormTrigger<PersonalInfoData>
  /** Form errors object */
  errors: FieldErrors<PersonalInfoData>
  /** Whether the field is required */
  required?: boolean
  /** Placeholder text */
  placeholder?: string
  /** Test ID for the field container */
  testId?: string
  /** Test ID for the select trigger */
  selectTestId?: string
  /** Test ID for the error message */
  errorTestId?: string
  /** Test ID prefix for options */
  optionTestIdPrefix?: string
  /** Additional CSS classes for the field container */
  className?: string
  /** onBlur handler for Redux persistence */
  onBlur?: (fieldName: keyof PersonalInfoData, value: string) => void
}

/**
 * Generic reusable select field component
 * Handles any select field with proper validation and error display
 */
export function SelectField({
  name,
  label,
  value,
  options,
  setValue,
  trigger,
  errors,
  required = false,
  placeholder = "Select an option",
  testId,
  selectTestId,
  errorTestId,
  optionTestIdPrefix,
  className,
  onBlur
}: SelectFieldProps) {
  // Generate default test IDs if not provided
  const fieldTestId = testId || `${name}-field`
  const fieldSelectTestId = selectTestId || `${name}-select`
  const fieldErrorTestId = errorTestId || `${name}-error`
  const fieldOptionTestIdPrefix = optionTestIdPrefix || `${name}-option`

  return (
    <div className={`space-y-2 ${className || ''}`} data-testid={fieldTestId}>
      <Label htmlFor={name} className="font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <Select
        value={value || ''}
        onValueChange={(selectedValue) => {
          setValue(name, selectedValue);
          trigger(name);
          // Call onBlur handler for Redux persistence
          if (onBlur) {
            onBlur(name, selectedValue);
          }
        }}
      >
        <SelectTrigger
          className={`w-full border-primary ${errors[name] ? 'border-red-300' : ''}`}
          data-testid={fieldSelectTestId}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              data-testid={`${fieldOptionTestIdPrefix}-${option.value}`}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {errors[name] && (
        <p className="text-xs text-red-500 flex items-center gap-1" data-testid={fieldErrorTestId}>
          <AlertCircle className="h-3 w-3" />
          {errors[name]?.message as string}
        </p>
      )}
    </div>
  )
}
