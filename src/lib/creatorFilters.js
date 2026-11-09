// Shared creator-discovery constants, formatters, and mock data.
// Consumed by useCreatorSearch hook and both discovery pages.

export const NICHES = [
  { label: 'Beauty & Skincare', emoji: '💄' },
  { label: 'Fashion & Style',   emoji: '👗' },
  { label: 'Food & Cooking',    emoji: '🍳' },
  { label: 'Tech & Gadgets',    emoji: '💻' },
  { label: 'Fitness & Wellness',emoji: '💪' },
  { label: 'Travel & Lifestyle',emoji: '✈️'  },
  { label: 'Entertainment',     emoji: '🎬' },
  { label: 'Comedy',            emoji: '😂' },
  { label: 'Music',             emoji: '🎵' },
  { label: 'Finance & Business',emoji: '💼' },
]

export const NICHE_LABELS = NICHES.map(n => n.label)

export const LOCATIONS = ['Lagos', 'Abuja', 'Accra, Ghana', 'Kumasi, Ghana', 'Nairobi, Kenya', 'Mombasa, Kenya']

export const GENDERS = ['Male', 'Female', 'Non-binary']

export const AGE_RANGES = [
  { label: '18–24', min: 18, max: 24 },
  { label: '25–34', min: 25, max: 34 },
  { label: '35–44', min: 35, max: 44 },
  { label: '45+',   min: 45, max: 99 },
]

export const FOLLOWER_RANGES = [
  { label: 'Nano  · < 10K',    min: 0,      max: 9999    },
  { label: 'Micro · 10K–50K',  min: 10000,  max: 50000   },
  { label: 'Mid   · 50K–200K', min: 50001,  max: 200000  },
  { label: 'Macro · 200K–1M',  min: 200001, max: 1000000 },
  { label: 'Mega  · 1M+',      min: 1000001,max: Infinity },
]

export const CONTENT_TYPES = ['Photo', 'Video', 'Reels', 'Stories', 'Podcast', 'Tutorial', 'Music']

export const LANGUAGES = ['English', 'French', 'Swahili', 'Hausa', 'Yoruba', 'Igbo', 'Twi', 'Amharic']

export const SORT_OPTIONS = [
  { value: 'relevant',       label: 'Most Relevant'   },
  { value: 'highest-rated',  label: 'Highest Rated'   },
  { value: 'lowest-price',   label: 'Lowest Price'    },
  { value: 'most-campaigns', label: 'Most Campaigns'  },
]

export const PAGE_SIZE = 9

export function formatNGN(amount) {
  if (!amount && amount !== 0) return '₦0'
  return '₦' + Number(amount).toLocaleString('en')
}

export function formatFollowers(n) {
  if (!n) return '0'
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return String(n)
}

export const MOCK_CREATORS = Array.from({ length: 12 }, (_, i) => ({
  _id: `talent_${i + 1}`,
  name: ['Adaeze Okafor', 'Chidi Nwosu', 'Fatimah Abdullahi', 'Emeka Eze', 'Ngozi Obi', 'Tunde Bakare',
    'Amaka Igwe', 'Femi Adeyemi', 'Chisom Okonkwo', 'Uche Nwachukwu', 'Bisi Alabi', 'Kemi Adeleke'][i],
  handle: ['adaeze_glam', 'chidi_tech', 'fatimah_style', 'emeka_eats', 'ngozi_fit', 'tunde_comedy',
    'amaka_luxe', 'femi_finance', 'chisom_travel', 'uche_music', 'bisi_beauty', 'kemi_hustle'][i],
  location: ['Lagos', 'Accra, Ghana', 'Nairobi, Kenya', 'Abuja', 'Nairobi, Kenya', 'Kumasi, Ghana',
    'Lagos', 'Accra, Ghana', 'Nairobi, Kenya', 'Lagos', 'Mombasa, Kenya', 'Accra, Ghana'][i],
  niches: [
    ['Beauty & Skincare', 'Fashion & Style'],
    ['Tech & Gadgets', 'Finance & Business'],
    ['Fashion & Style', 'Travel & Lifestyle'],
    ['Food & Cooking', 'Entertainment'],
    ['Fitness & Wellness'],
    ['Comedy', 'Entertainment'],
    ['Fashion & Style', 'Beauty & Skincare'],
    ['Finance & Business'],
    ['Travel & Lifestyle', 'Entertainment'],
    ['Music', 'Entertainment'],
    ['Beauty & Skincare'],
    ['Finance & Business', 'Fitness & Wellness'],
  ][i],
  tier: ['fast-rising', 'next-rated', 'top-rated', 'next-rated', 'top-rated', 'next-rated',
    'top-rated', 'fast-rising', 'next-rated', 'top-rated', 'fast-rising', 'next-rated'][i],
  avgRating:    [4.8, 4.5, 4.9, 4.3, 4.7, 4.6, 5.0, 4.1, 4.4, 4.8, 3.9, 4.2][i],
  totalFollowers:[125000, 45000, 280000, 62000, 189000, 310000, 95000, 28000, 74000, 420000, 18000, 55000][i],
  avgEngagement: [4.2, 5.1, 3.8, 6.3, 4.9, 5.5, 3.2, 7.1, 4.7, 3.1, 8.2, 5.8][i],
  completedCampaigns:[47, 23, 89, 31, 64, 112, 38, 11, 29, 143, 7, 19][i],
  minPrice:     [25000, 15000, 75000, 18000, 45000, 100000, 55000, 10000, 22000, 150000, 8000, 20000][i],
  availableForHire:[true, true, false, true, true, false, true, true, true, false, true, true][i],
  gender: ['Female','Male','Female','Male','Female','Male','Female','Male','Female','Male','Female','Female'][i],
  age:    [24, 28, 31, 26, 29, 33, 27, 35, 23, 32, 22, 30][i],
  languages: [
    ['English','Yoruba'],['English','Igbo'],['English','Swahili'],['English','Igbo'],
    ['English','Swahili'],['English','Twi'],['English','Yoruba'],['English','Yoruba'],
    ['English','Igbo'],['English','Igbo'],['English','Swahili'],['English','Twi'],
  ][i],
  contentTypes: [
    ['Reels','Photo'],['Video','Tutorial'],['Photo','Stories'],['Video','Reels'],
    ['Video','Stories'],['Video','Reels'],['Photo','Reels','Stories'],['Video','Podcast'],
    ['Photo','Stories','Video'],['Video','Music'],['Reels','Photo'],['Video','Podcast'],
  ][i],
  platforms: [
    ['Instagram','TikTok'],
    ['YouTube','Twitter/X','LinkedIn'],
    ['Instagram','TikTok','YouTube'],
    ['TikTok','Instagram'],
    ['Instagram','YouTube'],
    ['TikTok','YouTube','Facebook'],
    ['Instagram','Snapchat'],
    ['LinkedIn','Twitter/X'],
    ['Instagram','TikTok','Snapchat'],
    ['YouTube','Instagram','Twitter/X'],
    ['TikTok','Instagram'],
    ['LinkedIn','Twitter/X','Instagram'],
  ][i],
  featuredVideo: [
    'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  ][i],
}))
