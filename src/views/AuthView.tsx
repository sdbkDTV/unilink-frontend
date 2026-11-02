import React, { useState, useEffect, FormEvent } from 'react'
import { User } from '../types'
import { TooltipInput } from '../components/TooltipInput'
import { authApi, getMyProfile, parseError } from '../api'

interface AuthViewProps {
  onSuccess: (user: User) => void
}

export const AuthView: React.FC<AuthViewProps> = ({ onSuccess }) => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')

  // --- Giriş Formu Alanları ---
  const [loginEmail, setLoginEmail] = useState(() => localStorage.getItem('unilink_remember_email') || '')
  const [loginPassword, setLoginPassword] = useState(() => localStorage.getItem('unilink_remember_password') || '')

  // --- Kayıt Formu Alanları (Her zaman sıfırdan boş başlar) ---
  const [registerName, setRegisterName] = useState('')
  const [registerEmail, setRegisterEmail] = useState('')
  const [registerUniversity, setRegisterUniversity] = useState('')
  const [registerDepartment, setRegisterDepartment] = useState('')
  const [registerPassword, setRegisterPassword] = useState('')
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('')

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

      if (savedEmail) setLoginEmail(savedEmail)
      if (savedPass) setLoginPassword(savedPass)

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
    // Kayıt sekmesine geçildiğinde kayıt formunu tamamen temizle
    if (mode === 'register') {
      setRegisterName('')
      setRegisterEmail('')
      setRegisterUniversity('')
      setRegisterDepartment('')
      setRegisterPassword('')
      setRegisterConfirmPassword('')
    }
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

    const trimmedEmail = loginEmail.trim()
    const errs: Record<string, string> = {}

    if (!trimmedEmail) {
      errs.email = 'Lütfen e-posta adresinizi giriniz.'
    } else if (!trimmedEmail.includes('@')) {
      errs.email = 'Geçerli bir e-posta adresi giriniz.'
    }

    if (!loginPassword.trim()) {
      errs.password = 'Lütfen şifrenizi giriniz.'
    }

    if (Object.keys(errs).length > 0) {
      setAuthErrors(errs)
      return
    }

    setIsLoading(true)
    try {
      await authApi.login(trimmedEmail, loginPassword)
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

    const trimmedEmail = registerEmail.trim().toLowerCase()
    const trimmedName = registerName.trim()
    const trimmedUniversity = registerUniversity.trim()
    const trimmedDepartment = registerDepartment.trim()

    const errs: Record<string, string> = {}

    if (!trimmedName) errs.name = 'Ad Soyad zorunludur.'

    if (!trimmedEmail) {
      errs.email = 'E-posta adresi zorunludur.'
    } else if (!trimmedEmail.includes('@')) {
      errs.email = 'Geçerli bir e-posta adresi giriniz (örneğin: isim@fsm.edu.tr).'
    } else if (!trimmedEmail.endsWith('.edu.tr')) {
      errs.email = 'Kayıt için .edu.tr uzantılı bir üniversite e-postası gereklidir.'
    }

    if (!registerPassword.trim()) {
      errs.password = 'Şifre zorunludur.'
    } else if (registerPassword.length < 8) {
      errs.password = 'Şifre en az 8 karakter olmalıdır.'
    }

    if (!registerConfirmPassword.trim()) {
      errs.confirmPassword = 'Şifre tekrarı zorunludur.'
    } else if (registerPassword !== registerConfirmPassword) {
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
        password: registerPassword,
        fullName: trimmedName,
        university: trimmedUniversity,
        department: trimmedDepartment,
      })

      // Kayıt edilen bilgileri giriş ekranında hazır olması için sakla
      localStorage.setItem('unilink_remember_email', trimmedEmail)
      localStorage.setItem('unilink_remember_password', registerPassword)
      setLoginEmail(trimmedEmail)
      setLoginPassword(registerPassword)

      // Kayıt formunu sıfırla
      setRegisterName('')
      setRegisterEmail('')
      setRegisterUniversity('')
      setRegisterDepartment('')
      setRegisterPassword('')
      setRegisterConfirmPassword('')

      setSuccessNotice(
        'Kayıt başarılı! E-posta adresinize bir doğrulama bağlantısı gönderildi. Lütfen gelen kutunuzu (Mailpit) kontrol edip onayladıktan sonra giriş yapın.'
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
              name="login_email"
              type="email"
              autoComplete="username"
              placeholder="ornek@ogrenci.edu.tr"
              value={loginEmail}
              onChange={setLoginEmail}
              error={authErrors.email}
              required
            />
            <TooltipInput
              label="Şifre"
              name="login_password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={loginPassword}
              onChange={setLoginPassword}
              error={authErrors.password}
              required
            />
            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading ? 'Giriş Yapılıyor...' : 'Giriş Yap 🚀'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="auth-form" noValidate autoComplete="off">
            {/* Яндекс/Хром ловушка: перехватывает автоматическое автозаполнение браузера */}
            <input type="text" name="fake_username_trap" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />
            <input type="password" name="fake_password_trap" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />

            <TooltipInput
              label="Ad Soyad"
              name="reg_fullname_unique"
              placeholder="Ahmet Yılmaz"
              value={registerName}
              onChange={setRegisterName}
              error={authErrors.name}
              autoComplete="new-fullname-field"
              required
            />
            <TooltipInput
              label="Üniversite E-Posta (.edu.tr)"
              name="reg_email_student_unique"
              type="text"
              inputMode="email"
              placeholder="ornek@ogrenci.edu.tr"
              value={registerEmail}
              onChange={setRegisterEmail}
              error={authErrors.email}
              autoComplete="new-student-email-address"
              required
            />
            <TooltipInput
              label="Üniversite"
              name="reg_university_unique"
              placeholder="İstanbul Üniversitesi"
              value={registerUniversity}
              onChange={setRegisterUniversity}
              error={authErrors.university}
              autoComplete="new-university-field"
              required
            />
            <TooltipInput
              label="Bölüm"
              name="reg_department_unique"
              placeholder="Bilgisayar Mühendisliği"
              value={registerDepartment}
              onChange={setRegisterDepartment}
              error={authErrors.department}
              autoComplete="new-department-field"
              required
            />
            <TooltipInput
              label="Şifre (en az 8 karakter)"
              name="reg_password_unique"
              type="password"
              placeholder="••••••••"
              value={registerPassword}
              onChange={setRegisterPassword}
              error={authErrors.password}
              autoComplete="new-password"
              required
            />
            <TooltipInput
              label="Şifre Tekrar"
              name="reg_confirm_password_unique"
              type="password"
              placeholder="••••••••"
              value={registerConfirmPassword}
              onChange={setRegisterConfirmPassword}
              error={authErrors.confirmPassword}
              autoComplete="new-password"
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
