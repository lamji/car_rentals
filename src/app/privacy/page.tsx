"use client";

import React from "react";
import { Shield, Lock, Eye, FileText, ArrowLeft, Mail, Gavel } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

/**
 * Privacy Policy Page
 * Designed to meet Facebook/Meta Platform requirements.
 * Professional, transparent, and modern aesthetic.
 */
export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 overflow-x-hidden">
            {/* Navigation Header */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
                <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <Shield className="text-white h-6 w-6" />
                        </div>
                        <span className="font-black text-xl tracking-tight text-slate-900">Privacy <span className="text-emerald-500">Center</span></span>
                    </div>
                    <Link href="/">
                        <Button variant="ghost" className="text-slate-500 hover:text-slate-900 font-bold uppercase tracking-widest text-[10px] gap-2">
                            <ArrowLeft className="h-3 w-3" />
                            Return Home
                        </Button>
                    </Link>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-16">
                {/* Hero Section */}
                <div className="text-center mb-16 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight">Privacy Policy</h1>
                    <p className="text-slate-500 text-lg max-w-2xl mx-auto leading-relaxed">
                        We value your trust. This policy explains how we handle your personal information and Messenger data in alignment with Meta Platform policies.
                    </p>
                    <div className="flex items-center justify-center gap-6 pt-4">
                        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-widest">
                            <Lock className="h-3 w-3" />
                            Secure SSL
                        </div>
                        <div className="text-slate-400 text-xs font-mono uppercase tracking-widest">
                            Effective Date: Feb 18, 2026
                        </div>
                    </div>
                </div>

                <div className="space-y-12 bg-white p-8 md:p-16 rounded-[40px] border border-slate-200 shadow-xl animate-in fade-in slide-in-from-bottom-8 duration-1000">

                    {/* 1. Introduction */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold flex items-center gap-3 text-slate-800">
                            <FileText className="text-emerald-500 h-6 w-6" />
                            1. Introduction
                        </h2>
                        <div className="text-slate-600 leading-relaxed space-y-4">
                            <p>
                                This Privacy Policy describes how [Car Rental App Name] ("we," "us," or "our") collects, uses, and shares your personal information when you use our car rental services, mobile application, and Facebook Messenger interaction features.
                            </p>
                            <p>
                                By accessing our services, you agree to the collection and use of information in accordance with this policy.
                            </p>
                        </div>
                    </section>

                    {/* 2. Data We Collect */}
                    <section className="space-y-6">
                        <h2 className="text-2xl font-bold flex items-center gap-3 text-slate-800">
                            <Eye className="text-emerald-500 h-6 w-6" />
                            2. Information We Collect
                        </h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                <h3 className="font-bold text-slate-800 mb-2">Direct Information</h3>
                                <p className="text-sm text-slate-600">Name, Email Address, Phone Number, and Driver's License details provided during registration.</p>
                            </div>
                            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                <h3 className="font-bold text-slate-800 mb-2">Messenger Platform Data</h3>
                                <p className="text-sm text-slate-600">User ID (PSID), Profile Name, and raw message content sent via our official Facebook Page interaction.</p>
                            </div>
                            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                <h3 className="font-bold text-slate-800 mb-2">Location Data</h3>
                                <p className="text-sm text-slate-600">Geographical coordinates used specifically to find nearby rental garages and calculate distance for pricing.</p>
                            </div>
                            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                <h3 className="font-bold text-slate-800 mb-2">Payment Data</h3>
                                <p className="text-sm text-slate-600">Transaction details processed via PayMongo. We do not store full credit card numbers on our local servers.</p>
                            </div>
                        </div>
                    </section>

                    {/* 3. Use of Information */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold flex items-center gap-3 text-slate-800">
                            <Gavel className="text-emerald-500 h-6 w-6" />
                            3. How We Use Information
                        </h2>
                        <ul className="text-slate-600 leading-relaxed space-y-3 list-disc pl-6">
                            <li>To facilitate and manage car rental bookings.</li>
                            <li>To provide automated customer support via Facebook Messenger.</li>
                            <li>To process secure payments and prevent fraudulent transactions.</li>
                            <li>To improve our car search algorithms using anonymized location data.</li>
                            <li>To send service notifications and rental reminders.</li>
                        </ul>
                    </section>

                    {/* 4. Meta Platform Compliance */}
                    <section className="space-y-4 p-8 bg-emerald-50/50 rounded-3xl border border-emerald-100">
                        <h2 className="text-xl font-bold text-emerald-800 flex items-center gap-3">
                            Meta Platform Compliance
                        </h2>
                        <div className="text-slate-700 text-sm leading-relaxed space-y-4">
                            <p>
                                We comply with the **Meta Platform Terms** and **Messenger Platform Policies**. We do not sell your personal data or Messenger IDs to third-party advertisers.
                            </p>
                            <p>
                                Data collected through the Messenger API is used exclusively for functional purposes: providing service updates, answering inquiries, and managing your rental account.
                            </p>
                        </div>
                    </section>

                    {/* 5. User Rights */}
                    <section className="space-y-4">
                        <h2 className="text-2xl font-bold text-slate-800">
                            4. Your Data Rights
                        </h2>
                        <p className="text-slate-600 leading-relaxed">
                            You have the right to request access to your data or ask for the deletion of your account. To request data deletion, please contact us via the email below. We will process your request within 30 days in compliance with privacy regulations.
                        </p>
                    </section>

                    {/* Footer Contact */}
                    <div className="pt-12 border-t border-slate-100 flex flex-col items-center gap-6">
                        <div className="flex items-center gap-3 px-6 py-3 bg-slate-900 rounded-2xl shadow-xl shadow-slate-900/10">
                            <Mail className="text-emerald-400 h-5 w-5" />
                            <span className="text-white font-mono text-sm tracking-wider">privacy@carrentals.ph</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
                            End of Privacy Policy
                        </p>
                    </div>

                </div>
            </main>

            {/* Sub-footer */}
            <footer className="py-12 text-center border-t border-slate-200">
                <p className="text-slate-400 text-xs font-medium">
                    &copy; 2026 Car Rental Platforms. All rights reserved.
                </p>
            </footer>
        </div>
    );
}
