import React, { useState, useRef } from 'react'
import { ProjectCard } from '../types'
import { useClickOutside } from '../hooks/useClickOutside'

interface ProjectDetailModalProps {
  project: ProjectCard | null
  currentUserId?: string
  currentUserName?: string
  onClose: () => void
  isSaved?: boolean
  onToggleSave?: (id: string | number) => void
  isApplied?: boolean
  onApply?: (project: ProjectCard, roleIds: string[], message?: string) => Promise<void> | void
  onOpenIncomingApplications?: (project: ProjectCard) => void
  onDeleteProject?: (id: string | number) => Promise<void> | void
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  project,
  currentUserId,
  currentUserName,
  onClose,
  isSaved = false,
  onToggleSave,
  isApplied = false,
  onApply,
  onOpenIncomingApplications,
  onDeleteProject,
}) => {
  const modalRef = useRef<HTMLDivElement>(null)
  useClickOutside(modalRef, onClose)

  const [isApplying, setIsApplying] = useState(false)
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  if (!project) return null

  const isOwner = (project.ownerId && project.ownerId === currentUserId) || 
                  (project.authorName && project.authorName === currentUserName)

  const handleRoleToggle = (roleId: string) => {
    if (selectedRoleIds.includes(roleId)) {
      setSelectedRoleIds(selectedRoleIds.filter(id => id !== roleId))
    } else {
      if (selectedRoleIds.length >= 5) {
        setErrorMsg('En fazla 5 rol seçebilirsiniz.')
        return
      }
      setErrorMsg('')
      setSelectedRoleIds([...selectedRoleIds, roleId])
    }
  }

  const handleSubmitApplication = async () => {
    if (project.roles && project.roles.length > 0 && selectedRoleIds.length === 0) {
      setErrorMsg('Lütfen başvurmak için en az bir rol seçin.')
      return
    }

    setLoading(true)
    setErrorMsg('')
    try {
      if (onApply) {
        await onApply(project, selectedRoleIds, message.trim() || undefined)
      }
      setIsApplying(false)
    } catch (err: any) {
      setErrorMsg(err?.message || 'Başvuru yapılırken bir hata oluştu.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content" ref={modalRef} style={{ maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
        <button className="modal-close-btn" onClick={onClose}>✕</button>

        <div style={{ display: 'flex', justifyContent: 'space-between', paddingRight: '30px', alignItems: 'center' }}>
          <h2>{project.title}</h2>
          {onToggleSave && (
            <button
              className="save-btn"
              onClick={() => onToggleSave(project.id)}
              title={isSaved ? 'Kaydedilenlerden Çıkar' : 'Kaydet'}
            >
              {isSaved ? '🔖' : '📑'}
            </button>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
          <div><strong>Bölüm:</strong> {project.department}</div>
          <div><strong>Şirket / Üniversite:</strong> {project.company}</div>
          <div><strong>İlan Sahibi:</strong> 👤 {project.authorName}</div>
          {project.deadline && (
            <div><strong>Son Tarih:</strong> 📅 {new Date(project.deadline).toLocaleDateString('tr-TR')}</div>
          )}
          {project.type && (
            <div><strong>Tür:</strong> <span className="tech-tag" style={{ background: '#e0e7ff', color: '#4338ca' }}>{project.type}</span></div>
          )}
        </div>

        <div style={{ marginTop: '14px' }}>
          <strong>Teknolojiler:</strong>
          <div className="tech-tags" style={{ marginTop: '6px' }}>
            {project.technology.map((tech, idx) => (
              <span key={idx} className="tech-tag">{tech}</span>
            ))}
          </div>
        </div>

        {/* Roller Bölümü */}
        {project.roles && project.roles.length > 0 && (
          <div style={{ marginTop: '16px' }}>
            <strong>Aranan Roller:</strong>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
              {project.roles.map((r) => {
                const isFull = r.remainingCount <= 0
                return (
                  <div
                    key={r.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      background: '#f9fafb',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 600 }}>{r.role}</span>
                      <span style={{ marginLeft: '8px', fontSize: '13px', color: isFull ? '#ef4444' : '#059669' }}>
                        {isFull ? '(Dolu)' : `(${r.remainingCount} kontenjan kaldı)`}
                      </span>
                    </div>

                    {isApplying && !isApplied && (
                      <input
                        type="checkbox"
                        disabled={isFull}
                        checked={selectedRoleIds.includes(r.id)}
                        onChange={() => handleRoleToggle(r.id)}
                        style={{ width: '18px', height: '18px', cursor: isFull ? 'not-allowed' : 'pointer' }}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div style={{ marginTop: '16px' }}>
          <strong>Açıklama:</strong>
          <p style={{ marginTop: '6px', color: '#4b5563', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
            {project.description}
          </p>
        </div>

        {/* Başvuru Formu Alanı */}
        {isApplying && !isApplied && (
          <div style={{
            marginTop: '20px',
            padding: '16px',
            background: '#f0fdf4',
            borderRadius: '10px',
            border: '1px solid #bbf7d0'
          }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#166534' }}>Başvuru Detayı</h4>
            <p style={{ fontSize: '13px', color: '#15803d', margin: '0 0 12px 0' }}>
              Yukarıdaki listeden ilgilendiğiniz rol(leri) seçin ve kendinizi kısaca tanıtın.
            </p>

            <textarea
              placeholder="Merhaba, bu projeye şu nedenlerle katılmak istiyorum..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={1000}
              rows={3}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid #86efac',
                fontFamily: 'inherit',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
            <div style={{ textAlign: 'right', fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
              {message.length}/1000
            </div>

            {errorMsg && (
              <div style={{ color: '#dc2626', fontSize: '13px', marginTop: '8px' }}>
                ⚠️ {errorMsg}
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <button
                className="submit-btn"
                style={{ flex: 1, padding: '10px' }}
                disabled={loading}
                onClick={handleSubmitApplication}
              >
                {loading ? 'Gönderiliyor...' : 'Başvuruyu Gönder 🚀'}
              </button>
              <button
                type="button"
                onClick={() => { setIsApplying(false); setErrorMsg(''); }}
                style={{
                  padding: '10px 16px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  background: 'white',
                  cursor: 'pointer'
                }}
              >
                Vazgeç
              </button>
            </div>
          </div>
        )}

        {/* Alt Butonlar */}
        {!isApplying && (
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            {isOwner ? (
              <div style={{ display: 'flex', gap: '8px', flex: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{
                  padding: '10px 14px',
                  background: '#f3f4f6',
                  color: '#6b7280',
                  borderRadius: '8px',
                  textAlign: 'center',
                  fontWeight: 500,
                  fontSize: '13px'
                }}>
                  👑 Sizin İlanınız
                </div>
                {onOpenIncomingApplications && (
                  <button
                    className="submit-btn"
                    style={{ flex: 1, backgroundColor: '#8b5cf6' }}
                    onClick={() => onOpenIncomingApplications(project)}
                  >
                    📥 Gelen Başvurular
                  </button>
                )}
                {onDeleteProject && (
                  <button
                    style={{
                      padding: '10px 14px',
                      background: '#fee2e2',
                      color: '#dc2626',
                      border: '1px solid #fecaca',
                      borderRadius: '8px',
                      fontWeight: 600,
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}
                    onClick={async () => {
                      if (window.confirm('Bu ilanı iptal etmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) {
                        await onDeleteProject(project.id)
                        onClose()
                      }
                    }}
                  >
                    🗑️ İlanı İptal Et
                  </button>
                )}
              </div>
            ) : isApplied ? (
              <button
                className="submit-btn"
                style={{ flex: 1, backgroundColor: '#10b981', cursor: 'default' }}
                disabled
              >
                ✅ Başvuru Yapıldı
              </button>
            ) : (
              <button
                className="submit-btn"
                style={{ flex: 1, backgroundColor: '#2563eb' }}
                onClick={() => {
                  if (project.roles && project.roles.length > 0) {
                    setIsApplying(true)
                  } else if (onApply) {
                    onApply(project, [], 'Projeye katılmak istiyorum.')
                  }
                }}
              >
                ✉️ İletişime Geç / Başvur
              </button>
            )}

            <button
              onClick={onClose}
              style={{
                padding: '12px 20px',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                cursor: 'pointer',
                background: '#f9fafb'
              }}
            >
              Kapat
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
