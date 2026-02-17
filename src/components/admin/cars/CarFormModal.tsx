"use client";

import { useForm } from "react-hook-form";
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/ui/image-upload";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Car } from "@/lib/types";
import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import usePostCar from "@/lib/api/usePostCar";
import usePutCar from "@/lib/api/usePutCar";
import { useToast } from "@/components/providers/ToastProvider";

interface CarFormModalProps {
    open: boolean;
    onClose: () => void;
    car: Car | null;
    onSuccess: () => void;
}

export function CarFormModal({ open, onClose, car, onSuccess }: CarFormModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { showToast } = useToast();

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch
    } = useForm<Partial<Car>>({
        defaultValues: car || {
            selfDrive: true,
            type: "sedan",
            transmission: "automatic",
            fuel: "gasoline"
        }
    });

    // Sync form with car prop when it changes
    useEffect(() => {
        if (car) {
            reset({
                ...car,
                image: car?.imageUrls?.[0] || car?.image || '',
                // Ensure imageUrls is an array with at least 4 slots or fill with empty strings
                imageUrls: [
                    car?.imageUrls?.[0] || car?.image || '', // Primary image
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
    const primaryPreview = watch("imageUrls.0") || watch("image") || "";

    const onSubmit = async (data: Partial<Car>) => {
        setIsSubmitting(true);
        try {
            const isNew = !car;

            const rawUrls = data.imageUrls || [];
            const rawIds = data.imagePublicIds || [];

            // Filter sets based on URL presence
            const validImages = rawUrls
                .map((url, idx) => ({ url: url?.trim(), id: rawIds[idx] }))
                .filter(img => img.url && img.url !== "");

            const cleanImageUrls = validImages.map(img => img.url as string);
            const cleanPublicIds = validImages.map(img => img.id || "");

            // Ensure primary image is set
            const primaryImage = cleanImageUrls[0] || "";

            const payload = {
                ...data,
                id: data.id || `car-${Date.now()}`,
                image: primaryImage, // Set primary image
                imageUrls: cleanImageUrls, // Use the cleaned array
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

            const result = isNew
                ? await postCar(payload)
                : await putCar(payload);

            if (result.success) {
                onSuccess();
            }
        } catch (error: unknown) {
            console.error("Failed to save car:", error);
            const message: string =
                typeof error === "object" &&
                error !== null &&
                "response" in error &&
                typeof (error as { response?: { data?: { message?: string } } }).response?.data?.message === "string"
                    ? (error as { response?: { data?: { message?: string } } }).response?.data?.message || "Failed to save car details."
                    : "Failed to save car details.";
            showToast(message, "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="!fixed !inset-0 !left-0 !top-0 !right-0 !bottom-0 !z-[120] !w-screen !h-screen !max-w-none !max-h-none !translate-x-0 !translate-y-0 rounded-none flex flex-col justify-between gap-0 p-0 overflow-hidden border-none shadow-2xl bg-slate-50" showCloseButton={false}>
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full bg-slate-50">
                    {/* Header */}
                    <div className="bg-slate-900 text-white px-8 h-20 shrink-0 flex items-center justify-between z-20 shadow-md">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <p className="text-slate-400 text-[10px] font-mono uppercase tracking-widest">{car ? `REF: ${car?.id || car?._id}` : 'NEW REGISTRATION'}</p>
                                <span className="w-1 h-1 rounded-full bg-emerald-500"></span>
                                <p className="text-emerald-500 text-[10px] font-bold tracking-widest">{car ? 'EDIT MODE' : 'CREATE MODE'}</p>
                            </div>
                            <DialogTitle className="text-2xl font-extrabold tracking-tight">Vehicle Management</DialogTitle>
                        </div>
                        <div className="flex gap-3">
                            <Button type="button" variant="ghost" className="text-slate-400 hover:text-white hover:bg-white/10" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting} className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold uppercase tracking-widest px-8 shadow-lg shadow-emerald-900/20">
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {car ? "Save Changes" : "Register Vehicle"}
                            </Button>
                        </div>
                    </div>

                    {/* Main Layout: Tabs with Sidebar */}
                    <Tabs defaultValue="basic" className="flex-1 flex flex-col overflow-hidden gap-0" orientation="vertical">
                        <div className="flex-1 flex flex-row overflow-hidden">
                            {/* Sidebar Navigation */}
                            <div className="w-64 bg-white/50 border-r border-slate-200 shrink-0 overflow-y-auto py-8">
                                <div className="px-6 mb-4">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Navigation</p>
                                </div>
                                <TabsList className="flex flex-col h-auto w-full bg-transparent p-0 space-y-1 px-3">
                                    <TabsTrigger
                                        value="basic"
                                        className="w-full justify-start px-4 py-3 rounded-lg text-sm font-medium text-slate-500 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-slate-200 transition-all hover:bg-white/60 hover:text-slate-700"
                                    >
                                        Basic Information
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="pricing"
                                        className="w-full justify-start px-4 py-3 rounded-lg text-sm font-medium text-slate-500 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-slate-200 transition-all hover:bg-white/60 hover:text-slate-700"
                                    >
                                        Pricing Configuration
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="owner"
                                        className="w-full justify-start px-4 py-3 rounded-lg text-sm font-medium text-slate-500 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-slate-200 transition-all hover:bg-white/60 hover:text-slate-700"
                                    >
                                        Ownership Details
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="location"
                                        className="w-full justify-start px-4 py-3 rounded-lg text-sm font-medium text-slate-500 data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-slate-200 transition-all hover:bg-white/60 hover:text-slate-700"
                                    >
                                        Garage Location
                                    </TabsTrigger>
                                </TabsList>
                            </div>

                            {/* Content Area */}
                            <div className="flex-1 bg-slate-50/50 overflow-hidden flex flex-col">
                                <ScrollArea className="flex-1 h-full w-full">
                                    <div className="p-8 max-w-5xl mx-auto pb-24">
                                        <TabsContent value="basic" className="mt-0 space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 focus-visible:outline-none">
                                            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                                                {/* Image Preview Card */}
                                                <div className="md:col-span-4 space-y-4">
                                                    <div className="bg-white/90 p-3 rounded-2xl shadow-sm aspect-[4/3] max-w-[240px] flex items-center justify-center overflow-hidden relative group">
                                                        {primaryPreview ? (
                                                            <img src={primaryPreview} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                                                        ) : (
                                                            <div className="text-center text-slate-400">
                                                                <p className="text-xs font-bold uppercase tracking-widest">No Image</p>
                                                            </div>
                                                        )}
                                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                            <p className="text-white text-xs font-bold uppercase tracking-widest">Car Preview</p>
                                                        </div>
                                                    </div>
                                                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                                                        <div className="flex items-center justify-between">
                                                            <Label htmlFor="selfDrive" className="font-bold text-slate-700">Self-Drive Ready</Label>
                                                            <Switch
                                                                id="selfDrive"
                                                                checked={watch("selfDrive")}
                                                                onCheckedChange={(val) => setValue("selfDrive", val)}
                                                            />
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <Label htmlFor="isOnHold" className="font-bold text-slate-700">Maintenance Hold</Label>
                                                            <Switch
                                                                id="isOnHold"
                                                                checked={watch("isOnHold")}
                                                                onCheckedChange={(val) => setValue("isOnHold", val)}
                                                            />
                                                        </div>
                                                        {watch("isOnHold") && (
                                                            <div className="pt-2 animate-in fade-in slide-in-from-top-1">
                                                                <Label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Reason for Hold</Label>
                                                                <Input
                                                                    {...register("holdReason")}
                                                                    className="h-9 text-xs bg-slate-50 border-slate-200"
                                                                    placeholder="e.g. Pending Maintenance..."
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Basic Fields */}
                                                <div className="md:col-span-8 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                                                    <div className="grid grid-cols-2 gap-6">
                                                        <div className="space-y-2">
                                                            <Label className="uppercase text-[10px] tracking-widest font-black text-slate-400">Model Name</Label>
                                                            <Input {...register("name", { required: true })} className="h-12 border-slate-200 bg-slate-50 focus:bg-white transition-all font-bold text-lg" placeholder="Toyota Vios 2024" />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label className="uppercase text-[10px] tracking-widest font-black text-slate-400">Year Model</Label>
                                                            <Input type="number" {...register("year", { valueAsNumber: true })} className="h-12 border-slate-200 bg-slate-50 focus:bg-white transition-all font-bold" />
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-3 gap-6">
                                                        <div className="space-y-2">
                                                            <Label className="uppercase text-[10px] tracking-widest font-black text-slate-400">Type</Label>
                                                            <Select defaultValue={watch("type")} onValueChange={(val) => setValue("type", val)}>
                                                                <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="sedan">Sedan</SelectItem>
                                                                    <SelectItem value="suv">SUV</SelectItem>
                                                                    <SelectItem value="van">Van</SelectItem>
                                                                    <SelectItem value="pickup">Pickup</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label className="uppercase text-[10px] tracking-widest font-black text-slate-400">Transmission</Label>
                                                            <Select defaultValue={watch("transmission")} onValueChange={(val) => setValue("transmission", val)}>
                                                                <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="automatic">Automatic</SelectItem>
                                                                    <SelectItem value="manual">Manual</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label className="uppercase text-[10px] tracking-widest font-black text-slate-400">Fuel</Label>
                                                            <Input {...register("fuel")} className="h-12 border-slate-200" placeholder="Gasoline" />
                                                        </div>
                                                    </div>

                                                    <div className="space-y-4 pt-4 border-t border-slate-100">
                                                        <Label className="uppercase text-[10px] tracking-widest font-black text-slate-400">Vehicle Gallery (Max 4)</Label>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                                                            <div className="space-y-2">
                                                                <Label className="text-[10px] font-bold text-slate-500 uppercase">Main Thumbnail</Label>
                                                                <div className="space-y-2">
                                                                    <Input {...register("imageUrls.0", { required: true })} className="h-9 font-mono text-[11px] bg-slate-50 border-slate-200" placeholder="Primary Image URL..." />
                                                                    <ImageUpload
                                                                        value={watch("imageUrls.0")}
                                                                        compact
                                                                        onChange={(url) => {
                                                                            setValue("imageUrls.0", url || "");
                                                                            setValue("image", url || "");
                                                                            if (!url) setValue("imagePublicIds.0", "");
                                                                        }}
                                                                        onUploadSuccess={(data) => {
                                                                            setValue("imageUrls.0", data.url);
                                                                            setValue("imagePublicIds.0", data.publicId);
                                                                            setValue("image", data.url);
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-[10px] font-bold text-slate-500 uppercase">Side View</Label>
                                                                <div className="space-y-2">
                                                                    <Input {...register("imageUrls.1")} className="h-9 font-mono text-[11px] bg-slate-50 border-slate-200" placeholder="Optional URL..." />
                                                                    <ImageUpload
                                                                        value={watch("imageUrls.1")}
                                                                        compact
                                                                        onChange={(url) => {
                                                                            setValue("imageUrls.1", url || "");
                                                                            if (!url) setValue("imagePublicIds.1", "");
                                                                        }}
                                                                        onUploadSuccess={(data) => {
                                                                            setValue("imageUrls.1", data.url);
                                                                            setValue("imagePublicIds.1", data.publicId);
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-[10px] font-bold text-slate-500 uppercase">Interior View</Label>
                                                                <div className="space-y-2">
                                                                    <Input {...register("imageUrls.2")} className="h-9 font-mono text-[11px] bg-slate-50 border-slate-200" placeholder="Optional URL..." />
                                                                    <ImageUpload
                                                                        value={watch("imageUrls.2")}
                                                                        compact
                                                                        onChange={(url) => {
                                                                            setValue("imageUrls.2", url || "");
                                                                            if (!url) setValue("imagePublicIds.2", "");
                                                                        }}
                                                                        onUploadSuccess={(data) => {
                                                                            setValue("imageUrls.2", data.url);
                                                                            setValue("imagePublicIds.2", data.publicId);
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label className="text-[10px] font-bold text-slate-500 uppercase">Rear View</Label>
                                                                <div className="space-y-2">
                                                                    <Input {...register("imageUrls.3")} className="h-9 font-mono text-[11px] bg-slate-50 border-slate-200" placeholder="Optional URL..." />
                                                                    <ImageUpload
                                                                        value={watch("imageUrls.3")}
                                                                        compact
                                                                        onChange={(url) => {
                                                                            setValue("imageUrls.3", url || "");
                                                                            if (!url) setValue("imagePublicIds.3", "");
                                                                        }}
                                                                        onUploadSuccess={(data) => {
                                                                            setValue("imageUrls.3", data.url);
                                                                            setValue("imagePublicIds.3", data.publicId);
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="pricing" className="mt-0 space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 focus-visible:outline-none">
                                            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                                                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                                                    <span className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 mb-1">₱</span>
                                                    Rate Configuration
                                                </h3>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                    <div className="space-y-2 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                                        <Label className="uppercase text-[10px] tracking-widest font-black text-slate-400">Hourly Excess</Label>
                                                        <Input type="number" {...register("pricePerHour", { valueAsNumber: true })} className="h-10 border-slate-200 bg-white" />
                                                    </div>
                                                    <div className="space-y-2 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                                        <Label className="uppercase text-[10px] tracking-widest font-black text-slate-400">12-Hour Package</Label>
                                                        <Input type="number" {...register("pricePer12Hours", { valueAsNumber: true })} className="h-10 border-slate-200 bg-white" />
                                                    </div>
                                                    <div className="space-y-2 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                                        <Label className="uppercase text-[10px] tracking-widest font-black text-slate-400">24-Hour Package</Label>
                                                        <Input type="number" {...register("pricePer24Hours", { valueAsNumber: true })} className="h-10 border-slate-200 bg-white font-bold text-emerald-600" />
                                                    </div>
                                                </div>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="owner" className="mt-0 space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 focus-visible:outline-none">
                                            <div className="max-w-2xl bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                                                <div className="space-y-2">
                                                    <Label className="uppercase text-[10px] tracking-widest font-black text-slate-400">Owner Full Name</Label>
                                                    <Input {...register("owner.name", { required: true })} className="h-12" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="uppercase text-[10px] tracking-widest font-black text-slate-400">Owner Email</Label>
                                                    <Input type="email" {...register("owner.email", { required: true })} className="h-12" placeholder="owner@email.com" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="uppercase text-[10px] tracking-widest font-black text-slate-400">Contact Number</Label>
                                                    <Input {...register("owner.contactNumber", { required: true })} className="h-12" />
                                                </div>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="location" className="mt-0 space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 focus-visible:outline-none">
                                            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                                                <div className="space-y-2">
                                                    <Label className="uppercase text-[10px] tracking-widest font-black text-slate-400">Garage Address</Label>
                                                    <Input {...register("garageLocation.address")} className="h-12" placeholder="Full address..." />
                                                </div>
                                            </div>
                                        </TabsContent>
                                    </div>
                                </ScrollArea>
                            </div>
                        </div>
                    </Tabs>
                </form>
            </DialogContent>
        </Dialog>
    );
}
