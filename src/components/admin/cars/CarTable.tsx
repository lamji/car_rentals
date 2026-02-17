"use client";

import { Car } from "@/lib/types";
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Car as CarIcon,
    Search,
    Plus,
    RefreshCw,
    MoreVertical,
    Settings,
    ShieldCheck
} from "lucide-react";
import { useState } from "react";
import Image from "next/image";

import useDeleteCar from "@/lib/api/useDeleteCar";
import { showAlert } from "@/lib/slices/alertSlice";
import { useAppDispatch } from "@/lib/store";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Trash2 } from "lucide-react";

interface CarTableProps {
    cars: Car[];
    onRefresh: () => void;
    onAddCar: () => void;
    onEditCar: (car: Car) => void;
    canCreateCar?: boolean;
}

function ActionsCell({ car, onEdit, onRefresh }: { car: Car, onEdit: (car: Car) => void, onRefresh: () => void }) {
    const dispatch = useAppDispatch();
    const { mutateAsync: deleteCar } = useDeleteCar(car.id || car._id || "");

    const handleDelete = async () => {
        if (window.confirm(`Are you sure you want to remove ${car.name}?`)) {
            try {
                await deleteCar();
                dispatch(showAlert({
                    type: "success",
                    title: "Vehicle Removed",
                    message: `${car.name} has been deleted from the system.`,
                    duration: 3000
                }));
                onRefresh();
            } catch {
                dispatch(showAlert({
                    type: "error",
                    title: "Delete Failed",
                    message: "Could not remove vehicle. Please try again.",
                    duration: 5000
                }));
            }
        }
    };

    return (
        <div className="flex items-center gap-2">
            <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(car)}
                className="h-8 w-8 p-0"
            >
                <Settings className="h-4 w-4 text-gray-500" />
            </Button>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4 text-gray-500" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem
                        onClick={handleDelete}
                        className="text-red-600 focus:text-red-700 focus:bg-red-50"
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Vehicle
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

export function CarTable({ cars, onRefresh, onAddCar, onEditCar, canCreateCar = true }: CarTableProps) {
    const [globalFilter, setGlobalFilter] = useState("");
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await onRefresh();
        setIsRefreshing(false);
    };

    const columnHelper = createColumnHelper<Car>();

    const columns = [
        columnHelper.accessor("image", {
            header: "Car",
            cell: (info) => (
                <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-gray-100 shrink-0 bg-gray-50">
                        <Image
                            src={info.getValue() || "/images/car-placeholder.png"}
                            alt={info.row.original.name}
                            fill
                            className="object-cover"
                        />
                    </div>
                    <div>
                        <div className="font-semibold text-sm text-gray-900">{info.row.original.name}</div>
                        <div className="text-xs text-gray-500">{info.row.original.year} • {info.row.original.transmission}</div>
                    </div>
                </div>
            ),
        }),
        columnHelper.accessor("type", {
            header: "Type",
            cell: (info) => (
                <Badge variant="outline" className="capitalize">
                    {info.getValue()}
                </Badge>
            ),
        }),
        columnHelper.accessor("pricePer24Hours", {
            header: "24h Rate",
            cell: (info) => (
                <div className="font-medium text-sm">
                    P{info.getValue()?.toLocaleString()}
                </div>
            ),
        }),
        columnHelper.accessor("owner.name", {
            header: "Owner",
            cell: (info) => (
                <div className="text-sm">
                    <div>{info.getValue()}</div>
                    <div className="text-[10px] text-gray-500">{info.row.original.owner.contactNumber}</div>
                </div>
            ),
        }),
        columnHelper.accessor("selfDrive", {
            header: "Mode",
            cell: (info) => (
                <div className="flex items-center gap-1">
                    {info.getValue() ? (
                        <ShieldCheck className="h-3 w-3 text-green-600" />
                    ) : (
                        <UsersIcon className="h-3 w-3 text-blue-600" />
                    )}
                    <span className="text-xs">{info.getValue() ? "Self Drive" : "With Driver"}</span>
                </div>
            ),
        }),
        columnHelper.accessor("availability.isAvailableToday", {
            header: "Status",
            cell: (info) => {
                const isAvailable = info.getValue() && !info.row.original.isOnHold;
                return (
                    <Badge variant={isAvailable ? "default" : "secondary"} className={isAvailable ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}>
                        {info.row.original.isOnHold ? "On Hold" : isAvailable ? "Available" : "Unavailable"}
                    </Badge>
                );
            },
        }),
        columnHelper.display({
            id: "actions",
            header: "Actions",
            cell: (info) => (
                <ActionsCell
                    car={info.row.original}
                    onEdit={onEditCar}
                    onRefresh={onRefresh}
                />
            ),
        }),
    ];

    const table = useReactTable({
        data: cars,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        state: {
            globalFilter,
        },
        onGlobalFilterChange: setGlobalFilter,
    });

    return (
        <div className="space-y-4">
            {/* Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search cars by name, type, or owner..."
                        value={globalFilter ?? ""}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        className="pl-9 h-10"
                    />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button
                        variant="outline"
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="h-10"
                    >
                        {isRefreshing ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                            <RefreshCw className="h-4 w-4" />
                        )}
                    </Button>
                    {canCreateCar && (
                        <Button onClick={onAddCar} className="h-10 grow sm:grow-0">
                            <Plus className="h-4 w-4 mr-2" />
                            Register Car
                        </Button>
                    )}
                </div>
            </div>

            {/* Table Container */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <th
                                            key={header.id}
                                            className="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider"
                                        >
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext(),
                                                )}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                                        {row.getVisibleCells().map((cell) => (
                                            <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext(),
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={columns.length}
                                        className="px-6 py-12 text-center"
                                    >
                                        <div className="flex flex-col items-center gap-2">
                                            <CarIcon className="h-8 w-8 text-gray-300" />
                                            <p className="text-gray-500 font-medium">No cars found matching your criteria.</p>
                                            <Button variant="link" onClick={() => setGlobalFilter("")} className="text-primary p-0 h-auto">
                                                Clear all filters
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination Placeholder */}
            <div className="flex items-center justify-between px-2 py-4">
                <p className="text-xs text-gray-500">
                    Showing {table.getRowModel().rows.length} of {cars.length} cars
                </p>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled className="h-8">Previous</Button>
                    <Button variant="outline" size="sm" disabled className="h-8">Next</Button>
                </div>
            </div>
        </div>
    );
}

// Minimal UsersIcon substitute if lucide is missing it
function UsersIcon({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    );
}
