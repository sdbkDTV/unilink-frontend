import React from 'react'

interface TooltipInputProps {
  label: string
  id?: string
  type?: 'text' | 'email' | 'password'
  placeholder?: string
  value: string
  onChange: (val: string) => void
  error?: string
  required?: boolean
  isTextarea?: boolean
  rows?: number
}

export const TooltipInput: React.FC<TooltipInputProps> = ({
  label,
  id,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  required = false,
  isTextarea = false,
  rows = 4
}) => {
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="form-group">
      <label htmlFor={inputId}>
        {label} {required && '*'}
      </label>
      <div className="input-wrapper">
        {isTextarea ? (
          <textarea
            id={inputId}
            rows={rows}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={error ? 'input-error' : ''}
          />
        ) : (
          <input
            id={inputId}
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={error ? 'input-error' : ''}
          />
        )}
        {error && <div className="custom-tooltip">⚠️ {error}</div>}
      </div>
    </div>
  )
}