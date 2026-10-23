import React, { useRef } from 'react'
import { ProjectCard } from '../types'
import { useClickOutside } from '../hooks/useClickOutside'

interface ProjectDetailModalProps {
  project: ProjectCard | null
  onClose: () => void
  isSaved?: boolean
  onToggleSave?: (id: string | number) => void
  isApplied?: boolean
  onApply?: (project: ProjectCard) => void
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  project,
  onClose,
  isSaved = false,
  onToggleSave,
  isApplied = false,
  onApply,
}) => {
  const modalRef = useRef<HTMLDivElement>(null)
  useClickOutside(modalRef, onClose)

  if (!project) return null

  return (
    <div className="modal-overlay">
      <div className="modal-content" ref={modalRef}>
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div><strong>Bölüm:</strong> {project.department}</div>
          <div><strong>Şirket / Üniversite:</strong> {project.company}</div>
          <div><strong>Yazar:</strong> 👤 {project.authorName}</div>
          {project.deadline && (
            <div><strong>Son Tarih:</strong> 📅 {new Date(project.deadline).toLocaleDateString('tr-TR')}</div>
          )}
        </div>

        <div>
          <strong>Teknolojiler:</strong>
          <div className="tech-tags" style={{ marginTop: '6px' }}>
            {project.technology.map((tech, idx) => (
              <span key={idx} className="tech-tag">{tech}</span>
            ))}
          </div>
        </div>

        <div>
          <strong>Açıklama:</strong>
          <p style={{ marginTop: '6px', color: '#4b5563', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
            {project.description}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
          <button
            className="submit-btn"
            style={{
              flex: 1,
              backgroundColor: isApplied ? '#10b981' : '#2563eb',
              cursor: isApplied ? 'default' : 'pointer',
            }}
            disabled={isApplied}
            onClick={() => {
              if (!isApplied && onApply && project) {
                onApply(project)
              }
            }}
          >
            {isApplied ? '✅ Başvuru Yapıldı' : '✉️ İletişime Geç / Başvur'}
          </button>
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
      </div>
    </div>
  )
}
