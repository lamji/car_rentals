import { useState } from 'react';
import useInitCloudenary from './useInitCloudenary';

interface UseUploadImageReturn {
  uploadImage: (file: File) => Promise<string>;
  deleteImage: (imageUrl: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

/**
 * Extract public ID from Cloudinary URL
 * @param imageUrl - Cloudinary image URL
 * @returns Public ID for deletion
 */
const extractPublicId = (imageUrl: string): string => {
  try {
    // Extract public ID from Cloudinary URL
    // Example: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/image.jpg
    // We need to extract: folder/image.jpg
    const urlParts = imageUrl.split('/');
    const uploadIndex = urlParts.findIndex(part => part === 'upload');
    
    if (uploadIndex === -1 || uploadIndex + 1 >= urlParts.length) {
      throw new Error('Invalid Cloudinary URL format');
    }
    
    // Get everything after /upload/
    const pathParts = urlParts.slice(uploadIndex + 1);
    const fullPath = pathParts.join('/');
    
    // Remove version number if present (e.g., v1234567890/)
    const publicId = fullPath.replace(/^v\d+\//, '');
    
    // Remove file extension for Cloudinary API
    const publicIdWithoutExt = publicId.replace(/\.[^/.]+$/, '');
    
    console.log('Extracted public ID:', publicIdWithoutExt, 'from URL:', imageUrl);
    
    return publicIdWithoutExt;
  } catch (error) {
    console.error('Failed to extract public ID from URL:', imageUrl, error);
    throw new Error('Invalid Cloudinary URL format');
  }
};

export default function useUploadImage(): UseUploadImageReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { 
    cloudName: cloudNameFromInit, 
    preset: presetFromInit, 
    useSigned 
  } = useInitCloudenary()

  console.log("debug-cloudinary: cloudNameFromInit", cloudNameFromInit);
  console.log("debug-cloudinary: presetFromInit", presetFromInit);
  console.log("debug-cloudinary: useSigned", useSigned);

  const uploadImage = async (file: File): Promise<string> => {
    if (!cloudNameFromInit || !presetFromInit) {
      throw new Error('Cloudinary not initialized. Call init() first with cloudName and preset.');
    }

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', presetFromInit);

      if (useSigned) {
        // Fetch signature from API route
        const signResponse = await fetch('/api/cloudinary/sign', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            upload_preset: presetFromInit,
          }),
        });

        if (!signResponse.ok) {
          throw new Error('Failed to generate upload signature');
        }

        const signData = await signResponse.json();
        
        formData.append('api_key', signData.apiKey);
        formData.append('timestamp', signData.timestamp);
        formData.append('signature', signData.signature);
      }

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudNameFromInit}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'Upload failed');
      }

      const data = await response.json();
      return data.secure_url;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteImage = async (imageUrl: string): Promise<void> => {
    if (!imageUrl) {
      throw new Error('Image URL is required for deletion');
    }

    setIsLoading(true);
    setError(null);

    try {
      const publicId = extractPublicId(imageUrl);

      const response = await fetch('/api/cloudinary/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          publicId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'Failed to delete image');
      }

      const result = await response.json();
      
      if (!result.success) {
        // Don't throw error for "not found" cases - it's already deleted
        if (result.message?.includes('not found') || result.message?.includes('already deleted')) {
          console.log('Image was already deleted or not found in Cloudinary:', publicId);
          return; // Success - image is already gone
        }
        throw new Error(result.message || 'Failed to delete image');
      }

      console.log('Image deleted successfully from Cloudinary:', publicId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Delete failed';
      
      // Don't set error for "not found" cases
      if (!errorMessage.includes('not found') && !errorMessage.includes('already deleted')) {
        setError(errorMessage);
        throw err;
      } else {
        console.log('Image was already deleted or not found:', errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    uploadImage,
    deleteImage,
    isLoading,
    error,
  };
}
