import React from 'react'
import { ProjectCard as ProjectCardType } from '../types'
import { ProjectCard } from '../components/ProjectCard'

interface SavedProjectsViewProps {
  savedProjects: ProjectCardType[]
  onToggleSave: (id: string | number) => void
  onInspect: (project: ProjectCardType) => void
}

export const SavedProjectsView: React.FC<SavedProjectsViewProps> = ({
  savedProjects,
  onToggleSave,
  onInspect
}) => {
  return (
    <div>
      <h2 style={{ marginBottom: '20px' }}>🔖 Kaydedilen İlanlar ({savedProjects.length})</h2>
      {savedProjects.length > 0 ? (
        <div className="cards-grid">
          {savedProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              isSaved={true}
              onToggleSave={onToggleSave}
              onInspect={onInspect}
            />
          ))}
        </div>
      ) : (
        <div className="empty-placeholder">Henüz kaydedilmiş bir ilan bulunmamaktadır.</div>
      )}
    </div>
  )
}
