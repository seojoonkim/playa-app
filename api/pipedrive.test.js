import assert from 'node:assert/strict'
import test from 'node:test'
import { createHandler } from './pipedrive.js'

const validPayload = {
  name: 'Kim Test', phone: '+82 10-1234-5678', company: 'PLAYA Client', source: 'framer',
  sourceLabel: 'Contact funnel', referrer: 'https://example.com/start', pageReferrer: 'https://example.com/page',
  callTimes: ['Weekday afternoon'], fastTrack: true, locale: 'ko', quiz: { q1: 'community', q2: true },
  report: { en: 'A', ko: '가', desc: 'Description', w: 92, c: 44, b: 28, day: 'Monday' },
  answers: { role: { v: 'CEO', label: 'Role' }, size: { v: 12, label: 'Team size' } },
}
const env = { PIPEDRIVE_API_TOKEN: 'test-token', PLAYA_ALLOWED_ORIGINS: 'https://playa.framer.website', NODE_ENV: 'production' }

function req(body = validPayload, method = 'POST', origin = 'https://playa.framer.website') {
  return { method, body, headers: { origin, 'content-type': 'application/json' } }
}
function res() {
  return {
    headers: {}, statusCode: 0, body: undefined,
    setHeader(key, value) { this.headers[key] = value },
    status(code) { this.statusCode = code; return this },
    json(body) { this.body = body; return this },
    end() { return this },
  }
}
function jsonResponse(data, status = 200) {
  return { ok: status >= 200 && status < 300, status, async json() { return { success: status < 400, data } } }
}
function mockFetch(sequence) {
  const calls = []
  const fetchImpl = async (url, options) => {
    calls.push({ url: String(url), options })
    const next = sequence.shift()
    if (!next) throw new Error(`Unexpected fetch: ${url}`)
    return typeof next === 'function' ? next(url, options) : next
  }
  return { fetchImpl, calls }
}

async function invoke(sequence, body = validPayload) {
  const mock = mockFetch(sequence)
  const response = res()
  await createHandler({ env, fetchImpl: mock.fetchImpl })(req(body), response)
  return { response, calls: mock.calls }
}

test('validates required fields, shape, size, CORS, OPTIONS and methods', async () => {
  let response = res()
  await createHandler({ env })(req({ ...validPayload, phone: '' }), response)
  assert.equal(response.statusCode, 400)
  assert.match(response.body.error, /phone is required/)

  response = res()
  await createHandler({ env })(req({ ...validPayload, answers: { bad: 'value' } }), response)
  assert.equal(response.statusCode, 400)

  response = res()
  await createHandler({ env })(req({ ...validPayload, company: 'x'.repeat(301) }), response)
  assert.equal(response.statusCode, 400)

  response = res()
  await createHandler({ env })(req(validPayload, 'OPTIONS'), response)
  assert.equal(response.statusCode, 204)
  assert.equal(response.headers['Access-Control-Allow-Origin'], 'https://playa.framer.website')

  response = res()
  await createHandler({ env })(req(validPayload, 'GET'), response)
  assert.equal(response.statusCode, 405)
  assert.equal(response.headers.Allow, 'POST, OPTIONS')

  response = res()
  const wrongType = req(validPayload)
  wrongType.headers['content-type'] = 'text/plain'
  await createHandler({ env })(wrongType, response)
  assert.equal(response.statusCode, 415)

  response = res()
  await createHandler({ env })(req(validPayload, 'POST', 'https://evil.example'), response)
  assert.equal(response.statusCode, 403)
})

test('creates a new person, deal, complete note and call activity', async () => {
  const { response, calls } = await invoke([
    jsonResponse({ items: [] }), jsonResponse({ id: 10 }), jsonResponse({ items: [] }), jsonResponse({ id: 20 }),
    jsonResponse([]), jsonResponse({ id: 30 }), jsonResponse([]), jsonResponse({ id: 40 }),
  ])
  assert.equal(response.statusCode, 201)
  assert.deepEqual(response.body.created, { person: true, deal: true, note: true, activity: true })
  assert.equal(calls.length, 8)
  assert.match(calls[0].url, /persons\/search/)
  assert.match(calls[1].url, /\/persons\?/)
  const personBody = JSON.parse(calls[1].options.body)
  assert.equal(personBody.phone[0], validPayload.phone)
  const dealBody = JSON.parse(calls[3].options.body)
  assert.match(dealBody.title, /PLAYA-FUNNEL:[a-f0-9]{24}/)
  const noteBody = JSON.parse(calls[5].options.body)
  for (const text of ['Kim Test', 'PLAYA Client', 'Contact funnel', 'Page referrer', 'Quiz q1', 'community', 'Report desc', '92', 'Answer role', 'CEO', 'Team size']) {
    assert.match(noteBody.content, new RegExp(text))
  }
  const activityBody = JSON.parse(calls[7].options.body)
  assert.equal(activityBody.type, 'call')
  assert.match(activityBody.note, /Weekday afternoon/)
  assert.ok(calls.every(call => call.url.includes('api_token=test-token')))
})

test('accepts the published Framer payload shapes for quiz and numeric report scores', async () => {
  const actualShape = {
    ...validPayload,
    quiz: { q1: 'community', q2: 2 },
    report: { en: 'THE MORNING ATHLETE', ko: '몸으로 하루를 여는 사람', desc: '리듬 설명', w: 92, c: 44, b: 28, day: '아침 운동' },
    answers: {
      region: { v: 'gangnam', label: '강남구' }, work: { v: 'founder', label: '법인대표 · 창업가' },
      rhythm: { v: 'exercise', label: '운동으로 몸을 깨웁니다' }, purpose: { v: 'wellness', label: '운동과 컨디션 관리' },
      wellness: { v: 'routine', label: '매일의 루틴입니다' }, awareness: { v: 'current', label: '이용해 봤거나, 이용 중입니다' },
      connection: { v: 'first', label: '먼저 다가가는 편입니다' }, experience: { v: 'crowded', label: '혼잡과 예약 경쟁' },
      together: { v: 'family', label: '배우자, 그리고 가족' },
    },
  }
  const { response, calls } = await invoke([
    jsonResponse({ items: [{ item: { id: 77 } }] }), jsonResponse({ items: [] }), jsonResponse({ id: 88 }),
    jsonResponse([]), jsonResponse({ id: 99 }), jsonResponse([]), jsonResponse({ id: 100 }),
  ], actualShape)
  assert.equal(response.statusCode, 201)
  const noteCall = calls.find(call => new URL(call.url).pathname.endsWith('/notes') && call.options.method === 'POST')
  const noteBody = JSON.parse(noteCall.options.body)
  for (const expected of ['Quiz q1', 'community', 'Report w', '92', 'Answer region', '강남구', 'Answer together', '배우자, 그리고 가족']) {
    assert.match(noteBody.content, new RegExp(expected))
  }
})

test('reuses a person found by normalized phone', async () => {
  const noCalls = { ...validPayload, callTimes: [] }
  const { response, calls } = await invoke([
    jsonResponse({ items: [{ item: { id: 77 } }] }), jsonResponse({ items: [] }), jsonResponse({ id: 88 }),
    jsonResponse([]), jsonResponse({ id: 99 }),
  ], noCalls)
  assert.equal(response.statusCode, 201)
  assert.equal(response.body.personId, 77)
  assert.equal(response.body.created.person, false)
  assert.equal(response.body.created.activity, false)
  assert.equal(calls.filter(call => new URL(call.url).pathname.endsWith('/persons')).length, 0)
  assert.match(new URL(calls[0].url).searchParams.get('term'), /^\+821012345678$/)
})

test('retry finds stable deal marker and does not create a second primary record', async () => {
  let captured
  const sequence = [
    jsonResponse({ items: [{ item: { id: 7 } }] }),
    (url) => { captured = new URL(url).searchParams.get('term'); return jsonResponse({ items: [{ item: { id: 8 } }] }) },
    () => jsonResponse([{ id: 9, content: `already ${captured}` }]),
    () => jsonResponse([{ id: 10, subject: `call ${captured}` }]),
  ]
  const { response, calls } = await invoke(sequence)
  assert.match(captured, /^PLAYA-FUNNEL:[a-f0-9]{24}$/)
  assert.equal(response.statusCode, 200)
  assert.equal(response.body.idempotent, true)
  assert.deepEqual(response.body.created, { person: false, deal: false, note: false, activity: false })
  assert.equal(calls.some(call => new URL(call.url).pathname.endsWith('/deals') && call.options.method === 'POST'), false)
})

test('reports upstream failure stage without leaking upstream response', async () => {
  const { response } = await invoke([jsonResponse(null, 503)])
  assert.equal(response.statusCode, 502)
  assert.deepEqual(response.body, { ok: false, error: 'Pipedrive request failed', stage: 'person search', retryable: true })
})

test('partial retry after deal creation reuses deal and completes missing note', async () => {
  const noCalls = { ...validPayload, callTimes: [] }
  const { response, calls } = await invoke([
    jsonResponse({ items: [{ item: { id: 1 } }] }), jsonResponse({ items: [{ item: { id: 2 } }] }),
    jsonResponse([]), jsonResponse({ id: 3 }),
  ], noCalls)
  assert.equal(response.statusCode, 200)
  assert.equal(response.body.created.deal, false)
  assert.equal(response.body.created.note, true)
  assert.equal(calls.filter(call => call.options.method === 'POST').length, 1)
  assert.match(calls.find(call => call.options.method === 'POST').url, /\/notes\?/)
})
