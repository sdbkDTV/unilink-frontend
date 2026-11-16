import React, { useState, useEffect } from 'react'
import { ProjectCard as ProjectCardType } from '../types'
import { getMyPostings, MyPosting, parseError } from '../api'

interface MyPostingsViewProps {
  currentUserId?: string
  currentUserName: string
  allProjects: ProjectCardType[]
  onInspect: (project: ProjectCardType) => void
  onOpenIncomingApplications: (project: ProjectCardType) => void
  onDeleteProject: (id: string | number) => void
}

export const MyPostingsView: React.FC<MyPostingsViewProps> = ({
  currentUserId,
  currentUserName,
  allProjects,
  onInspect,
  onOpenIncomingApplications,
  onDeleteProject,
}) => {
  const [myPostings, setMyPostings] = useState<MyPosting[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getMyPostings()
      .then((page) => {
        if (page && page.content) {
          setMyPostings(page.content)
        }
      })
      .catch((err) => {
        const parsed = parseError(err)
        console.warn('Backend ilanlarım servisi alınamadı:', parsed.message)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  // Eğer backend verisi geldiyse onu kullan, yoksa yerel projelerden filtrele
  const displayList: ProjectCardType[] = myPostings.length > 0
    ? myPostings.map((mp) => {
        const p = mp.posting as any
        return {
          id: p.id,
          title: p.title,
          department: p.owner?.department || '',
          technology: p.technologies ? p.technologies.map((t: any) => t.name) : [],
          company: p.organizationName || p.owner?.university || '',
          description: p.shortDescription || p.description || '',
          authorName: p.owner?.fullName || currentUserName,
          ownerId: p.owner?.id || currentUserId,
          type: p.type,
          open: p.open,
          deadline: p.deadline,
          roles: p.roles?.map((r: any) => ({
            id: r.id,
            role: r.role,
            requiredCount: r.requiredCount,
            remainingCount: r.remainingCount,
            acceptedCount: r.acceptedCount,
          })),
        }
      })
    : allProjects.filter(
        (p) =>
          (currentUserId && p.ownerId === currentUserId) ||
          p.authorName === currentUserName
      )

  return (
    <div className="view-container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}>
          📋 İlanlarım
        </h1>
        <p style={{ color: '#64748b', fontSize: '14px' }}>
          Yayınladığınız tüm projeleri, başvuru durumlarını ve kontenjanları buradan yönetebilirsiniz.
        </p>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
          İlanlarınız yükleniyor...
        </div>
      ) : displayList.length === 0 ? (
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px dashed #cbd5e1',
            padding: '48px 24px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>📭</div>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
            Henüz Açılmış Bir İlanınız Yok
          </h3>
          <p style={{ fontSize: '13px', color: '#64748b' }}>
            Ekip arkadaşı aradığınız projeler için yukarıdaki "➕ İlan aç" butonunu kullanarak yeni ilan oluşturabilirsiniz.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {displayList.map((project) => {
            const isCancelled = project.open === false && (project as any).status === 'CANCELLED'
            const isClosed = project.open === false && !isCancelled

            return (
              <div
                key={project.id}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  padding: '20px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  opacity: isCancelled ? 0.6 : 1,
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: '600',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        backgroundColor: '#eff6ff',
                        color: '#2563eb',
                      }}
                    >
                      {project.type || 'PROJE'}
                    </span>

                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: '600',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        backgroundColor: isCancelled ? '#fee2e2' : isClosed ? '#fef3c7' : '#ecfdf5',
                        color: isCancelled ? '#dc2626' : isClosed ? '#d97706' : '#059669',
                      }}
                    >
                      {isCancelled ? 'İptal Edildi' : isClosed ? 'Başvuru Kapandı' : 'Yayında'}
                    </span>
                  </div>

                  <h3
                    style={{
                      fontSize: '16px',
                      fontWeight: '700',
                      color: '#0f172a',
                      marginBottom: '8px',
                      cursor: 'pointer',
                    }}
                    onClick={() => onInspect(project)}
                  >
                    {project.title}
                  </h3>

                  <p
                    style={{
                      fontSize: '13px',
                      color: '#64748b',
                      marginBottom: '14px',
                      lineHeight: '1.4',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {project.description}
                  </p>

                  {/* Roller ve Kalan Kontenjan */}
                  {project.roles && project.roles.length > 0 && (
                    <div style={{ marginBottom: '14px' }}>
                      <div style={{ fontSize: '12px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>
                        Aranan Roller:
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {project.roles.map((r) => (
                          <span
                            key={r.id || r.role}
                            style={{
                              fontSize: '11px',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              backgroundColor: '#f1f5f9',
                              color: '#334155',
                              border: '1px solid #e2e8f0',
                            }}
                          >
                            {r.role}: <strong>{r.remainingCount ?? r.requiredCount} yer</strong>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Alt Aksiyon Butonları */}
                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '14px', display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => onOpenIncomingApplications(project)}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      backgroundColor: '#2563eb',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    📥 Başvurular
                  </button>

                  <button
                    onClick={() => onInspect(project)}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: '#f8fafc',
                      color: '#475569',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '500',
                      cursor: 'pointer',
                    }}
                  >
                    İncele
                  </button>

                  {!isCancelled && (
                    <button
                      onClick={() => {
                        if (window.confirm('Bu ilanı iptal etmek istediğinize emin misiniz?')) {
                          onDeleteProject(project.id)
                        }
                      }}
                      style={{
                        padding: '8px 10px',
                        backgroundColor: '#fff1f2',
                        color: '#e11d48',
                        border: '1px solid #fecdd3',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '500',
                        cursor: 'pointer',
                      }}
                      title="İlanı İptal Et"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
