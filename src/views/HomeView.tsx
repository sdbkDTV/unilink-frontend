import React, { useState, useMemo, useRef } from 'react'
import { ProjectCard as ProjectCardType } from '../types'
import { ProjectCard } from '../components/ProjectCard'
import { useClickOutside } from '../hooks/useClickOutside'

interface HomeViewProps {
  projects: ProjectCardType[]
  savedProjectIds: (string | number)[]
  onToggleSave: (id: string | number) => void
  onInspect: (project: ProjectCardType) => void
}

export const HomeView: React.FC<HomeViewProps> = ({
  projects,
  savedProjectIds,
  onToggleSave,
  onInspect
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const filterRef = useRef<HTMLDivElement>(null)

  useClickOutside(filterRef, () => {
    if (isFilterOpen) setIsFilterOpen(false)
  })

  const departments = useMemo(() => {
    return Array.from(new Set(projects.map((p) => p.department)))
  }, [projects])

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const q = searchQuery.toLowerCase()
      const matchesSearch =
        project.title.toLowerCase().includes(q) ||
        project.technology.some((t) => t.toLowerCase().includes(q)) ||
        project.department.toLowerCase().includes(q)
      const matchesDept = selectedDepartment === 'all' || project.department === selectedDepartment
      return matchesSearch && matchesDept
    })
  }, [projects, searchQuery, selectedDepartment])

  return (
    <div>
      <div className="top-bar">
        <div ref={filterRef} style={{ position: 'relative' }}>
          <button className={`filter-btn ${selectedDepartment !== 'all' ? 'active' : ''}`} onClick={() => setIsFilterOpen(!isFilterOpen)}>
            Filtrele ⚙️ {selectedDepartment !== 'all' && `(${selectedDepartment})`}
          </button>
          {isFilterOpen && (
            <div className="filter-dropdown">
              <button className="popup-item" onClick={() => { setSelectedDepartment('all'); setIsFilterOpen(false); }}>
                Tüm Bölümler
              </button>
              {departments.map((dept) => (
                <button key={dept} className="popup-item" onClick={() => { setSelectedDepartment(dept); setIsFilterOpen(false); }}>
                  {dept}
                </button>
              ))}
            </div>
          )}
        </div>

        <input
          type="text"
          className="search-input"
          placeholder="Ara (Başlık, Teknoloji, Bölüm...)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="cards-grid">
        {filteredProjects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            isSaved={savedProjectIds.some((favId) => String(favId) === String(project.id))}
            onToggleSave={onToggleSave}
            onInspect={onInspect}
          />
        ))}
      </div>
    </div>
  )
}
