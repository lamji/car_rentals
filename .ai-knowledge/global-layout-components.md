
# Global Layout Components & Services

## Overview
The application uses a `LayoutContent` wrapper that provides global UI components. **Do not re-implement these locally.**

## 1. Global Notifications (Toasts)
- **Provider**: `ToastProvider` (in `src/components/providers/ToastProvider.tsx`)
- **Hook**: `useToast()`
- **Usage**:
  ```tsx
  import { useToast } from "@/components/providers/ToastProvider";
  const { showToast } = useToast();
  showToast("Operation successful", "success");
  ```

## 2. Global Modals (Alerts)
- **Provider**: `AlertModal` (rendered in `src/app/layout.tsx`)
- **Hook**: `useAlerts()` (in `src/hooks/useAlerts.ts`)
- **Usage**:
  ```tsx
  import { useAlerts } from "@/hooks/useAlerts";
  const { showSuccessAlert, showErrorAlert } = useAlerts();
  showSuccessAlert("Title", "Message");
  ```

## 3. Cloudinary Image Management
- **Hook**: `useUploadImage()`
- **Return Type**: `Promise<{ url: string; publicId: string }>`
- **Database Rule**: Always store the `publicId` alongside the URL to enable future deletion or updates.
- **Schema Pattern**:
  ```javascript
  // Mongoose Schema
  imageUrls: [{ type: String }],      // Public URLs
  imagePublicIds: [{ type: String }], // Corresponding public_ids
  ```
- **UI Component**: `ImageUpload`
  - Supports `onUploadSuccess` callback to capture `publicId`.
  ```tsx
  <ImageUpload 
      onUploadSuccess={({ url, publicId }) => {
          // Store both!
      }} 
  />
  ```

## 4. Confirmation Modal
- **Component**: `ConfirmationModal` (Global)
- **Usage**: (Verify hook usage instructions in `useConfirmation.ts` if needed).
