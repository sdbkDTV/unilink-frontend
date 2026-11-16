import React, { useState, FormEvent } from 'react'
import { TooltipInput } from '../components/TooltipInput'
import { Logo } from '../components/Logo'
import { authApi, parseError } from '../api'

interface ResetPasswordViewProps {
  onGoLogin: () => void
}

export const ResetPasswordView: React.FC<ResetPasswordViewProps> = ({ onGoLogin }) => {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [isLoading, setIsLoading] = useState(false)
  const [generalError, setGeneralError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [isSuccess, setIsSuccess] = useState(false)

  const token = new URLSearchParams(window.location.search).get('token') || ''

  const handleReset = async (e: FormEvent) => {
    e.preventDefault()
    setGeneralError('')
    setFieldErrors({})

    if (!token) {
      setGeneralError('Geçersiz veya eksik şifre sıfırlama bağlantısı.')
      return
    }

    const errs: Record<string, string> = {}
    if (!newPassword.trim()) {
      errs.newPassword = 'Lütfen yeni şifrenizi giriniz.'
    } else if (newPassword.length < 8) {
      errs.newPassword = 'Yeni şifre en az 8 karakter olmalıdır.'
    } else if (newPassword.length > 72) {
      errs.newPassword = 'Yeni şifre en fazla 72 karakter olabilir.'
    }

    if (!confirmPassword.trim()) {
      errs.confirmPassword = 'Lütfen yeni şifrenizi tekrar giriniz.'
    } else if (newPassword !== confirmPassword) {
      errs.confirmPassword = 'Şifreler birbiriyle eşleşmiyor.'
    }

    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs)
      return
    }

    setIsLoading(true)
    try {
      await authApi.resetPassword(token, newPassword)
      setIsSuccess(true)
    } catch (err: unknown) {
      const parsed = parseError(err)
      setGeneralError(parsed.message || 'Şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş.')
      if (parsed.fieldErrors) {
        setFieldErrors(parsed.fieldErrors)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '28px' }}>
          <Logo size={42} subtitle="Yeni Şifre Belirleme" />
        </div>

        {generalError && (
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: '#fef2f2',
              color: '#dc2626',
              borderRadius: '8px',
              fontSize: '13px',
              marginBottom: '14px',
              border: '1px solid #fecaca',
            }}
          >
            ⚠️ {generalError}
          </div>
        )}

        {isSuccess ? (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🎉</div>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#166534', marginBottom: '8px' }}>
              Şifreniz Başarıyla Sıfırlandı!
            </h3>
            <p style={{ fontSize: '13px', color: '#475569', marginBottom: '20px' }}>
              Yeni şifrenizle hemen sisteme giriş yapabilirsiniz.
            </p>
            <button
              onClick={onGoLogin}
              className="submit-btn"
              type="button"
            >
              Giriş Ekranına Git 🚀
            </button>
          </div>
        ) : (
          <form onSubmit={handleReset} className="auth-form" noValidate>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
              Lütfen hesabınız için en az 8 karakter uzunluğunda yeni bir şifre belirleyiniz.
            </p>

            <TooltipInput
              label="Yeni Şifre"
              name="new_password"
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={setNewPassword}
              error={fieldErrors.newPassword}
              required
            />

            <TooltipInput
              label="Yeni Şifre Tekrar"
              name="confirm_new_password"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={setConfirmPassword}
              error={fieldErrors.confirmPassword}
              required
            />

            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading ? 'Sıfırlanıyor...' : 'Yeni Şifreyi Kaydet 🔑'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '14px' }}>
              <button
                type="button"
                onClick={onGoLogin}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                Giriş Ekranına Dön
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
