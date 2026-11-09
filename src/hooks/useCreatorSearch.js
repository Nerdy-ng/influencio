import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { calcScore, loadAlgoConfig, ALGO_DEFAULTS } from '../lib/algoRanking'
import {
  PAGE_SIZE, MOCK_CREATORS,
} from '../lib/creatorFilters'

export { PAGE_SIZE }

export function useCreatorSearch() {
  const [talents, setTalents] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [search, setSearch] = useState('')
  const [selectedNiches, setSelectedNiches] = useState([])
  const [selectedPlatforms, setSelectedPlatforms] = useState([])
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [selectedTiers, setSelectedTiers] = useState([])
  const [availableOnly, setAvailableOnly] = useState(false)
  const [selectedLocations, setSelectedLocations] = useState([])
  const [selectedGenders, setSelectedGenders] = useState([])
  const [selectedAgeRanges, setSelectedAgeRanges] = useState([])
  const [selectedFollowerRanges, setSelectedFollowerRanges] = useState([])
  const [selectedContentTypes, setSelectedContentTypes] = useState([])
  const [selectedLanguages, setSelectedLanguages] = useState([])
  const [sort, setSort] = useState('relevant')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const sentinelRef = useRef(null)
  const algoConfigRef = useRef(ALGO_DEFAULTS)

  useEffect(() => {
    loadAlgoConfig(supabase).then(cfg => { algoConfigRef.current = cfg })
  }, [])

  const fetchTalents = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      let query = supabase.from('profiles').select('*').eq('has_creator_access', true)

      if (availableOnly)           query = query.eq('available_for_hire', true)
      if (selectedTiers.length)    query = query.in('tier', selectedTiers)
      if (selectedLocations.length)query = query.in('location', selectedLocations)
      if (selectedGenders.length)  query = query.in('gender', selectedGenders)
      if (selectedNiches.length)   query = query.overlaps('niches', selectedNiches)
      if (selectedPlatforms.length)query = query.overlaps('platforms', selectedPlatforms)
      if (selectedContentTypes.length) query = query.overlaps('content_types', selectedContentTypes)
      if (selectedLanguages.length)    query = query.overlaps('languages', selectedLanguages)
      if (search) query = query.or(`full_name.ilike.%${search}%,handle.ilike.%${search}%`)

      const { data, error: err } = await query
      if (err) throw err

      const creatorIds = (data || []).map(p => p.id)
      let cheapestByCreator = {}
      if (creatorIds.length > 0) {
        const { data: rateCards } = await supabase
          .from('rate_cards')
          .select('creator_id, durations')
          .in('creator_id', creatorIds)
        ;(rateCards || []).forEach(rc => {
          const prices = (rc.durations || []).map(d => d.price).filter(p => typeof p === 'number')
          if (prices.length) cheapestByCreator[rc.creator_id] = Math.min(...prices)
        })
      }

      let mapped = (data || []).map(p => ({
        _id: p.id,
        name: p.full_name,
        handle: p.handle,
        location: p.location,
        bio: p.bio,
        avatar_url: p.avatar_url,
        niches: p.niches || [],
        platforms: p.platforms || [],
        contentTypes: p.content_types || [],
        languages: p.languages || [],
        tier: p.tier || null,
        avgRating: p.avg_rating || 0,
        totalFollowers: p.total_followers || 0,
        avgEngagement: p.avg_engagement || 0,
        completedCampaigns: p.completed_campaigns || 0,
        identityVerified: p.identity_verified || false,
        sparkEarned: p.spark_earned || false,
        updatedAt: p.updated_at || null,
        createdAt: p.created_at || null,
        minPrice: cheapestByCreator[p.id] ?? (p.min_price || 0),
        availableForHire: p.available_for_hire,
        gender: p.gender,
        age: p.age,
        featuredVideo: p.featured_video,
        socials: p.socials || [],
      }))

      // Client-side filters (not supported as Supabase array operators)
      if (minPrice) mapped = mapped.filter(c => c.minPrice >= Number(minPrice))
      if (maxPrice) mapped = mapped.filter(c => c.minPrice <= Number(maxPrice))
      if (selectedFollowerRanges.length)
        mapped = mapped.filter(c => selectedFollowerRanges.some(r => c.totalFollowers >= r.min && c.totalFollowers <= r.max))
      if (selectedAgeRanges.length)
        mapped = mapped.filter(c => c.age && selectedAgeRanges.some(r => c.age >= r.min && c.age <= r.max))

      if (sort === 'relevant')            mapped = [...mapped].sort((a, b) => calcScore(b, algoConfigRef.current) - calcScore(a, algoConfigRef.current))
      else if (sort === 'highest-rated')  mapped.sort((a, b) => b.avgRating - a.avgRating)
      else if (sort === 'lowest-price')   mapped.sort((a, b) => a.minPrice - b.minPrice)
      else if (sort === 'most-campaigns') mapped.sort((a, b) => b.completedCampaigns - a.completedCampaigns)

      // Fall back to mock data when no real creator profiles exist yet
      if (mapped.length === 0) {
        let filtered = MOCK_CREATORS.filter(c => {
          if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.handle.toLowerCase().includes(search.toLowerCase())) return false
          if (selectedNiches.length && !selectedNiches.some(n => c.niches.includes(n))) return false
          if (selectedPlatforms.length && !selectedPlatforms.some(p => (c.platforms || []).includes(p))) return false
          if (minPrice && c.minPrice < Number(minPrice)) return false
          if (maxPrice && c.minPrice > Number(maxPrice)) return false
          if (selectedTiers.length && !selectedTiers.includes(c.tier)) return false
          if (availableOnly && !c.availableForHire) return false
          if (selectedLocations.length && !selectedLocations.includes(c.location)) return false
          if (selectedGenders.length && !selectedGenders.includes(c.gender)) return false
          if (selectedAgeRanges.length && !selectedAgeRanges.some(r => c.age >= r.min && c.age <= r.max)) return false
          if (selectedFollowerRanges.length && !selectedFollowerRanges.some(r => c.totalFollowers >= r.min && c.totalFollowers <= r.max)) return false
          if (selectedContentTypes.length && !selectedContentTypes.some(ct => (c.contentTypes || []).includes(ct))) return false
          if (selectedLanguages.length && !selectedLanguages.some(l => (c.languages || []).includes(l))) return false
          return true
        })
        if (sort === 'relevant')            filtered = [...filtered].sort((a, b) => calcScore(b, algoConfigRef.current) - calcScore(a, algoConfigRef.current))
        else if (sort === 'highest-rated')  filtered.sort((a, b) => b.avgRating - a.avgRating)
        else if (sort === 'lowest-price')   filtered.sort((a, b) => a.minPrice - b.minPrice)
        else if (sort === 'most-campaigns') filtered.sort((a, b) => b.completedCampaigns - a.completedCampaigns)
        setTotal(filtered.length)
        setTalents(filtered)
        return
      }

      setTotal(mapped.length)
      setTalents(mapped)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [
    search, selectedNiches, selectedPlatforms, minPrice, maxPrice, selectedTiers, availableOnly,
    selectedLocations, selectedGenders, selectedAgeRanges, selectedFollowerRanges,
    selectedContentTypes, selectedLanguages, sort,
  ])

  useEffect(() => { fetchTalents() }, [fetchTalents])

  useEffect(() => { setVisibleCount(PAGE_SIZE) }, [
    search, selectedNiches, selectedPlatforms, minPrice, maxPrice,
    selectedTiers, availableOnly, selectedLocations, selectedGenders,
    selectedAgeRanges, selectedFollowerRanges, selectedContentTypes, selectedLanguages, sort,
  ])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !loading && visibleCount < talents.length) {
        setVisibleCount(c => c + PAGE_SIZE)
      }
    }, { threshold: 0.1 })
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [loading, visibleCount, talents.length])

  const toggleNiche    = n => setSelectedNiches(prev => prev.includes(n) ? prev.filter(x => x !== n) : [...prev, n])
  const toggleTier     = t => setSelectedTiers(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])
  const togglePlatform = p => setSelectedPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])
  const toggleLocation = l => setSelectedLocations(prev => prev.includes(l) ? prev.filter(x => x !== l) : [...prev, l])
  const toggleGender   = g => setSelectedGenders(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g])
  const toggleAge      = a => setSelectedAgeRanges(prev => prev.some(r => r.label === a.label) ? prev.filter(r => r.label !== a.label) : [...prev, a])
  const toggleFollower = f => setSelectedFollowerRanges(prev => prev.some(r => r.label === f.label) ? prev.filter(r => r.label !== f.label) : [...prev, f])
  const toggleContent  = c => setSelectedContentTypes(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])
  const toggleLanguage = l => setSelectedLanguages(prev => prev.includes(l) ? prev.filter(x => x !== l) : [...prev, l])

  const resetFilters = () => {
    setSelectedNiches([])
    setSelectedPlatforms([])
    setMinPrice('')
    setMaxPrice('')
    setSelectedTiers([])
    setAvailableOnly(false)
    setSelectedLocations([])
    setSelectedGenders([])
    setSelectedAgeRanges([])
    setSelectedFollowerRanges([])
    setSelectedContentTypes([])
    setSelectedLanguages([])
    setVisibleCount(PAGE_SIZE)
  }

  const activeFilterCount =
    selectedNiches.length + selectedPlatforms.length + selectedTiers.length + selectedLocations.length +
    selectedGenders.length + selectedAgeRanges.length + selectedFollowerRanges.length +
    selectedContentTypes.length + selectedLanguages.length + (availableOnly ? 1 : 0)

  return {
    talents, total, loading, error,
    search, setSearch,
    selectedNiches, selectedPlatforms, minPrice, setMinPrice, maxPrice, setMaxPrice,
    selectedTiers, availableOnly, setAvailableOnly,
    selectedLocations, selectedGenders, selectedAgeRanges, selectedFollowerRanges,
    selectedContentTypes, selectedLanguages,
    sort, setSort,
    visibleCount, setVisibleCount,
    mobileFiltersOpen, setMobileFiltersOpen,
    sentinelRef,
    toggleNiche, toggleTier, togglePlatform, toggleLocation, toggleGender,
    toggleAge, toggleFollower, toggleContent, toggleLanguage,
    resetFilters, fetchTalents,
    activeFilterCount,
  }
}
