import React from 'react'
import { ProjectCard as ProjectCardType } from '../types'

interface ProjectCardProps {
  project: ProjectCardType
  isSaved?: boolean
  onToggleSave?: (id: string | number) => void
  onInspect?: (project: ProjectCardType) => void
  showFullDetails?: boolean
  customAction?: React.ReactNode
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  isSaved = false,
  onToggleSave,
  onInspect,
  showFullDetails = true,
  customAction
}) => {
  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">{project.title}</h3>
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

      {showFullDetails && (
        <>
          <div className="card-field"><strong>Bölüm:</strong> {project.department}</div>
          <div className="card-field">
            <strong>Teknoloji:</strong>
            <div className="tech-tags">
              {project.technology.map((tech, idx) => (
                <span key={idx} className="tech-tag">{tech}</span>
              ))}
            </div>
          </div>
          <div className="card-field"><strong>Şirket / Üniversite:</strong> {project.company}</div>
        </>
      )}

      <p className="card-description"><strong>Açıklama:</strong> {project.description}</p>

      {customAction ? (
        <div style={{ marginTop: '8px' }}>{customAction}</div>
      ) : (
        <div className="card-footer">
          <span className="author-badge">👤 {project.authorName}</span>
          {onInspect && (
            <button className="inspect-btn" onClick={() => onInspect(project)}>
              İncele
            </button>
          )}
        </div>
      )}
    </div>
  )
}
