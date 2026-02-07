# Cloudinary Module

A set of React hooks for integrating Cloudinary image upload functionality into your Next.js application.

## Overview

This module provides two main hooks:
- `useInitCloudenary` - Initialize Cloudinary configuration
- `useUploadImage` - Upload images to Cloudinary

## Installation

The hooks are already integrated into your project. Just import and use them:

```typescript
import { useInitCloudenary, useUploadImage } from '@/lib/npm-ready-stack/cloudinary';
```

## Environment Variables

Add these to your `.env` file:

```bash
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_PRESET=your_upload_preset
```

### Required Variables

- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` - Your Cloudinary cloud name
- `NEXT_PUBLIC_CLOUDINARY_PRESET` - Your Cloudinary upload preset name

### Optional Variables (for advanced features)

```bash
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_secret
```

## Setup in Cloudinary Dashboard

1. **Create Upload Preset**:
   - Go to Cloudinary Dashboard → Settings → Upload
   - Create a new upload preset
   - Configure security settings (file types, size limits, etc.)
   - Set signing mode to "Unsigned" for client-side uploads

2. **Get Cloud Name**:
   - Found in your Cloudinary Dashboard dashboard

## Usage

### 1. Initialize Cloudinary (App-wide)

Initialize Cloudinary once in your app layout or root component:

```typescript
import { useInitCloudenary } from '@/lib/npm-ready-stack/cloudinary';

export function LayoutContent({ children }: LayoutContentProps) {
  const { init: initializedCloudinary } = useInitCloudenary();

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME && 
        process.env.NEXT_PUBLIC_CLOUDINARY_PRESET) {
      initializedCloudinary({
        cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
        preset: process.env.NEXT_PUBLIC_CLOUDINARY_PRESET,
      });
    } else {
      console.warn('Cloudinary environment variables not set');
    }
  }, [initializedCloudinary]);

  return <div>{children}</div>;
}
```

### 2. Upload Images

Use the upload hook in any component:

```typescript
import { useUploadImage } from '@/lib/npm-ready-stack/cloudinary';

function ImageUploader() {
  const { uploadImage, isLoading, error } = useUploadImage();

  const handleFileUpload = async (file: File) => {
    try {
      const imageUrl = await uploadImage(file);
      console.log('Upload successful:', imageUrl);
      // Do something with the uploaded image URL
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload(file);
        }}
        disabled={isLoading}
      />
      {isLoading && <p>Uploading...</p>}
      {error && <p>Error: {error}</p>}
    </div>
  );
}
```

### 3. Complete Example with Preview

```typescript
import { useState } from 'react';
import { useUploadImage } from '@/lib/npm-ready-stack/cloudinary';
import Image from 'next/image';

function ImageUploadWithPreview() {
  const [preview, setPreview] = useState<string | null>(null);
  const { uploadImage, isLoading, error } = useUploadImage();

  const handleFileSelect = (file: File) => {
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to Cloudinary
    uploadImage(file)
      .then((url) => {
        console.log('Uploaded to:', url);
        setPreview(url); // Update with Cloudinary URL
      })
      .catch(console.error);
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file);
        }}
        disabled={isLoading}
      />
      
      {isLoading && <p>Uploading...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      
      {preview && (
        <div style={{ marginTop: '1rem' }}>
          <p>Preview:</p>
          <Image
            src={preview}
            alt="Upload preview"
            width={200}
            height={200}
            style={{ objectFit: 'cover' }}
          />
        </div>
      )}
    </div>
  );
}
```

## API Reference

### useInitCloudenary

Initialize Cloudinary configuration.

```typescript
const { cloudName, preset, init } = useInitCloudenary();
```

#### Returns

- `cloudName: string | null` - Current cloud name
- `preset: string | null` - Current upload preset
- `init: (config: { cloudName: string, preset: string }) => void` - Initialize function

#### init Parameters

- `cloudName: string` - Your Cloudinary cloud name
- `preset: string` - Your upload preset name

### useUploadImage

Upload images to Cloudinary.

```typescript
const { uploadImage, isLoading, error } = useUploadImage();
```

#### Returns

- `uploadImage: (file: File) => Promise<string>` - Upload function
- `isLoading: boolean` - Upload in progress
- `error: string | null` - Error message if upload fails

#### uploadImage Parameters

- `file: File` - The image file to upload

#### Returns

- `Promise<string>` - The uploaded image URL

## Security Considerations

### Upload Preset Security

Configure your upload preset in Cloudinary Dashboard with:

1. **File Type Restrictions**:
   - Allow only: `jpg`, `jpeg`, `png`, `gif`, `webp`
   - Block executables and scripts

2. **File Size Limits**:
   - Set reasonable max file size (e.g., 10MB)

3. **Access Control**:
   - Restrict to specific domains if needed
   - Use signed uploads for sensitive applications

### Environment Variables

- Never expose API secrets in client-side code
- Use `NEXT_PUBLIC_` prefix only for public variables
- Keep API keys and secrets server-side

## Error Handling

Common errors and solutions:

### "Cloudinary not initialized"
- Cause: `useInitCloudenary` not called before upload
- Solution: Ensure initialization runs before upload attempts

### "Upload failed"
- Cause: Network issues, invalid preset, or Cloudinary errors
- Solution: Check network, preset name, and Cloudinary status

### Environment variables not set
- Cause: Missing `.env` variables
- Solution: Add required environment variables

## Debug Mode

The hooks include debug logging. Enable debug output by checking browser console for:
- `debug-cloudinary: cloudNameFromInit`
- `debug-cloudinary: presetFromInit`

## Advanced Usage

### Multiple Upload Presets

For different upload types, you can create multiple instances:

```typescript
const avatarUpload = useUploadImage();
const documentUpload = useUploadImage();

// Initialize with different presets
avatarUpload.init({ cloudName: 'your-cloud', preset: 'avatar-preset' });
documentUpload.init({ cloudName: 'your-cloud', preset: 'document-preset' });
```

### Server-side Uploads

For server-side uploads, use Cloudinary's SDK with API keys and secrets:

```typescript
// This would be in API routes, not client-side
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
```

## Troubleshooting

### Common Issues

1. **Upload fails with CORS error**
   - Check Cloudinary dashboard CORS settings
   - Ensure your domain is whitelisted

2. **Environment variables undefined**
   - Restart development server after changing `.env`
   - Check variable names match exactly

3. **Upload preset not found**
   - Verify preset name in Cloudinary dashboard
   - Ensure preset is set to "Unsigned" mode

### Testing

Test your setup with a simple image upload before implementing complex features.

## Support

For issues related to:
- **Cloudinary Service**: Check Cloudinary documentation and status
- **Hook Implementation**: Review this documentation and code
- **Integration**: Check environment variables and initialization

## License

This module is part of your car rental application project.
