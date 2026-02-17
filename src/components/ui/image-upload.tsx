import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useUploadImage } from '@/lib/npm-ready-stack/cloudinary';
import { FileText } from 'lucide-react';
import Image from 'next/image';
import React from 'react';

interface ImageUploadProps {
  /** Current image URL or preview */
  value?: string;
  /** Callback when image is uploaded/removed */
  onChange: (url?: string) => void;
  /** Required field indicator */
  required?: boolean;
  /** Label text */
  label?: string;
  /** Help text below the upload area */
  helpText?: string;
  /** Placeholder text for upload button */
  placeholder?: string;
  /** Accepted file types */
  accept?: string;
  /** Maximum file size in MB */
  maxSize?: number;
  /** Container className */
  className?: string;
  /** Test ID for the upload field */
  testId?: string;
  /** Test ID for the input element */
  inputTestId?: string;
  /** Error message */
  error?: string;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Callback on upload success with full metadata */
  onUploadSuccess?: (data: { url: string; publicId: string }) => void;
  /** Compact UI variant for dense form layouts */
  compact?: boolean;
}

export function ImageUpload({
  value,
  onChange,
  required = false,
  label = 'Upload Image',
  helpText = 'PNG, JPG up to 10MB',
  placeholder = 'Upload Image',
  accept = 'image/*',
  maxSize = 10,
  className = '',
  testId = 'image-upload-field',
  inputTestId = 'image-input',
  error,
  disabled = false,
  onUploadSuccess,
  compact = false,
}: ImageUploadProps) {
  const { uploadImage, deleteImage, isLoading: isUploading, error: uploadError } = useUploadImage();
  const [preview, setPreview] = React.useState<string | null>(value || null);

  /**
   * Handle image upload to Cloudinary
   * @param file - The image file to upload
   */
  const handleImageUpload = async (file: File) => {
    try {
      // Validate file size
      if (file.size > maxSize * 1024 * 1024) {
        throw new Error(`File size must be less than ${maxSize}MB`);
      }

      // Show local preview immediately
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to Cloudinary
      const { url, publicId } = await uploadImage(file);

      // Update preview with Cloudinary URL
      setPreview(url);

      // Notify parent component
      onChange(url);
      onUploadSuccess?.({ url, publicId });
    } catch (error) {
      console.error('Upload failed:', error);
      // Reset preview on error
      setPreview(null);
      onChange(undefined);
    }
  };

  /**
   * Handle image removal from Cloudinary and local state
   */
  const handleImageRemove = async () => {
    if (preview && preview.startsWith('https://res.cloudinary.com')) {
      try {
        // Delete from Cloudinary if it's a Cloudinary URL
        await deleteImage(preview);
      } catch (error) {
        console.error('Failed to delete image from Cloudinary:', error);
        // Continue with local removal even if Cloudinary deletion fails
      }
    }

    // Clear local state and notify parent
    setPreview(null);
    onChange(undefined);

    // Clear file input
    const input = document.getElementById(inputTestId) as HTMLInputElement;
    if (input) input.value = '';
  };

  // Update preview when value prop changes
  React.useEffect(() => {
    setPreview(value || null);
  }, [value]);

  return (
    <div className={`space-y-2 ${className}`} data-testid={testId}>
      <Label htmlFor={inputTestId} className="font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>

      {preview ? (
        // Image Preview
        <div className={`relative rounded-lg ${compact ? "p-1.5 bg-slate-50/70 shadow-sm" : "border-2 border-primary p-2"}`}>
          <div className={`relative w-full bg-gray-50 rounded-md overflow-hidden ${compact ? "h-28" : "h-48"}`}>
            <Image
              src={preview}
              alt={`${label} Preview`}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleImageRemove}
            disabled={isUploading || disabled}
            className={`w-full ${compact ? "mt-1 h-7 text-[10px]" : "mt-2"}`}
          >
            Remove Image
          </Button>
        </div>
      ) : (
        // Upload Area
        <div className={`rounded-lg text-center transition-colors ${compact ? "p-2.5 bg-slate-50/70 hover:bg-slate-100/70" : "border-2 border-dashed border-primary/30 p-4 hover:border-primary/50"}`}>
          <input
            id={inputTestId}
            type="file"
            accept={accept}
            className="hidden"
            data-testid={inputTestId}
            disabled={disabled}
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (file) {
                await handleImageUpload(file);
              }
            }}
          />
          <div className={`flex flex-col items-center ${compact ? "gap-1.5" : "gap-2"}`}>
            {isUploading ? (
              <div className="flex flex-col items-center gap-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <p className="text-sm text-primary">Uploading...</p>
              </div>
            ) : (
              <>
                <div className={`${compact ? "w-9 h-9" : "w-12 h-12"} bg-primary/10 rounded-full flex items-center justify-center`}>
                  <FileText className={`${compact ? "h-4 w-4" : "h-6 w-6"} text-primary`} />
                </div>
                <div>
                  <p className={`${compact ? "text-xs" : "text-sm"} font-medium text-gray-900`}>{placeholder}</p>
                  {!compact && <p className="text-xs text-gray-500">{helpText}</p>}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById(inputTestId)?.click()}
                  className={compact ? "mt-1 h-7 text-[10px]" : "mt-2"}
                  disabled={isUploading || disabled}
                >
                  Choose File
                </Button>
              </>
            )}
          </div>
          {(uploadError || error) && (
            <p className="text-xs text-red-500 text-center mt-2">
              {uploadError || error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
