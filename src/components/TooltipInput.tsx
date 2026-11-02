import React from 'react'

interface TooltipInputProps {
  label: string
  id?: string
  name?: string
  autoComplete?: string
  type?: 'text' | 'email' | 'password'
  inputMode?: 'email' | 'text' | 'numeric' | 'search' | 'none'
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
  name,
  autoComplete,
  type = 'text',
  inputMode,
  placeholder,
  value,
  onChange,
  error,
  required = false,
  isTextarea = false,
  rows = 4
}) => {
  const inputId = id || (name || label.toLowerCase().replace(/\s+/g, '-'))

  return (
    <div className="form-group">
      <label htmlFor={inputId}>
        {label} {required && '*'}
      </label>
      <div className="input-wrapper">
        {isTextarea ? (
          <textarea
            id={inputId}
            name={name}
            rows={rows}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={error ? 'input-error' : ''}
          />
        ) : (
          <input
            id={inputId}
            name={name}
            type={type}
            inputMode={inputMode}
            autoComplete={autoComplete}
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
