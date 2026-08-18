import fs from 'node:fs'

const css = fs.readFileSync(new URL('../src/index.css', import.meta.url), 'utf8')
const marker = 'Mobile motion pass: slower, compositor-friendly, and free of clip-path reveals.'
const start = css.indexOf(marker)
const mobile = start >= 0 ? css.slice(start) : ''

const checks = [
  ['mobile motion layer exists', start >= 0],
  ['mobile breakpoint is scoped', mobile.includes('@media (max-width: 759px) and (prefers-reduced-motion: no-preference)')],
  ['refined reveal easing exists', mobile.includes('--ease-reveal-opacity: cubic-bezier(0.33, 0.08, 0.2, 1)') && mobile.includes('--ease-reveal-settle: cubic-bezier(0.16, 1, 0.3, 1)')],
  ['common opacity settles gradually', mobile.includes('opacity 1650ms var(--ease-reveal-opacity)')],
  ['common transform settles gradually', mobile.includes('transform 1950ms var(--ease-reveal-settle)')],
  ['image filter settles gradually', mobile.includes('filter 2400ms var(--ease-reveal-opacity)')],
  ['image transform settles gradually', mobile.includes('transform 2700ms var(--ease-reveal-settle)')],
  ['mobile reveal cadence is expanded', css.includes('.pl-flow { --reveal-step: 72ms; }') && css.includes('.pl-flow [data-reveal="image"] { --reveal-step: 86ms; }')],
  ['reset shower crop is raised', css.includes('.pl-rhythm--reset .pl-rhythm__media img { object-position: 50% 25%; }')],
  ['hero fade is 1.5x', mobile.includes('.pl-hero__frame { transition-duration: 1350ms; }')],
  ['hero intro is 1.5x', mobile.includes('animation-duration: 1650ms') && mobile.includes('animation-duration: 1470ms')],
  ['hero story is 1.5x', mobile.includes('.pl-hero__story { animation-duration: 780ms; }')],
  ['hero ambient effects are 1.5x', mobile.includes('animation-duration: 11.1s') && mobile.includes('animation-duration: 4.2s')],
  ['link and form feedback are 1.5x', mobile.includes('.pl-underline { transition-duration: 600ms, 600ms; }') && mobile.includes('.pl-apply__field input { transition-duration: 375ms; }') && mobile.includes('.pl-apply__submit { transition-duration: 450ms, 450ms; }')],
  ['spaces transitions are 1.5x', mobile.includes('transform 1125ms var(--ease), opacity 975ms var(--ease)') && mobile.includes('.pl-slide img { transition-duration: 1800ms; }')],
  ['members transitions are 1.5x', mobile.includes('transition-duration: 1350ms') && mobile.includes('opacity 1200ms var(--ease), transform 2100ms')],
  ['mobile reveal clip paths are removed', mobile.includes('clip-path: none;')],
  ['mobile reveal travel is reduced', mobile.includes('translate3d(0, 14px, 0)') && mobile.includes('translate3d(0, 22px, 0)')],
  ['will-change excludes clip-path on mobile', mobile.includes('will-change: opacity, transform;')],
  ['reduced motion remains after mobile layer', mobile.lastIndexOf('@media (prefers-reduced-motion: reduce)') > mobile.indexOf('@media (max-width: 759px)')],
  ['hero functional timing remains synchronized', css.includes('animation: pl-hero-progress 6500ms linear forwards') && css.includes('const HERO_INTERVAL = 6500') === false],
]

const failures = checks.filter(([, ok]) => !ok)
if (failures.length) {
  for (const [name] of failures) console.error(`FAIL ${name}`)
  process.exit(1)
}
console.log(`PASS ${checks.length}/${checks.length} mobile motion contracts`)
