"use client";

import React from "react";
import { MapPin, Navigation, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGarageMapPicker } from "./hooks/useGarageMapPicker";

interface GarageMapPickerProps {
    value?: { lat: number; lng: number };
    onChange: (coords: { lat: number; lng: number }, address: string, city: string, province: string) => void;
}

/**
 * Interactive map component for selecting garage location.
 * Features an integrated search box for quick area navigation.
 */
export function GarageMapPicker({ value, onChange }: GarageMapPickerProps) {
    const {
        mapContainerRef,
        isReverseGeocoding,
        handleLocateMe,
        searchState,
        handlers
    } = useGarageMapPicker({ value, onChange });

    const showSuggestions = searchState.suggestions.length > 0;

    return (
        <div className="space-y-3" data-testid="garage-map-picker-root">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                        <Navigation className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div>
                        <p className="text-xs font-black uppercase tracking-widest text-slate-400">Integrated Map</p>
                        <p className="text-[10px] text-slate-500 font-medium">Search or pinpoint the location</p>
                    </div>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleLocateMe}
                    data-testid="map-locate-me-btn"
                    className="h-8 text-[10px] font-bold uppercase tracking-widest border-slate-200"
                >
                    <MapPin className="mr-1 h-3 w-3" />
                    Locate Me
                </Button>
            </div>

            <div className="relative group">
                {/* Search Box Overlay */}
                <div className="absolute top-4 left-4 right-14 z-10">
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                            {searchState.isSearching ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                                <Search className="h-3.5 w-3.5" />
                            )}
                        </div>
                        <Input
                            value={searchState.query}
                            onChange={(e) => handlers.onSearchInputChange(e.target.value)}
                            placeholder="Find an address..."
                            data-testid="map-search-input"
                            className="pl-9 h-10 bg-white shadow-xl border-none text-xs font-medium rounded-xl focus:ring-2 focus:ring-emerald-500/20"
                        />

                        {showSuggestions && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2">
                                {searchState.suggestions.map((s: any) => (
                                    <button
                                        key={s.id}
                                        type="button"
                                        onClick={() => handlers.handleSearchSelect(s)}
                                        data-testid={`map-suggestion-${s.id}`}
                                        className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-[11px] font-medium text-slate-700 border-b border-slate-50 last:border-0 transition-colors"
                                    >
                                        {s.place_name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div
                    ref={mapContainerRef}
                    data-testid="mapbox-root-container"
                    className="w-full h-[320px] rounded-2xl border border-slate-200 overflow-hidden shadow-inner bg-slate-100"
                />

                {isReverseGeocoding && (
                    <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] flex items-center justify-center rounded-2xl animate-in fade-in duration-300">
                        <div className="bg-white px-4 py-2 rounded-full shadow-xl border border-slate-100 flex items-center gap-2">
                            <Loader2 className="h-3 w-3 animate-spin text-emerald-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Retrieving Marker Location...</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
