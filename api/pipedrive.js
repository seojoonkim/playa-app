import { createHash } from 'node:crypto'

const MAX_BODY_BYTES = 64 * 1024
const STRING_LIMITS = {
  name: 200, phone: 80, company: 300, source: 200, sourceLabel: 300,
  referrer: 2048, locale: 20, pageReferrer: 2048,
}
const REPORT_KEYS = ['en', 'ko', 'desc', 'w', 'c', 'b', 'day']
const MAX_ANSWERS = 100
const MAX_CALL_TIMES = 20
const MARKER_PREFIX = 'PLAYA-FUNNEL:'

class RequestError extends Error {
  constructor(message, status = 400) {
    super(message)
    this.status = status
  }
}

class PipedriveError extends Error {
  constructor(operation, status) {
    super(`Pipedrive ${operation} failed`)
    this.operation = operation
    this.status = status
  }
}

function ownObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function limitedString(value, field, max, required = false) {
  if (value === undefined || value === null) {
    if (required) throw new RequestError(`${field} is required`)
    return ''
  }
  if (typeof value !== 'string') throw new RequestError(`${field} must be a string`)
  const result = value.trim()
  if (required && !result) throw new RequestError(`${field} is required`)
  if (result.length > max) throw new RequestError(`${field} is too long`)
  return result
}

function limitedScalar(value, field, max) {
  if (value === undefined || value === null) return ''
  if (!['string', 'number', 'boolean'].includes(typeof value)) {
    throw new RequestError(`${field} must be a scalar`)
  }
  const result = String(value).trim()
  if (result.length > max) throw new RequestError(`${field} is too long`)
  return result
}

function validateQuiz(input) {
  if (input === undefined || input === null) return {}
  if (!ownObject(input)) throw new RequestError('quiz must be an object')
  const entries = Object.entries(input)
  if (entries.length > 20) throw new RequestError('Too many quiz answers')
  return Object.fromEntries(entries.map(([key, value]) => {
    if (key.length > 100) throw new RequestError('Quiz key is too long')
    return [key, limitedScalar(value, `quiz.${key}`, 300)]
  }))
}

function validatePayload(input) {
  if (!ownObject(input)) throw new RequestError('JSON body must be an object')
  const rawSize = Buffer.byteLength(JSON.stringify(input))
  if (rawSize > MAX_BODY_BYTES) throw new RequestError('Request body is too large', 413)

  const payload = {}
  for (const [field, max] of Object.entries(STRING_LIMITS)) {
    payload[field] = limitedString(input[field], field, max, field === 'name' || field === 'phone')
  }
  if (input.fastTrack !== undefined && typeof input.fastTrack !== 'boolean') {
    throw new RequestError('fastTrack must be a boolean')
  }
  payload.fastTrack = input.fastTrack === true

  if (input.callTimes !== undefined && !Array.isArray(input.callTimes)) {
    throw new RequestError('callTimes must be an array')
  }
  if ((input.callTimes?.length || 0) > MAX_CALL_TIMES) throw new RequestError('Too many callTimes')
  payload.callTimes = (input.callTimes || []).map((value, index) =>
    limitedString(value, `callTimes[${index}]`, 200, true))
  payload.quiz = validateQuiz(input.quiz)

  if (input.report !== undefined && !ownObject(input.report)) throw new RequestError('report must be an object')
  payload.report = {}
  for (const key of REPORT_KEYS) {
    payload.report[key] = limitedScalar(input.report?.[key], `report.${key}`, key === 'desc' ? 4000 : 500)
  }

  if (input.answers !== undefined && !ownObject(input.answers)) throw new RequestError('answers must be an object')
  const entries = Object.entries(input.answers || {})
  if (entries.length > MAX_ANSWERS) throw new RequestError('Too many answers')
  payload.answers = {}
  for (const [key, answer] of entries) {
    if (key.length > 100) throw new RequestError('Answer key is too long')
    if (!ownObject(answer)) throw new RequestError(`answers.${key} must be an object`)
    const value = answer.v
    if (!(value === null || value === undefined || ['string', 'number', 'boolean'].includes(typeof value))) {
      throw new RequestError(`answers.${key}.v must be a scalar`)
    }
    const rendered = value === null || value === undefined ? '' : String(value)
    if (rendered.length > 2000) throw new RequestError(`answers.${key}.v is too long`)
    payload.answers[key] = {
      v: rendered,
      label: limitedString(answer.label, `answers.${key}.label`, 1000),
    }
  }
  return payload
}

function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`
  if (ownObject(value)) return `{${Object.keys(value).sort().map(k => `${JSON.stringify(k)}:${canonical(value[k])}`).join(',')}}`
  return JSON.stringify(value)
}

function normalizedPhone(phone) {
  const plus = phone.trim().startsWith('+') ? '+' : ''
  return plus + phone.replace(/\D/g, '')
}

function submissionMarker(payload) {
  const normalized = { ...payload, phone: normalizedPhone(payload.phone) }
  const digest = createHash('sha256').update(`${normalized.phone}\n${canonical(normalized)}`).digest('hex')
  return `${MARKER_PREFIX}${digest.slice(0, 24)}`
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char])
}

function row(label, value) {
  return `<p><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value || '—')}</p>`
}

function buildNote(payload, marker) {
  const metadata = [
    ['Idempotency marker', marker], ['Name', payload.name], ['Phone', payload.phone],
    ['Company', payload.company], ['Source', payload.source], ['Source label', payload.sourceLabel],
    ['Referrer', payload.referrer], ['Page referrer', payload.pageReferrer], ['Locale', payload.locale],
    ['Fast track', payload.fastTrack ? 'Yes' : 'No'], ['Requested call times', payload.callTimes.join(' | ')],
  ]
  const quiz = Object.entries(payload.quiz).map(([key, value]) => row(`Quiz ${key}`, value)).join('')
  const report = REPORT_KEYS.map(key => row(`Report ${key}`, payload.report[key])).join('')
  const answers = Object.entries(payload.answers).map(([key, answer]) =>
    row(`Answer ${key}${answer.label ? ` (${answer.label})` : ''}`, answer.v)).join('')
  return `<h2>PLAYA funnel submission</h2>${metadata.map(([k, v]) => row(k, v)).join('')}<h3>Quiz</h3>${quiz || '<p>—</p>'}<h3>Report</h3>${report}<h3>Answers</h3>${answers || '<p>—</p>'}`
}

function apiBase(env) {
  let configured = env.PIPEDRIVE_API_BASE
  if (!configured && env.PIPEDRIVE_COMPANY_DOMAIN) {
    const domain = env.PIPEDRIVE_COMPANY_DOMAIN.trim().replace(/^https?:\/\//, '').replace(/\..*$/, '')
    if (!/^[a-z0-9-]+$/i.test(domain)) throw new Error('Invalid PIPEDRIVE_COMPANY_DOMAIN')
    configured = `https://${domain}.pipedrive.com/api/v1`
  }
  configured ||= 'https://api.pipedrive.com/v1'
  const url = new URL(configured)
  if (url.protocol !== 'https:') throw new Error('PIPEDRIVE_API_BASE must use HTTPS')
  return url.toString().replace(/\/$/, '')
}

function createClient(env, fetchImpl) {
  const token = env.PIPEDRIVE_API_TOKEN
  if (!token) throw new Error('PIPEDRIVE_API_TOKEN is not configured')
  const base = apiBase(env)
  return async (operation, path, options = {}) => {
    const url = new URL(`${base}${path}`)
    url.searchParams.set('api_token', token)
    let response
    try {
      response = await fetchImpl(url, {
        ...options,
        headers: { 'content-type': 'application/json', ...options.headers },
        signal: options.signal || AbortSignal.timeout(10_000),
      })
    } catch {
      throw new PipedriveError(operation, 0)
    }
    let body = null
    try { body = await response.json() } catch { /* upstream may return no JSON */ }
    if (!response.ok || body?.success === false) throw new PipedriveError(operation, response.status)
    return body?.data
  }
}

function firstSearchId(data) {
  return data?.items?.[0]?.item?.id ?? null
}

async function ensurePerson(client, payload) {
  const found = await client('person search', `/persons/search?term=${encodeURIComponent(normalizedPhone(payload.phone))}&fields=phone&exact_match=true&limit=1`)
  const existing = firstSearchId(found)
  if (existing) return { id: existing, created: false }
  const created = await client('person creation', '/persons', {
    method: 'POST', body: JSON.stringify({ name: payload.name, phone: [payload.phone] }),
  })
  if (!created?.id) throw new PipedriveError('person creation', 502)
  return { id: created.id, created: true }
}

async function ensureDeal(client, payload, personId, marker) {
  // The marker is embedded in a human-friendly title, so use title search rather
  // than exact_match (which would require the entire title to equal the marker).
  const found = await client('deal idempotency search', `/deals/search?term=${encodeURIComponent(marker)}&fields=title&limit=1`)
  const existing = firstSearchId(found)
  if (existing) return { id: existing, created: false }
  const created = await client('deal creation', '/deals', {
    method: 'POST',
    body: JSON.stringify({ title: `${payload.name} — PLAYA 문의 [${marker}]`, person_id: personId, status: 'open' }),
  })
  if (!created?.id) throw new PipedriveError('deal creation', 502)
  return { id: created.id, created: true }
}

async function ensureNote(client, payload, dealId, marker) {
  const notes = await client('note lookup', `/notes?deal_id=${dealId}&limit=100&sort=id%20DESC`)
  if (Array.isArray(notes) && notes.some(note => String(note.content || '').includes(marker))) return false
  await client('note creation', '/notes', {
    method: 'POST', body: JSON.stringify({ deal_id: dealId, content: buildNote(payload, marker) }),
  })
  return true
}

async function ensureCall(client, payload, personId, dealId, marker) {
  if (!payload.callTimes.length) return false
  const activities = await client('activity lookup', `/activities?deal_id=${dealId}&limit=100&done=0`)
  if (Array.isArray(activities) && activities.some(activity => String(activity.subject || '').includes(marker))) return false
  await client('call activity creation', '/activities', {
    method: 'POST',
    body: JSON.stringify({
      subject: `PLAYA 상담 전화 [${marker}]`, type: 'call', person_id: personId, deal_id: dealId,
      note: `Requested call times: ${payload.callTimes.join(' | ')}`,
    }),
  })
  return true
}

function configuredOrigins(env) {
  return new Set(`${env.PLAYA_ALLOWED_ORIGINS || ''},${env.PLAYA_PREVIEW_ORIGINS || ''}`
    .split(',').map(value => value.trim().replace(/\/$/, '')).filter(Boolean))
}

function cors(req, res, env) {
  const origin = typeof req.headers?.origin === 'string' ? req.headers.origin.replace(/\/$/, '') : ''
  const allowed = configuredOrigins(env)
  let accepted = !origin || allowed.has(origin)
  if (origin && (env.NODE_ENV !== 'production' || env.PLAYA_ALLOW_LOCALHOST === 'true')) {
    try { accepted ||= ['localhost', '127.0.0.1', '::1'].includes(new URL(origin).hostname) } catch { accepted = false }
  }
  if (origin && accepted) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Vary', 'Origin')
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    res.setHeader('Access-Control-Max-Age', '86400')
  }
  return accepted
}

function send(res, status, body) {
  res.status(status).json(body)
}

export function createHandler({ env = process.env, fetchImpl = globalThis.fetch } = {}) {
  return async function handler(req, res) {
    if (!cors(req, res, env)) return send(res, 403, { ok: false, error: 'Origin not allowed' })
    if (req.method === 'OPTIONS') return res.status(204).end()
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST, OPTIONS')
      return send(res, 405, { ok: false, error: 'Method not allowed' })
    }
    try {
      const contentType = String(req.headers?.['content-type'] || '').toLowerCase()
      if (!contentType.startsWith('application/json')) throw new RequestError('Content-Type must be application/json', 415)
      const contentLength = Number(req.headers?.['content-length'] || 0)
      if (contentLength > MAX_BODY_BYTES) throw new RequestError('Request body is too large', 413)
      let body = req.body
      if (typeof body === 'string') {
        if (Buffer.byteLength(body) > MAX_BODY_BYTES) throw new RequestError('Request body is too large', 413)
        try { body = JSON.parse(body) } catch { throw new RequestError('Invalid JSON body') }
      }
      const payload = validatePayload(body)
      const marker = submissionMarker(payload)
      const client = createClient(env, fetchImpl)
      const person = await ensurePerson(client, payload)
      const deal = await ensureDeal(client, payload, person.id, marker)
      const noteCreated = await ensureNote(client, payload, deal.id, marker)
      const activityCreated = await ensureCall(client, payload, person.id, deal.id, marker)
      return send(res, deal.created ? 201 : 200, {
        ok: true, idempotent: !deal.created, personId: person.id, dealId: deal.id,
        created: { person: person.created, deal: deal.created, note: noteCreated, activity: activityCreated },
      })
    } catch (error) {
      if (error instanceof RequestError) return send(res, error.status, { ok: false, error: error.message })
      if (error instanceof PipedriveError) {
        return send(res, 502, { ok: false, error: 'Pipedrive request failed', stage: error.operation, retryable: true })
      }
      console.error('PLAYA Pipedrive endpoint error', error instanceof Error ? error.message : error)
      return send(res, 500, { ok: false, error: 'Server configuration or internal error', retryable: false })
    }
  }
}

export { buildNote, normalizedPhone, submissionMarker, validatePayload }
export default createHandler()
