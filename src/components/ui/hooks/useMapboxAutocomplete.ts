"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface UseMapboxAutocompleteProps {
    value: string;
    onChange: (value: string, details?: {
        lat: number;
        lng: number;
        city?: string;
        province?: string;
    }) => void;
}

export function useMapboxAutocomplete({ value, onChange }: UseMapboxAutocompleteProps) {
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

    const fetchSuggestions = useCallback(async (query: string) => {
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
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setInputValue(val);
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

        let city = "";
        let province = "";

        if (suggestion.context) {
            suggestion.context.forEach((item: any) => {
                if (item.id.startsWith("place")) city = item.text;
                if (item.id.startsWith("region")) province = item.text;
            });
        }

        setInputValue(fullAddress);
        setSuggestions([]);
        setShowSuggestions(false);
        onChange(fullAddress, { lat, lng, city, province });
    };

    const handleClear = () => {
        setInputValue("");
        onChange("", undefined);
        setSuggestions([]);
        setShowSuggestions(false);
    };

    const handleFocus = () => {
        if (inputValue && inputValue.length >= 3) {
            setShowSuggestions(true);
        }
    };

    return {
        inputValue,
        suggestions,
        showSuggestions,
        isLoading,
        containerRef,
        handlers: {
            handleInputChange,
            handleSelect,
            handleClear,
            handleFocus
        }
    };
}
