import React from 'react'

interface LogoProps {
  size?: number
  showText?: boolean
  className?: string
  subtitle?: string
}

export const Logo: React.FC<LogoProps> = ({
  size = 40,
  showText = true,
  className = '',
  subtitle
}) => {
  return (
    <div
      className={`unilink-logo-container ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '12px',
        userSelect: 'none',
        textDecoration: 'none',
      }}
    >
      {/* Иконка эмблемы (Академическая конфедератка в созвездии связей) */}
      <img
        src="/logo_icon.png"
        alt="UniLink Logo"
        width={size}
        height={size}
        style={{
          width: size,
          height: size,
          objectFit: 'contain',
          filter: 'drop-shadow(0 2px 6px rgba(37, 99, 235, 0.16))',
          flexShrink: 0,
        }}
      />

      {/* Текстовая часть логотипа в фирменном стиле */}
      {showText && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '1px' }}>
            <span
              style={{
                fontSize: size * 0.68,
                fontWeight: 700,
                color: '#1d4ed8',
                letterSpacing: '-0.02em',
                fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              }}
            >
              Uni
            </span>
            <span
              style={{
                fontSize: size * 0.68,
                fontWeight: 700,
                color: '#06b6d4',
                letterSpacing: '-0.02em',
                fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              }}
            >
              Link
            </span>
          </div>
          {subtitle && (
            <span
              style={{
                fontSize: '11px',
                color: '#64748b',
                fontWeight: 500,
                marginTop: '4px',
                letterSpacing: '0.01em',
              }}
            >
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
