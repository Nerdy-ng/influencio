import { useState } from 'react'
import { BadgeCheck, MapPin, Camera, PlayCircle, Globe, Star, TrendingUp, Users, Heart, MessageCircle, Eye, ChevronRight, Briefcase, DollarSign } from 'lucide-react'

const profile = {
  name: 'Amara Osei',
  handle: '@amaraosei',
  location: 'Lagos',
  niche: 'Beauty & Skincare',
  verified: true,
  bio: 'Beauty talent & skincare educator passionate about celebrating African skin. I help brands connect authentically with modern African women through honest, engaging content that converts.',
  avatar: null,
  initials: 'AO',
  accentColor: '#FF6B9D',
  tags: ['Skincare', 'Beauty', 'Lifestyle', 'Self-care', 'Natural Hair'],
  socials: [
    { platform: 'Instagram', handle: '@amaraosei',  followers: '284K', engagement: '6.4%', icon: Camera,     color: '#E1306C' },
    { platform: 'TikTok',    handle: '@amaraosei',  followers: '190K', engagement: '8.9%', icon: PlayCircle, color: '#010101' },
    { platform: 'YouTube',   handle: 'Amara Osei',  followers: '47K',  engagement: '5.2%', icon: PlayCircle, color: '#FF0000' },
    { platform: 'Twitter/X', handle: '@amaraosei_',  followers: '32K',  engagement: '3.1%', icon: Globe,      color: '#1DA1F2' },
    { platform: 'Facebook',  handle: 'Amara Osei',  followers: '18K',  engagement: '2.8%', icon: Globe,      color: '#1877F2' },
  ],
  demographics: {
    gender: [{ label: 'Female', pct: 78 }, { label: 'Male', pct: 18 }, { label: 'Other', pct: 4 }],
    age: [
      { label: '13–17', pct: 8 },
      { label: '18–24', pct: 38 },
      { label: '25–34', pct: 35 },
      { label: '35–44', pct: 14 },
      { label: '45+',   pct: 5 },
    ],
    topCities: ['Lagos', 'Accra', 'Nairobi', 'Kumasi', 'London'],
  },
  metrics: [
    { label: 'Avg. Views',     value: '42K',  icon: Eye,           color: '#c084fc' },
    { label: 'Avg. Likes',     value: '8.2K', icon: Heart,         color: '#FF6B9D' },
    { label: 'Avg. Comments',  value: '640',  icon: MessageCircle, color: '#D4AF37' },
    { label: 'Reach / Post',   value: '61K',  icon: Users,         color: '#FF6B9D' },
    { label: 'Campaigns Done', value: '34',   icon: Briefcase,     color: '#c084fc' },
    { label: 'Talent Rating', value: '4.9★', icon: Star,          color: '#D4AF37' },
  ],
  portfolio: [
    { brand: 'NovaSkin',    type: 'Instagram Reel',    result: '2.1M views',  initials: 'NS', color: '#FF6B9D' },
    { brand: 'GlowLab',     type: 'YouTube Review',    result: '340K views',  initials: 'GL', color: '#c084fc' },
    { brand: 'UrbanThread',  type: 'TikTok Campaign',   result: '890K views',  initials: 'UT', color: '#D4AF37' },
    { brand: 'VerdeFresh',  type: 'Story Series × 7',  result: '120K reach',  initials: 'VF', color: '#FF6B9D' },
    { brand: 'LuxeNest',    type: 'Feed Post × 3',     result: '85K reach',   initials: 'LN', color: '#FF6B9D' },
    { brand: 'MindfulBrew', type: 'Instagram Reel',    result: '670K views',  initials: 'MB', color: '#c084fc' },
  ],
  pricing: [
    { type: 'Instagram Reel',     price: '₦350,000',  note: 'fixed' },
    { type: 'Instagram Feed Post', price: '₦180,000', note: 'fixed' },
    { type: 'Instagram Stories',   price: '₦80,000',  note: 'per 5 stories' },
    { type: 'TikTok Video',        price: '₦280,000', note: 'fixed' },
    { type: 'YouTube Integration', price: 'Negotiable', note: 'based on scope' },
    { type: 'Brand Ambassador',    price: 'Negotiable', note: 'monthly retainer' },
  ],
}

function StatBar({ label, pct, color }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-brand-dark/50 w-16 flex-shrink-0">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-brand-dark/8 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs font-semibold text-brand-dark/60 w-8 text-right">{pct}%</span>
    </div>
  )
}

export default function TalentProfile() {
  const [activeTab, setActiveTab] = useState('overview')
  const tabs = ['overview', 'demographics', 'portfolio', 'pricing']

  return (
    <section className="py-28 bg-white">
      <div className="max-w-6xl mx-auto px-6">

        {/* Section header */}
        <div className="text-center mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#FF6B9D' }}>Talent Profiles</p>
          <h2 className="text-4xl lg:text-5xl font-black text-brand-dark mb-4">
            Everything you need to<br />
            <span style={{ color: '#c084fc' }}>make the right call</span>
          </h2>
          <p className="text-brand-dark/50 max-w-lg mx-auto">
            Rich talent profiles give brands the full picture — audience, reach, work history, and pricing — before making a move.
          </p>
        </div>

        {/* Profile card */}
        <div className="rounded-3xl overflow-hidden shadow-2xl" style={{ border: '1px solid #e9d5ff' }}>

          {/* Top banner */}
          <div className="h-32 relative" style={{ background: 'linear-gradient(135deg, #1a0030 0%, #3b0764 60%, #c084fc 100%)' }}>
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          </div>

          {/* Avatar + identity */}
          <div className="bg-white px-8 pb-0">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-10 mb-6">
              <div className="flex items-end gap-4">
                <div className="w-20 h-20 rounded-2xl border-4 border-white shadow-xl flex items-center justify-center text-white font-black text-2xl flex-shrink-0"
                  style={{ backgroundColor: profile.accentColor }}>
                  {profile.initials}
                </div>
                <div className="pb-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-2xl font-black text-brand-dark">{profile.name}</h3>
                    {profile.verified && <BadgeCheck className="w-5 h-5" style={{ color: profile.accentColor }} />}
                  </div>
                  <div className="flex items-center gap-3 text-brand-dark/40 text-sm">
                    <span>{profile.handle}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{profile.location}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 pb-1">
                <span className="text-xs font-semibold rounded-full px-3 py-1.5"
                  style={{ color: profile.accentColor, backgroundColor: `${profile.accentColor}15`, border: `1px solid ${profile.accentColor}30` }}>
                  {profile.niche}
                </span>
                <button className="text-sm font-bold px-5 py-2.5 rounded-full text-white"
                  style={{ backgroundColor: '#4c1d95' }}>
                  Hire Amara
                </button>
              </div>
            </div>

            {/* Bio */}
            <p className="text-brand-dark/60 text-sm leading-relaxed max-w-2xl mb-5">{profile.bio}</p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {profile.tags.map(t => (
                <span key={t} className="text-xs text-brand-dark/40 bg-brand-dark/5 rounded-full px-3 py-1">{t}</span>
              ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-0 border-b border-brand-dark/8">
              {tabs.map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`relative px-6 py-3 text-sm font-semibold capitalize transition-colors ${
                    activeTab === tab ? '' : 'text-brand-dark/35 hover:text-brand-dark/60'
                  }`}
                  style={activeTab === tab ? { color: '#4c1d95' } : {}}>
                  {tab}
                  {activeTab === tab && (
                    <span className="absolute bottom-[-1px] left-0 right-0 h-0.5 rounded-full" style={{ backgroundColor: '#c084fc' }} />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tab content */}
          <div className="bg-white px-8 py-8">

            {/* OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Metrics grid */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-brand-dark/30 mb-4">Engagement Metrics</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {profile.metrics.map((m, i) => (
                      <div key={i} className="rounded-2xl p-4 text-center" style={{ backgroundColor: `${m.color}10`, border: `1px solid ${m.color}20` }}>
                        <m.icon className="w-5 h-5 mx-auto mb-2" style={{ color: m.color }} />
                        <p className="font-black text-lg text-brand-dark">{m.value}</p>
                        <p className="text-brand-dark/40 text-[10px] mt-0.5">{m.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Social platforms */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-brand-dark/30 mb-4">Social Media</p>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {profile.socials.map((s, i) => (
                      <div key={i} className="rounded-2xl p-4 flex items-center gap-3" style={{ backgroundColor: '#f9f5ff', border: '1px solid #e9d5ff' }}>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${s.color}15` }}>
                          <s.icon className="w-5 h-5" style={{ color: s.color }} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-brand-dark font-bold text-sm">{s.followers}</p>
                          <p className="text-brand-dark/40 text-xs truncate">{s.platform}</p>
                        </div>
                        <div className="ml-auto text-right flex-shrink-0">
                          <p className="text-xs font-bold" style={{ color: '#c084fc' }}>{s.engagement}</p>
                          <p className="text-brand-dark/30 text-[10px]">eng.</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* DEMOGRAPHICS */}
            {activeTab === 'demographics' && (
              <div className="grid md:grid-cols-3 gap-8">
                <div className="rounded-2xl p-6" style={{ backgroundColor: '#f9f5ff', border: '1px solid #e9d5ff' }}>
                  <p className="text-xs font-semibold uppercase tracking-widest text-brand-dark/30 mb-5">Gender Split</p>
                  <div className="space-y-3">
                    {profile.demographics.gender.map((g, i) => (
                      <StatBar key={i} label={g.label} pct={g.pct} color={['#FF6B9D', '#c084fc', '#D4AF37'][i]} />
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl p-6" style={{ backgroundColor: '#f9f5ff', border: '1px solid #e9d5ff' }}>
                  <p className="text-xs font-semibold uppercase tracking-widest text-brand-dark/30 mb-5">Age Range</p>
                  <div className="space-y-3">
                    {profile.demographics.age.map((a, i) => (
                      <StatBar key={i} label={a.label} pct={a.pct} color="#c084fc" />
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl p-6" style={{ backgroundColor: '#f9f5ff', border: '1px solid #e9d5ff' }}>
                  <p className="text-xs font-semibold uppercase tracking-widest text-brand-dark/30 mb-5">Top Locations</p>
                  <div className="space-y-3">
                    {profile.demographics.topCities.map((city, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                          style={{ backgroundColor: '#c084fc' }}>{i + 1}</span>
                        <span className="text-sm text-brand-dark/70 font-medium">{city}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* PORTFOLIO */}
            {activeTab === 'portfolio' && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-brand-dark/30 mb-6">Past Work</p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {profile.portfolio.map((p, i) => (
                    <div key={i} className="rounded-2xl overflow-hidden group cursor-pointer" style={{ border: '1px solid #e9d5ff' }}>
                      {/* Placeholder thumbnail */}
                      <div className="h-36 flex items-center justify-center relative" style={{ backgroundColor: `${p.color}15` }}>
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-lg"
                          style={{ backgroundColor: p.color }}>
                          {p.initials}
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                          <PlayCircle className="w-10 h-10 text-white" />
                        </div>
                      </div>
                      <div className="p-4">
                        <p className="font-bold text-brand-dark text-sm">{p.brand}</p>
                        <p className="text-brand-dark/40 text-xs mt-0.5">{p.type}</p>
                        <div className="flex items-center gap-1 mt-2">
                          <TrendingUp className="w-3 h-3" style={{ color: p.color }} />
                          <span className="text-xs font-semibold" style={{ color: p.color }}>{p.result}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PRICING */}
            {activeTab === 'pricing' && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-brand-dark/30 mb-6">Rate Card</p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {profile.pricing.map((p, i) => {
                    const colors = ['#FF6B9D', '#c084fc', '#D4AF37', '#FF6B9D', '#c084fc', '#FF6B9D']
                    const c = colors[i]
                    return (
                      <div key={i} className="rounded-2xl p-5 flex items-center justify-between" style={{ backgroundColor: `${c}08`, border: `1px solid ${c}25` }}>
                        <div>
                          <p className="font-semibold text-brand-dark text-sm">{p.type}</p>
                          <p className="text-brand-dark/35 text-xs mt-0.5">{p.note}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-base" style={{ color: c }}>{p.price}</p>
                          {p.price === 'Negotiable' && (
                            <span className="text-[10px] font-semibold rounded-full px-2 py-0.5" style={{ backgroundColor: `${c}15`, color: c }}>Flexible</span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="mt-6 rounded-2xl p-5 flex items-center justify-between" style={{ backgroundColor: '#4c1d95', border: '1px solid #c084fc40' }}>
                  <div>
                    <p className="font-bold text-white text-sm">Ready to work with Amara?</p>
                    <p className="text-white/50 text-xs mt-0.5">Send a brief and get a response within 24 hours.</p>
                  </div>
                  <button className="flex items-center gap-1.5 text-sm font-bold px-5 py-2.5 rounded-full text-white flex-shrink-0"
                    style={{ backgroundColor: '#FF6B9D' }}>
                    Send Brief <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
