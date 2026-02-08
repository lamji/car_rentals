interface BasicPersonalInfoProps {
  firstName?: string
  middleName?: string
  lastName?: string
  contactNumber?: string
  email?: string
}

export function BasicPersonalInfo({
  firstName,
  middleName,
  lastName,
  contactNumber,
  email
}: BasicPersonalInfoProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div data-testid="first-name-field">
          <span className="text-sm font-medium text-gray-500">
            First Name
          </span>
          <p className="text-sm" data-testid="first-name-value">{firstName || ''}</p>
        </div>
        <div data-testid="middle-name-field">
          <span className="text-sm font-medium text-gray-500">
            Middle Name
          </span>
          <p className="text-sm" data-testid="middle-name-value">{middleName || ''}</p>
        </div>
        <div data-testid="last-name-field">
          <span className="text-sm font-medium text-gray-500">
            Last Name
          </span>
          <p className="text-sm" data-testid="last-name-value">{lastName || ''}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div data-testid="contact-number-field">
          <span className="text-sm font-medium text-gray-500">
            Contact Number
          </span>
          <p className="text-sm" data-testid="contact-number-value">{contactNumber || ''}</p>
        </div>
        <div data-testid="email-field">
          <span className="text-sm font-medium text-gray-500">
            Email Address
          </span>
          <p className="text-sm" data-testid="email-value">{email || ''}</p>
        </div>
        <div></div>
      </div>
    </>
  )
}
