import fs from 'node:fs'

const landing = fs.readFileSync(new URL('../src/pages/Landing.tsx', import.meta.url), 'utf8')
const css = fs.readFileSync(new URL('../src/index.css', import.meta.url), 'utf8')

const checks = [
  ['members portrait stage exists', landing.includes('pl-members__portrait')],
  ['age orbit exists', landing.includes('pl-members__orbit')],
  ['composition sequence marker exists', landing.includes('pl-members__sequence')],
  ['members portrait styling exists', css.includes('.pl-members__portrait')],
  ['reduced motion covers member orbit', /prefers-reduced-motion[\s\S]*pl-members__orbit/.test(css)],
  ['footer spaces column restored', landing.includes('t.footer.spaces') && landing.includes('footerSpaces.map')],
  ['footer more column restored', landing.includes('t.footer.more') && landing.includes('t.footer.instagram')],
  ['footer text mark restored', landing.includes('<p className="pl-footer__mark">PLAYA</p>')],
]

const failed = checks.filter(([, ok]) => !ok)
for (const [name, ok] of checks) console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`)
if (failed.length) process.exit(1)
