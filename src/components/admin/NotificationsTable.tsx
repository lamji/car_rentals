'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  sendNotificationDB,
  sendNotificationToAllDB
} from '@/lib/pwaService/db-actions'
import { showAlert } from '@/lib/slices/alertSlice'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  MessageSquare,
  RefreshCw,
  Send,
  Trash2
} from 'lucide-react'
import { useState } from 'react'
import { useDispatch } from 'react-redux'

/**
 * Subscription data type for the table
 */
interface SubscriptionRow {
  id: string
  subscriptionId: string
  userId?: string
  endpoint: string
  userAgent?: string
  createdAt: string
  isActive: boolean
}

interface NotificationsTableProps {
  subscriptions: SubscriptionRow[]
  onRefresh: () => void
  onDelete: (subscriptionId: string) => void
}

/**
 * Action cell component for table rows
 * Handles individual notification sending and deletion
 */
function ActionCell({ 
  subscriptionId, 
  onSend, 
  onDelete 
}: { 
  subscriptionId: string
  onSend: (subscriptionId: string, message: string) => Promise<void>
  onDelete: (subscriptionId: string) => void
}) {
  const [message, setMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const dispatch = useDispatch()
  
  const handleSend = async () => {
    if (!message.trim()) return
    setIsSending(true)
    await onSend(subscriptionId, message)
    setMessage('')
    setIsSending(false)
  }
  
  const handleDelete = () => {
    // Show confirmation before deletion
    if (window.confirm(`Are you sure you want to delete subscription ${subscriptionId.substring(0, 8)}...?`)) {
      onDelete(subscriptionId)
      dispatch(showAlert({
        type: 'info',
        title: 'Subscription Deleted',
        message: `Subscription ${subscriptionId.substring(0, 8)}... has been removed`,
        duration: 3000
      }))
    }
  }
  
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        <Input
          placeholder="Message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-32 h-8 text-xs"
        />
        <Button
          size="sm"
          onClick={handleSend}
          disabled={isSending || !message.trim()}
          className="h-8 px-2"
        >
          {isSending ? (
            <RefreshCw className="h-3 w-3 animate-spin" />
          ) : (
            <Send className="h-3 w-3" />
          )}
        </Button>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={handleDelete}
        className="h-8 px-2"
      >
        <Trash2 className="h-3 w-3" />
      </Button>
    </div>
  )
}

/**
 * TanStack Table component for managing push notification subscriptions
 * Displays subscriptions with individual send actions and bulk operations
 */
export function NotificationsTable({ 
  subscriptions, 
  onRefresh, 
  onDelete
}: NotificationsTableProps) {
  const [globalFilter, setGlobalFilter] = useState('')
  const [broadcastMessage, setBroadcastMessage] = useState('')
  const [isBroadcasting, setIsBroadcasting] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const dispatch = useDispatch()

  /**
   * Send notification to a specific subscription
   */
  async function sendToSubscription(subscriptionId: string, message: string) {
    if (!message.trim()) return

    try {
      const result = await sendNotificationDB(message, subscriptionId)
      
      // Show global alert instead of callback
      dispatch(showAlert({
        type: result.success ? 'success' : 'error',
        title: result.success ? 'Notification Sent' : 'Send Failed',
        message: result.success 
          ? `Message sent to ${subscriptionId.substring(0, 8)}...` 
          : result.error || 'Failed to send notification',
        duration: 3000
      }))
    } catch (_error) {
      dispatch(showAlert({
        type: 'error',
        title: 'Network Error',
        message: 'Failed to send notification due to network error',
        duration: 3000
      }))
    }
  }

  /**
   * Send broadcast notification to all active subscriptions
   */
  async function handleBroadcast() {
    if (!broadcastMessage.trim()) return

    setIsBroadcasting(true)
    try {
      const result = await sendNotificationToAllDB(broadcastMessage)
      
      // Show global alert instead of callback
      dispatch(showAlert({
        type: result.success ? 'success' : 'error',
        title: result.success ? 'Broadcast Sent' : 'Broadcast Failed',
        message: result.success 
          ? `Message sent to ${result.sentCount} active users` 
          : result.error || 'Failed to send broadcast',
        duration: 4000
      }))
      
      if (result.success) {
        setBroadcastMessage('')
      }
    } catch (_error) {
      dispatch(showAlert({
        type: 'error',
        title: 'Network Error',
        message: 'Failed to send broadcast due to network error',
        duration: 3000
      }))
    } finally {
      setIsBroadcasting(false)
    }
  }

  /**
   * Refresh subscriptions list
   */
  async function handleRefresh() {
    setIsRefreshing(true)
    await onRefresh()
    setIsRefreshing(false)
    
    // Show success alert
    dispatch(showAlert({
      type: 'success',
      title: 'Data Refreshed',
      message: 'Subscription list has been updated',
      duration: 2000
    }))
  }

  // Create column helper
  const columnHelper = createColumnHelper<SubscriptionRow>()

  // Define table columns
  const columns = [
    columnHelper.accessor('subscriptionId', {
      header: 'Subscription ID',
      cell: (info) => (
        <div className="font-mono text-sm">
          {info.getValue().substring(0, 12)}...
        </div>
      ),
    }),
    columnHelper.accessor('userId', {
      header: 'User ID',
      cell: (info) => (
        <div className="text-sm">
          {info.getValue() || 'Anonymous'}
        </div>
      ),
    }),
    columnHelper.accessor('userAgent', {
      header: 'Device',
      cell: (info) => {
        const ua = info.getValue()
        if (!ua) return <span className="text-gray-400">Unknown</span>
        
        // Extract browser/device info
        const isMobile = /Mobile|Android|iPhone|iPad/.test(ua)
        const browser = ua.includes('Chrome') ? 'Chrome' : 
                      ua.includes('Firefox') ? 'Firefox' : 
                      ua.includes('Safari') ? 'Safari' : 'Unknown'
        
        return (
          <div className="text-sm">
            <div>{browser}</div>
            <div className="text-xs text-gray-500">
              {isMobile ? 'Mobile' : 'Desktop'}
            </div>
          </div>
        )
      },
    }),
    columnHelper.accessor('createdAt', {
      header: 'Created',
      cell: (info) => (
        <div className="text-sm text-gray-600">
          {info.getValue()}
        </div>
      ),
    }),
    columnHelper.accessor('isActive', {
      header: 'Status',
      cell: (info) => (
        <Badge variant={info.getValue() ? 'default' : 'secondary'}>
          {info.getValue() ? 'Active' : 'Inactive'}
        </Badge>
      ),
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: (info) => (
        <ActionCell 
          subscriptionId={info.row.original.subscriptionId}
          onSend={sendToSubscription}
          onDelete={onDelete}
        />
      ),
    }),
  ]

  // Create table instance
  const table = useReactTable({
    data: subscriptions,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  })

  return (
    <div className="space-y-6">
      {/* Broadcast Section */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Broadcast Message</h3>
        </div>
        <div className="flex gap-2">
          <Textarea
            placeholder="Enter broadcast message..."
            value={broadcastMessage}
            onChange={(e) => setBroadcastMessage(e.target.value)}
            className="flex-1"
            rows={2}
          />
          <Button
            onClick={handleBroadcast}
            disabled={isBroadcasting || !broadcastMessage.trim()}
            variant="destructive"
          >
            {isBroadcasting ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <MessageSquare className="h-4 w-4 mr-2" />
            )}
            Broadcast ({subscriptions.filter(s => s.isActive).length})
          </Button>
        </div>
      </div>

      {/* Table Controls */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Push Subscriptions ({subscriptions.length})
        </h3>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search subscriptions..."
            value={globalFilter ?? ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-64"
          />
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b bg-gray-50">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-sm font-medium text-gray-900"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b hover:bg-gray-50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-gray-500"
                >
                  No subscriptions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
