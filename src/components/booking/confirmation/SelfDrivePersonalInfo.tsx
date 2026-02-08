"use client";

import { VALID_ID_TYPES } from '@/lib/data/validId';
// import { VALID_ID_TYPES } from '@/lib/constants/idTypes'
// import { NextImage } from '@/components/ui/NextImage'
import Image from 'next/image'
import { useState } from 'react'

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
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null)

  // Helper function to get ID type label from value
  const getIdTypeLabel = (value?: string): string => {
    if (!value) return ''
    const idType = VALID_ID_TYPES.find(type => type.value === value)
    return idType?.label || value
  }

  const handleImageClick = (imageSrc: string) => {
    setFullscreenImage(imageSrc)
  }

  const closeFullscreen = () => {
    setFullscreenImage(null)
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        <div></div>
      </div>

      {/* Uploaded Images */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div data-testid="license-image-field">
          <span className="text-sm font-medium text-gray-500">
            Driver&apos;s License Image
          </span>
          {licenseImage ? (
            <div className="mt-1">
              <div 
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => handleImageClick(licenseImage)}
                data-testid="license-image-clickable"
              >
                <Image
                  src={licenseImage}
                  alt="Driver's License"
                  width={80}
                  height={80}
                  className="object-cover rounded border border-gray-200"
                  data-testid="license-image-preview"
                />
              </div>
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
              <div 
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => handleImageClick(ltoPortalScreenshot)}
                data-testid="lto-portal-screenshot-clickable"
              >
                <Image
                  src={ltoPortalScreenshot}
                  alt="LTO Portal Screenshot"
                  width={80}
                  height={80}
                  className="object-cover rounded border border-gray-200"
                  data-testid="lto-portal-screenshot-preview"
                />
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400" data-testid="lto-portal-screenshot-missing">No screenshot uploaded</p>
          )}
        </div>
        <div></div>
      </div>

      {/* Fullscreen Image Modal */}
      {fullscreenImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={closeFullscreen}
          data-testid="fullscreen-modal"
        >
          <div className="relative max-w-4xl max-h-full">
            <Image
              src={fullscreenImage}
              alt="Full screen view"
              width={1200}
              height={800}
              className="max-w-full max-h-full object-contain rounded"
              data-testid="fullscreen-image"
              priority
            />
            <button
              className="absolute -top-12 -right-4 bg-white hover:bg-gray-100 text-gray-900 p-2 rounded-full shadow-lg transition-colors"
              onClick={closeFullscreen}
              data-testid="close-fullscreen"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  )
}
