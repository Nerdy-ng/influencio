import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function WorkspaceSelectorPage() {
  const navigate = useNavigate()
  const [capabilities, setCapabilities] = useState(null)
  const [selecting, setSelecting]       = useState(null) // 'brand' | 'creator' | null

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { navigate('/login', { replace: true }); return }
      supabase
        .from('profiles')
        .select('has_brand_access, has_creator_access')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          if (!data) { navigate('/login', { replace: true }); return }
          // If only one capability exists, skip the selector and route directly
          if (data.has_brand_access && !data.has_creator_access) {
            navigate('/brand-dashboard', { replace: true })
            return
          }
          if (data.has_creator_access && !data.has_brand_access) {
            navigate('/dashboard', { replace: true })
            return
          }
          setCapabilities(data)
        })
    })
  }, [])

  async function selectWorkspace(workspace) {
    setSelecting(workspace)
    try {
      const { error } = await supabase.functions.invoke('sync-workspace', {
        body: { workspace },
      })
      if (error) throw error
      localStorage.setItem('brandiór_workspace', workspace)
      localStorage.setItem('brandiór_role', workspace === 'brand' ? 'brand' : 'talent')
      navigate(workspace === 'brand' ? '/brand-dashboard' : '/dashboard', { replace: true })
    } catch {
      setSelecting(null)
    }
  }

  if (!capabilities) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0015' }}>
        <div className="w-8 h-8 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#0a0015' }}>
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-black text-white mb-2">Welcome back</h1>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>Choose a workspace to continue</p>
        </div>

        <div className="space-y-4">
          {capabilities.has_brand_access && (
            <button
              onClick={() => selectWorkspace('brand')}
              disabled={!!selecting}
              className="w-full p-5 rounded-2xl text-left transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #1a0035 0%, #3d0080 100%)', border: '1px solid rgba(192,132,252,0.3)' }}
            >
              <div className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#c084fc' }}>
                {selecting === 'brand' ? 'Loading…' : 'Brand'}
              </div>
              <div className="text-white font-bold text-base">Brand Workspace</div>
              <div className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.45)' }}>Find creators, run campaigns</div>
            </button>
          )}

          {capabilities.has_creator_access && (
            <button
              onClick={() => selectWorkspace('creator')}
              disabled={!!selecting}
              className="w-full p-5 rounded-2xl text-left transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #0d0020 0%, #3b0764 100%)', border: '1px solid rgba(192,132,252,0.3)' }}
            >
              <div className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#F72585' }}>
                {selecting === 'creator' ? 'Loading…' : 'Creator'}
              </div>
              <div className="text-white font-bold text-base">Creator Workspace</div>
              <div className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.45)' }}>Find campaigns, grow your profile</div>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
