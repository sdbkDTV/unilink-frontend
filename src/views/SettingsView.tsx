import React, { useState, FormEvent } from 'react'
import { User } from '../types'
import { changePassword, parseError } from '../api'

interface SettingsViewProps {
  user: User
}

export const SettingsView: React.FC<SettingsViewProps> = ({ user }) => {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault()
    setSuccessMessage('')
    setErrorMessage('')
    setFieldErrors({})

    const errs: Record<string, string> = {}
    if (!currentPassword.trim()) {
      errs.currentPassword = 'Lütfen mevcut şifrenizi giriniz.'
    }
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
      errs.confirmPassword = 'Yeni şifreler birbiriyle eşleşmiyor.'
    }

    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs)
      return
    }

    setIsLoading(true)
    try {
      await changePassword({
        currentPassword: currentPassword.trim(),
        newPassword: newPassword.trim(),
      })
      setSuccessMessage('🎉 Şifreniz başarıyla değiştirildi! Yeni oturum anahtarlarınız kaydedildi. Güvenlik gereği diğer cihazlardaki oturumlar kapatıldı.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: unknown) {
      const parsed = parseError(err)
      setErrorMessage(parsed.message)
      if (parsed.fieldErrors) {
        setFieldErrors(parsed.fieldErrors)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="view-container" style={{ maxWidth: '680px', margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}>
          ⚙️ Hesap ve Güvenlik Ayarları
        </h1>
        <p style={{ color: '#64748b', fontSize: '14px' }}>
          UniLink hesabınızın güvenlik ve şifre yapılandırmalarını buradan yönetebilirsiniz.
        </p>
      </div>

      {/* Şifre Değiştirme Kartı */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}
      >
        <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a', marginBottom: '8px' }}>
          🔒 Şifre Değiştir
        </h2>
        <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
          Şifrenizi değiştirdiğinizde bu cihazdaki oturumunuz kesintisiz yenilenir, diğer cihazlardaki tüm açık oturumlar güvenlik gereği kapatılır.
        </p>

        {successMessage && (
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: '#f0fdf4',
              color: '#166534',
              borderRadius: '8px',
              border: '1px solid #bbf7d0',
              fontSize: '13px',
              marginBottom: '16px',
            }}
          >
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: '#fef2f2',
              color: '#dc2626',
              borderRadius: '8px',
              border: '1px solid #fecaca',
              fontSize: '13px',
              marginBottom: '16px',
            }}
          >
            ⚠️ {errorMessage}
          </div>
        )}

        <form onSubmit={handleChangePassword}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
              Mevcut Şifre *
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: fieldErrors.currentPassword ? '1px solid #ef4444' : '1px solid #cbd5e1',
                fontSize: '14px',
                outline: 'none',
              }}
            />
            {fieldErrors.currentPassword && (
              <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{fieldErrors.currentPassword}</p>
            )}
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
              Yeni Şifre (en az 8 karakter) *
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: fieldErrors.newPassword ? '1px solid #ef4444' : '1px solid #cbd5e1',
                fontSize: '14px',
                outline: 'none',
              }}
            />
            {fieldErrors.newPassword && (
              <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{fieldErrors.newPassword}</p>
            )}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
              Yeni Şifre Tekrar *
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: fieldErrors.confirmPassword ? '1px solid #ef4444' : '1px solid #cbd5e1',
                fontSize: '14px',
                outline: 'none',
              }}
            />
            {fieldErrors.confirmPassword && (
              <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{fieldErrors.confirmPassword}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              padding: '10px 20px',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '14px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1,
            }}
          >
            {isLoading ? 'Güncelleniyor...' : 'Şifreyi Güncelle 🔑'}
          </button>
        </form>
      </div>

      {/* Hesap Bilgileri Özeti */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}
      >
        <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#0f172a', marginBottom: '16px' }}>
          👤 Hesap Bilgileri
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '14px' }}>
          <div>
            <span style={{ color: '#64748b', display: 'block', fontSize: '12px' }}>Ad Soyad</span>
            <span style={{ fontWeight: '500', color: '#1e293b' }}>{user.name}</span>
          </div>
          <div>
            <span style={{ color: '#64748b', display: 'block', fontSize: '12px' }}>Üniversite E-Postası</span>
            <span style={{ fontWeight: '500', color: '#1e293b' }}>{user.email}</span>
          </div>
          <div>
            <span style={{ color: '#64748b', display: 'block', fontSize: '12px' }}>Üniversite</span>
            <span style={{ fontWeight: '500', color: '#1e293b' }}>{user.university}</span>
          </div>
          <div>
            <span style={{ color: '#64748b', display: 'block', fontSize: '12px' }}>Bölüm</span>
            <span style={{ fontWeight: '500', color: '#1e293b' }}>{user.department}</span>
          </div>
        </div>

        <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', fontSize: '12px', color: '#64748b' }}>
          ℹ️ Üniversite e-posta adresi ve bölüm bilgileri sistem güvenliği ve akademik doğrulama kuralları gereği sabittir. Diğer profil bilgilerinizi <strong>Profil</strong> sekmesinden güncelleyebilirsiniz.
        </div>
      </div>
    </div>
  )
}
