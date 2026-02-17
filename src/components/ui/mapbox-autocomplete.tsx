"use client";

import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Loader2, MapPin, X } from "lucide-react";

interface MapboxAutocompleteProps {
    value: string;
    onChange: (value: string, coordinates?: { lat: number, lng: number }) => void;
    placeholder?: string;
    className?: string;
}

export function MapboxAutocomplete({
    value,
    onChange,
    placeholder = "Search for an address...",
    className = "",
}: MapboxAutocompleteProps) {
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [inputValue, setInputValue] = useState(value);
    const containerRef = useRef<HTMLDivElement>(null);
    const debounceTimer = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        setInputValue(value);
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
        };
    }, []);

    const fetchSuggestions = async (query: string) => {
        if (!query || query.length < 3) {
            setSuggestions([]);
            return;
        }

        setIsLoading(true);
        try {
            const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
            const res = await fetch(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
                    query
                )}.json?access_token=${token}&country=PH&limit=5&types=address,poi,place`
            );
            const data = await res.json();
            setSuggestions(data.features || []);
            setShowSuggestions(true);
        } catch (error) {
            console.error("Mapbox Autocomplete error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setInputValue(val);

        // Pass the raw string back to parent immediately for controlled input behavior
        onChange(val);

        if (debounceTimer.current) clearTimeout(debounceTimer.current);

        if (val.length < 3) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        debounceTimer.current = setTimeout(() => {
            fetchSuggestions(val);
        }, 500);
    };

    const handleSelect = (suggestion: any) => {
        const fullAddress = suggestion.place_name;
        const [lng, lat] = suggestion.center;

        setInputValue(fullAddress);
        setSuggestions([]);
        setShowSuggestions(false);

        // Return full address and coordinates to parent
        onChange(fullAddress, { lat, lng });
    };

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 z-10" />
                <Input
                    value={inputValue || ""}
                    onChange={handleInputChange}
                    placeholder={placeholder}
                    className="pl-10 pr-10 h-12 bg-slate-50 border-slate-200 focus:bg-white transition-all font-medium"
                    onFocus={() => {
                        if (inputValue && inputValue.length >= 3) {
                            setShowSuggestions(true);
                        }
                    }}
                />
                {isLoading && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-slate-400" />
                )}
                {!isLoading && inputValue && (
                    <button
                        type="button"
                        onClick={() => {
                            setInputValue("");
                            onChange("", undefined);
                            setSuggestions([]);
                            setShowSuggestions(false);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 hover:text-slate-600 z-10"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-[100] w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
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
                            onClick={() => handleSelect(s)}
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
