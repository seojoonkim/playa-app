import fs from 'node:fs'

const landing = fs.readFileSync(new URL('../src/pages/Landing.tsx', import.meta.url), 'utf8')
const css = fs.readFileSync(new URL('../src/index.css', import.meta.url), 'utf8')

const blocks = (source, marker) => {
  const found = []
  let cursor = 0
  while (cursor < source.length) {
    const start = source.indexOf(marker, cursor)
    if (start < 0) break
    const open = source.indexOf('{', start + marker.length)
    if (open < 0) break
    let depth = 1
    let end = open + 1
    for (; end < source.length && depth; end += 1) {
      if (source[end] === '{') depth += 1
      if (source[end] === '}') depth -= 1
    }
    found.push(source.slice(open + 1, end - 1))
    cursor = end
  }
  return found
}
const hasBlock = (selector, declarations) =>
  blocks(css, selector).some((body) => declarations.every((value) => body.includes(value)))

const koFacts = [
  "{ k: 'Belonging', v: '누구에게나 열려 있지는 않습니다. 서로의 시간과 태도를 알아보는 멤버를 위한 곳입니다.' }",
  "{ k: 'A day', v: '정해진 코스 없이, 그날 필요한 장면을 고릅니다.' }",
]
const enFacts = [
  "{ k: 'Belonging', v: 'Not a place open to everyone, but one for members who recognise and respect one another’s time.' }",
  "{ k: 'A day', v: 'There is no fixed sequence. Choose what the day calls for.' }",
]
const ordered = (values) => values.every((value, index) => landing.indexOf(value) >= 0 && (index === 0 || landing.indexOf(values[index - 1]) < landing.indexOf(value)))

const checks = [
  ['manifesto class exists', landing.includes('pl-facts pl-facts--manifesto')],
  ['semantic description list remains', landing.includes('<dl className="pl-facts pl-facts--manifesto"') && landing.includes('<dt>{fact.k}</dt>') && landing.includes('<dd>{fact.v}</dd>')],
  ['Korean fact copy and order remain exact', ordered(koFacts)],
  ['English fact copy and order remain exact', ordered(enFacts)],
  ['mobile second row offset is exact', hasBlock('.pl-facts--manifesto > div:nth-child(2)', ['width: calc(100% - 28px)', 'margin-left: 28px'])],
  ['desktop second row offset is exact', hasBlock('.pl-facts--manifesto > div:nth-child(2)', ['width: calc(100% - 88px)', 'margin-left: 88px'])],
  ['decorative number markers are hidden', landing.includes('className="pl-facts__index" aria-hidden="true"') && landing.includes("String(index + 1).padStart(2, '0')")],
  ['desktop vertical labels exist', hasBlock('.pl-facts--manifesto dt', ['writing-mode: vertical-rl', 'transform: rotate(180deg)'])],
  ['mobile labels return horizontal', hasBlock('.pl-facts--manifesto dt', ['writing-mode: horizontal-tb', 'transform: none'])],
  ['reduced motion overrides hidden state', hasBlock('.pl-facts--manifesto:not(.is-visible) > div,\n  .pl-facts--manifesto > div', ['opacity: 1', 'transform: none', 'transition: none'])],
  ['invitation title remains', landing.includes('pl-display pl-invite__title') && landing.includes('{t.invitation.title}')],
  ['invitation body remains', landing.includes('pl-invite__copy') && landing.includes('{t.invitation.body}')],
  ['four ways remains protected', landing.includes('pl-ways pl-flow pl-flow--warm') && landing.includes('{t.ways.title}')],
]

let failed = 0
for (const [name, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}`)
  if (!ok) failed += 1
}
process.exitCode = failed ? 1 : 0
