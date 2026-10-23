import React, { useState, FormEvent } from 'react'
import { User } from '../types'
import { TooltipInput } from '../components/TooltipInput'
import { authApi, getMyProfile, parseError } from '../api'

interface AuthViewProps {
  onSuccess: (user: User) => void
}

export const AuthView: React.FC<AuthViewProps> = ({ onSuccess }) => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  
  // Form fields
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [department, setDepartment] = useState('')
  const [university, setUniversity] = useState('')

  // State management
  const [authErrors, setAuthErrors] = useState<Record<string, string>>({})
  const [generalError, setGeneralError] = useState<string>('')
  const [successNotice, setSuccessNotice] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

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
      // Offline / Demo fallback
      console.warn('Backend çevrimdışı, demo modunda devam ediliyor.')
      onSuccess({
        name: name.trim() || 'Öğrenci',
        email: email.trim(),
        department: department.trim() || 'Bilgisayar Mühendisliği',
        university: university.trim() || 'İstanbul Üniversitesi',
      })
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
              type="email"
              placeholder="ornek@ogrenci.edu.tr"
              value={email}
              onChange={setEmail}
              error={authErrors.email}
              required
            />
            <TooltipInput
              label="Şifre"
              type="password"
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
              placeholder="Ahmet Yılmaz"
              value={name}
              onChange={setName}
              error={authErrors.name}
              required
            />
            <TooltipInput
              label="Üniversite E-Posta (.edu.tr)"
              type="email"
              placeholder="ornek@ogrenci.edu.tr"
              value={email}
              onChange={setEmail}
              error={authErrors.email}
              required
            />
            <TooltipInput
              label="Üniversite"
              placeholder="İstanbul Üniversitesi"
              value={university}
              onChange={setUniversity}
              error={authErrors.university}
              required
            />
            <TooltipInput
              label="Bölüm"
              placeholder="Bilgisayar Mühendisliği"
              value={department}
              onChange={setDepartment}
              error={authErrors.department}
              required
            />
            <TooltipInput
              label="Şifre (en az 8 karakter)"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={setPassword}
              error={authErrors.password}
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