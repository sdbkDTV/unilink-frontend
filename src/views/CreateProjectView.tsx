import React, { useState, FormEvent } from 'react'
import { ProjectCard } from '../types'
import { TooltipInput } from '../components/TooltipInput'

interface CreateProjectViewProps {
  authorName: string
  defaultUniversity: string
  onCreate: (project: ProjectCard) => void
}

export const CreateProjectView: React.FC<CreateProjectViewProps> = ({
  authorName,
  defaultUniversity,
  onCreate
}) => {
  const [title, setTitle] = useState('')
  const [department, setDepartment] = useState('')
  const [tech, setTech] = useState('')
  const [company, setCompany] = useState('')
  const [description, setDescription] = useState('')
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const errs: { [key: string]: string } = {}
    if (!title.trim()) errs.title = 'Lütfen bu alanı doldurunuz.'
    if (!department.trim()) errs.department = 'Lütfen bu alanı doldurunuz.'
    if (!description.trim()) errs.description = 'Lütfen bu alanı doldurunuz.'

    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    onCreate({
      id: Date.now(),
      title,
      department,
      technology: tech ? tech.split(',').map((t) => t.trim()) : ['React'],
      company: company || defaultUniversity,
      description,
      authorName
    })
  }

  return (
    <div className="form-container">
      <h2>➕ Yeni İlan / Proje Oluştur</h2>
      <form onSubmit={handleSubmit} className="create-form" noValidate>
        <TooltipInput label="Proje / İlan Başlığı" value={title} onChange={setTitle} error={errors.title} required />
        <TooltipInput label="Bölüm" value={department} onChange={setDepartment} error={errors.department} required />
        <TooltipInput label="Kullanılan Teknolojiler (virgülle ayırınız)" placeholder="Örn: React, Java" value={tech} onChange={setTech} />
        <TooltipInput label="Şirket / Üniversite / Kulüp" value={company} onChange={setCompany} />
        <TooltipInput label="Açıklama" value={description} onChange={setDescription} error={errors.description} isTextarea required />
        <button type="submit" className="submit-btn">🚀 İlanı Yayınla</button>
      </form>
    </div>
  )
}