import fs from 'node:fs'

const landing = fs.readFileSync(new URL('../src/pages/Landing.tsx', import.meta.url), 'utf8')
const css = fs.readFileSync(new URL('../src/index.css', import.meta.url), 'utf8')

const ways = landing.indexOf('className="pl-ivory pl-ways')
const location = landing.indexOf('className="pl-place pl-flow')
const journey = landing.indexOf('className="pl-journey-section"')
const day = landing.indexOf('className="pl-day"')

const checks = [
  ['section order is ways, location, journey, day', ways >= 0 && ways < location && location < journey && journey < day],
  ['journey is independent from ways', /<section className="pl-journey-section"[\s\S]*?<div className="pl-journey pl-bleed">/.test(landing)],
  ['location keeps olive authority', css.includes('.pl-place {\n  background: var(--olive);')],
  ['journey uses warm sand background', css.includes('.pl-journey-section {\n  background: var(--ivory-deep);')],
  ['journey standalone spacing removes nested offset', css.includes('.pl-journey-section .pl-journey {\n  margin-top: 0;\n  padding-top: 0;\n  border-top: 0;')],
  ['journey heading hierarchy is valid', landing.includes('<h2 className="pl-display pl-journey__title" id="journey-title">') && landing.includes('<h3>{step.title}</h3>')],
]

const failures = checks.filter(([, passed]) => !passed)
for (const [name, passed] of checks) console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`)
if (failures.length) process.exit(1)
