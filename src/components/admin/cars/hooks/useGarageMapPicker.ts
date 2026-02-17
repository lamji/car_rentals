"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

interface UseGarageMapPickerProps {
    value?: { lat: number; lng: number };
    onChange: (coords: { lat: number; lng: number }, address: string, city: string, province: string) => void;
}

export function useGarageMapPicker({ value, onChange }: UseGarageMapPickerProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<mapboxgl.Map | null>(null);
    const markerRef = useRef<mapboxgl.Marker | null>(null);
    const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const debounceTimer = useRef<NodeJS.Timeout | null>(null);

    const handleMapInteraction = useCallback(async (lng: number, lat: number, skipAddressUpdate = false) => {
        setIsReverseGeocoding(true);
        try {
            const token = mapboxgl.accessToken;
            const res = await fetch(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${token}&country=PH&types=address,poi,place`
            );
            const data = await res.json();
            
            if (data.features && data.features.length > 0) {
                const feature = data.features[0];
                const address = feature.place_name;
                
                let city = "";
                let province = "";
                
                if (feature.context) {
                    feature.context.forEach((item: any) => {
                        if (item.id.startsWith("place")) city = item.text;
                        if (item.id.startsWith("region")) province = item.text;
                    });
                }
                
                if (!skipAddressUpdate) {
                    setSearchQuery(address);
                }
                onChange({ lat, lng }, address, city, province);
            }
        } catch (error) {
            console.error("Reverse geocoding error:", error);
        } finally {
            setIsReverseGeocoding(false);
        }
    }, [onChange, setSearchQuery]);

    const handleSearch = useCallback(async (query: string) => {
        if (!query || query.length < 3) {
            setSuggestions([]);
            return;
        }

        setIsSearching(true);
        try {
            const token = mapboxgl.accessToken;
            const res = await fetch(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${token}&country=PH&limit=5&types=address,poi,place`
            );
            const data = await res.json();
            setSuggestions(data.features || []);
        } catch (error) {
            console.error("Search error:", error);
        } finally {
            setIsSearching(false);
        }
    }, []);

    const onSearchInputChange = (val: string) => {
        setSearchQuery(val);
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        
        if (val.length >= 3) {
            debounceTimer.current = setTimeout(() => {
                handleSearch(val);
            }, 500);
        } else {
            setSuggestions([]);
        }
    };

    const handleSearchSelect = (suggestion: any) => {
        const [lng, lat] = suggestion.center;
        const address = suggestion.place_name;
        
        setSearchQuery(address);
        setSuggestions([]);
        
        if (mapRef.current && markerRef.current) {
            markerRef.current.setLngLat([lng, lat]);
            mapRef.current.easeTo({
                center: [lng, lat],
                zoom: 15
            });
        }
        
        handleMapInteraction(lng, lat, true);
    };

    useEffect(() => {
        if (!mapContainerRef.current) return;

        mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

        const map = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: "mapbox://styles/lamjilampago/ckg2ggpzw0r9j19mit7o0fr2n",
            center: [value?.lng || 121.0426, value?.lat || 14.5409],
            zoom: 13,
        });

        mapRef.current = map;
        map.addControl(new mapboxgl.NavigationControl(), "top-right");

        const marker = new mapboxgl.Marker({
            draggable: true,
            color: "#EF4444"
        })
            .setLngLat([value?.lng || 121.0426, value?.lat || 14.5409])
            .addTo(map);

        markerRef.current = marker;

        marker.on("dragend", () => {
            const lngLat = marker.getLngLat();
            handleMapInteraction(lngLat.lng, lngLat.lat);
        });

        map.on("click", (e) => {
            const { lng, lat } = e.lngLat;
            marker.setLngLat([lng, lat]);
            handleMapInteraction(lng, lat);
        });

        return () => {
            map.remove();
        };
    }, [handleMapInteraction, value]); // Run once on mount

    useEffect(() => {
        if (mapRef.current && markerRef.current && value) {
            const currentPos = markerRef.current.getLngLat();
            if (Math.abs(currentPos.lng - value.lng) > 0.00001 || Math.abs(currentPos.lat - value.lat) > 0.00001) {
                markerRef.current.setLngLat([value.lng, value.lat]);
                mapRef.current.easeTo({
                    center: [value.lng, value.lat],
                    duration: 1000
                });
            }
        }
    }, [value]);

    const handleLocateMe = () => {
        if (navigator.geolocation && mapRef.current && markerRef.current) {
            navigator.geolocation.getCurrentPosition((position) => {
                const { latitude, longitude } = position.coords;
                markerRef.current?.setLngLat([longitude, latitude]);
                mapRef.current?.easeTo({
                    center: [longitude, latitude],
                    zoom: 15
                });
                handleMapInteraction(longitude, latitude);
            });
        }
    };

    return {
        mapContainerRef,
        isReverseGeocoding,
        handleLocateMe,
        searchState: {
            query: searchQuery,
            suggestions,
            isSearching
        },
        handlers: {
            onSearchInputChange,
            handleSearchSelect
        }
    };
}
