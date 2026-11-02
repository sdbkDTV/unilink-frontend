import React, { useState, useEffect, useRef } from 'react'
import { ProjectCard } from '../types'
import { useClickOutside } from '../hooks/useClickOutside'
import { getIncomingApplications, acceptApplication, rejectApplication, parseError } from '../api'
import type { IncomingApplication } from '../api/types'

interface IncomingApplicationsModalProps {
  project: ProjectCard
  onClose: () => void
  onActionComplete?: () => void
}

export const IncomingApplicationsModal: React.FC<IncomingApplicationsModalProps> = ({
  project,
  onClose,
  onActionComplete,
}) => {
  const modalRef = useRef<HTMLDivElement>(null)
  useClickOutside(modalRef, onClose)

  const [applications, setApplications] = useState<IncomingApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState<'PENDING' | 'ACCEPTED' | 'REJECTED' | 'ALL'>('PENDING')
  const [actionError, setActionError] = useState('')
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [roleSelectionAppId, setRoleSelectionAppId] = useState<string | null>(null)
  const [selectedRoleId, setSelectedRoleId] = useState<string>('')

  const fetchApplications = () => {
    if (typeof project.id !== 'string') {
      setLoading(false)
      return
    }
    setLoading(true)
    const statusParam = selectedTab === 'ALL' ? undefined : selectedTab
    getIncomingApplications(project.id, statusParam)
      .then((page) => {
        setApplications(page.content || [])
      })
      .catch((err) => {
        const parsed = parseError(err)
        setActionError(parsed.message)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchApplications()
  }, [project.id, selectedTab])

  const handleAccept = async (app: IncomingApplication) => {
    setActionError('')
    let roleIdToUse = selectedRoleId

    // Если у кандидата только одна выбранная роль, используем её автоматически
    if (!roleIdToUse && app.appliedRoles.length === 1) {
      roleIdToUse = app.appliedRoles[0].id
    }

    if (!roleIdToUse) {
      setRoleSelectionAppId(app.id)
      return
    }

    setProcessingId(app.id)
    try {
      await acceptApplication(app.id, roleIdToUse)
      setRoleSelectionAppId(null)
      setSelectedRoleId('')
      fetchApplications()
      if (onActionComplete) onActionComplete()
    } catch (err: unknown) {
      const parsed = parseError(err)
      setActionError(parsed.message)
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (appId: string) => {
    if (!window.confirm('Bu başvuruyu reddetmek istediğinize emin misiniz?')) return

    setActionError('')
    setProcessingId(appId)
    try {
      await rejectApplication(appId)
      fetchApplications()
      if (onActionComplete) onActionComplete()
    } catch (err: unknown) {
      const parsed = parseError(err)
      setActionError(parsed.message)
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content" ref={modalRef} style={{ maxWidth: '750px', maxHeight: '90vh', overflowY: 'auto' }}>
        <button className="modal-close-btn" onClick={onClose}>✕</button>

        <h2>📥 Gelen Başvurular</h2>
        <p style={{ color: '#6b7280', fontSize: '14px', margin: '4px 0 16px 0' }}>
          <strong>{project.title}</strong> ilanına yapılan başvurular
        </p>

        {/* Tab filtreleri */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' }}>
          {(['PENDING', 'ACCEPTED', 'REJECTED', 'ALL'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => { setSelectedTab(tab); setActionError(''); }}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: 'none',
                background: selectedTab === tab ? '#2563eb' : '#f3f4f6',
                color: selectedTab === tab ? 'white' : '#4b5563',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {tab === 'PENDING' && '⏳ Bekleyenler'}
              {tab === 'ACCEPTED' && '✅ Kabul Edilenler'}
              {tab === 'REJECTED' && '❌ Reddedilenler'}
              {tab === 'ALL' && 'Tümü'}
            </button>
          ))}
        </div>

        {actionError && (
          <div style={{
            margin: '12px 0',
            padding: '10px 14px',
            background: '#fef2f2',
            color: '#dc2626',
            borderRadius: '6px',
            fontSize: '13px',
            border: '1px solid #fecaca'
          }}>
            ⚠️ {actionError}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#6b7280' }}>
            ⏳ Başvurular yükleniyor...
          </div>
        ) : applications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#9ca3af', fontSize: '14px' }}>
            Bu kategoride başvuru bulunmuyor.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px' }}>
            {applications.map((app) => (
              <div
                key={app.id}
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '10px',
                  padding: '16px',
                  background: '#fafafa',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '16px', color: '#111827' }}>
                      👤 {app.applicant.fullName}
                    </h3>
                    <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#6b7280' }}>
                      {app.applicant.department} | {app.applicant.university}
                    </p>
                  </div>

                  {/* Durum Rozeti */}
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      padding: '4px 10px',
                      borderRadius: '12px',
                      background:
                        app.status === 'ACCEPTED' ? '#dcfce7' :
                        app.status === 'REJECTED' ? '#fee2e2' :
                        app.status === 'WITHDRAWN' ? '#f3f4f6' : '#fef9c3',
                      color:
                        app.status === 'ACCEPTED' ? '#166534' :
                        app.status === 'REJECTED' ? '#991b1b' :
                        app.status === 'WITHDRAWN' ? '#6b7280' : '#854d0e',
                    }}
                  >
                    {app.status === 'ACCEPTED' && 'Kabul Edildi'}
                    {app.status === 'REJECTED' && 'Reddedildi'}
                    {app.status === 'WITHDRAWN' && 'Geri Çekildi'}
                    {app.status === 'PENDING' && 'Beklemede'}
                  </span>
                </div>

                {/* İletişim Bilgileri (Kabul edilmişse e-posta görünür) */}
                {app.applicant.email && (
                  <div style={{ fontSize: '13px', color: '#1d4ed8', background: '#eff6ff', padding: '6px 10px', borderRadius: '6px' }}>
                    ✉️ İletişim: <strong>{app.applicant.email}</strong>
                  </div>
                )}

                {/* Bio */}
                {app.applicant.bio && (
                  <p style={{ fontSize: '13px', color: '#4b5563', margin: 0, fontStyle: 'italic' }}>
                    "{app.applicant.bio}"
                  </p>
                )}

                {/* Bağlantılar (GitHub / LinkedIn) */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {app.applicant.githubUrl && (
                    <a
                      href={app.applicant.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: '12px', color: '#2563eb', textDecoration: 'none' }}
                    >
                      🐙 GitHub ↗
                    </a>
                  )}
                  {app.applicant.linkedinUrl && (
                    <a
                      href={app.applicant.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: '12px', color: '#0077b5', textDecoration: 'none' }}
                    >
                      💼 LinkedIn ↗
                    </a>
                  )}
                </div>

                {/* Başvurduğu roller */}
                <div style={{ fontSize: '13px' }}>
                  <span style={{ color: '#6b7280' }}>Talip olduğu roller: </span>
                  {app.appliedRoles.map((r) => (
                    <span
                      key={r.id}
                      style={{
                        display: 'inline-block',
                        background: '#e0e7ff',
                        color: '#3730a3',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 500,
                        marginRight: '6px'
                      }}
                    >
                      {r.role}
                    </span>
                  ))}
                  {app.acceptedRole && (
                    <span style={{ color: '#166534', fontWeight: 600, marginLeft: '8px' }}>
                      (Yerleştirildi: {app.acceptedRole.role})
                    </span>
                  )}
                </div>

                {/* Mesaj */}
                {app.message && (
                  <div style={{
                    background: '#ffffff',
                    border: '1px solid #e5e7eb',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    color: '#374151'
                  }}>
                    <strong>Mesaj:</strong> {app.message}
                  </div>
                )}

                {/* Rol Seçim Açılır Alanı (Birden fazla role talip olduysa kabulde sor) */}
                {roleSelectionAppId === app.id && (
                  <div style={{
                    marginTop: '8px',
                    padding: '10px',
                    background: '#ecfdf5',
                    borderRadius: '8px',
                    border: '1px solid #a7f3d0'
                  }}>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: '#065f46', display: 'block', marginBottom: '6px' }}>
                      Kabul edilecek rolü seçin:
                    </label>
                    <select
                      value={selectedRoleId}
                      onChange={(e) => setSelectedRoleId(e.target.value)}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '6px',
                        border: '1px solid #10b981',
                        width: '100%',
                        fontSize: '13px',
                        marginBottom: '8px'
                      }}
                    >
                      <option value="">-- Rol Seçiniz --</option>
                      {app.appliedRoles.map(r => (
                        <option key={r.id} value={r.id}>{r.role}</option>
                      ))}
                    </select>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => handleAccept(app)}
                        disabled={!selectedRoleId || processingId === app.id}
                        style={{
                          padding: '6px 12px',
                          background: '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Onayla ve Kabul Et
                      </button>
                      <button
                        onClick={() => { setRoleSelectionAppId(null); setSelectedRoleId(''); }}
                        style={{
                          padding: '6px 12px',
                          background: 'white',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        İptal
                      </button>
                    </div>
                  </div>
                )}

                {/* Aksiyon butonları (Yalnızca beklemedeyse) */}
                {app.status === 'PENDING' && roleSelectionAppId !== app.id && (
                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                    <button
                      onClick={() => handleAccept(app)}
                      disabled={processingId === app.id}
                      style={{
                        padding: '8px 16px',
                        background: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      {processingId === app.id ? 'İşleniyor...' : '✅ Kabul Et'}
                    </button>
                    <button
                      onClick={() => handleReject(app.id)}
                      disabled={processingId === app.id}
                      style={{
                        padding: '8px 16px',
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      {processingId === app.id ? 'İşleniyor...' : '❌ Reddet'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
