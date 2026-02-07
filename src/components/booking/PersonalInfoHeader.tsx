import { Card, CardContent } from '@/components/ui/card'
import { User } from 'lucide-react'

interface PersonalInfoHeaderProps {
  /** Title for the header */
  title?: string
  /** Description for the header */
  description?: string
  /** Test ID for the header card */
  testId?: string
}

/**
 * Reusable header component for personal information forms
 * Displays a consistent header with icon, title, and description
 */
export function PersonalInfoHeader({
  title = "Personal Information",
  description = "Enter your details to complete the booking",
  testId = "personal-info-header"
}: PersonalInfoHeaderProps) {
  return (
    <Card className="border-blue-200 bg-blue-50" data-testid={testId}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <User className="h-5 w-5 text-blue-600" />
          <div>
            <h3 className="font-semibold text-blue-900">{title}</h3>
            <p className="text-sm text-blue-700">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
