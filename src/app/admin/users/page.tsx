'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Users,
    UserPlus,
    Search,
    Shield,
    Mail,
    Calendar,
    MoreVertical
} from 'lucide-react'
import { Input } from '@/components/ui/input'

/**
 * Admin Users Management Page
 * Displays and allows management of system users and roles.
 */
export default function UsersPage() {
    // Placeholder data - would be replaced with actual API call
    const users = [
        { id: '1', name: 'Master Lamji', email: 'admin@admin.com', role: 'admin', joined: '2024-01-15' },
        { id: '2', name: 'Sample Owner', email: 'owner@owner.com', role: 'owner', joined: '2024-02-10' },
    ];

    return (
        <div className="space-y-8" data-testid="admin-users-page">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                    <p className="text-gray-600 mt-2">
                        Manage system administrators, owners, and customer accounts
                    </p>
                </div>
                <Button className="flex items-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    Add New User
                </Button>
            </div>

            {/* Quick Actions & Search */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search users by name or email..."
                        className="pl-10"
                    />
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm">All Roles</Button>
                    <Button variant="outline" size="sm">Admins</Button>
                    <Button variant="outline" size="sm">Owners</Button>
                </div>
            </div>

            {/* Users List */}
            <Card>
                <CardHeader>
                    <CardTitle>System Users</CardTitle>
                    <CardDescription>
                        A total of {users.length} registered users in the system
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50/50">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">User Details</th>
                                    <th className="px-6 py-4 font-semibold">Role</th>
                                    <th className="px-6 py-4 font-semibold">Joined Date</th>
                                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                    {user.name.charAt(0)}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-gray-900">{user.name}</span>
                                                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                        <Mail className="w-3 h-3" />
                                                        {user.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant={user.role === 'admin' ? "default" : "secondary"} className="capitalize">
                                                <div className="flex items-center gap-1">
                                                    <Shield className="w-3 h-3" />
                                                    {user.role}
                                                </div>
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-gray-600">
                                                <Calendar className="w-4 h-4 opacity-40" />
                                                <span>{new Date(user.joined).toLocaleDateString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                <MoreVertical className="w-4 h-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
