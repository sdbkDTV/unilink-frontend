import React, { useState, useEffect, useRef } from 'react'
import { api } from '../api/client'

type VerifyState = 'loading' | 'ok' | 'invalid'

export const VerifyEmailView: React.FC<{ onGoLogin?: () => void }> = ({ onGoLogin }) => {
  const [state, setState] = useState<VerifyState>('loading')
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true

    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')

    if (!token) {
      setState('invalid')
      return
    }

    api.get(`/api/verify-email?token=${token}`)
      .then(() => setState('ok'))
      .catch(() => setState('invalid'))
  }, [])

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea, #764ba2)',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '48px',
        textAlign: 'center',
        maxWidth: '420px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
      }}>
        {state === 'loading' && (
          <>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
            <h2>E-posta adresiniz doğrulanıyor…</h2>
            <p style={{ color: '#666' }}>Lütfen bekleyin.</p>
          </>
        )}
        {state === 'ok' && (
          <>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
            <h2>Hesabınız doğrulandı!</h2>
            <p style={{ color: '#666', marginBottom: '24px' }}>
              Artık giriş yapabilirsiniz.
            </p>
            <button
              onClick={onGoLogin}
              style={{
                padding: '12px 32px',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '15px',
                fontWeight: 600,
              }}
            >
              Giriş Yap →
            </button>
          </>
        )}
        {state === 'invalid' && (
          <>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
            <h2>Doğrulama başarısız</h2>
            <p style={{ color: '#666', marginBottom: '24px' }}>
              Doğrulama bağlantısı geçersiz veya süresi dolmuş.
            </p>
            <button
              onClick={onGoLogin}
              style={{
                padding: '12px 32px',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '15px',
                fontWeight: 600,
              }}
            >
              Giriş Sayfasına Dön →
            </button>
          </>
        )}
      </div>
    </div>
  )
}