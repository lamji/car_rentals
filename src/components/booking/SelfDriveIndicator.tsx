import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { FileText } from 'lucide-react'

interface SelfDriveIndicatorProps {
  /** Test ID for the indicator card */
  testId?: string
  /** Test ID for the LTO portal info */
  ltoTestId?: string
}

/**
 * Reusable component for displaying self-drive rental information
 * Shows rental type, license requirement, and LTO portal information
 */
export function SelfDriveIndicator({
  testId = "self-drive-indicator",
  ltoTestId = "lto-portal-info"
}: SelfDriveIndicatorProps) {
  return (
    <Card className="border-green-200 bg-green-50" data-testid={testId}>
      <CardContent className="p-4">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-green-600" />
          <span className="sm font-medium text-green-900">Self-Drive Rental</span>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            License Required
          </Badge>
        </div>
        <p className="text-xs text-green-700 mt-1">
          Valid driver&apos;s license needed for garage pickup verification
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded p-2 mt-2">
          <p className="text-xs text-blue-700" data-testid={ltoTestId}>
            <strong>Important:</strong> You will be required to open the LTO portal for license verification and deposit one ID at the garage.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
