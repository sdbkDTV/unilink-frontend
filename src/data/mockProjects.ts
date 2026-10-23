import { ProjectCard } from '../types'

export const INITIAL_PROJECTS: ProjectCard[] = [
  {
    id: 1,
    title: 'Üniversite Kitap Takas Platformu',
    department: 'Bilgisayar Mühendisliği',
    technology: ['React', 'Java', 'Spring Boot'],
    company: 'İstanbul Üniversitesi',
    description: 'Öğrenciler arasında ders kitabı değişimini kolaylaştıracak web platformu için Frontend geliştirici arıyoruz.',
    authorName: 'Ahmet Yılmaz'
  },
  {
    id: 2,
    title: 'Kampüs Etkinlik Mobil Uygulaması',
    department: 'Yazılım Mühendisliği',
    technology: ['React Native', 'Node.js'],
    company: 'BT Kulübü',
    description: 'Hackathon projesi: Tüm üniversite kulüp etkinliklerini ve duyurularını tek bir yerde toplayan mobil uygulama.',
    authorName: 'Elif Kaya'
  },
  {
    id: 3,
    title: 'Yapay Zeka Destekli Sınav Asistanı',
    department: 'Yapay Zeka Mühendisliği',
    technology: ['Python', 'React', 'FastAPI'],
    company: 'AI Laboratuvarı',
    description: 'LLM modellerini ders notlarına entegre edecek Java / Python arka plan (Backend) geliştiricisi aranıyor.',
    authorName: 'Mehmet Demir'
  },
  {
    id: 4,
    title: 'Proje Ortağı Bulma Platformu',
    department: 'Bilgisayar Bilimleri',
    technology: ['React', 'TypeScript', 'Java'],
    company: 'Bitirme Projesi 2026',
    description: 'Bitirme ve dönem projeleri için takım arkadaşı bulmayı sağlayan sosyal ağ platformu.',
    authorName: 'Ayşe Çelik'
  }
]