import React from 'react'
import { TabType } from '../types'

export const PlaceholderView: React.FC<{ tab: TabType }> = ({ tab }) => (
  <div className="empty-placeholder">
    <h2>"{tab}" Sayfası Yapım Aşamasında</h2>
    <p style={{ marginTop: '10px' }}>MVP sürümünde arama, ilan açma, favoriler ve profil aktiftir.</p>
  </div>
)