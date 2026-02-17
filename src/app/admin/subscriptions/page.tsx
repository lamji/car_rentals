'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Database,
    Trash2,
    Calendar,
    Smartphone,
    CheckCircle2,
    XCircle
} from 'lucide-react'
import useGetSubscriptions from '@/lib/api/useGetSubscriptions'
import { useState } from 'react'

/**
 * Admin Subscriptions Management Page
 * Displays and allows management of push notification subscriptions
 */
export default function SubscriptionsPage() {
    const { data: subscriptions, isLoading, refetch } = useGetSubscriptions()
    const [deleting, setDeleting] = useState<string | null>(null)

    const handleDelete = async (subscriptionId: string) => {
        try {
            setDeleting(subscriptionId)
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/subscriptions?subscriptionId=${subscriptionId}`, {
                method: 'DELETE'
            })
            if (response.ok) {
                refetch()
            }
        } catch (error) {
            console.error('Failed to delete subscription:', error)
        } finally {
            setDeleting(null)
        }
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Manage Subscriptions</h1>
                <p className="text-gray-600 mt-2">
                    View and manage active push notification devices
                </p>
            </div>

            {/* Stats Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Subscriptions</CardTitle>
                        <Database className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {isLoading ? '...' : subscriptions?.length || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Across all registered devices
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Subscriptions List */}
            <Card>
                <CardHeader>
                    <CardTitle>Active Devices</CardTitle>
                    <CardDescription>
                        Devices currently receiving system notifications
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-10">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : !subscriptions || subscriptions.length === 0 ? (
                        <div className="text-center py-10 text-gray-500">
                            <Database className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            <p>No active subscriptions found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3">ID / User</th>
                                        <th className="px-6 py-3">Device / User Agent</th>
                                        <th className="px-6 py-3">Created</th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {subscriptions.map((sub: any) => (
                                        <tr key={sub.subscriptionId} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900 truncate max-w-[150px]" title={sub.subscriptionId}>
                                                    {sub.subscriptionId.substring(0, 12)}...
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {sub.userId || 'Guest User'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Smartphone className="w-4 h-4 text-gray-400" />
                                                    <div className="truncate max-w-[200px]" title={sub.userAgent}>
                                                        {sub.userAgent || 'Unknown Device'}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-gray-400" />
                                                    <span>{new Date(sub.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant={sub.isActive ? "default" : "secondary"}>
                                                    {sub.isActive ? (
                                                        <div className="flex items-center gap-1">
                                                            <CheckCircle2 className="w-3 h-3" />
                                                            Active
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-1">
                                                            <XCircle className="w-3 h-3" />
                                                            Inactive
                                                        </div>
                                                    )}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => handleDelete(sub.subscriptionId)}
                                                    disabled={deleting === sub.subscriptionId}
                                                >
                                                    <Trash2 className="w-4 h-4 mr-1" />
                                                    {deleting === sub.subscriptionId ? 'Removing...' : 'Remove'}
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
