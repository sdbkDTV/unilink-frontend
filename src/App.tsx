import { useState, useEffect, useCallback } from 'react'
import type { TabType, User, ProjectCard as ProjectCardType, Application } from './types'
import { INITIAL_PROJECTS } from './data/mockProjects'
import type { PostingSummary, Technology, Application as ApiApplication } from './api/types'
import {
  tokens,
  getMyProfile,
  getFeed,
  createPosting,
  applyToPosting,
  getMyApplications,
  withdrawApplication,
  savePosting,
  unsavePosting,
  getPendingCount,
  authApi,
  parseError
} from './api'

import { Navbar } from './components/Navbar'
import { ProjectDetailModal } from './components/ProjectDetailModal'

import { AuthView } from './views/AuthView'
import { VerifyEmailView } from './views/VerifyEmailView'
import { HomeView } from './views/HomeView'
import { CreateProjectView } from './views/CreateProjectView'
import { ProfileView } from './views/ProfileView'
import { SavedProjectsView } from './views/SavedProjectsView'
import { ApplicationsView } from './views/ApplicationsView'
import { PlaceholderView } from './views/PlaceholderView'

import './styles/global.css'

export default function App() {
  // URL yolunu kontrol et: /verify-email?token=... ise doğrulama sayfasını göster
  const [currentPath, setCurrentPath] = useState(window.location.pathname)

  useEffect(() => {
    const handlePopState = () => setCurrentPath(window.location.pathname)
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return Boolean(tokens.getAccess())
  })

  const [currentUser, setCurrentUser] = useState<User>({
    name: 'Saidbek Dautov',
    email: 'saidbek@ogrenci.edu.tr',
    department: 'Bilgisayar Mühendisliği',
    university: 'İstanbul Üniversitesi'
  })

  const [activeTab, setActiveTab] = useState<TabType>('Anasayfa')

  // Projeler (localStorage yedekli)
  const [projects, setProjects] = useState<ProjectCardType[]>(() => {
    const saved = localStorage.getItem('unilink_projects')
    return saved ? JSON.parse(saved) : INITIAL_PROJECTS
  })

  // Kaydedilen ilan ID'leri
  const [savedProjectIds, setSavedProjectIds] = useState<(string | number)[]>(() => {
    const saved = localStorage.getItem('unilink_saved_ids')
    return saved ? JSON.parse(saved) : []
  })

  // Başvurular
  const [applications, setApplications] = useState<Application[]>(() => {
    const saved = localStorage.getItem('unilink_applications')
    return saved ? JSON.parse(saved) : []
  })

  // Bekleyen başvuru rozet sayısı
  const [pendingCount, setPendingCount] = useState<number>(0)

  // İncelenen proje detayı (Modal)
  const [inspectingProject, setInspectingProject] = useState<ProjectCardType | null>(null)

  // Backend'den ilan ve başvuru verilerini çek
  const loadBackendData = useCallback(() => {
    // İlan akışını çek
    getFeed()
      .then((page) => {
        if (page && page.content && page.content.length > 0) {
          const mapped: ProjectCardType[] = page.content.map((p: PostingSummary) => ({
            id: p.id,
            title: p.title,
            department: p.owner.department,
            technology: p.technologies.map((t: Technology) => t.name),
            company: p.organizationName || p.owner.university,
            description: p.shortDescription,
            authorName: p.owner.fullName,
            type: p.type,
            open: p.open,
            deadline: p.deadline,
          }))
          setProjects(mapped)
        }
      })
      .catch((err: unknown) => {
        const parsed = parseError(err)
        console.warn('Backend akışı alınamadı, yerel veriler kullanılıyor:', parsed.message)
      })

    // Başvuru rozetini çek
    getPendingCount()
      .then((count) => setPendingCount(count))
      .catch(() => {})

    // Kendi başvurularını çek
    getMyApplications()
      .then((page) => {
        if (page && page.content) {
          const mappedApps: Application[] = page.content.map((app: ApiApplication) => ({
            id: app.id,
            projectId: app.posting.id,
            projectTitle: app.posting.title,
            company: 'UniLink Ekibi',
            appliedAt: new Date(app.createdAt).toLocaleDateString('tr-TR'),
            status:
              app.status === 'ACCEPTED'
                ? 'Kabul Edildi'
                : app.status === 'REJECTED'
                ? 'Reddedildi'
                : app.status === 'WITHDRAWN'
                ? 'Geri çekildi'
                : 'Beklemede',
          }))
          setApplications(mappedApps)
        }
      })
      .catch(() => {})
  }, [])

  // 1. Sayfa ilk açıldığında: Token varsa kullanıcı profilini çek
  useEffect(() => {
    if (tokens.getAccess()) {
      getMyProfile()
        .then((profile) => {
          setCurrentUser({
            id: profile.userId,
            name: profile.fullName,
            email: profile.email,
            department: profile.department,
            university: profile.university,
            bio: profile.bio,
            githubUrl: profile.githubUrl,
            linkedinUrl: profile.linkedinUrl,
          })
          setIsAuthenticated(true)
        })
        .catch(() => {
          tokens.clear()
          setIsAuthenticated(false)
        })
    }
  }, [])

  // 2. İlanları ve bekleyen rozet sayısını backend'den çek
  useEffect(() => {
    if (isAuthenticated) {
      loadBackendData()
    }
  }, [isAuthenticated, loadBackendData])

  // LocalStorage senkronizasyonu
  useEffect(() => {
    localStorage.setItem('unilink_projects', JSON.stringify(projects))
  }, [projects])

  useEffect(() => {
    localStorage.setItem('unilink_saved_ids', JSON.stringify(savedProjectIds))
  }, [savedProjectIds])

  useEffect(() => {
    localStorage.setItem('unilink_applications', JSON.stringify(applications))
  }, [applications])

  // Yeni ilan oluşturma (Backend + LocalStorage)
  const handleCreateProject = async (newProject: ProjectCardType) => {
    try {
      const created = await createPosting({
        type: 'PROJECT',
        title: newProject.title,
        description: newProject.description,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        roles: [{ role: 'Geliştirici', requiredCount: 2 }],
        technologies: newProject.technology,
        organizationName: newProject.company,
      })

      const mapped: ProjectCardType = {
        id: created.id,
        title: created.title,
        department: created.owner.department,
        technology: created.technologies.map((t: Technology) => t.name),
        company: created.organizationName || created.owner.university,
        description: created.description,
        authorName: created.owner.fullName,
      }
      setProjects([mapped, ...projects])
    } catch {
      // Backend kapalıysa yerel olarak ekle
      setProjects([newProject, ...projects])
    }
    setActiveTab('Anasayfa')
  }

  // Proje listesinde artık bulunmayan kaydedilmiş kimlikleri temizle
  useEffect(() => {
    if (projects.length > 0) {
      setSavedProjectIds((prev) =>
        prev.filter((id) => projects.some((p) => String(p.id) === String(id)))
      )
    }
  }, [projects])

  const isIdSaved = (id: string | number) =>
    savedProjectIds.some((favId) => String(favId) === String(id))

  // Favorilere ekle / çıkar
  const toggleSaveProject = async (id: string | number) => {
    const isSaved = isIdSaved(id)
    if (isSaved) {
      setSavedProjectIds(savedProjectIds.filter((favId) => String(favId) !== String(id)))
      if (typeof id === 'string') {
        unsavePosting(id).catch(() => {})
      }
    } else {
      setSavedProjectIds([...savedProjectIds, id])
      if (typeof id === 'string') {
        savePosting(id).catch(() => {})
      }
    }
  }

  // Başvuru yapma
  const handleApply = async (project: ProjectCardType) => {
    if (applications.some((a) => a.projectId === project.id)) return

    try {
      if (typeof project.id === 'string') {
        await applyToPosting(project.id, {
          message: 'Projeye katılmak istiyorum.',
          roleIds: [],
        })
      }
    } catch {
      // Backend çevrimdışıysa yerel simülasyon devam eder
    }

    const newApp: Application = {
      id: Date.now(),
      projectId: project.id,
      projectTitle: project.title,
      company: project.company,
      appliedAt: new Date().toLocaleDateString('tr-TR'),
      status: 'Beklemede',
    }
    setApplications([newApp, ...applications])
  }

  // Başvuru iptal etme / geri çekme
  const handleCancelApplication = async (id: string | number) => {
    if (typeof id === 'string') {
      withdrawApplication(id).catch(() => {})
    }
    setApplications(applications.filter((a) => a.id !== id))
  }

  // Çıkış yapma
  const handleLogout = async () => {
    try {
      await authApi.logout()
    } catch {
      // Çıkış hatası olsa bile token'ları temizle
    }
    tokens.clear()
    setIsAuthenticated(false)
    setActiveTab('Anasayfa')
  }

  // --- E-posta doğrulama sayfası: /verify-email?token=... ---
  if (currentPath === '/verify-email') {
    return (
      <VerifyEmailView
        onGoLogin={() => {
          window.history.pushState({}, '', '/')
          setCurrentPath('/')
        }}
      />
    )
  }

  // --- Giriş sayfası ---
  if (!isAuthenticated) {
    return (
      <AuthView
        onSuccess={(u) => {
          setCurrentUser(u)
          setIsAuthenticated(true)
          // Giriş başarılıysa hemen backend verilerini yükle
          loadBackendData()
        }}
      />
    )
  }

  const savedProjects = projects.filter((p) => isIdSaved(p.id))
  const userProjects = projects.filter((p) => p.authorName === currentUser.name)

  return (
    <div className="app-container">
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        savedCount={savedProjects.length}
        pendingCount={pendingCount}
        onLogout={handleLogout}
      />

      <main className="main-content">
        {activeTab === 'Anasayfa' && (
          <HomeView
            projects={projects}
            savedProjectIds={savedProjectIds}
            onToggleSave={toggleSaveProject}
            onInspect={setInspectingProject}
          />
        )}
        {activeTab === 'İlan aç' && (
          <CreateProjectView
            authorName={currentUser.name}
            defaultUniversity={currentUser.university}
            onCreate={handleCreateProject}
          />
        )}
        {activeTab === 'Profil' && (
          <ProfileView user={currentUser} userProjects={userProjects} onInspect={setInspectingProject} />
        )}
        {activeTab === 'Kaydedilenler' && (
          <SavedProjectsView savedProjects={savedProjects} onToggleSave={toggleSaveProject} onInspect={setInspectingProject} />
        )}
        {activeTab === 'Başvurular' && (
          <ApplicationsView applications={applications} onCancelApplication={handleCancelApplication} />
        )}
        {activeTab !== 'Anasayfa' &&
          activeTab !== 'İlan aç' &&
          activeTab !== 'Profil' &&
          activeTab !== 'Kaydedilenler' &&
          activeTab !== 'Başvurular' && <PlaceholderView tab={activeTab} />}
      </main>

      {inspectingProject && (
        <ProjectDetailModal
          project={inspectingProject}
          onClose={() => setInspectingProject(null)}
          isSaved={isIdSaved(inspectingProject.id)}
          onToggleSave={toggleSaveProject}
          isApplied={applications.some((a) => a.projectId === inspectingProject.id)}
          onApply={handleApply}
        />
      )}
    </div>
  )
}
