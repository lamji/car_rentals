import NextImage from 'next/image'
import { VALID_ID_TYPES } from '@/lib/data/validId'

interface SelfDrivePersonalInfoProps {
  idType?: string
  licenseNumber?: string
  licenseImage?: string
  ltoPortalScreenshot?: string
}

export function SelfDrivePersonalInfo({
  idType,
  licenseNumber,
  licenseImage,
  ltoPortalScreenshot
}: SelfDrivePersonalInfoProps) {
  // Helper function to get ID type label from value
  const getIdTypeLabel = (value?: string): string => {
    if (!value) return ''
    const idType = VALID_ID_TYPES.find(type => type.value === value)
    return idType?.label || value
  }

  return (
    <>
      <div data-testid="id-type-field">
        <span className="text-sm font-medium text-gray-500">
          ID Type
        </span>
        <p className="text-sm" data-testid="id-type-value">{getIdTypeLabel(idType)}</p>
      </div>
      <div data-testid="license-number-field">
        <span className="text-sm font-medium text-gray-500">
          License Number
        </span>
        <p className="text-sm" data-testid="license-number-value">{licenseNumber || ''}</p>
      </div>

      {/* Uploaded Images */}
      <div className="space-y-3">
        <div data-testid="license-image-field">
          <span className="text-sm font-medium text-gray-500">
            Driver&apos;s License Image
          </span>
          {licenseImage ? (
            <div className="mt-1">
              <NextImage
                src={licenseImage}
                alt="Driver's License"
                width={80}
                height={80}
                className="object-cover rounded border border-gray-200"
                data-testid="license-image-preview"
              />
            </div>
          ) : (
            <p className="text-sm text-gray-400" data-testid="license-image-missing">No image uploaded</p>
          )}
        </div>

        <div data-testid="lto-portal-screenshot-field">
          <span className="text-sm font-medium text-gray-500">
            LTO Portal Screenshot
          </span>
          {ltoPortalScreenshot ? (
            <div className="mt-1">
              <NextImage
                src={ltoPortalScreenshot}
                alt="LTO Portal Screenshot"
                width={80}
                height={80}
                className="object-cover rounded border border-gray-200"
                data-testid="lto-portal-screenshot-preview"
              />
            </div>
          ) : (
            <p className="text-sm text-gray-400" data-testid="lto-portal-screenshot-missing">No screenshot uploaded</p>
          )}
        </div>
      </div>
    </>
  )
}
