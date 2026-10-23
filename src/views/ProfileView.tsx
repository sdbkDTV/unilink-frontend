import React, { useState, useEffect } from 'react'
import { User, ProjectCard as ProjectCardType } from '../types'
import { ProjectCard } from '../components/ProjectCard'
import { getMyProfile } from '../api'
import type { Profile } from '../api/types'

interface ProfileViewProps {
  user: User
  userProjects: ProjectCardType[]
  onInspect: (project: ProjectCardType) => void
}

export const ProfileView: React.FC<ProfileViewProps> = ({ user, userProjects, onInspect }) => {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getMyProfile()
      .then((p) => setProfile(p))
      .catch(() => setProfile(null))
      .finally(() => setLoading(false))
  }, [])

  // Backend'den gelen profil varsa onu kullan, yoksa parent'tan gelen user bilgisini göster
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
      <div className="profile-header-card">
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
