import React, { useState, useEffect, FormEvent } from 'react'
import { User } from '../types'
import { TooltipInput } from '../components/TooltipInput'
import { authApi, getMyProfile, parseError } from '../api'

interface AuthViewProps {
  onSuccess: (user: User) => void
}

export const AuthView: React.FC<AuthViewProps> = ({ onSuccess }) => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')

  // Form fields (kayıt sonrasında yazılan bilgilerin silinmemesi için localStorage desteği)
  const [email, setEmail] = useState(() => localStorage.getItem('unilink_remember_email') || '')
  const [password, setPassword] = useState(() => localStorage.getItem('unilink_remember_password') || '')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [department, setDepartment] = useState('')
  const [university, setUniversity] = useState('')

  // State management
  const [authErrors, setAuthErrors] = useState<Record<string, string>>({})
  const [generalError, setGeneralError] = useState<string>('')
  const [successNotice, setSuccessNotice] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  // Sayfa yüklendiğinde doğrulama durumunu veya kayıt bildirimlerini kontrol et
  useEffect(() => {
    const checkStoredCredentialsAndNotices = () => {
      const verifySuccess = sessionStorage.getItem('verify_success') || localStorage.getItem('verify_success')
      const verifyError = sessionStorage.getItem('verify_error') || localStorage.getItem('verify_error')

      const savedEmail = localStorage.getItem('unilink_remember_email')
      const savedPass = localStorage.getItem('unilink_remember_password')

      if (savedEmail) setEmail(savedEmail)
      if (savedPass) setPassword(savedPass)

      if (verifySuccess) {
        setSuccessNotice('🎉 Hesabınız başarıyla doğrulandı! Bilgileriniz hazır, doğrudan giriş yapabilirsiniz.')
        sessionStorage.removeItem('verify_success')
        localStorage.removeItem('verify_success')
        setAuthMode('login')
      } else if (verifyError) {
        setGeneralError(verifyError)
        sessionStorage.removeItem('verify_error')
        localStorage.removeItem('verify_error')
      }
    }

    checkStoredCredentialsAndNotices()

    // Başka sekmede doğrulama tamamlandığında da senkronize ol
    window.addEventListener('storage', checkStoredCredentialsAndNotices)
    return () => window.removeEventListener('storage', checkStoredCredentialsAndNotices)
  }, [])

  const resetErrorsAndNotices = () => {
    setAuthErrors({})
    setGeneralError('')
    setSuccessNotice('')
  }

  const switchMode = (mode: 'login' | 'register') => {
    setAuthMode(mode)
    resetErrorsAndNotices()
  }

  // Handle errors coming from Spring Boot validation
  const handleApiError = (err: unknown) => {
    const parsed = parseError(err)

    if (parsed.status === 0) {
      setGeneralError('Sunucuya ulaşılamadı. Backend servisinin (http://localhost:8080) çalıştığından emin olun.')
      return
    }

    setGeneralError(parsed.message)

    if (parsed.fieldErrors) {
      const mappedErrors: Record<string, string> = { ...parsed.fieldErrors }

      // Backend returns 'fullName', map it to 'name' for the UI
      if (mappedErrors.fullName) {
        mappedErrors.name = mappedErrors.fullName
        delete mappedErrors.fullName
      }

      setAuthErrors(mappedErrors)
    }
  }

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault()
    resetErrorsAndNotices()

    const trimmedEmail = email.trim()
    const errs: Record<string, string> = {}

    if (!trimmedEmail) {
      errs.email = 'Lütfen e-posta adresinizi giriniz.'
    } else if (!trimmedEmail.includes('@')) {
      errs.email = 'Geçerli bir e-posta adresi giriniz.'
    }

    if (!password.trim()) {
      errs.password = 'Lütfen şifrenizi giriniz.'
    }

    if (Object.keys(errs).length > 0) {
      setAuthErrors(errs)
      return
    }

    setIsLoading(true)
    try {
      await authApi.login(trimmedEmail, password)
      const profile = await getMyProfile()

      // Giriş başarılı olunca geçici hafızayı temizle
      localStorage.removeItem('unilink_remember_email')
      localStorage.removeItem('unilink_remember_password')

      onSuccess({
        id: profile.userId,
        name: profile.fullName,
        email: profile.email,
        department: profile.department,
        university: profile.university,
        bio: profile.bio,
        githubUrl: profile.githubUrl,
        linkedinUrl: profile.linkedinUrl,
      })
    } catch (err) {
      handleApiError(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault()
    resetErrorsAndNotices()

    const trimmedEmail = email.trim().toLowerCase()
    const trimmedName = name.trim()
    const trimmedUniversity = university.trim()
    const trimmedDepartment = department.trim()

    const errs: Record<string, string> = {}

    if (!trimmedName) errs.name = 'Ad Soyad zorunludur.'

    if (!trimmedEmail) {
      errs.email = 'E-posta adresi zorunludur.'
    } else if (!trimmedEmail.includes('@')) {
      errs.email = 'Geçerli bir e-posta adresi giriniz (örneğin: isim@fsm.edu.tr).'
    } else if (!trimmedEmail.endsWith('.edu.tr')) {
      errs.email = 'Kayıt için .edu.tr uzantılı bir üniversite e-postası gereklidir.'
    }

    if (!password.trim()) {
      errs.password = 'Şifre zorunludur.'
    } else if (password.length < 8) {
      errs.password = 'Şifre en az 8 karakter olmalıdır.'
    }

    if (!confirmPassword.trim()) {
      errs.confirmPassword = 'Şifre tekrarı zorunludur.'
    } else if (password !== confirmPassword) {
      errs.confirmPassword = 'Şifreler birbiriyle eşleşmiyor.'
    }

    if (!trimmedUniversity) errs.university = 'Üniversite zorunludur.'
    if (!trimmedDepartment) errs.department = 'Bölüm zorunludur.'

    if (Object.keys(errs).length > 0) {
      setAuthErrors(errs)
      return
    }

    setIsLoading(true)
    try {
      await authApi.register({
        email: trimmedEmail,
        password,
        fullName: trimmedName,
        university: trimmedUniversity,
        department: trimmedDepartment,
      })

      // Kayıt edilen bilgileri giriş ekranında hazır olması için sakla
      localStorage.setItem('unilink_remember_email', trimmedEmail)
      localStorage.setItem('unilink_remember_password', password)

      setSuccessNotice(
        'Kayıt başarılı! Doğrulama e-postası gönderildi. Mailpit arayüzünü (http://localhost:8025) kontrol edebilirsiniz.'
      )
      setAuthMode('login')
    } catch (err) {
      handleApiError(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <h1>🔗 UniLink</h1>
          <p>Proje ve Etkinlik Bulma Platformu</p>
        </div>

        <div className="auth-toggle">
          <button
            className={authMode === 'login' ? 'active' : ''}
            onClick={() => switchMode('login')}
            type="button"
          >
            Giriş Yap
          </button>
          <button
            className={authMode === 'register' ? 'active' : ''}
            onClick={() => switchMode('register')}
            type="button"
          >
            Kayıt Ol
          </button>
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

        {successNotice && (
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: '#f0fdf4',
              color: '#166534',
              borderRadius: '8px',
              fontSize: '13px',
              marginBottom: '14px',
              border: '1px solid #bbf7d0',
            }}
          >
            ✉️ {successNotice}
          </div>
        )}

        {authMode === 'login' ? (
          <form onSubmit={handleLogin} className="auth-form" noValidate>
            <TooltipInput
              label="Üniversite E-Posta Adresi"
              name="email"
              type="email"
              autoComplete="username"
              placeholder="ornek@ogrenci.edu.tr"
              value={email}
              onChange={setEmail}
              error={authErrors.email}
              required
            />
            <TooltipInput
              label="Şifre"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={setPassword}
              error={authErrors.password}
              required
            />
            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading ? 'Giriş Yapılıyor...' : 'Giriş Yap 🚀'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="auth-form" noValidate>
            <TooltipInput
              label="Ad Soyad"
              name="name"
              placeholder="Ahmet Yılmaz"
              value={name}
              onChange={setName}
              error={authErrors.name}
              required
            />
            <TooltipInput
              label="Üniversite E-Posta (.edu.tr)"
              name="email"
              type="email"
              autoComplete="username"
              placeholder="ornek@ogrenci.edu.tr"
              value={email}
              onChange={setEmail}
              error={authErrors.email}
              required
            />
            <TooltipInput
              label="Üniversite"
              name="university"
              placeholder="İstanbul Üniversitesi"
              value={university}
              onChange={setUniversity}
              error={authErrors.university}
              required
            />
            <TooltipInput
              label="Bölüm"
              name="department"
              placeholder="Bilgisayar Mühendisliği"
              value={department}
              onChange={setDepartment}
              error={authErrors.department}
              required
            />
            <TooltipInput
              label="Şifre (en az 8 karakter)"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={password}
              onChange={setPassword}
              error={authErrors.password}
              required
            />
            <TooltipInput
              label="Şifre Tekrar"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={setConfirmPassword}
              error={authErrors.confirmPassword}
              required
            />
            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading ? 'Kayıt Olunuyor...' : 'Kayıt Ol ve Başla ✨'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}