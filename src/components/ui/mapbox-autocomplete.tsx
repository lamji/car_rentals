"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Loader2, MapPin, X } from "lucide-react";
import { useMapboxAutocomplete } from "./hooks/useMapboxAutocomplete";

interface MapboxAutocompleteProps {
    value: string;
    onChange: (value: string, details?: {
        lat: number;
        lng: number;
        city?: string;
        province?: string;
    }) => void;
    placeholder?: string;
    className?: string;
}

/**
 * Address autocomplete component using Mapbox Geocoding API.
 * Presentation only - Logic extracted to useMapboxAutocomplete hook.
 */
export function MapboxAutocomplete({
    value,
    onChange,
    placeholder = "Search for an address...",
    className = "",
}: MapboxAutocompleteProps) {
    const {
        inputValue,
        suggestions,
        showSuggestions,
        isLoading,
        containerRef,
        handlers
    } = useMapboxAutocomplete({ value, onChange });

    return (
        <div ref={containerRef} className={`relative ${className}`} data-testid="mapbox-autocomplete-container">
            <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 z-10" />
                <Input
                    value={inputValue || ""}
                    onChange={handlers.handleInputChange}
                    placeholder={placeholder}
                    data-testid="mapbox-autocomplete-input"
                    className="pl-10 pr-10 h-12 bg-slate-50 border-slate-200 focus:bg-white transition-all font-medium"
                    onFocus={handlers.handleFocus}
                />
                {isLoading && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-slate-400" />
                )}
                {!isLoading && inputValue && (
                    <button
                        type="button"
                        onClick={handlers.handleClear}
                        data-testid="mapbox-autocomplete-clear-button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 hover:text-slate-600 z-10"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            {showSuggestions && suggestions.length > 0 && (
                <div
                    data-testid="mapbox-autocomplete-suggestions"
                    className="absolute z-[100] w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300"
                >
                    <div className="px-3 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Search Results</span>
                        <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                            <MapPin className="w-2.5 h-2.5" />
                            Mapbox Geocoding
                        </span>
                    </div>
                    {suggestions.map((s) => (
                        <button
                            key={s.id}
                            type="button"
                            onClick={() => handlers.handleSelect(s)}
                            data-testid={`mapbox-suggestion-${s.id}`}
                            className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-all border-b border-slate-100 last:border-0 flex items-start gap-4 group"
                        >
                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                                <MapPin className="h-4 w-4 text-slate-400 group-hover:text-primary transition-colors" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-bold text-slate-900 leading-tight group-hover:text-primary transition-colors truncate">
                                    {s.text}
                                </p>
                                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                                    {s.place_name}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
