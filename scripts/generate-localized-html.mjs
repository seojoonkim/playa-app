import { mkdir, readFile, writeFile } from 'node:fs/promises'

const rootPath = new URL('../dist/index.html', import.meta.url)
const source = await readFile(rootPath, 'utf8')
const titleKo = 'PLAYA | 서울 프라이빗 웰니스 멤버십 클럽'
const descriptionKo = '운동과 회복, 미식과 대화가 이어지는 서울 강남 도산대로의 프라이빗 웰니스 멤버십 클럽 PLAYA.'
const titleEn = 'PLAYA | Private Wellness Membership in Seoul'
const descriptionEn = 'PLAYA is a private wellness members club on Dosan-daero, where movement, recovery, dining and conversation meet.'

const english = source
  .replace('<html lang="ko">', '<html lang="en">')
  .replace(`<title>${titleKo}</title>`, `<title>${titleEn}</title>`)
  .replaceAll(descriptionKo, descriptionEn)
  .replaceAll(titleKo, titleEn)
  .replace('property="og:url" content="https://playa-landing-alpha.vercel.app/"', 'property="og:url" content="https://playa-landing-alpha.vercel.app/en"')
  .replace('property="og:locale" content="ko_KR"', 'property="og:locale" content="en_US"')
  .replace('property="og:locale:alternate" content="en_US"', 'property="og:locale:alternate" content="ko_KR"')

await Promise.all([
  mkdir(new URL('../dist/en/', import.meta.url), { recursive: true }),
  mkdir(new URL('../dist/en/apply/', import.meta.url), { recursive: true }),
])
const englishApply = english.replace(
  'property="og:url" content="https://playa-landing-alpha.vercel.app/en"',
  'property="og:url" content="https://playa-landing-alpha.vercel.app/en/apply"',
)

await Promise.all([
  writeFile(new URL('../dist/en/index.html', import.meta.url), english),
  writeFile(new URL('../dist/en/apply/index.html', import.meta.url), englishApply),
])

console.log('Generated localized English HTML for /en and /en/apply')
