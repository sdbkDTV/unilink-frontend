export interface ProjectCard {
  id: number | string
  title: string
  department: string
  technology: string[]
  company: string
  description: string
  authorName: string
  type?: string
  open?: boolean
  deadline?: string
}

export interface User {
  id?: string
  name: string
  email: string
  department: string
  university: string
  bio?: string | null
  githubUrl?: string | null
  linkedinUrl?: string | null
}

export interface Application {
  id: number | string
  projectId: number | string
  projectTitle: string
  company: string
  appliedAt: string
  status: 'Beklemede' | 'Kabul Edildi' | 'Reddedildi' | 'Geri çekildi'
}

export type TabType = 
  | 'Anasayfa' 
  | 'Mesajlaşma' 
  | 'Profil' 
  | 'Settings' 
  | 'İlan aç' 
  | 'Kaydedilenler' 
  | 'Başvurular'
