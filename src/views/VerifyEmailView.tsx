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

    api.post('/api/auth/verify-email', { token })
      .then(() => {
        setState('ok')
        const msg = '🎉 Hesabınız başarıyla doğrulandı! Bilgileriniz hazır, doğrudan giriş yapabilirsiniz.'
        localStorage.setItem('verify_success', msg)
      })
      .catch(() => {
        setState('invalid')
      })
  }, [])

  const handleCloseOrLogin = () => {
    // Если вкладку можно закрыть скриптом (открыта из ссылки)
    try {
      window.close()
    } catch {
      // Игнорируем, если браузер блокирует close
    }

    if (onGoLogin) {
      onGoLogin()
    } else {
      window.location.href = '/'
    }
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
      fontFamily: 'system-ui, sans-serif',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '40px 32px',
        textAlign: 'center',
        maxWidth: '420px',
        width: '100%',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      }}>
        {state === 'loading' && (
          <>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
            <h2 style={{ fontSize: '20px', color: '#111827', margin: '0 0 8px 0' }}>E-posta adresiniz doğrulanıyor…</h2>
            <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>Lütfen bekleyin.</p>
          </>
        )}

        {state === 'ok' && (
          <>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
            <h2 style={{ fontSize: '22px', color: '#166534', margin: '0 0 10px 0' }}>Hesabınız Doğrulandı!</h2>
            <p style={{ color: '#4b5563', fontSize: '14px', lineHeight: '1.5', marginBottom: '24px' }}>
              E-posta adresiniz başarıyla onaylandı. Önceki sekmenize dönebilir veya buradan giriş yapabilirsiniz.
            </p>
            <button
              onClick={handleCloseOrLogin}
              style={{
                width: '100%',
                padding: '12px 24px',
                background: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '15px',
                fontWeight: 600,
                boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)'
              }}
            >
              Giriş Ekranına Git 🚀
            </button>
          </>
        )}

        {state === 'invalid' && (
          <>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
            <h2 style={{ fontSize: '20px', color: '#dc2626', margin: '0 0 10px 0' }}>Doğrulama Başarısız</h2>
            <p style={{ color: '#6b7280', fontSize: '14px', lineHeight: '1.5', marginBottom: '24px' }}>
              Doğrulama bağlantısı geçersiz veya süresi dolmuş.
            </p>
            <button
              onClick={handleCloseOrLogin}
              style={{
                width: '100%',
                padding: '12px 24px',
                background: '#4b5563',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '15px',
                fontWeight: 600,
              }}
            >
              Giriş Sayfasına Dön
            </button>
          </>
        )}
      </div>
    </div>
  )
}
