import fs from 'node:fs'

const landing = fs.readFileSync(new URL('../src/pages/Landing.tsx', import.meta.url), 'utf8')
const css = fs.readFileSync(new URL('../src/index.css', import.meta.url), 'utf8')

const checks = [
  ['tonal flow classes exist', landing.includes('pl-flow--warm') && landing.includes('pl-flow--quiet') && landing.includes('pl-flow--deep')],
  ['whitespace rhythm classes exist', landing.includes('pl-space--breathe') && landing.includes('pl-space--editorial') && landing.includes('pl-space--dense')],
  ['light lounges use quiet ambient light', landing.includes('pl-lounges pl-flow pl-flow--quiet pl-space--editorial')],
  ['hero remains outside global flow system', /className="pl-hero"/.test(landing) && !/className="pl-hero[^\"]*pl-flow/.test(landing)],
  ['day remains outside global flow system', /className="pl-day"/.test(landing) && !/className="pl-day[^\"]*pl-flow/.test(landing)],
  ['final remains outside global flow system', /className="pl-final"/.test(landing) && !/className="pl-final[^\"]*pl-flow/.test(landing)],
  ['reveal order is assigned by the hook', landing.includes("style.setProperty('--reveal-order'")],
  ['flow visibility is observed once', landing.includes("section.classList.add('is-flow-visible')") && landing.includes('sectionObserver.unobserve')],
  ['tonal drift styling exists', css.includes('.pl-flow::before') && css.includes('.pl-flow--warm') && css.includes('.pl-flow--quiet') && css.includes('.pl-flow--deep')],
  ['cadence uses reveal order', css.includes('var(--reveal-order') && css.includes('--reveal-step')],
  ['whitespace system is responsive', css.includes('.pl-space--breathe') && css.includes('.pl-space--editorial') && css.includes('.pl-space--dense')],
  ['reduced motion disables flow transitions', /prefers-reduced-motion[\s\S]*?\.pl-flow::before[\s\S]*?transition:\s*none/.test(css)],
  ['members portrait remains included', landing.includes('pl-members__portrait') && css.includes('.pl-members__orbit')],
  ['footer restoration remains included', landing.includes('footerSpaces.map') && landing.includes('pl-footer__mark">PLAYA')],
]

const failures = checks.filter(([, passed]) => !passed)
for (const [name, passed] of checks) console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`)
if (failures.length) process.exit(1)
