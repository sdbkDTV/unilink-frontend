import React, { useState, useEffect } from 'react'
import { User, ProjectCard as ProjectCardType } from '../types'
import { ProjectCard } from '../components/ProjectCard'
import { getMyProfile, updateMyProfile, updateMyTechnologies, parseError } from '../api'
import type { Profile } from '../api/types'

interface ProfileViewProps {
  user: User
  userProjects: ProjectCardType[]
  onInspect: (project: ProjectCardType) => void
  onUserUpdated?: (updated: User) => void
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  userProjects,
  onInspect,
  onUserUpdated,
}) => {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Edit form states
  const [fullName, setFullName] = useState('')
  const [university, setUniversity] = useState('')
  const [department, setDepartment] = useState('')
  const [bio, setBio] = useState('')
  const [githubUrl, setGithubUrl] = useState('')
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [techList, setTechList] = useState<string[]>([])
  const [techInput, setTechInput] = useState('')

  const fetchProfile = () => {
    setLoading(true)
    getMyProfile()
      .then((p) => {
        setProfile(p)
        setFullName(p.fullName || '')
        setUniversity(p.university || '')
        setDepartment(p.department || '')
        setBio(p.bio || '')
        setGithubUrl(p.githubUrl || '')
        setLinkedinUrl(p.linkedinUrl || '')
        setTechList(p.technologies?.map((t) => t.name) || [])
      })
      .catch(() => {
        setProfile(null)
        setFullName(user.name)
        setUniversity(user.university)
        setDepartment(user.department)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  const handleAddTech = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && techInput.trim()) {
      e.preventDefault()
      const trimmed = techInput.trim()
      if (!techList.some((t) => t.toLowerCase() === trimmed.toLowerCase())) {
        if (techList.length >= 20) {
          setErrorMsg('En fazla 20 teknoloji ekleyebilirsiniz.')
          return
        }
        setTechList([...techList, trimmed])
      }
      setTechInput('')
    }
  }

  const handleRemoveTech = (indexToRemove: number) => {
    setTechList(techList.filter((_, idx) => idx !== indexToRemove))
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')

    if (!fullName.trim() || !university.trim() || !department.trim()) {
      setErrorMsg('Ad Soyad, Üniversite ve Bölüm alanları zorunludur.')
      return
    }

    if (githubUrl.trim() && !githubUrl.trim().startsWith('https://github.com/')) {
      setErrorMsg('GitHub bağlantısı "https://github.com/..." ile başlamalıdır.')
      return
    }

    if (
      linkedinUrl.trim() &&
      !linkedinUrl.trim().startsWith('https://linkedin.com/') &&
      !linkedinUrl.trim().startsWith('https://www.linkedin.com/')
    ) {
      setErrorMsg('LinkedIn bağlantısı "https://linkedin.com/..." ile başlamalıdır.')
      return
    }

    setSaving(true)
    try {
      // 1. Profil temel bilgilerini güncelle
      const updatedProfile = await updateMyProfile({
        fullName: fullName.trim(),
        university: university.trim(),
        department: department.trim(),
        bio: bio.trim() || null,
        githubUrl: githubUrl.trim() || null,
        linkedinUrl: linkedinUrl.trim() || null,
      })

      // 2. Teknolojileri güncelle
      await updateMyTechnologies(techList)

      setProfile({
        ...updatedProfile,
        technologies: techList.map((name, idx) => ({ id: String(idx), name })),
      })

      if (onUserUpdated) {
        onUserUpdated({
          id: updatedProfile.userId,
          name: updatedProfile.fullName,
          email: updatedProfile.email,
          department: updatedProfile.department,
          university: updatedProfile.university,
          bio: updatedProfile.bio,
          githubUrl: updatedProfile.githubUrl,
          linkedinUrl: updatedProfile.linkedinUrl,
        })
      }

      setSuccessMsg('Profil bilgileriniz başarıyla güncellendi! 🎉')
      setIsEditing(false)
    } catch (err: unknown) {
      const parsed = parseError(err)
      setErrorMsg(parsed.message)
    } finally {
      setSaving(false)
    }
  }

  const displayName = profile?.fullName ?? user.name
  const displayEmail = profile?.email ?? user.email
  const displayDepartment = profile?.department ?? user.department
  const displayUniversity = profile?.university ?? user.university
  const displayBio = profile?.bio ?? user.bio ?? null
  const displayGithub = profile?.githubUrl ?? user.githubUrl ?? null
  const displayLinkedin = profile?.linkedinUrl ?? user.linkedinUrl ?? null
  const displayTechnologies = profile?.technologies ?? []

  if (loading) {
    return (
      <div className="profile-container" style={{ textAlign: 'center', padding: '60px 0' }}>
        <p style={{ color: '#888', fontSize: '16px' }}>⏳ Profil bilgileri yükleniyor…</p>
      </div>
    )
  }

  return (
    <div className="profile-container">
      {successMsg && (
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: '#f0fdf4',
            color: '#166534',
            borderRadius: '8px',
            fontSize: '14px',
            marginBottom: '16px',
            border: '1px solid #bbf7d0',
          }}
        >
          {successMsg}
        </div>
      )}

      {isEditing ? (
        /* Profil Düzenleme Formu */
        <div className="profile-header-card" style={{ textAlign: 'left', padding: '28px' }}>
          <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>✏️ Profili Düzenle</h2>

          {errorMsg && (
            <div
              style={{
                padding: '10px 14px',
                backgroundColor: '#fef2f2',
                color: '#dc2626',
                borderRadius: '8px',
                fontSize: '13px',
                marginBottom: '16px',
                border: '1px solid #fecaca',
              }}
            >
              ⚠️ {errorMsg}
            </div>
          )}

          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>Ad Soyad *</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  marginTop: '4px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>Üniversite *</label>
                <input
                  type="text"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    marginTop: '4px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>Bölüm *</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    marginTop: '4px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>
                Hakkımda / Bio (en fazla 500 karakter)
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={500}
                rows={3}
                placeholder="Kendinizden, ilgi alanlarınızdan ve hedeflerinizden bahsedin..."
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  marginTop: '4px',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>GitHub URL</label>
                <input
                  type="url"
                  placeholder="https://github.com/kullaniciadi"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    marginTop: '4px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>LinkedIn URL</label>
                <input
                  type="url"
                  placeholder="https://linkedin.com/in/kullaniciadi"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    marginTop: '4px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>
                Teknolojiler & Yetenekler (Yazıp Enter'a basın)
              </label>
              <input
                type="text"
                placeholder="Örn: React, Node.js, Python, Docker..."
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyDown={handleAddTech}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  marginTop: '4px',
                  boxSizing: 'border-box',
                }}
              />
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                {techList.map((tech, idx) => (
                  <span
                    key={idx}
                    style={{
                      background: '#ede9fe',
                      color: '#6d28d9',
                      padding: '4px 10px',
                      borderRadius: '16px',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    {tech}
                    <button
                      type="button"
                      onClick={() => handleRemoveTech(idx)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#8b5cf6',
                        fontWeight: 'bold',
                        padding: 0,
                      }}
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              <button
                type="submit"
                className="submit-btn"
                disabled={saving}
                style={{ flex: 1, padding: '12px' }}
              >
                {saving ? 'Kaydediliyor...' : '💾 Değişiklikleri Kaydet'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false)
                  setErrorMsg('')
                }}
                style={{
                  padding: '12px 20px',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  background: '#f9fafb',
                  cursor: 'pointer',
                }}
              >
                Vazgeç
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Profil Görüntüleme Kartı */
        <div className="profile-header-card">
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={() => {
                setIsEditing(true)
                setErrorMsg('')
                setSuccessMsg('')
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                background: '#f3f4f6',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 600,
                color: '#374151',
              }}
            >
              ✏️ Profili Düzenle
            </button>
          </div>

          <div className="profile-avatar">🎓</div>
          <h2>{displayName}</h2>
          <p className="profile-sub">{displayDepartment} | {displayUniversity}</p>
          <p className="profile-email">✉️ {displayEmail}</p>

          {displayBio && (
            <p style={{ marginTop: '12px', color: '#555', fontSize: '14px', lineHeight: '1.5' }}>
              {displayBio}
            </p>
          )}

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '16px', flexWrap: 'wrap' }}>
            {displayGithub && (
              <a
                href={displayGithub}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  background: '#24292e',
                  color: 'white',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontSize: '13px',
                  fontWeight: 500,
                }}
              >
                🐙 GitHub
              </a>
            )}
            {displayLinkedin && (
              <a
                href={displayLinkedin}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  background: '#0077b5',
                  color: 'white',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontSize: '13px',
                  fontWeight: 500,
                }}
              >
                💼 LinkedIn
              </a>
            )}
          </div>

          {displayTechnologies.length > 0 && (
            <div style={{ marginTop: '16px' }}>
              <p style={{ fontSize: '13px', color: '#888', marginBottom: '8px' }}>Teknolojiler</p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                {displayTechnologies.map((tech) => (
                  <span
                    key={tech.id}
                    style={{
                      background: 'linear-gradient(135deg, #667eea33, #764ba233)',
                      color: '#5b4a9e',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 500,
                    }}
                  >
                    {tech.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="profile-section">
        <h3>Oluşturduğum İlanlar ({userProjects.length})</h3>
        <div className="cards-grid" style={{ marginTop: '16px' }}>
          {userProjects.map((project) => (
            <ProjectCard key={project.id} project={project} onInspect={onInspect} />
          ))}
          {userProjects.length === 0 && (
            <p style={{ color: '#999', fontSize: '14px' }}>Henüz bir ilan oluşturmadınız.</p>
          )}
        </div>
      </div>
    </div>
  )
}
