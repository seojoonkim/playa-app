import fs from 'node:fs'

const landing = fs.readFileSync(new URL('../src/pages/Landing.tsx', import.meta.url), 'utf8')
const manifest = JSON.parse(fs.readFileSync(new URL('../public/images/playa-space-official/manifest.json', import.meta.url), 'utf8'))

const checks = [
  ['Korean golf-room name', landing.includes("name: { ko: '골프 연습실', en: 'Screen Golf' }")],
  ['Screen Golf image', landing.includes("imagePath: '/images/playa-space-official/screen-golf.webp'")],
  ['Screen Golf description', landing.includes('TRACKMAN TMiO로 스윙을 정교하게 읽는 실내 스크린 골프.')],
  ['Bornyon image', landing.includes("imagePath: '/images/playa-bornyon-official/bornyon-dining-room.webp'")],
  ['Bornyon description', landing.includes('도심 전망과 우드파이어 요리를 누리는 멤버 전용 다이닝.')],
  ['Concierge image', landing.includes("imagePath: '/images/playa-space-official/concierge.webp'")],
  ['Concierge description', landing.includes('와인, 레스토랑, 부동산을 위한 전문 추천과 맞춤 서비스.')],
  ['Korean footer name', landing.includes("golf: '골프 연습실'" )],
  ['English footer name', landing.includes("golf: 'Screen Golf'" )],
  ['Official source manifest', manifest.items.length === 2 && manifest.items.every((item) => item.source_page.startsWith('https://playa.club/'))],
]

for (const [label, pass] of checks) console.log(`${pass ? 'PASS' : 'FAIL'} ${label}`)
const passed = checks.filter(([, pass]) => pass).length
console.log(`\n${passed}/${checks.length} checks passed`)
if (passed !== checks.length) process.exit(1)
