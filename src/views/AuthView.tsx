import React, { useState, FormEvent } from 'react'
import { User } from '../types'
import { TooltipInput } from '../components/TooltipInput'
import { authApi, getMyProfile, parseError } from '../api'

interface AuthViewProps {
  onSuccess: (user: User) => void
}

export const AuthView: React.FC<AuthViewProps> = ({ onSuccess }) => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [department, setDepartment] = useState('')
  const [university, setUniversity] = useState('')
  
  const [authErrors, setAuthErrors] = useState<{ [key: string]: string }>({})
  const [generalError, setGeneralError] = useState<string>('')
  const [successNotice, setSuccessNotice] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault()
    setGeneralError('')
    setSuccessNotice('')
    const errs: { [key: string]: string } = {}

    if (!email.trim()) errs.email = 'Lütfen e-posta adresinizi giriniz.'
    if (!password.trim()) errs.password = 'Lütfen şifrenizi giriniz.'

    if (Object.keys(errs).length > 0) {
      setAuthErrors(errs)
      return
    }

    setIsLoading(true)
    try {
      // 1. Backend'e giriş isteği atıyoruz
      await authApi.login(email.trim(), password)
      
      // 2. Giriş başarılıysa kendi profil bilgilerimizi çekiyoruz
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
    } catch (err: unknown) {
      const parsed = parseError(err)
      if (parsed.status === 0) {
        // Backend kapalıysa demo modunda devam et
        console.warn('Backend çevrimdışı, demo modunda giriş yapılıyor.')
        onSuccess({
          name: name || 'Öğrenci',
          email,
          department: department || 'Bilgisayar Mühendisliği',
          university: university || 'İstanbul Üniversitesi'
        })
      } else {
        setGeneralError(parsed.message)
        if (parsed.fieldErrors) {
          setAuthErrors(parsed.fieldErrors)
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault()
    setGeneralError('')
    setSuccessNotice('')
    const errs: { [key: string]: string } = {}

    if (!name.trim()) errs.name = 'Ad Soyad zorunludur.'
    if (!email.trim()) {
      errs.email = 'E-posta zorunludur.'
    } else if (!email.trim().endsWith('.edu.tr')) {
      errs.email = 'Kayıt için .edu.tr uzantılı bir üniversite e-postası gereklidir.'
    }
    if (!password.trim()) {
      errs.password = 'Şifre zorunludur.'
    } else if (password.length < 8) {
      errs.password = 'Şifre en az 8 karakter olmalıdır.'
    }
    if (!university.trim()) errs.university = 'Üniversite zorunludur.'
    if (!department.trim()) errs.department = 'Bölüm zorunludur.'

    if (Object.keys(errs).length > 0) {
      setAuthErrors(errs)
      return
    }

    setIsLoading(true)
    try {
      await authApi.register({
        email: email.trim().toLowerCase(),
        password,
        fullName: name.trim(),
        university: university.trim(),
        department: department.trim(),
      })
      
      setSuccessNotice(
        'Kayıt başarılı! Doğrulama e-postası gönderildi. Test için Mailpit arayüzünü (http://localhost:8025) kontrol edebilirsiniz.'
      )
      setAuthMode('login')
    } catch (err: unknown) {
      const parsed = parseError(err)
      if (parsed.status === 0) {
        // Backend çevrimdışıysa demo olarak devam et
        onSuccess({
          name: name.trim(),
          email: email.trim(),
          department: department.trim(),
          university: university.trim(),
        })
      } else {
        setGeneralError(parsed.message)
        if (parsed.fieldErrors) {
          setAuthErrors(parsed.fieldErrors)
        }
      }
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
            onClick={() => {
              setAuthMode('login')
              setAuthErrors({})
              setGeneralError('')
            }}
          >
            Giriş Yap
          </button>
          <button
            className={authMode === 'register' ? 'active' : ''}
            onClick={() => {
              setAuthMode('register')
              setAuthErrors({})
              setGeneralError('')
            }}
          >
            Kayıt Ol
          </button>
        </div>

        {generalError && (
          <div style={{
            padding: '10px 14px',
            backgroundColor: '#fef2f2',
            color: '#dc2626',
            borderRadius: '8px',
            fontSize: '13px',
            marginBottom: '14px',
            border: '1px solid #fecaca'
          }}>
            ⚠️ {generalError}
          </div>
        )}

        {successNotice && (
          <div style={{
            padding: '10px 14px',
            backgroundColor: '#f0fdf4',
            color: '#166534',
            borderRadius: '8px',
            fontSize: '13px',
            marginBottom: '14px',
            border: '1px solid #bbf7d0'
          }}>
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
