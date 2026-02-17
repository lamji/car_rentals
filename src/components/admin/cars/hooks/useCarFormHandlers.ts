"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { Car } from "@/lib/types";
import usePostCar from "@/lib/api/usePostCar";
import usePutCar from "@/lib/api/usePutCar";
import { useToast } from "@/components/providers/ToastProvider";

interface UseCarFormHandlersProps {
    car: Car | null;
    onClose: () => void;
    onSuccess: () => void;
}

export function useCarFormHandlers({ car, onClose, onSuccess }: UseCarFormHandlersProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { showToast } = useToast();

    const formMethods = useForm<Partial<Car>>({
        defaultValues: car || {
            selfDrive: true,
            type: "sedan",
            transmission: "automatic",
            fuel: "gasoline"
        }
    });

    const { reset, setValue, watch, handleSubmit, formState: { isDirty } } = formMethods;

    // Sync form with car prop when it changes
    useEffect(() => {
        if (car) {
            reset({
                ...car,
                image: car?.imageUrls?.[0] || car?.image || '',
                imageUrls: [
                    car?.imageUrls?.[0] || car?.image || '',
                    car?.imageUrls?.[1] || '',
                    car?.imageUrls?.[2] || '',
                    car?.imageUrls?.[3] || '',
                ],
                imagePublicIds: [
                    car?.imagePublicIds?.[0] || '',
                    car?.imagePublicIds?.[1] || '',
                    car?.imagePublicIds?.[2] || '',
                    car?.imagePublicIds?.[3] || '',
                ]
            });
        } else {
            reset({
                selfDrive: true,
                type: "sedan",
                transmission: "automatic",
                fuel: "gasoline",
                image: '',
                imageUrls: ['', '', '', ''],
                imagePublicIds: ['', '', '', '']
            });
        }
    }, [car, reset]);

    const { mutateAsync: postCar } = usePostCar();
    const { mutateAsync: putCar } = usePutCar(car?.id || "");

    const onSubmit = async (data: Partial<Car>) => {
        setIsSubmitting(true);
        try {
            const isNew = !car;

            if (data.garageLocation?.address && !data.garageLocation?.coordinates) {
                showToast("Please select a valid address from the suggestions to save coordinates.", "warning");
                setIsSubmitting(false);
                return;
            }

            const rawUrls = data.imageUrls || [];
            const rawIds = data.imagePublicIds || [];

            const validImages = rawUrls
                .map((url, idx) => ({ url: url?.trim(), id: rawIds[idx] }))
                .filter(img => img.url && img.url !== "");

            const cleanImageUrls = validImages.map(img => img.url as string);
            const cleanPublicIds = validImages.map(img => img.id || "");
            const primaryImage = cleanImageUrls[0] || "";

            const payload = {
                ...data,
                id: data.id || `car-${Date.now()}`,
                image: primaryImage,
                imageUrls: cleanImageUrls,
                imagePublicIds: cleanPublicIds,
                owner: data.owner ? {
                    ...data.owner,
                    email: data.owner.email?.trim(),
                } : undefined,
                garageLocation: data.garageLocation,
                driverCharge: data.driverCharge || 0,
                rating: data.rating || 5,
                rentedCount: data.rentedCount || 0,
                isActive: true,
                isOnHold: data.isOnHold || false,
            };

            const result = isNew ? await postCar(payload) : await putCar(payload);

            if (result.success) {
                reset(payload);
                onSuccess();
            }
        } catch (error: unknown) {
            console.error("Failed to save car:", error);
            const message = typeof error === "object" && error !== null && "response" in error 
                ? (error as any).response?.data?.message || "Failed to save car details."
                : "Failed to save car details.";
            showToast(message, "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRequestClose = useCallback(() => {
        if (isSubmitting) return;
        if (!isDirty) {
            onClose();
            return;
        }
        showToast("You have unsaved changes. Save first before closing.", "warning");
    }, [isSubmitting, isDirty, onClose, showToast]);

    // Value Handlers (Moved out of JSX)
    const handleSelfDriveChange = (val: boolean) => setValue("selfDrive", val, { shouldDirty: true });
    const handleOnHoldChange = (val: boolean) => setValue("isOnHold", val, { shouldDirty: true });
    const handleTypeChange = (val: string) => setValue("type", val, { shouldDirty: true });
    const handleTransmissionChange = (val: string) => setValue("transmission", val, { shouldDirty: true });
    
    const handleMainThumbnailChange = (url?: string) => {
        setValue("imageUrls.0", url || "", { shouldDirty: true });
        setValue("image", url || "", { shouldDirty: true });
        if (!url) setValue("imagePublicIds.0", "", { shouldDirty: true });
    };

    const handleMainThumbnailUpload = (data: { url: string; publicId: string }) => {
        setValue("imageUrls.0", data.url, { shouldDirty: true });
        setValue("imagePublicIds.0", data.publicId, { shouldDirty: true });
        setValue("image", data.url, { shouldDirty: true });
    };

    const handleGalleryImageChange = (index: number, url?: string) => {
        setValue(`imageUrls.${index}` as any, url || "", { shouldDirty: true });
        if (!url) setValue(`imagePublicIds.${index}` as any, "", { shouldDirty: true });
    };

    const handleGalleryImageUpload = (index: number, data: { url: string; publicId: string }) => {
        setValue(`imageUrls.${index}` as any, data.url, { shouldDirty: true });
        setValue(`imagePublicIds.${index}` as any, data.publicId, { shouldDirty: true });
    };

    const handleMapboxAutocompleteChange = (address: string, details?: any) => {
        setValue("garageLocation.address", address, { shouldDirty: true });
        setValue("garageAddress", address, { shouldDirty: true });
        if (details) {
            setValue("garageLocation.coordinates", { lat: details.lat, lng: details.lng }, { shouldDirty: true });
            setValue("garageLocation.city", details.city || "", { shouldDirty: true });
            setValue("garageLocation.province", details.province || "", { shouldDirty: true });
        } else {
            setValue("garageLocation.coordinates", undefined, { shouldDirty: true });
            setValue("garageLocation.city", "", { shouldDirty: true });
            setValue("garageLocation.province", "", { shouldDirty: true });
        }
    };

    const handleMapPickerChange = (coords: { lat: number; lng: number }, address: string, city: string, province: string) => {
        setValue("garageLocation.coordinates", coords, { shouldDirty: true });
        setValue("garageLocation.address", address, { shouldDirty: true });
        setValue("garageAddress", address, { shouldDirty: true });
        setValue("garageLocation.city", city, { shouldDirty: true });
        setValue("garageLocation.province", province, { shouldDirty: true });
    };

    return {
        formMethods,
        isSubmitting,
        isDirty,
        onSubmit: handleSubmit(onSubmit),
        handleRequestClose,
        handlers: {
            handleSelfDriveChange,
            handleOnHoldChange,
            handleTypeChange,
            handleTransmissionChange,
            handleMainThumbnailChange,
            handleMainThumbnailUpload,
            handleGalleryImageChange,
            handleGalleryImageUpload,
            handleMapboxAutocompleteChange,
            handleMapPickerChange
        }
    };
}
