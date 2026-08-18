import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Locale } from './Landing'

const PLAYA_LOGO = '/brand/playa-wordmark.svg'

const FIELDS = [
  { name: 'name', type: 'text', ko: '이름', en: 'Name', required: true, autoComplete: 'name' },
  { name: 'phone', type: 'tel', ko: '전화번호', en: 'Phone Number', required: true, autoComplete: 'tel' },
  { name: 'email', type: 'email', ko: '이메일', en: 'Email Address', required: true, autoComplete: 'email' },
  { name: 'company', type: 'text', ko: '회사', en: 'Company', required: true, autoComplete: 'organization' },
  { name: 'sns_account', type: 'text', ko: 'SNS 계정', en: 'Social Media Account', required: false },
  { name: 'referral', type: 'text', ko: '플라야 추천회원', en: 'PLAYA Member Referral', required: false },
] as const

type FieldName = (typeof FIELDS)[number]['name']
type FormData = Record<FieldName, string>

const EMPTY_FORM: FormData = { name: '', phone: '', email: '', company: '', sns_account: '', referral: '' }

const COPY = {
  ko: {
    home: '/', homeLabel: 'PLAYA 홈', back: '홈으로', eyebrow: 'Membership enquiry',
    title: '플라야 멤버십\n상담 신청',
    lead: 'PLAYA는 기존 멤버의 추천을 바탕으로 서로 잘 맞는지 충분히 알아가는 과정을 거칩니다.',
    notes: ['신원이 불분명한 경우 상담이 어려울 수 있습니다.', '자세한 상담은 플라야 라운지에서 대면 미팅과 공간 투어로 진행됩니다.'],
    panel: '멤버십 상담 신청 정보', required: '필수 입력', requiredLabel: '필수', optional: '선택',
    placeholder: (label: string, required: boolean) => required ? `${label}을 입력해 주세요` : '선택 사항',
    error: '필수 항목을 모두 입력해 주세요.', consent: '제출하시면 상담을 위한 연락에 동의한 것으로 간주됩니다.',
    submit: '상담 신청하기', submitting: '제출 중', done: '신청이 완료되었습니다.',
    doneBody: <>내용을 확인한 뒤 담당자가 직접 연락드리겠습니다.<br />관심을 갖고 문의해 주셔서 감사합니다.</>,
    returnHome: '홈으로 돌아가기', switchPath: '/en/apply', switchLabel: 'EN',
  },
  en: {
    home: '/en', homeLabel: 'PLAYA home', back: 'Back home', eyebrow: 'Membership enquiry',
    title: 'Begin a membership\nconversation',
    lead: 'Membership at PLAYA begins with a recommendation from an existing member and a thoughtful conversation about whether the community is the right fit.',
    notes: ['We may be unable to proceed where an applicant’s identity cannot be verified.', 'A detailed conversation takes place in person at PLAYA Lounge, together with a tour of the club.'],
    panel: 'Membership enquiry details', required: 'Required fields', requiredLabel: 'Required', optional: 'Optional',
    placeholder: (label: string, required: boolean) => required ? `Enter your ${label.toLowerCase()}` : 'Optional',
    error: 'Please complete all required fields.', consent: 'By submitting, you agree to be contacted about your membership enquiry.',
    submit: 'Send enquiry', submitting: 'Submitting', done: 'Your enquiry has been received.',
    doneBody: <>Our team will review your details and contact you directly.<br />Thank you for your interest in PLAYA.</>,
    returnHome: 'Return home', switchPath: '/apply', switchLabel: 'KR',
  },
} as const

export default function Apply({ locale = 'ko' }: { locale?: Locale }) {
  const t = COPY[locale]
  const navigate = useNavigate()
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    document.documentElement.lang = locale
    document.title = locale === 'ko' ? 'PLAYA 멤버십 상담 신청' : 'PLAYA Membership Enquiry'
  }, [locale])

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const name = event.target.name as FieldName
    setFormData((previous) => ({ ...previous, [name]: event.target.value }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    if (!formData.name || !formData.phone || !formData.email || !formData.company) {
      setError(t.error)
      setLoading(false)
      return
    }
    try {
      const { error: supabaseError } = await supabase.from('membership_applications').insert([formData])
      if (supabaseError) throw supabaseError
      setSubmitted(true)
    } catch (submissionError) {
      console.error('Membership submission failed:', submissionError)
      setError(locale === 'ko' ? '전송하지 못했습니다. 잠시 후 다시 시도해 주세요.' : 'We could not send your enquiry. Please try again shortly.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) return (
    <main className="pl-apply-result">
      <Link to={t.home} className="pl-apply__brand" aria-label={t.homeLabel}><img src={PLAYA_LOGO} alt="PLAYA" /></Link>
      <p className="pl-label">{t.eyebrow}</p>
      <h1 className="pl-display">{t.done}</h1>
      <p>{t.doneBody}</p>
      <button type="button" className="pl-apply__submit" onClick={() => navigate(t.home)}>{t.returnHome}</button>
    </main>
  )

  return (
    <main className="pl-apply">
      <header className="pl-apply__header">
        <Link to={t.home} className="pl-apply__brand" aria-label={t.homeLabel}><img src={PLAYA_LOGO} alt="PLAYA" /></Link>
        <div className="pl-apply__tools">
          <Link to={t.switchPath} className="pl-apply__back" lang={locale === 'ko' ? 'en' : 'ko'}>{t.switchLabel}</Link>
          <Link to={t.home} className="pl-apply__back"><span aria-hidden="true">←</span> {t.back}</Link>
        </div>
      </header>
      <div className="pl-apply__layout">
        <section className="pl-apply__intro" aria-labelledby="apply-title">
          <p className="pl-label">{t.eyebrow}</p>
          <h1 className="pl-display" id="apply-title">{t.title}</h1>
          <p className="pl-apply__lead">{t.lead}</p>
          <div className="pl-apply__notes">{t.notes.map((note) => <p key={note}>{note}</p>)}</div>
          <address className="pl-apply__address"><span>PLAYA LOUNGE</span>{locale === 'ko' ? '서울 강남구 도산대로 212' : '212 Dosan-daero, Gangnam-gu, Seoul'}</address>
        </section>
        <section className="pl-apply__form-panel" aria-label={t.panel}>
          <div className="pl-apply__form-head"><p>APPLICATION FORM</p><p><span aria-hidden="true">*</span> {t.required}</p></div>
          <form className="pl-apply__form" onSubmit={handleSubmit}>
            {FIELDS.map((field, index) => {
              const primary = locale === 'ko' ? field.ko : field.en
              const secondary = locale === 'ko' ? field.en : field.ko
              return <div className="pl-apply__field" key={field.name}>
                <label htmlFor={field.name}>
                  <span>{String(index + 1).padStart(2, '0')}</span><span>{primary}</span><small>{secondary}</small>
                  {field.required ? <sup aria-label={t.requiredLabel}>*</sup> : <em>{t.optional}</em>}
                </label>
                <input id={field.name} name={field.name} type={field.type} value={formData[field.name]} onChange={handleChange} required={field.required} autoComplete={'autoComplete' in field ? field.autoComplete : undefined} placeholder={t.placeholder(primary, field.required)} />
              </div>
            })}
            {error && <p className="pl-apply__error" role="alert">{error}</p>}
            <div className="pl-apply__action"><p>{t.consent}</p><button type="submit" className="pl-apply__submit" disabled={loading}>{loading ? t.submitting : t.submit} <span aria-hidden="true">→</span></button></div>
          </form>
        </section>
      </div>
    </main>
  )
}
