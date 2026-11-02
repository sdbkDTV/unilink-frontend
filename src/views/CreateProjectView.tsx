import React, { useState, FormEvent } from 'react'
import { ProjectCard, ProjectRole } from '../types'
import { TooltipInput } from '../components/TooltipInput'

interface CreateProjectViewProps {
  authorName: string
  defaultUniversity: string
  onCreate: (project: ProjectCard) => Promise<void> | void
}

export const CreateProjectView: React.FC<CreateProjectViewProps> = ({
  authorName,
  defaultUniversity,
  onCreate,
}) => {
  const [type, setType] = useState<'PROJECT' | 'COMPETITION' | 'STARTUP'>('PROJECT')
  const [title, setTitle] = useState('')
  const [department, setDepartment] = useState('')
  const [tech, setTech] = useState('')
  const [company, setCompany] = useState('')
  const [description, setDescription] = useState('')
  const [deadline, setDeadline] = useState(() => {
    // Varsayılan: 30 gün sonrası
    const d = new Date()
    d.setDate(d.getDate() + 30)
    return d.toISOString().split('T')[0]
  })

  // Roller listesi (en az 1 rol)
  const [roles, setRoles] = useState<{ role: string; count: number }[]>([
    { role: 'Geliştirici', count: 2 },
  ])

  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAddRole = () => {
    if (roles.length >= 10) {
      alert('En fazla 10 farklı rol ekleyebilirsiniz.')
      return
    }
    setRoles([...roles, { role: '', count: 1 }])
  }

  const handleRemoveRole = (index: number) => {
    if (roles.length <= 1) {
      alert('İlanda en az bir rol bulunmalıdır.')
      return
    }
    setRoles(roles.filter((_, idx) => idx !== index))
  }

  const handleRoleChange = (index: number, field: 'role' | 'count', value: string | number) => {
    const updated = [...roles]
    if (field === 'role') {
      updated[index].role = String(value)
    } else {
      const num = Number(value)
      updated[index].count = num < 1 ? 1 : num > 50 ? 50 : num
    }
    setRoles(updated)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const errs: { [key: string]: string } = {}

    if (!title.trim()) errs.title = 'İlan başlığı zorunludur.'
    if (!department.trim()) errs.department = 'Bölüm alanı zorunludur.'
    if (!description.trim()) errs.description = 'Açıklama alanı zorunludur.'
    if (!deadline) errs.deadline = 'Son başvuru tarihi zorunludur.'

    // Rol kontrolleri
    const emptyRole = roles.some((r) => !r.role.trim())
    if (emptyRole) {
      errs.roles = 'Lütfen tüm rollerin isimlerini doldurunuz.'
    }

    // Aynı isimde rol kontrolü
    const roleNames = roles.map((r) => r.role.trim().toLowerCase())
    const hasDuplicates = new Set(roleNames).size !== roleNames.length
    if (hasDuplicates) {
      errs.roles = 'Aynı rolü birden fazla kez ekleyemezsiniz.'
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    setErrors({})
    setIsSubmitting(true)

    try {
      const formattedRoles: ProjectRole[] = roles.map((r, idx) => ({
        id: String(idx + 1),
        role: r.role.trim(),
        requiredCount: r.count,
        remainingCount: r.count,
      }))

      await onCreate({
        id: Date.now(),
        title: title.trim(),
        type,
        department: department.trim(),
        technology: tech ? tech.split(',').map((t) => t.trim()).filter(Boolean) : ['React'],
        company: company.trim() || defaultUniversity,
        description: description.trim(),
        authorName,
        deadline: new Date(deadline).toISOString(),
        roles: formattedRoles,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="form-container">
      <h2>➕ Yeni İlan / Proje Oluştur</h2>
      <form onSubmit={handleSubmit} className="create-form" noValidate>
        {/* İlan Türü */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
            İlan Türü
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[
              { id: 'PROJECT', label: '🎓 Okul / Kişisel Proje' },
              { id: 'COMPETITION', label: '🏆 Yarışma / Hackathon' },
              { id: 'STARTUP', label: '🚀 Girişim / Startup' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setType(t.id as any)}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '8px',
                  border: type === t.id ? '2px solid #2563eb' : '1px solid #d1d5db',
                  background: type === t.id ? '#eff6ff' : 'white',
                  color: type === t.id ? '#1d4ed8' : '#4b5563',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <TooltipInput
          label="Proje / İlan Başlığı (en fazla 150 karakter)"
          value={title}
          onChange={setTitle}
          error={errors.title}
          required
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <TooltipInput
            label="Bölüm"
            value={department}
            onChange={setDepartment}
            error={errors.department}
            required
          />
          <TooltipInput
            label="Şirket / Üniversite / Organizasyon"
            placeholder={defaultUniversity}
            value={company}
            onChange={setCompany}
          />
        </div>

        {/* Son Başvuru Tarihi */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
            Son Başvuru Tarihi *
          </label>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              boxSizing: 'border-box',
              fontSize: '14px',
            }}
          />
          {errors.deadline && (
            <span style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px', display: 'block' }}>
              {errors.deadline}
            </span>
          )}
        </div>

        {/* Roller Bölümü */}
        <div style={{ marginBottom: '20px', padding: '14px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <label style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>
              Aranan Roller ve Kontenjanlar *
            </label>
            <button
              type="button"
              onClick={handleAddRole}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                border: '1px solid #2563eb',
                background: 'white',
                color: '#2563eb',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              + Rol Ekle
            </button>
          </div>

          {errors.roles && (
            <div style={{ color: '#dc2626', fontSize: '12px', marginBottom: '8px' }}>
              ⚠️ {errors.roles}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {roles.map((r, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="text"
                  placeholder="Rol adı (Örn: Backend, Frontend, UI/UX...)"
                  value={r.role}
                  onChange={(e) => handleRoleChange(idx, 'role', e.target.value)}
                  style={{
                    flex: 3,
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    fontSize: '13px',
                  }}
                />
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={r.count}
                  onChange={(e) => handleRoleChange(idx, 'count', e.target.value)}
                  title="Kontenjan (kişi sayısı)"
                  style={{
                    flex: 1,
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    fontSize: '13px',
                  }}
                />
                <span style={{ fontSize: '12px', color: '#6b7280' }}>kişi</span>
                {roles.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveRole(idx)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#ef4444',
                      cursor: 'pointer',
                      fontSize: '16px',
                      padding: '4px 8px',
                    }}
                    title="Rolü Sil"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <TooltipInput
          label="Kullanılan Teknolojiler (virgülle ayırınız)"
          placeholder="Örn: React, Node.js, Docker, Python"
          value={tech}
          onChange={setTech}
        />

        <TooltipInput
          label="Açıklama (Proje detayları, hedefler, aranan özellikler)"
          value={description}
          onChange={setDescription}
          error={errors.description}
          isTextarea
          required
        />

        <button type="submit" className="submit-btn" disabled={isSubmitting}>
          {isSubmitting ? 'İlan Yayınlanıyor...' : '🚀 İlanı Yayınla'}
        </button>
      </form>
    </div>
  )
}
