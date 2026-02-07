import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Shield, Database, Eye, Lock } from 'lucide-react'

interface DataPrivacyModalProps {
  /** Whether the modal is open */
  open: boolean
  /** Function to close the modal */
  onOpenChange: (open: boolean) => void
  /** Function to handle scroll events */
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void
  /** Whether user has scrolled to bottom */
  hasScrolledToBottom: boolean
  /** Function to handle decline action */
  onDecline: () => void
  /** Function to handle agree action */
  onAgree: () => void
}

/**
 * Data Privacy Consent Modal component
 * Displays comprehensive data privacy policy with scroll-to-bottom requirement
 */
export function DataPrivacyModal({
  open,
  onOpenChange,
  onScroll,
  hasScrolledToBottom,
  onDecline,
  onAgree
}: DataPrivacyModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-screen h-screen max-w-none max-h-none flex flex-col m-0 rounded-none overflow-hidden">
        <DialogHeader className="shrink-0 px-6 py-4 border-b">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Shield className="h-6 w-6" />
            Data Privacy Consent Agreement
          </DialogTitle>
          <DialogDescription className="text-base">
            Please read and review our comprehensive data privacy policy below.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4" onScroll={onScroll}>
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Introduction */}
            <div>
              <h3 className="font-semibold text-xl mb-3">Data Privacy Act Compliance</h3>
              <p className="text-base text-gray-600">
                In compliance with the Republic Act No. 10173 (Data Privacy Act of 2012) of the Philippines,
                we are committed to protecting your personal data and ensuring transparency in our data processing practices.
              </p>
            </div>

            <Separator />

            {/* Data Collection */}
            <div>
              <h4 className="font-semibold flex items-center gap-2 mb-3 text-lg">
                <Database className="h-5 w-5" />
                Data Collection
              </h4>
              <p className="text-base text-gray-600 mb-3">
                We collect the following personal information for legitimate business purposes:
              </p>
              <ul className="text-base text-gray-600 space-y-2 list-disc list-inside">
                <li>Full name (first, middle, last name)</li>
                <li>Contact number and email address</li>
                <li>Valid government-issued ID and ID number</li>
                <li>Driver&apos;s license information (for self-drive rentals)</li>
                <li>Home and office addresses</li>
                <li>Rental history and payment information</li>
              </ul>
            </div>

            <Separator />

            {/* Purpose of Processing */}
            <div>
              <h4 className="font-semibold flex items-center gap-2 mb-3 text-lg">
                <Eye className="h-5 w-5" />
                Purpose of Data Processing
              </h4>
              <p className="text-base text-gray-600 mb-3">
                Your personal data will be processed for the following specific purposes:
              </p>
              <ul className="text-base text-gray-600 space-y-2 list-disc list-inside">
                <li>Vehicle rental booking and reservation processing</li>
                <li>Identity verification and background checks</li>
                <li>Payment processing and financial transactions</li>
                <li>Insurance coverage and claims processing</li>
                <li>Legal compliance with government regulations</li>
                <li>Customer service and support</li>
                <li>Marketing communications (with your consent)</li>
              </ul>
            </div>

            <Separator />

            {/* Data Protection */}
            <div>
              <h4 className="font-semibold flex items-center gap-2 mb-3 text-lg">
                <Lock className="h-5 w-5" />
                Data Protection Measures
              </h4>
              <p className="text-base text-gray-600 mb-3">
                We implement appropriate security measures to protect your personal data:
              </p>
              <ul className="text-base text-gray-600 space-y-2 list-disc list-inside">
                <li>Encrypted data storage and transmission</li>
                <li>Restricted access to authorized personnel only</li>
                <li>Regular security audits and updates</li>
                <li>Secure disposal of data after retention period</li>
                <li>Compliance with international security standards</li>
              </ul>
            </div>

            <Separator />

            {/* Data Retention */}
            <div>
              <h4 className="font-semibold mb-3 text-lg">Data Retention Period</h4>
              <p className="text-base text-gray-600">
                Your personal data will be retained for a maximum period of five (5) years from the date of
                your last transaction, unless required by law to be retained for a longer period. After the
                retention period, your data will be securely destroyed or anonymized.
              </p>
            </div>

            <Separator />

            {/* Your Rights */}
            <div>
              <h4 className="font-semibold mb-3 text-lg">Your Data Privacy Rights</h4>
              <p className="text-base text-gray-600 mb-3">
                Under the Data Privacy Act, you have the following rights:
              </p>
              <ul className="text-base text-gray-600 space-y-2 list-disc list-inside">
                <li>Right to be informed of personal data processing</li>
                <li>Right to access your personal data</li>
                <li>Right to correct inaccurate data</li>
                <li>Right to erasure or blocking of data</li>
                <li>Right to object to processing</li>
                <li>Right to data portability</li>
                <li>Right to file a complaint with the National Privacy Commission</li>
              </ul>
            </div>

            <Separator />

            {/* Contact Information */}
            <div>
              <h4 className="font-semibold mb-3 text-lg">Data Privacy Contact</h4>
              <p className="text-base text-gray-600">
                For any data privacy concerns or to exercise your rights, please contact our
                Data Protection Officer at privacy@carrentals.ph or call (02) 123-4567.
              </p>
            </div>
          </div>
        </div>

        <div className="shrink-0 px-6 py-4 border-t bg-gray-50">
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              size="lg"
              onClick={onDecline}
              data-testid="decline-consent-button"
            >
              Decline
            </Button>
            <Button
              size="lg"
              disabled={!hasScrolledToBottom}
              onClick={onAgree}
              data-testid="agree-consent-button"
            >
              I Agree
            </Button>
          </div>
          {!hasScrolledToBottom && (
            <p className="text-xs text-gray-500 self-center">
              Please scroll to the bottom to enable agreement
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
