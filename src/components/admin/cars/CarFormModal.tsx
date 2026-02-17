"use client";

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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { MapboxAutocomplete } from "@/components/ui/mapbox-autocomplete";
import { GarageMapPicker } from "./GarageMapPicker";
import { useCarFormHandlers } from "./hooks/useCarFormHandlers";

interface CarFormModalProps {
    open: boolean;
    onClose: () => void;
    car: Car | null;
    onSuccess: () => void;
}

/**
 * Vehicle management modal for creating and editing car records.
 * Presentation only - Logic extracted to useCarFormHandlers hook.
 */
export function CarFormModal({ open, onClose, car, onSuccess }: CarFormModalProps) {
    const {
        formMethods,
        isSubmitting,
        onSubmit,
        handleRequestClose,
        handlers
    } = useCarFormHandlers({ car, onClose, onSuccess });

    const { register, watch } = formMethods;

    // Pre-calculate derived values for JSX purity
    const watchedImage = watch("image");
    const watchedPrimaryUrl = watch("imageUrls.0");
    const primaryPreview = watchedPrimaryUrl || watchedImage || "";
    const isEditing = !!car;
    const refText = car ? `REF: ${car?.id || car?._id}` : 'NEW REGISTRATION';
    const modeText = car ? 'EDIT MODE' : 'CREATE MODE';
    const submitText = car ? "Save Changes" : "Register Vehicle";
    const isOnHold = watch("isOnHold");

    return (
        <Dialog open={open} onOpenChange={(nextOpen) => {
            if (!nextOpen) {
                handleRequestClose();
            }
        }}>
            <DialogContent
                data-testid="car-form-modal-content"
                className="!fixed !inset-0 !left-0 !top-0 !right-0 !bottom-0 !z-[120] !w-screen !h-screen !max-w-none !max-h-none !translate-x-0 !translate-y-0 rounded-none flex flex-col justify-between gap-0 p-0 overflow-hidden border-none shadow-2xl bg-slate-50"
                showCloseButton={false}
            >
                <form onSubmit={onSubmit} className="flex flex-col h-full bg-slate-50" data-testid="car-registration-form">
                    {/* Header */}
                    <div className="bg-slate-900 text-white px-8 h-20 shrink-0 flex items-center justify-between z-20 shadow-md">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <p className="text-slate-400 text-[10px] font-mono uppercase tracking-widest">{refText}</p>
                                <span className="w-1 h-1 rounded-full bg-emerald-500"></span>
                                <p className="text-emerald-500 text-[10px] font-bold tracking-widest">{modeText}</p>
                            </div>
                            <DialogTitle className="text-2xl font-extrabold tracking-tight">Vehicle Management</DialogTitle>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                type="button"
                                variant="ghost"
                                className="text-slate-400 hover:text-white hover:bg-white/10"
                                onClick={handleRequestClose}
                                data-testid="car-form-cancel-button"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                data-testid="car-form-submit-button"
                                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold uppercase tracking-widest px-8 shadow-lg shadow-emerald-900/20"
                            >
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {submitText}
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
                                        <TabsContent value="basic" data-testid="tab-content-basic" className="mt-0 space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 focus-visible:outline-none">
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
                                                                onCheckedChange={handlers.handleSelfDriveChange}
                                                                data-testid="car-switch-self-drive"
                                                            />
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <Label htmlFor="isOnHold" className="font-bold text-slate-700">Maintenance Hold</Label>
                                                            <Switch
                                                                id="isOnHold"
                                                                checked={isOnHold}
                                                                onCheckedChange={handlers.handleOnHoldChange}
                                                                data-testid="car-switch-on-hold"
                                                            />
                                                        </div>
                                                        {isOnHold && (
                                                            <div className="pt-2 animate-in fade-in slide-in-from-top-1">
                                                                <Label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Reason for Hold</Label>
                                                                <Input
                                                                    {...register("holdReason")}
                                                                    data-testid="car-input-hold-reason"
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
                                                            <Input
                                                                {...register("name", { required: true })}
                                                                data-testid="car-input-name"
                                                                className="h-12 border-slate-200 bg-slate-50 focus:bg-white transition-all font-bold text-lg"
                                                                placeholder="Toyota Vios 2024"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label className="uppercase text-[10px] tracking-widest font-black text-slate-400">Year Model</Label>
                                                            <Input
                                                                type="number"
                                                                {...register("year", { valueAsNumber: true })}
                                                                data-testid="car-input-year"
                                                                className="h-12 border-slate-200 bg-slate-50 focus:bg-white transition-all font-bold"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-3 gap-6">
                                                        <div className="space-y-2">
                                                            <Label className="uppercase text-[10px] tracking-widest font-black text-slate-400">Type</Label>
                                                            <Select
                                                                value={watch("type")}
                                                                onValueChange={handlers.handleTypeChange}
                                                            >
                                                                <SelectTrigger className="h-12" data-testid="car-select-type"><SelectValue /></SelectTrigger>
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
                                                            <Select
                                                                value={watch("transmission")}
                                                                onValueChange={handlers.handleTransmissionChange}
                                                            >
                                                                <SelectTrigger className="h-12" data-testid="car-select-transmission"><SelectValue /></SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="automatic">Automatic</SelectItem>
                                                                    <SelectItem value="manual">Manual</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label className="uppercase text-[10px] tracking-widest font-black text-slate-400">Fuel</Label>
                                                            <Input
                                                                {...register("fuel")}
                                                                data-testid="car-input-fuel"
                                                                className="h-12 border-slate-200"
                                                                placeholder="Gasoline"
                                                            />
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
                                                                        onChange={handlers.handleMainThumbnailChange}
                                                                        onUploadSuccess={handlers.handleMainThumbnailUpload}
                                                                        data-testid="car-upload-main"
                                                                    />
                                                                </div>
                                                            </div>
                                                            {[1, 2, 3].map((idx) => (
                                                                <div key={idx} className="space-y-2">
                                                                    <Label className="text-[10px] font-bold text-slate-500 uppercase">
                                                                        {idx === 1 ? "Side View" : idx === 2 ? "Interior View" : "Rear View"}
                                                                    </Label>
                                                                    <div className="space-y-2">
                                                                        <Input {...register(`imageUrls.${idx}` as any)} className="h-9 font-mono text-[11px] bg-slate-50 border-slate-200" placeholder="Optional URL..." />
                                                                        <ImageUpload
                                                                            value={watch(`imageUrls.${idx}` as any)}
                                                                            compact
                                                                            onChange={(url) => handlers.handleGalleryImageChange(idx, url)}
                                                                            onUploadSuccess={(data) => handlers.handleGalleryImageUpload(idx, data)}
                                                                            data-testid={`car-upload-gallery-${idx}`}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="pricing" data-testid="tab-content-pricing" className="mt-0 space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 focus-visible:outline-none">
                                            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                                                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                                                    <span className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 mb-1">₱</span>
                                                    Rate Configuration
                                                </h3>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                    <div className="space-y-2 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                                        <Label className="uppercase text-[10px] tracking-widest font-black text-slate-400">Hourly Excess</Label>
                                                        <Input type="number" {...register("pricePerHour", { valueAsNumber: true })} data-testid="car-input-price-hour" className="h-10 border-slate-200 bg-white" />
                                                    </div>
                                                    <div className="space-y-2 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                                        <Label className="uppercase text-[10px] tracking-widest font-black text-slate-400">12-Hour Package</Label>
                                                        <Input type="number" {...register("pricePer12Hours", { valueAsNumber: true })} data-testid="car-input-price-12h" className="h-10 border-slate-200 bg-white" />
                                                    </div>
                                                    <div className="space-y-2 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                                        <Label className="uppercase text-[10px] tracking-widest font-black text-slate-400">24-Hour Package</Label>
                                                        <Input type="number" {...register("pricePer24Hours", { valueAsNumber: true })} data-testid="car-input-price-24h" className="h-10 border-slate-200 bg-white font-bold text-emerald-600" />
                                                    </div>
                                                </div>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="owner" data-testid="tab-content-owner" className="mt-0 space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 focus-visible:outline-none">
                                            <div className="max-w-2xl bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                                                <div className="space-y-2">
                                                    <Label className="uppercase text-[10px] tracking-widest font-black text-slate-400">Owner Full Name</Label>
                                                    <Input {...register("owner.name", { required: true })} data-testid="car-input-owner-name" className="h-12" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="uppercase text-[10px] tracking-widest font-black text-slate-400">Owner Email</Label>
                                                    <Input type="email" {...register("owner.email", { required: true })} data-testid="car-input-owner-email" className="h-12" placeholder="owner@email.com" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="uppercase text-[10px] tracking-widest font-black text-slate-400">Contact Number</Label>
                                                    <Input {...register("owner.contactNumber", { required: true })} data-testid="car-input-owner-contact" className="h-12" />
                                                </div>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="location" data-testid="tab-content-location" className="mt-0 space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 focus-visible:outline-none">
                                            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                                                <div className="pt-4">
                                                    <GarageMapPicker
                                                        value={watch("garageLocation.coordinates")}
                                                        onChange={handlers.handleMapPickerChange}
                                                        data-testid="car-map-picker-garage"
                                                    />
                                                </div>
                                            </div>
                                        </TabsContent>
                                    </div>
                                </ScrollArea>
                            </div>
                        </div>
                    </Tabs>
                </form>
            </DialogContent >
        </Dialog >
    );
}
