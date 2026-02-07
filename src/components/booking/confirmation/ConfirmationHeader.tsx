import { Card, CardContent } from '@/components/ui/card'
import { FileText } from 'lucide-react'

export function ConfirmationHeader() {
  return (
    <Card className="border-green-200 bg-green-50 p-0 py-4 shadow-none" data-testid="confirmation-header">
      <CardContent className="p-4 shadow-none">
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-green-600" data-testid="confirmation-icon" />
          <div>
            <h3 className="font-semibold text-green-900" data-testid="confirmation-title">
              Booking Confirmation
            </h3>
            <p className="text-sm text-green-700" data-testid="confirmation-subtitle">
              Review your booking details and confirm
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
