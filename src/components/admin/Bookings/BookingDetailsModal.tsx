/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    User,
    Mail,
    Phone,
    Calendar,
    MapPin,
    Car as CarIcon,
    CreditCard,
    ShieldCheck,
    FileText,
    X,
    ChevronLeftIcon
} from 'lucide-react'

interface BookingDetailsModalProps {
    booking: any
    isOpen: boolean
    onClose: () => void
    onApprove: (id: string) => void
    onCancel: (id: string) => void
    isUpdating: boolean
    canManageActions?: boolean
}

export default function BookingDetailsModal({
    booking,
    isOpen,
    onClose,
    onApprove,
    onCancel,
    isUpdating,
    canManageActions = true,
}: BookingDetailsModalProps) {
    const [viewImage, setViewImage] = useState<string | null>(null)

    if (!booking) return null

    const { bookingDetails, selectedCar } = booking

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="!fixed !inset-0 !left-0 !top-0 !right-0 !bottom-0 !z-[120] !w-screen !h-screen !max-w-none !max-h-none !translate-x-0 !translate-y-0 rounded-none flex flex-col justify-between gap-0 p-0 overflow-hidden border-none shadow-2xl bg-white" showCloseButton={false}>
                    <ScrollArea className="flex flex-col justify-between overflow-hidden">
                        <DialogHeader className="contents space-y-0 text-left">
                            <div className="bg-slate-900 text-white p-8 md:p-12 shrink-0">
                                <div className="max-w-7xl mx-auto">
                                    <div className="flex justify-between items-start mb-8">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <p className="text-slate-400 text-xs font-mono">{booking.bookingId}</p>
                                                <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                                                <p className="text-slate-400 text-xs uppercase tracking-tighter">System ID: {booking._id}</p>
                                            </div>
                                            <DialogTitle className="text-3xl md:text-4xl font-extrabold tracking-tight underline decoration-emerald-500/30 decoration-4 underline-offset-8">Booking Explorer</DialogTitle>
                                        </div>
                                        <div className="flex gap-4">
                                            <Badge variant="outline" className="border-slate-700 text-slate-300 py-2 px-4 text-xs font-bold tracking-widest gap-2">
                                                <span className="opacity-70 font-normal">PAYMENT:</span> {booking.paymentStatus.toUpperCase()}
                                            </Badge>
                                            <Badge className={`${booking.bookingStatus === 'confirmed' ? 'bg-green-500' :
                                                booking.bookingStatus === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                                                } text-white py-2 px-4 text-xs font-bold tracking-widest shadow-xl shadow-black/40 gap-2`}>
                                                <span className="opacity-70 font-normal">STATUS:</span> {booking.bookingStatus.toUpperCase()}
                                            </Badge>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={onClose}
                                                className="text-slate-400 hover:text-white hover:bg-slate-800 ml-4 h-11 w-11 transition-all"
                                            >
                                                <X className="w-7 h-7" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-10">
                                        <div className="flex items-center gap-5">
                                            <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center border border-slate-700 shadow-inner">
                                                <User className="w-7 h-7 text-slate-400" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black mb-1">Customer Account</p>
                                                <p className="font-extrabold text-xl tracking-tight">{bookingDetails?.firstName} {bookingDetails?.lastName}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-5">
                                            <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center border border-slate-700 shadow-inner">
                                                <CarIcon className="w-7 h-7 text-slate-400" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black mb-1">Reserved Vehicle</p>
                                                <p className="font-extrabold text-xl tracking-tight">{selectedCar?.name || 'N/A'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-5">
                                            <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center border border-slate-700 shadow-inner">
                                                <CreditCard className="w-7 h-7 text-slate-400" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black mb-1">Settlement Amount</p>
                                                <p className="font-extrabold text-xl tracking-tight text-emerald-400">₱{(bookingDetails?.totalPrice || 0).toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-5">
                                            <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center border border-slate-700 shadow-inner">
                                                <CreditCard className="w-7 h-7 text-slate-400" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black mb-1">Payment Method</p>
                                                <p className="font-extrabold text-xl tracking-tight capitalize">
                                                    {typeof booking.paymentMethod === 'string'
                                                        ? booking.paymentMethod.replace('_', ' ')
                                                        : booking.paymentMethod?.type?.replace('_', ' ') || 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <DialogDescription asChild>
                                <div className="p-0 bg-slate-50">
                                    <div className="max-w-7xl mx-auto p-10 md:p-16 space-y-16">
                                        {/* Main Content Area */}
                                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">

                                            {/* Left Section: Information (7 cols) */}
                                            <div className="lg:col-span-7 space-y-12">
                                                {/* Contact Info */}
                                                <section>
                                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                        <User className="w-3 h-3" /> Personal Information
                                                    </h3>
                                                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                            <div className="space-y-1">
                                                                <p className="text-[10px] text-slate-400 uppercase font-black flex items-center gap-2"><Mail className="w-3 h-3" /> Email Address</p>
                                                                <p className="font-bold text-slate-900">{bookingDetails?.email}</p>
                                                            </div>
                                                            <div className="space-y-1">
                                                                <p className="text-[10px] text-slate-400 uppercase font-black flex items-center gap-2"><Phone className="w-3 h-3" /> Mobile Number</p>
                                                                <p className="font-bold text-slate-900">{bookingDetails?.contactNumber}</p>
                                                            </div>
                                                            <div className="space-y-1">
                                                                <p className="text-[10px] text-slate-400 uppercase font-black flex items-center gap-2"><FileText className="w-3 h-3" /> Identification Type</p>
                                                                <p className="font-bold text-slate-900">{bookingDetails?.idType?.replace('_', ' ') || 'None'}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </section>

                                                {/* Rental Details */}
                                                <section>
                                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                        <Calendar className="w-3 h-3" /> Schedule & Service
                                                    </h3>
                                                    <div className="grid grid-cols-2 gap-6">
                                                        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                                                            <p className="text-[10px] text-slate-400 uppercase font-black mb-2 tracking-widest">Pickup Date</p>
                                                            <p className="text-lg font-extrabold text-slate-900">{bookingDetails?.startDate}</p>
                                                            <p className="text-sm text-slate-500 font-medium">{bookingDetails?.startTime}</p>
                                                        </div>
                                                        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                                                            <p className="text-[10px] text-slate-400 uppercase font-black mb-2 tracking-widest">Return Date</p>
                                                            <p className="text-lg font-extrabold text-slate-900">{bookingDetails?.endDate}</p>
                                                            <p className="text-sm text-slate-500 font-medium">{bookingDetails?.endTime}</p>
                                                        </div>
                                                    </div>
                                                    <div className="mt-6 bg-blue-600 rounded-2xl p-6 flex items-center justify-between shadow-lg shadow-blue-500/20 overflow-hidden relative">
                                                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                                                        <div className="flex items-center gap-4 relative z-10">
                                                            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                                                                <MapPin className="w-6 h-6 text-white" />
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] font-black text-blue-100 uppercase tracking-widest">Logistics Mode</p>
                                                                <p className="text-lg font-extrabold text-white capitalize">{bookingDetails?.pickupType}</p>
                                                            </div>
                                                        </div>
                                                        <div className="bg-white/90 backdrop-blur-sm self-center px-4 py-2 rounded-xl text-blue-700 font-black text-sm shadow-sm relative z-10 border border-white">
                                                            {bookingDetails?.durationHours}H RENTAL DURATION
                                                        </div>
                                                    </div>
                                                </section>
                                            </div>

                                            {/* Right Column: Documents */}
                                            <div className="lg:col-span-5 space-y-12">
                                                <section>
                                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                        <ShieldCheck className="w-3 h-3" /> Compliance Documents
                                                    </h3>
                                                    <div className="grid grid-cols-1 gap-6">
                                                        {/* License Image */}
                                                        <div
                                                            className="group relative h-64 rounded-3xl overflow-hidden bg-white border border-slate-200 cursor-zoom-in transition-all hover:ring-4 hover:ring-blue-500/20 shadow-sm"
                                                            onClick={() => bookingDetails?.licenseImage && setViewImage(bookingDetails.licenseImage)}
                                                        >
                                                            {bookingDetails?.licenseImage ? (
                                                                <img
                                                                    src={bookingDetails.licenseImage}
                                                                    alt="License"
                                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">
                                                                    <ShieldCheck className="w-10 h-10 mb-2 opacity-20" />
                                                                    <p className="text-xs font-bold opacity-40 uppercase tracking-widest">Not Uploaded</p>
                                                                </div>
                                                            )}
                                                            <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                                                <SearchIcon className="w-8 h-8 text-white" />
                                                            </div>
                                                            <div className="absolute top-4 left-4 bg-white px-3 py-1.5 rounded-full text-[10px] font-black text-slate-900 shadow-sm uppercase tracking-tighter shadow-black/10 flex items-center gap-2">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                                                Driver&apos;s License
                                                            </div>
                                                        </div>

                                                        {/* LTO Screenshot */}
                                                        <div
                                                            className="group relative h-64 rounded-3xl overflow-hidden bg-white border border-slate-200 cursor-zoom-in transition-all hover:ring-4 hover:ring-blue-500/20 shadow-sm"
                                                            onClick={() => bookingDetails?.ltoPortalScreenshot && setViewImage(bookingDetails.ltoPortalScreenshot)}
                                                        >
                                                            {bookingDetails?.ltoPortalScreenshot ? (
                                                                <img
                                                                    src={bookingDetails.ltoPortalScreenshot}
                                                                    alt="LTO Validation"
                                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">
                                                                    <FileText className="w-10 h-10 mb-2 opacity-20" />
                                                                    <p className="text-xs font-bold opacity-40 uppercase tracking-widest">Not Uploaded</p>
                                                                </div>
                                                            )}
                                                            <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                                                <SearchIcon className="w-8 h-8 text-white" />
                                                            </div>
                                                            <div className="absolute top-4 left-4 bg-white px-3 py-1.5 rounded-full text-[10px] font-black text-slate-900 shadow-sm uppercase tracking-tighter shadow-black/10 flex items-center gap-2">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                                                LTO Verification
                                                            </div>
                                                        </div>
                                                    </div>
                                                </section>
                                            </div>
                                        </div>

                                        <Separator className="bg-slate-200 opacity-50" />
                                    </div>
                                </div>
                            </DialogDescription>
                        </DialogHeader>
                    </ScrollArea>

                    <DialogFooter className="px-8 py-6 bg-white border-t border-slate-100 flex items-center justify-between sm:justify-between shrink-0">
                        <Button variant="ghost" className="text-slate-500 font-bold uppercase tracking-widest text-[10px] hover:bg-slate-50" onClick={onClose}>
                            <ChevronLeftIcon className="w-4 h-4 mr-2" /> EXIT EXPLORER
                        </Button>
                        <div className="flex gap-3">
                            {canManageActions && booking.bookingStatus !== 'cancelled' && (
                                <Button
                                    variant="ghost"
                                    className="text-red-500 hover:bg-red-50 font-bold uppercase tracking-widest text-[10px] px-6"
                                    onClick={() => { onCancel(booking._id); onClose(); }}
                                    disabled={isUpdating}
                                >
                                    Reject Booking
                                </Button>
                            )}
                            {canManageActions && booking.bookingStatus === 'pending' && (
                                <Button
                                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold uppercase tracking-widest text-[10px] px-8 py-6 shadow-xl shadow-slate-900/10 transition-all active:scale-95"
                                    onClick={() => { onApprove(booking._id); onClose(); }}
                                    disabled={isUpdating}
                                >
                                    Confirm & Authorize
                                </Button>
                            )}
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Image Lightbox */}
            {/* Image Lightbox - Nested Dialog */}
            <Dialog open={!!viewImage} onOpenChange={(open) => !open && setViewImage(null)}>
                <DialogContent className="!fixed !z-[200] !left-0 !top-0 !right-0 !bottom-0 !max-w-[100vw] !w-[100vw] !h-[100vh] !max-h-[100vh] !translate-x-0 !translate-y-0 !border-none !bg-transparent !shadow-none !p-0 grid place-items-center focus:outline-none" showCloseButton={false}>
                    <DialogTitle className="sr-only">Image preview</DialogTitle>

                    {/* Backdrop / Container */}
                    <div className="relative w-full h-full flex items-center justify-center p-4" onClick={() => setViewImage(null)}>

                        {/* Dark Backdrop */}
                        <div className="absolute inset-0 bg-black/95 backdrop-blur-md" />

                        {/* Controls */}
                        <button
                            type="button"
                            onClick={() => setViewImage(null)}
                            className="absolute top-6 right-6 z-50 text-white/50 hover:text-white hover:bg-white/10 p-2 rounded-full transition-all"
                        >
                            <X className="w-8 h-8" />
                        </button>

                        {/* Image */}
                        {viewImage && (
                            <img
                                src={viewImage}
                                alt="Enlarged view"
                                className="relative z-10 w-auto h-auto max-w-full max-h-[90vh] object-contain rounded-md shadow-2xl animate-in fade-in zoom-in-95 duration-200"
                                onClick={(e) => e.stopPropagation()}
                            />
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}

function SearchIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
        </svg>
    )
}
