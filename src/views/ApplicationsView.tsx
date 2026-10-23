import React from 'react'
import type { Application } from '../types'

interface ApplicationsViewProps {
  applications: Application[]
  onCancelApplication: (id: string | number) => void
}

export const ApplicationsView: React.FC<ApplicationsViewProps> = ({
  applications,
  onCancelApplication,
}) => {
  return (
    <div>
      <h2 style={{ marginBottom: '20px' }}>📥 Başvurularım ({applications.length})</h2>

      {applications.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {applications.map((app) => (
            <div
              key={app.id}
              style={{
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              }}
            >
              <div>
                <h3 style={{ fontSize: '17px', color: '#111827', marginBottom: '4px' }}>
                  {app.projectTitle}
                </h3>
                <p style={{ fontSize: '13px', color: '#6b7280' }}>
                  🏢 {app.company} • 📅 Başvuru Tarihi: {app.appliedAt}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span
                  style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: 600,
                    backgroundColor:
                      app.status === 'Kabul Edildi'
                        ? '#dcfce7'
                        : app.status === 'Reddedildi'
                        ? '#fee2e2'
                        : '#fef9c3',
                    color:
                      app.status === 'Kabul Edildi'
                        ? '#15803d'
                        : app.status === 'Reddedildi'
                        ? '#b91c1c'
                        : '#854d0e',
                  }}
                >
                  {app.status === 'Kabul Edildi'
                    ? '🟢 Kabul Edildi'
                    : app.status === 'Reddedildi'
                    ? '🔴 Reddedildi'
                    : '🟡 Beklemede'}
                </span>

                <button
                  onClick={() => onCancelApplication(app.id)}
                  style={{
                    background: 'none',
                    border: '1px solid #d1d5db',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    color: '#ef4444',
                    cursor: 'pointer',
                  }}
                >
                  İptal Et ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-placeholder">
          <div className="empty-placeholder-icon">📥</div>
          <h3>Henüz bir başvuru yapmadınız</h3>
          <p style={{ marginTop: '8px' }}>
            İlgilendiğiniz projelerin detayına giderek "İletişime Geç / Başvur" butonuna tıklayabilirsiniz.
          </p>
        </div>
      )}
    </div>
  )
}
