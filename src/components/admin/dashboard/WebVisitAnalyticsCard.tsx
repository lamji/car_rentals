"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, TrendingDown, TrendingUp } from "lucide-react";

interface WebVisitPoint {
    label: string;
    count: number;
}

interface WebVisitAnalytics {
    totalVisits7d: number;
    todayVisits: number;
    activeDevices: number;
    trendPercent: number;
    series: WebVisitPoint[];
}

interface WebVisitAnalyticsCardProps {
    analytics: WebVisitAnalytics;
}

export function WebVisitAnalyticsCard({ analytics }: WebVisitAnalyticsCardProps) {
    const maxCount = Math.max(...analytics.series.map((point) => point.count), 1);
    const hasPositiveTrend = analytics.trendPercent >= 0;

    return (
        <Card className="border-none shadow-sm">
            <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-600" />
                    Web Visit Analytics
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="rounded-xl bg-slate-50 p-4">
                        <p className="text-[11px] uppercase tracking-widest text-slate-500 font-bold">Visits (7d)</p>
                        <p className="text-2xl font-black text-slate-900">{analytics.totalVisits7d}</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-4">
                        <p className="text-[11px] uppercase tracking-widest text-slate-500 font-bold">Today</p>
                        <p className="text-2xl font-black text-slate-900">{analytics.todayVisits}</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-4">
                        <p className="text-[11px] uppercase tracking-widest text-slate-500 font-bold">Active Devices</p>
                        <p className="text-2xl font-black text-slate-900">{analytics.activeDevices}</p>
                    </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Last 7 Days</p>
                        <p className={`text-xs font-bold flex items-center gap-1 ${hasPositiveTrend ? "text-emerald-600" : "text-red-600"}`}>
                            {hasPositiveTrend ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {hasPositiveTrend ? "+" : ""}
                            {analytics.trendPercent}%
                        </p>
                    </div>
                    <div className="grid grid-cols-7 gap-3 items-end h-28">
                        {analytics.series.map((point) => (
                            <div key={point.label} className="flex flex-col items-center gap-2">
                                <div className="w-full h-20 flex items-end">
                                    <div
                                        className="w-full bg-blue-500/80 rounded-t-md transition-all"
                                        style={{ height: `${Math.max((point.count / maxCount) * 100, point.count > 0 ? 12 : 2)}%` }}
                                        title={`${point.label}: ${point.count}`}
                                    />
                                </div>
                                <span className="text-[10px] font-bold text-slate-500 uppercase">{point.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
