"use client";

import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store";
import { showLoader, hideLoader } from "@/lib/slices/globalLoaderSlice";
import { showAlert } from "@/lib/slices/alertSlice";
import useGetCars from "@/lib/api/useGetCars";
import { CarTable } from "@/components/admin/cars/CarTable";
import { Car } from "@/lib/types";
import { Car as CarIcon, ChevronRight } from "lucide-react";
import Link from "next/link";
import { CarFormModal } from "@/components/admin/cars/CarFormModal";

/**
 * Admin Car Management Page
 * Handles car listing, filtering, and registration orchestration
 */
export default function AdminCarsPage() {
    const dispatch = useAppDispatch();
    const role = useAppSelector((state) => state.auth.role);
    const canCreateCar = role === "admin";
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCar, setEditingCar] = useState<Car | null>(null);

    const { data: carData, isLoading, error, refetch } = useGetCars({ managed: true, query: { page: 1 } });

    // Sync Global Loader
    useEffect(() => {
        if (isLoading) {
            dispatch(showLoader("Synchronizing car inventory..."));
        } else {
            dispatch(hideLoader());
        }
    }, [isLoading, dispatch]);

    // Handle Errors
    useEffect(() => {
        if (error) {
            dispatch(
                showAlert({
                    type: "error",
                    title: "Synchronization Failed",
                    message: "Could not fetch car data from server.",
                    duration: 5000,
                })
            );
        }
    }, [error, dispatch]);

    const cars = useMemo(() => {
        if (!carData?.success || !carData?.data) {
            return [];
        }
        return carData.data as Car[];
    }, [carData]);

    const handleAddCar = () => {
        setEditingCar(null);
        setIsModalOpen(true);
    };

    const handleEditCar = (car: Car) => {
        setEditingCar(car);
        setIsModalOpen(true);
    };

    const handleFormSuccess = () => {
        setIsModalOpen(false);
        refetch();
        dispatch(showAlert({
            type: "success",
            title: "Success",
            message: editingCar ? "Car updated successfully" : "New car registered successfully",
            duration: 3000
        }));
    };

    return (
        <div className="space-y-6">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                <Link href="/admin" className="hover:text-primary transition-colors">ADMIN</Link>
                <ChevronRight className="h-3 w-3" />
                <span className="text-gray-900">CAR MANAGEMENT</span>
            </nav>

            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <CarIcon className="h-6 w-6 text-primary" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                            Car Management
                        </h1>
                    </div>
                    <p className="text-sm text-gray-500 max-w-md">
                        Register new vehicles, manage pricing packages, and control visibility across the platform.
                    </p>
                </div>
            </div>

            {/* Main Table Content */}
            <CarTable
                cars={cars}
                onRefresh={() => refetch()}
                onAddCar={handleAddCar}
                onEditCar={handleEditCar}
                canCreateCar={canCreateCar}
            />

            {/* Car Form Modal */}
            <CarFormModal
                key={editingCar?.id || editingCar?._id || "new"}
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                car={editingCar}
                onSuccess={handleFormSuccess}
            />
        </div>
    );
}
