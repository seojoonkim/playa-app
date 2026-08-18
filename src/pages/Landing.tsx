import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { Link, useLocation } from 'react-router-dom'

/* ==========================================================================
   Locale
   ========================================================================== */

export type Locale = 'ko' | 'en'

interface LandingProps {
  locale?: Locale
}

const IMG = (n: number) => `/images/playa-web/playa-${String(n).padStart(2, '0')}.webp`

/** Frames extracted from PLAYA's own Instagram reels. */
const REEL = (name: string) => `/images/playa-instagram-20260730/selected/${name}.jpg`
const REEL_VIDEO = (name: string) => `/videos/playa-instagram-20260730/${name}.mp4`

interface HeroSlide {
  id: string
  image: string
  category: Bi
  name: Bi
  caption: Bi
  alt: Bi
  position?: string
}

/** Lounge and sport alternate so PLAYA's social and active rhythms share the opening. */
const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'lounge-dark',
    image: '/images/playa-instagram-facilities/playa-lounge-1.webp',
    category: { ko: 'PLAYA LOUNGE', en: 'PLAYA LOUNGE' },
    name: { ko: '하루가 잠시 느려지는 자리', en: 'Where the day slows down' },
    caption: {
      ko: '따뜻한 빛과 깊은 좌석 사이에서 혼자만의 쉼과 멤버 사이의 대화가 자연스럽게 이어집니다.',
      en: 'Warm light and deep seating make room for quiet pauses and unhurried conversation.',
    },
    alt: {
      ko: '어두운 좌석과 마키 조명이 놓인 PLAYA 라운지',
      en: 'PLAYA Lounge with dark seating and warm marquee lights',
    },
    position: '50% 45%',
  },
  {
    id: 'fitness',
    image: IMG(2),
    category: { ko: 'SPORT · FITNESS', en: 'SPORT · FITNESS' },
    name: { ko: '몸의 감각을 깨우는 시작', en: 'Begin with the body in focus' },
    caption: {
      ko: '부드러운 빛 아래 정돈된 움직임으로 하루의 첫 리듬을 선명하게 만듭니다.',
      en: 'Measured movement beneath soft light brings the first rhythm of the day into focus.',
    },
    alt: {
      ko: '빛나는 반투명 벽을 따라 늘어선 PLAYA 피트니스 웨이트 머신',
      en: 'Weight machines along the glowing translucent wall of the PLAYA fitness room',
    },
    position: '50% 50%',
  },
  {
    id: 'lounge-red',
    image: '/images/playa-instagram-facilities/playa-lounge-2.webp',
    category: { ko: 'PLAYA LOUNGE', en: 'PLAYA LOUNGE' },
    name: { ko: '대화가 오래 머무는 공간', en: 'A room made for longer conversations' },
    caption: {
      ko: '붉은 벽과 낮은 소파가 일상의 만남을 조금 더 친밀하고 기억에 남는 시간으로 바꿉니다.',
      en: 'Red walls and low sofas turn an everyday meeting into something more intimate and memorable.',
    },
    alt: {
      ko: '붉은 광택 벽과 소파가 있는 PLAYA 라운지',
      en: 'PLAYA Lounge with red lacquered walls and sofas',
    },
    position: '50% 48%',
  },
  {
    id: 'tennis',
    image: IMG(17),
    category: { ko: 'SPORT · TENNIS', en: 'SPORT · TENNIS' },
    name: { ko: '랠리로 이어지는 좋은 긴장', en: 'The good tension of a rally' },
    caption: {
      ko: '도심 한가운데의 실내 코트에서 집중과 호흡, 멤버 사이의 경기가 한 흐름으로 이어집니다.',
      en: 'Focus, breath and matches between members unfold on an indoor court in the heart of the city.',
    },
    alt: {
      ko: '공이 담긴 볼 카트가 놓인 PLAYA 실내 테니스 코트',
      en: 'PLAYA indoor tennis court with a ball cart',
    },
    position: '50% 50%',
  },
  {
    id: 'lounge-light',
    image: '/images/playa-instagram-facilities/playa-lounge-3.webp',
    category: { ko: 'PLAYA LOUNGE', en: 'PLAYA LOUNGE' },
    name: { ko: '빛이 머무는 세 번째 라운지', en: 'A third lounge shaped by light' },
    caption: {
      ko: '밝은 간접 조명과 여유로운 좌석이 생각을 정리하고 다음 약속을 기다리는 시간을 품습니다.',
      en: 'Soft indirect light and generous seating hold the time between one thought and the next meeting.',
    },
    alt: {
      ko: '밝은 좌석과 간접 조명이 이어지는 PLAYA 라운지',
      en: 'Bright seating and indirect lighting in the PLAYA Lounge',
    },
    position: '50% 55%',
  },
  {
    id: 'badminton',
    image: IMG(8),
    category: { ko: 'SPORT · BADMINTON', en: 'SPORT · BADMINTON' },
    name: { ko: '빛과 속도가 교차하는 코트', en: 'A court where light meets speed' },
    caption: {
      ko: '높은 창에서 떨어지는 빛 아래 빠른 움직임과 가벼운 승부가 하루의 에너지를 바꿉니다.',
      en: 'Beneath light from the high windows, quick movement and friendly competition shift the day’s energy.',
    },
    alt: {
      ko: '높은 창에서 빛이 들어오는 PLAYA 배드민턴 코트의 원목 바닥',
      en: 'Timber floor of the PLAYA badminton court lit from high windows',
    },
    position: '50% 52%',
  },
]
const HERO_INTERVAL = 6500

const INSTAGRAM_URL = 'https://www.instagram.com/playaseoul/'

const SECTIONS = ['about', 'ways', 'lounges', 'community', 'membership'] as const
type SectionId = (typeof SECTIONS)[number]

type Bi = Record<Locale, string>

/* ==========================================================================
   Data
   ========================================================================== */

interface WayCard {
  id: string
  number: string
  verb: string
  image: string
  alt: Bi
  title: Bi
  line: Bi
}

/** Section 3 — four rhythms of a day, intentionally distinct from the facility directory. */
const WAYS: WayCard[] = [
  {
    id: 'move',
    number: '01',
    verb: 'MOVE',
    image: IMG(6),
    alt: {
      ko: '차분한 조명 아래 나란히 놓인 PLAYA 피트니스 머신',
      en: 'PLAYA fitness machines arranged beneath calm architectural lighting',
    },
    title: { ko: '몸을 깨우는 시간', en: 'Wake the body' },
    line: {
      ko: '하루의 첫 리듬을 만들고 몸의 감각을 선명하게 되찾습니다.',
      en: 'Set the first rhythm of the day and bring the body back into focus.',
    },
  },
  {
    id: 'reset',
    number: '02',
    verb: 'RESET',
    image: IMG(16),
    alt: {
      ko: '빛이 드는 석재 벽에 설치된 PLAYA 샤워 공간',
      en: 'PLAYA shower set against a stone wall in soft light',
    },
    title: { ko: '호흡을 되찾는 시간', en: 'Find your breath' },
    line: {
      ko: '움직임 뒤의 속도를 낮추고 다음 일정으로 넘어가기 전 잠시 고릅니다.',
      en: 'Lower the pace after movement before stepping into what comes next.',
    },
  },
  {
    id: 'connect',
    number: '03',
    verb: 'CONNECT',
    image: '/images/playa-lounge-pdf-260108/playa-lounge-page-08.webp',
    alt: {
      ko: '테이블과 소파에서 대화하고 업무를 보는 PLAYA 라운지의 멤버들',
      en: 'Members talking and working around the tables and sofas of the PLAYA Lounge',
    },
    title: { ko: '사람과 생각이 만나는 시간', en: 'Meet people and ideas' },
    line: {
      ko: '예정된 미팅과 우연한 대화가 자연스럽게 이어집니다.',
      en: 'Planned meetings and unexpected conversations flow into one another.',
    },
  },
  {
    id: 'stay',
    number: '04',
    verb: 'STAY',
    image: '/images/playa-bornyon-official/bornyon-dining-room.webp',
    alt: {
      ko: '골든아워의 빛과 도시 전망이 펼쳐진 본연의 다이닝 테이블',
      en: 'Bornyon dining tables in golden-hour light with a broad city view',
    },
    title: { ko: '식사와 대화가 이어지는 시간', en: 'Stay for the table' },
    line: {
      ko: '좋은 식사 앞에 머물며 낮에 시작된 이야기를 더 깊게 나눕니다.',
      en: 'Stay over a good meal and take the day’s conversations further.',
    },
  },
]

interface EventCard {
  id: string
  /** Web-optimised video and poster extracted from the corresponding Instagram reel. */
  video: string
  image: string
  title: Bi
  meta: Bi
  body: Bi
  alt: Bi
  url: string
}

/**
 * Section 6 — three documented evenings, each with a photograph from its source
 * post. The BOND dinner is a collaborator's post that tags PLAYA, not a post
 * from PLAYA's own account, and the copy says so.
 */
const EVENTS: EventCard[] = [
  {
    id: 'insight-night',
    video: REEL_VIDEO('insight-night'),
    image: REEL('insight-night'),
    title: { ko: '인사이트 나이트', en: 'Insight Night' },
    meta: { ko: '대화 · 게스트 권민주', en: 'Conversation · guest Minju Kweon' },
    body: {
      ko: '프리즈 아시아 권민주 디렉터와 글로벌 컬렉터의 이동, 새로운 아트 허브와 컬렉팅의 흐름을 이야기했습니다.',
      en: 'An evening with Minju Kweon, VIP & Business Development Director at Frieze Asia, on shifts among global collectors, emerging art hubs, collecting trends and the workings of the art market.',
    },
    alt: {
      ko: '인사이트 나이트 현장에서 발표 화면을 휴대폰으로 촬영하는 참석자',
      en: 'A guest photographing the presentation screen on a phone during Insight Night',
    },
    url: 'https://www.instagram.com/playaseoul/reel/DbVVQr9v1cu/',
  },
  {
    id: 'chef-dining',
    video: REEL_VIDEO('chef-dining'),
    image: REEL('chef-dining-table'),
    title: { ko: '셰프 다이닝', en: 'Chef Dining' },
    meta: { ko: '다이닝 · 셰프 변종인', en: 'Dining · Chef Jongin Byeon' },
    body: {
      ko: '서울 에빗과 싱가포르 젠을 거쳐 코펜하겐 노마에서 일하는 변종인 셰프가 본연 프라이빗 다이닝에서 멤버를 위한 저녁을 차렸습니다.',
      en: 'Chef Jongin Byeon, whose career runs from Evett in Seoul to Zén in Singapore and Noma in Copenhagen, cooked a member dinner at Bornyon private dining.',
    },
    alt: {
      ko: '변종인 셰프의 요리가 접시에 담겨 놓인 멤버 테이블',
      en: 'Plates from Chef Jongin Byeon’s menu set out on the member table',
    },
    url: 'https://www.instagram.com/playaseoul/reel/DbKNY1TvoPj/',
  },
  {
    id: 'bond-anniversary',
    video: REEL_VIDEO('bond-anniversary'),
    image: REEL('bond-anniversary'),
    title: { ko: 'BOND 30주년 디너', en: 'BOND 30th Anniversary Dinner' },
    meta: { ko: '와인 · 본연 프라이빗 다이닝', en: 'Wine · Bornyon private dining' },
    body: {
      ko: 'BOND 와이너리 30주년을 기념해 PLAYA 멤버들이 본연의 테이블에 모였습니다.',
      en: 'PLAYA members marked the 30th anniversary of BOND winery at Bornyon. Documented in a post by a collaborator who was at the table.',
    },
    alt: {
      ko: '와인 글라스가 가득한 원형 테이블을 천장 거울로 내려다본 본연의 저녁 자리',
      en: 'A round table crowded with wine glasses seen from above in the ceiling mirror at Bornyon',
    },
    url: 'https://www.instagram.com/youngkwon.kr/reel/DZWhIC6Sh23/',
  },
]

const COLLABORATIONS = [
  { id: 'aman', image: '/images/playa-collaborations/aman.webp', url: 'https://www.instagram.com/playaseoul/p/DbVTQjcvq7I/' },
  { id: 'graff', image: '/images/playa-collaborations/graff.webp', url: 'https://www.instagram.com/p/DYWKdL3Egz7/' },
  { id: 'aesop', image: '/images/playa-collaborations/aesop.webp', url: 'https://www.instagram.com/playaseoul/p/DbCNIEPvSV-/' },
] as const

interface Space {
  id: string
  image?: number
  imagePath?: string
  name: Bi
  line: Bi
  alt?: Bi
}

/** Six facilities shown on the landing page with verified imagery from official PLAYA sources. */
const SPACES: Space[] = [
  {
    id: 'tennis',
    image: 17,
    name: { ko: '테니스', en: 'Tennis' },
    line: {
      ko: '실내 코트에서 이어지는 랠리와 멤버 경기.',
      en: 'Indoor rallies, coaching sessions and matches between members.',
    },
    alt: {
      ko: '공이 담긴 볼 카트가 놓인 PLAYA 실내 테니스 코트',
      en: 'PLAYA indoor tennis court with a ball cart',
    },
  },
  {
    id: 'fitness',
    image: 2,
    name: { ko: '피트니스', en: 'Fitness' },
    line: {
      ko: '빛이 들어오는 반투명 벽을 따라 늘어선 웨이트 머신.',
      en: 'Weight machines lined along a glowing translucent wall.',
    },
    alt: {
      ko: '빛나는 반투명 벽을 따라 늘어선 PLAYA 피트니스 웨이트 머신',
      en: 'Weight machines along the glowing translucent wall of the PLAYA fitness room',
    },
  },
  {
    id: 'badminton',
    image: 8,
    name: { ko: '배드민턴', en: 'Badminton' },
    line: {
      ko: '천창으로 빛이 떨어지는 검은 벽의 원목 코트.',
      en: 'A timber court in black walls, lit from a band of high windows.',
    },
    alt: {
      ko: '높은 창에서 빛이 들어오는 PLAYA 배드민턴 코트의 원목 바닥',
      en: 'Timber floor of the PLAYA badminton court lit from high windows',
    },
  },
  {
    id: 'golf',
    imagePath: '/images/playa-space-official/screen-golf.webp',
    name: { ko: '골프 연습실', en: 'Screen Golf' },
    line: {
      ko: 'TRACKMAN TMiO로 스윙을 정교하게 읽는 실내 스크린 골프.',
      en: 'Indoor screen golf with TRACKMAN TMiO swing analysis.',
    },
    alt: {
      ko: '인조 잔디 위 골프공과 드라이버가 놓인 PLAYA 골프 연습실',
      en: 'Golf ball and driver on the turf of the PLAYA screen golf room',
    },
  },
  {
    id: 'bornyon',
    imagePath: '/images/playa-bornyon-official/bornyon-dining-room.webp',
    name: { ko: '본연 프라이빗 다이닝', en: 'Bornyon Private Dining' },
    line: {
      ko: '도심 전망과 우드파이어 요리를 누리는 멤버 전용 다이닝.',
      en: 'Member dining with city views and wood-fire cuisine.',
    },
    alt: {
      ko: '도심 전망을 마주한 본연 프라이빗 다이닝의 원형 테이블',
      en: 'Round table in Bornyon Private Dining overlooking the city',
    },
  },
  {
    id: 'concierge',
    imagePath: '/images/playa-space-official/concierge.webp',
    name: { ko: '컨시어지', en: 'Concierge' },
    line: {
      ko: '와인, 레스토랑, 부동산을 위한 전문 추천과 맞춤 서비스.',
      en: 'Tailored recommendations for wine, restaurants and real estate.',
    },
    alt: {
      ko: '물병 냉장고와 선반을 갖춘 PLAYA 컨시어지 호스피탈리티 카운터',
      en: 'PLAYA concierge hospitality counter with shelves and a water fridge',
    },
  },
]

/* ==========================================================================
   Copy
   ========================================================================== */

interface Fact {
  k: string
  v: string
}

interface Dictionary {
  docTitle: string
  docDescription: string
  skip: string
  navHome: string
  navLabel: string
  nav: Record<SectionId, string>
  menuOpen: string
  menuClose: string
  apply: string
  prev: string
  next: string
  railLabel: string
  hero: {
    label: string
    title: string
    ctaSpaces: string
    ctaApply: string
    cue: string
    carouselLabel: string
    previous: string
    next: string
    swipe: string
  }
  invitation: { label: string; title: string; body: string; facts: Fact[]; alt: string }
  ways: {
    label: string
    title: string
    note: string
    journeyLabel: string
    journeyTitle: string
    journey: Array<{ time: string; title: string; body: string }>
  }
  location: { label: string; title: string; body: string; alt: string }
  day: { label: string; quote: string; alt: string }
  community: { label: string; title: string; line: string; source: string; follow: string }
  members: {
    label: string
    title: string
    body: string
    ageLabel: string
    composition: string
    categories: string[]
    personas: string[]
    privacy: string
  }
  collaborations: { label: string; title: string; body: string; source: string; items: Array<{ meta: string; title: string; body: string; alt: string }> }
  lounges: {
    label: string
    title: string
    note: string
    playaName: string
    playaMeta: string
    playaBody: string
    audioName: string
    audioMeta: string
    audioBody: string
    alts: string[]
  }
  spaces: { label: string; title: string; note: string; view: string }
  overview: { label: string; title: string; body: string; caption: string; alt: string }
  proof: { label: string; line: string; support: string }
  cta: { title: string; apply: string; instagram: string; alt: string }
  footer: {
    tag: string
    spaces: string
    more: string
    privacy: string
    instagram: string
    rights: string
  }
  facilityNames: Record<'tennis' | 'fitness' | 'badminton' | 'golf' | 'audio' | 'bornyon' | 'concierge', string>
}

const COPY: Record<Locale, Dictionary> = {
  ko: {
    docTitle: 'PLAYA | 서울 프라이빗 웰니스 멤버십 클럽',
    docDescription:
      'PLAYA는 운동과 회복, 미식과 대화가 끊기지 않고 이어지는 서울의 프라이빗 웰니스 멤버십 클럽입니다.',
    skip: '본문으로 건너뛰기',
    navHome: 'PLAYA 홈',
    navLabel: '주요 메뉴',
    nav: {
      about: '소개',
      ways: '이용',
      lounges: '라운지',
      community: '이벤트',
      membership: '멤버십',
    },
    menuOpen: '메뉴 열기',
    menuClose: '메뉴 닫기',
    apply: '멤버십 문의',
    prev: '이전',
    next: '다음',
    railLabel: '가로 스크롤 목록',
    hero: {
      label: 'Seoul · Private Members Club',
      title: '도산대로 안쪽,\n서울의 프라이빗\n멤버십',
      ctaSpaces: '공간 보기',
      ctaApply: '멤버십 문의',
      cue: '아래로',
      carouselLabel: 'PLAYA 라운지와 스포츠 시설 둘러보기',
      previous: '이전 장면',
      next: '다음 장면',
      swipe: '밀어서 둘러보기',
    },
    invitation: {
      label: 'Invitation',
      title: '운동과 회복, 미식과 대화가\n한 주소에서 이어집니다',
      body: 'PLAYA는 서울 강남 도산대로에 자리한 프라이빗 웰니스 멤버십 클럽입니다.',
      facts: [
        { k: 'Belonging', v: '누구에게나 열려 있지는 않습니다. 서로의 시간과 태도를 알아보는 멤버를 위한 곳입니다.' },
        { k: 'A day', v: '정해진 코스 없이, 그날 필요한 장면을 고릅니다.' },
      ],
      alt: '거친 석재 벽과 긴 테이블, 따뜻한 조명이 어우러진 PLAYA 내부 공간',
    },
    ways: {
      label: 'Four ways',
      title: 'PLAYA를 쓰는\n네 가지 방법',
      note: '공간이 아니라, PLAYA에서 하루를 보내는 네 가지 리듬입니다.',
      journeyLabel: 'Two hours at PLAYA',
      journeyTitle: '두 시간이면 충분한\n하나의 동선',
      journey: [
        { time: '2:30 PM', title: '함께 움직이기', body: '멤버와 랠리를 주고받으며 오후를 엽니다.' },
        { time: '4:00 PM', title: '짧게 집중하기', body: '피트니스에서 30분 동안 필요한 움직임에 집중합니다.' },
        { time: '4:30 PM', title: '다음 장면 준비하기', body: '샤워를 하고 옷을 갈아입으며 다음 일정을 준비합니다.' },
        { time: '5:00 PM', title: '대화 이어가기', body: '라운지에 자리를 옮겨 미팅이나 긴 대화를 자연스럽게 이어갑니다.' },
      ],
    },
    location: {
      label: 'Location',
      title: '서울 안에,\n서울의 속도 바깥에',
      body: '서울 강남 도산대로 한가운데에 있습니다. 문을 지나면 거리의 소음이 한 걸음 물러나고, 클럽 안에서는 도시와 다른 속도로 시간이 흘러갑니다.',
      alt: '반투명 벽과 원목이 이어지는 PLAYA 내부',
    },
    day: {
      label: 'A day at',
      quote: '코트에서 라운지로,\n라운지에서 테이블로.',
      alt: 'PLAYA 클럽 내부의 넓은 전경',
    },
    community: {
      label: 'Community',
      title: 'PLAYA에서\n함께한 저녁들',
      line: '멤버를 위한 저녁은 초대된 게스트의 이야기, 셰프가 준비한 식탁, 함께 고른 와인으로 시작됩니다. 아래는 PLAYA에서 열린 세 번의 저녁입니다.',
      source: '게시물 보기',
      follow: '@playaseoul 팔로우',
    },
    members: {
      label: 'Members',
      title: '각자의 자리에서,\n이미 깊이 들어가 있는 사람들',
      body: 'PLAYA의 멤버는 업의 종류로 묶이지 않습니다. 자신이 선택한 영역을 오래 파고들어온 태도와 서로의 깊이를 알아보는 안목이 이곳의 공통점입니다.',
      ageLabel: '멤버 평균 연령',
      composition: '멤버 구성',
      categories: ['기업가', '투자자', '전문직', '경영진', '그 외'],
      personas: [
        '39세 · 스타트업 대표',
        '43세 · VC 파트너 · 복수의 엑싯 경험',
        '37세 · 의사 · 4개 지점 운영',
        '31세 · 크리에이터',
      ],
      privacy: '멤버 구성을 설명하기 위한 익명 예시이며 특정 개인을 지칭하지 않습니다.',
    },
    collaborations: {
      label: 'Collaborations',
      title: '라운지에서 열리는\n브랜드 프로그램',
      body: 'PLAYA 라운지에서 열리는 프로그램은 브랜드의 세계를 멤버의 일상 가까이 가져옵니다. 각 프로그램은 공식 기록을 통해 확인할 수 있습니다.',
      source: '공식 게시물 보기',
      items: [
        { meta: 'Upcoming · Hospitality', title: 'A Moment with Aman', body: 'Aman의 환대와 여행의 세계를 PLAYA에서 나누는 2026년 8월 예정 프로그램입니다.', alt: 'PLAYA와 Aman의 A Moment with Aman 행사 안내 이미지' },
        { meta: 'Private Event · High Jewellery', title: 'Graff Private Event', body: 'Graff의 하이 주얼리와 PLAYA 라운지의 친밀한 분위기가 만난 프라이빗 이벤트입니다.', alt: 'PLAYA 라운지에 전시된 Graff 하이 주얼리 프라이빗 이벤트 장면' },
        { meta: 'Community Partnership · Since 2024', title: 'Aesop × PLAYA', body: '2024년부터 이어진 Aesop과 PLAYA의 커뮤니티 파트너십. 일상의 리추얼과 세심한 환대를 함께 제안합니다.', alt: 'PLAYA 공간에 놓인 Aesop 제품과 커뮤니티 파트너십 연출' },
      ],
    },
    lounges: {
      label: 'Lounges',
      title: '머무는 방식이 다른\n두 개의 라운지',
      note: 'PLAYA 라운지는 세 개 층으로 이어지고, 오디오 라운지는 음악을 위해 따로 마련된 방입니다.',
      playaName: 'PLAYA 라운지',
      playaMeta: '3개 층 · 휴식 · 교류',
      playaBody: '층마다 빛과 좌석, 분위기가 달라집니다. 같은 라운지 안에서 그날에 맞는 자리를 고르게 됩니다.',
      audioName: '오디오 라운지',
      audioMeta: 'Bowers & Wilkins · T+A',
      audioBody: '정교한 오디오 시스템과 편안한 좌석, 차 한 잔이 있는 청취 공간입니다. 음악에 집중하며 하루의 소음을 가라앉힙니다.',
      alts: [
        '어두운 좌석과 마키 조명이 놓인 PLAYA 라운지',
        '붉은 광택 벽과 소파가 있는 PLAYA 라운지',
        '밝은 좌석과 간접 조명이 이어지는 PLAYA 라운지',
        'Bowers & Wilkins 스피커와 좌석이 놓인 PLAYA 오디오 라운지',
        'PLAYA 오디오 라운지의 Bowers & Wilkins 스피커 디테일',
        '따뜻한 조명 아래 차를 따르는 PLAYA 오디오 라운지의 장면',
      ],
    },
    spaces: {
      label: 'Spaces',
      title: '클럽을 이루는\n공간들',
      note: '라운지 밖의 시설을 한눈에 봅니다.',
      view: '자세히 보기',
    },
    overview: {
      label: 'One club',
      title: '여러 시설이 아니라\n하나의 클럽',
      body: '테니스와 피트니스, 배드민턴과 골프, 라운지와 프라이빗 다이닝. 하나의 멤버십이 이 시설들을 하나의 클럽으로 잇습니다.',
      caption: 'PLAYA · 서울',
      alt: 'PLAYA 클럽 전경',
    },

    proof: {
      label: 'Membership',
      line: '추천에서 시작되는\n멤버십',
      support: 'PLAYA 멤버십은 기존 회원의 추천을 통해서만 시작됩니다. 한 사람 한 사람의 결을 세심하게 살피는 것은 커뮤니티의 밀도와 신뢰를 지키기 위한 방식입니다.',
    },
    cta: {
      title: 'PLAYA가 궁금하시다면\n문의를 남겨 주세요',
      apply: '멤버십 문의',
      instagram: '인스타그램',
      alt: 'PLAYA 클럽 내부 전경',
    },
    footer: {
      tag: '서울 강남 도산대로의 프라이빗 웰니스 멤버십 클럽.',
      spaces: '공간',
      more: '더 보기',
      privacy: '개인정보처리방침',
      instagram: 'Instagram',
      rights: 'All rights reserved.',
    },
    facilityNames: {
      tennis: '테니스',
      fitness: '피트니스',
      badminton: '배드민턴',
      golf: '골프 연습실',
      audio: '오디오 라운지',
      bornyon: '본연 프라이빗 다이닝',
      concierge: '컨시어지',
    },
  },
  en: {
    docTitle: 'PLAYA | Private Wellness Members Club, Seoul',
    docDescription:
      'PLAYA is a private wellness members club in Seoul, bringing movement, recovery, dining and conversation under one roof.',
    skip: 'Skip to main content',
    navHome: 'PLAYA home',
    navLabel: 'Primary',
    nav: {
      about: 'About',
      ways: 'Four ways',
      lounges: 'Lounges',
      community: 'Community',
      membership: 'Membership',
    },
    menuOpen: 'Open menu',
    menuClose: 'Close menu',
    apply: 'Enquire',
    prev: 'Previous',
    next: 'Next',
    railLabel: 'Horizontal list',
    hero: {
      label: 'Seoul · Private Members Club',
      title: 'Membership,\nbeyond the city,\nat another pace.',
      ctaSpaces: 'See the spaces',
      ctaApply: 'Enquire',
      cue: 'Scroll',
      carouselLabel: 'Explore PLAYA lounges and sports facilities',
      previous: 'Previous scene',
      next: 'Next scene',
      swipe: 'Swipe to explore',
    },
    invitation: {
      label: 'Invitation',
      title: 'Movement, recovery, dining\nand conversation at one address',
      body: 'PLAYA is a private wellness members club on Dosan-daero in Gangnam, Seoul.',
      facts: [
        { k: 'Belonging', v: 'Not a place open to everyone, but one for members who recognise and respect one another’s time.' },
        { k: 'A day', v: 'There is no fixed sequence. Choose what the day calls for.' },
      ],
      alt: 'PLAYA interior with a long table, textured stone walls and warm architectural light',
    },
    ways: {
      label: 'Four ways',
      title: 'Four ways\nto use PLAYA',
      note: 'Not four facilities, but four rhythms that shape a day at PLAYA.',
      journeyLabel: 'Two hours at PLAYA',
      journeyTitle: 'One continuous route,\ncompleted in two hours',
      journey: [
        { time: '2:30 PM', title: 'Move together', body: 'Open the afternoon with a rally against another member.' },
        { time: '4:00 PM', title: 'Focus briefly', body: 'Spend thirty focused minutes moving with purpose in the fitness room.' },
        { time: '4:30 PM', title: 'Prepare for what follows', body: 'Shower, change and prepare for the next appointment.' },
        { time: '5:00 PM', title: 'Stay in conversation', body: 'Move into the lounge for a meeting or a longer conversation without leaving the club.' },
      ],
    },
    location: {
      label: 'Location',
      title: 'In Seoul,\napart from its pace',
      body: 'The club sits in the middle of Dosan-daero in Gangnam, Seoul. Beyond the door the noise of the street steps back, and time inside runs at a different tempo from the city.',
      alt: 'Translucent walls and timber inside PLAYA',
    },
    day: {
      label: 'A day at',
      quote: 'From the court to the lounge,\nfrom the lounge to the table.',
      alt: 'A broad interior view of the PLAYA club',
    },
    community: {
      label: 'Community',
      title: 'Evenings that\nactually happened at PLAYA',
      line: 'Member evenings begin with an invited guest’s story, a table prepared by a chef or wine chosen together. Three evenings held at PLAYA are documented below.',
      source: 'View the original on Instagram',
      follow: 'Follow @playaseoul',
    },
    members: {
      label: 'Members',
      title: 'People already deep\nin their own field',
      body: 'PLAYA members are not grouped by industry. What they share is the habit of going far into one chosen field, and the eye to recognise that depth in someone else.',
      ageLabel: 'Average member age',
      composition: 'Member composition',
      categories: ['Entrepreneur', 'Investor', 'Practitioner', 'Executive', 'Others'],
      personas: [
        '39 · Startup CEO',
        '43 · VC Partner · multiple exits',
        '37 · Doctor · four locations',
        '31 · Creator',
      ],
      privacy: 'These anonymised profiles illustrate member composition and do not refer to identifiable individuals.',
    },
    collaborations: {
      label: 'Collaborations',
      title: 'Brand programmes,\nhosted in the lounge',
      body: 'Programmes at PLAYA Lounge bring each brand’s world closer to members’ everyday lives. Each one can be explored through its official record.',
      source: 'View official post',
      items: [
        { meta: 'Upcoming · Hospitality', title: 'A Moment with Aman', body: 'A programme scheduled for August 2026, bringing Aman’s world of travel and hospitality to PLAYA.', alt: 'Announcement artwork for A Moment with Aman at PLAYA' },
        { meta: 'Private Event · High Jewellery', title: 'Graff Private Event', body: 'An intimate private event bringing Graff high jewellery into the atmosphere of PLAYA Lounge.', alt: 'Graff high jewellery presented during a private event at PLAYA Lounge' },
        { meta: 'Community Partnership · Since 2024', title: 'Aesop × PLAYA', body: 'A community partnership continuing since 2024, shaped around everyday ritual and thoughtful hospitality.', alt: 'Aesop products arranged inside PLAYA for the community partnership' },
      ],
    },
    lounges: {
      label: 'Lounges',
      title: 'Two lounges,\ntwo ways to stay',
      note: 'PLAYA Lounge runs across three floors. The Audio Lounge is a separate room built for listening.',
      playaName: 'PLAYA Lounge',
      playaMeta: 'Three floors · Rest · Connection',
      playaBody: 'Light, seating and mood shift from floor to floor, so the same lounge offers a different seat depending on the day.',
      audioName: 'Audio Lounge',
      audioMeta: 'Bowers & Wilkins · T+A',
      audioBody: 'A dedicated listening room with a precise audio system, comfortable seating and tea. A place to let music quiet the noise of the day.',
      alts: [
        'Dark seating and marquee lighting in the PLAYA Lounge',
        'Red lacquered walls and a sofa in the PLAYA Lounge',
        'Bright seating and indirect light in the PLAYA Lounge',
        'PLAYA Audio Lounge with Bowers & Wilkins speakers and lounge seating',
        'Detail of a Bowers & Wilkins speaker in the PLAYA Audio Lounge',
        'Tea being poured under warm light in the PLAYA Audio Lounge',
      ],
    },
    spaces: {
      label: 'Spaces',
      title: 'The spaces\nthat make the club',
      note: 'A look at the facilities beyond the lounges.',
      view: 'View space',
    },
    overview: {
      label: 'One club',
      title: 'Not several facilities\nbut a single club',
      body: 'Tennis, fitness, badminton and golf, the lounges and the private dining room. One membership connects them as a single club.',
      caption: 'PLAYA — Seoul',
      alt: 'A wide view of the PLAYA club',
    },

    proof: {
      label: 'Membership',
      line: 'Membership begins\nwith a recommendation',
      support: 'Membership at PLAYA begins only through a recommendation from an existing member. We take time to understand each person individually, because that is how the closeness and trust of this community are protected.',
    },
    cta: {
      title: 'Curious about PLAYA?\nLeave an enquiry.',
      apply: 'Make an enquiry',
      instagram: 'Instagram',
      alt: 'Interior view of the PLAYA club',
    },
    footer: {
      tag: 'A private wellness members club on Dosan-daero, Seoul.',
      spaces: 'Spaces',
      more: 'More',
      privacy: 'Privacy policy',
      instagram: 'Instagram',
      rights: 'All rights reserved.',
    },
    facilityNames: {
      tennis: 'Tennis',
      fitness: 'Fitness',
      badminton: 'Badminton',
      golf: 'Screen Golf',
      audio: 'Audio Lounge',
      bornyon: 'Bornyon Private Dining',
      concierge: 'Concierge',
    },
  },
}

/* ==========================================================================
   Hooks
   ========================================================================== */

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const apply = () => setReduced(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])
  return reduced
}

/** Adds `is-visible` to each [data-reveal] node the first time it enters view. */
function useRevealOnScroll(key: string) {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const nodes = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'))
    const sections = Array.from(root.querySelectorAll<HTMLElement>('main > section.pl-flow'))

    sections.forEach((section) => {
      section.querySelectorAll<HTMLElement>('[data-reveal]').forEach((node, index) => {
        node.style.setProperty('--reveal-order', String(Math.min(index, 6)))
      })
    })

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      nodes.forEach((node) => node.classList.add('is-visible'))
      sections.forEach((section) => section.classList.add('is-flow-visible'))
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -8% 0px' },
    )
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          const section = entry.target as HTMLElement
          section.classList.add('is-flow-visible')
          sectionObserver.unobserve(section)
        })
      },
      { threshold: 0.06, rootMargin: '0px 0px -12% 0px' },
    )

    nodes.forEach((node) => observer.observe(node))
    sections.forEach((section) => sectionObserver.observe(section))
    return () => {
      observer.disconnect()
      sectionObserver.disconnect()
    }
  }, [key])

  return rootRef
}

function useHeroCycle(count: number, paused: boolean) {
  const [index, setIndex] = useState(0)
  const [revision, setRevision] = useState(0)

  const goTo = useCallback(
    (next: number) => {
      setIndex(((next % count) + count) % count)
      setRevision((value) => value + 1)
    },
    [count],
  )
  const step = useCallback((direction: 1 | -1) => goTo(index + direction), [goTo, index])

  useEffect(() => {
    if (paused || count < 2) return
    const id = window.setTimeout(() => setIndex((current) => (current + 1) % count), HERO_INTERVAL)
    return () => window.clearTimeout(id)
  }, [count, index, paused, revision])

  return { index, goTo, step }
}

/**
 * Drives a horizontal scroll-snap rail: reports the active item and scrolls by
 * exactly one item. Native scrolling stays in charge; this only nudges it.
 */
function useRail(ref: RefObject<HTMLUListElement | null>, count: number) {
  const [index, setIndex] = useState(0)

  const step = useCallback(() => {
    const rail = ref.current
    if (!rail) return 0
    const first = rail.firstElementChild as HTMLElement | null
    if (!first) return rail.clientWidth
    const second = first.nextElementSibling as HTMLElement | null
    return second ? second.offsetLeft - first.offsetLeft : first.offsetWidth
  }, [ref])

  useEffect(() => {
    const rail = ref.current
    if (!rail) return
    const onScroll = () => {
      const size = step() || 1
      setIndex(Math.max(0, Math.min(count - 1, Math.round(rail.scrollLeft / size))))
    }
    onScroll()
    rail.addEventListener('scroll', onScroll, { passive: true })
    return () => rail.removeEventListener('scroll', onScroll)
  }, [count, ref, step])

  const scrollBy = useCallback(
    (direction: 1 | -1) => {
      const rail = ref.current
      if (!rail) return
      rail.scrollBy({ left: direction * step(), behavior: 'smooth' })
    },
    [ref, step],
  )

  return { ref, index, scrollBy }
}

/* ==========================================================================
   Small pieces
   ========================================================================== */

function RailControls({
  index,
  count,
  onPrev,
  onNext,
  prevLabel,
  nextLabel,
  tone = 'dark',
  hint,
}: {
  index: number
  count: number
  onPrev: () => void
  onNext: () => void
  prevLabel: string
  nextLabel: string
  tone?: 'dark' | 'light'
  hint?: string
}) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return (
    <div className={tone === 'light' ? 'pl-railctl pl-railctl--light' : 'pl-railctl'}>
      <p className="pl-railctl__count" aria-live="polite">
        <span>{pad(index + 1)}</span>
        <i aria-hidden="true">/</i>
        <span>{pad(count)}</span>
      </p>
      <div className="pl-railctl__btns">
        <button type="button" aria-label={prevLabel} onClick={onPrev} disabled={index === 0}>
          <span aria-hidden="true">←</span>
        </button>
        <button type="button" aria-label={nextLabel} onClick={onNext} disabled={index === count - 1}>
          <span aria-hidden="true">→</span>
        </button>
      </div>
      <div className="pl-railctl__progress" aria-hidden="true">
        <i style={{ transform: `scaleX(${(index + 1) / count})` }} />
      </div>
      {hint && (
        <p className={`pl-railctl__hint${index > 0 ? ' is-used' : ''}`}>
          {hint}<span aria-hidden="true">→</span>
        </p>
      )}
    </div>
  )
}

/* ==========================================================================
   Component
   ========================================================================== */

export default function Landing({ locale = 'ko' }: LandingProps) {
  const t = COPY[locale]
  const { hash } = useLocation()
  const reducedMotion = usePrefersReducedMotion()

  const [menuOpen, setMenuOpen] = useState(false)
  const [solid, setSolid] = useState(false)
  const [heroPaused, setHeroPaused] = useState(false)
  const hero = useHeroCycle(HERO_SLIDES.length, reducedMotion || heroPaused)
  const heroTouchStart = useRef<number | null>(null)
  const rootRef = useRevealOnScroll(locale)
  const eventVideosRef = useRef<Array<HTMLVideoElement | null>>([])

  const spaceRef = useRef<HTMLUListElement>(null)
  const spaceRail = useRail(spaceRef, SPACES.length)
  const footerSpaces = [
    t.facilityNames.tennis,
    t.facilityNames.fitness,
    t.facilityNames.badminton,
    t.facilityNames.golf,
    t.facilityNames.audio,
    t.facilityNames.bornyon,
    t.facilityNames.concierge,
  ]

  /* localized document metadata */
  useEffect(() => {
    document.documentElement.lang = locale
    document.title = t.docTitle

    let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.name = 'description'
      document.head.appendChild(meta)
    }
    meta.content = t.docDescription
  }, [locale, t.docTitle, t.docDescription])

  const onHeroKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      hero.step(-1)
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      hero.step(1)
    }
  }

  const onHeroTouchStart = (event: React.TouchEvent<HTMLElement>) => {
    heroTouchStart.current = event.touches[0]?.clientX ?? null
  }

  const onHeroTouchEnd = (event: React.TouchEvent<HTMLElement>) => {
    const start = heroTouchStart.current
    const end = event.changedTouches[0]?.clientX
    heroTouchStart.current = null
    if (start == null || end == null || Math.abs(end - start) < 48) return
    hero.step(end < start ? 1 : -1)
  }

  /* Escape closes the mobile menu; the page behind it stays put */
  useEffect(() => {
    if (!menuOpen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  /* Play event reels only while their cards are in view; posters carry the rest. */
  useEffect(() => {
    const videos = eventVideosRef.current.filter((video): video is HTMLVideoElement => Boolean(video))
    if (reducedMotion) {
      videos.forEach((video) => {
        video.pause()
        video.currentTime = 0
      })
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement
          if (entry.isIntersecting) void video.play().catch(() => undefined)
          else video.pause()
        })
      },
      { rootMargin: '120px 0px', threshold: 0.25 },
    )
    videos.forEach((video) => observer.observe(video))
    return () => observer.disconnect()
  }, [reducedMotion])

  /* transparent over the hero, solid once scrolled */
  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const suffix = hash || ''
  const koHref = useMemo(() => `/${suffix}`, [suffix])
  const enHref = useMemo(() => `/en${suffix}`, [suffix])

  const languageSwitch = (
    <p className="pl-lang">
      <Link to={koHref} lang="ko" hrefLang="ko" aria-current={locale === 'ko' ? 'page' : undefined}>
        KR
      </Link>
      <span className="pl-lang__sep" aria-hidden="true">
        /
      </span>
      <Link to={enHref} lang="en" hrefLang="en" aria-current={locale === 'en' ? 'page' : undefined}>
        EN
      </Link>
    </p>
  )

  return (
    <div className="pl-shell" ref={rootRef}>
      <a className="pl-skip" href="#main">
        {t.skip}
      </a>

      {/* --------------------------------------------------------- navigation */}
      <header className={['pl-nav', solid ? 'is-solid' : '', menuOpen ? 'is-open' : ''].join(' ').trim()}>
        <div className="pl-bleed">
          <div className="pl-nav__bar">
            <Link className="pl-wordmark" to={locale === 'ko' ? '/' : '/en'} aria-label={t.navHome}>
              <img src="/brand/playa-wordmark.svg" alt="" aria-hidden="true" />
            </Link>

            <nav aria-label={t.navLabel}>
              <ul className="pl-nav__links">
                {SECTIONS.map((id) => (
                  <li key={id}>
                    <a className="pl-nav__link" href={`#${id}`}>
                      {t.nav[id]}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="pl-nav__side">
              {languageSwitch}
              <Link className="pl-nav__cta" to={locale === 'ko' ? '/apply' : '/en/apply'}>
                {t.apply}
              </Link>
              <button
                type="button"
                className={menuOpen ? 'pl-burger is-open' : 'pl-burger'}
                aria-expanded={menuOpen}
                aria-controls="pl-mobile-menu"
                aria-label={menuOpen ? t.menuClose : t.menuOpen}
                onClick={() => setMenuOpen((open) => !open)}
              >
                <span />
                <span />
                <span />
              </button>
            </div>
          </div>
        </div>

        {menuOpen && (
          <div className="pl-menu" id="pl-mobile-menu">
            <div className="pl-bleed">
              <div className="pl-menu__inner">
                <nav aria-label={t.navLabel}>
                  <ul className="pl-menu__list">
                    {SECTIONS.map((id) => (
                      <li key={id}>
                        <a href={`#${id}`} onClick={() => setMenuOpen(false)}>
                          {t.nav[id]}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
                <div className="pl-menu__foot">
                  <Link className="pl-textlink" to={locale === 'ko' ? '/apply' : '/en/apply'} onClick={() => setMenuOpen(false)}>
                    {t.apply}
                  </Link>
                  {languageSwitch}
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      <main id="main">
        {/* ---------------------------------------------------- 1 · hero */}
        <section
          className="pl-hero"
          aria-labelledby="hero-title"
          aria-roledescription="carousel"
          aria-label={t.hero.carouselLabel}
          tabIndex={0}
          onKeyDown={onHeroKeyDown}
          onTouchStart={onHeroTouchStart}
          onTouchEnd={onHeroTouchEnd}
          onMouseEnter={() => setHeroPaused(true)}
          onMouseLeave={() => setHeroPaused(false)}
          onFocus={() => setHeroPaused(true)}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setHeroPaused(false)
          }}
        >
          <div className="pl-hero__stage">
            {HERO_SLIDES.map((slide, i) => (
              <div
                key={slide.id}
                className={i === hero.index ? 'pl-hero__frame is-active' : 'pl-hero__frame'}
                aria-hidden={i === hero.index ? undefined : true}
              >
                <img
                  src={slide.image}
                  alt={i === hero.index ? slide.alt[locale] : ''}
                  loading={i === 0 ? 'eager' : 'lazy'}
                  fetchPriority={i === 0 ? 'high' : 'low'}
                  width="1440"
                  height="1800"
                  style={{ objectPosition: slide.position }}
                />
              </div>
            ))}
            <div className="pl-hero__veil" />
          </div>

          <div className="pl-hero__body pl-bleed">
            <div className="pl-hero__intro" key={`hero-intro-${locale}-${hero.index}`}>
              <p className="pl-label pl-label--light">{t.hero.label}</p>
              <h1 className="pl-display pl-hero__title" id="hero-title">
                {t.hero.title}
              </h1>
              <p className="pl-hero__actions">
                <a className="pl-underline" href="#spaces">
                  {t.hero.ctaSpaces}
                </a>
                <Link className="pl-underline" to={locale === 'ko' ? '/apply' : '/en/apply'}>
                  {t.hero.ctaApply}
                </Link>
              </p>
            </div>

            <div className="pl-hero__story" key={`${locale}-${hero.index}`} aria-live="polite">
              <p className="pl-hero__category">{HERO_SLIDES[hero.index].category[locale]}</p>
              <p className="pl-display pl-hero__name">{HERO_SLIDES[hero.index].name[locale]}</p>
              <p className="pl-hero__caption">{HERO_SLIDES[hero.index].caption[locale]}</p>
            </div>

            <div className="pl-hero__controls">
              <p className="pl-hero__count" aria-hidden="true">
                <span>{String(hero.index + 1).padStart(2, '0')}</span>
                <i>/</i>
                <span>{String(HERO_SLIDES.length).padStart(2, '0')}</span>
              </p>
              <div className="pl-hero__buttons">
                <button type="button" onClick={() => hero.step(-1)} aria-label={t.hero.previous}>
                  <span aria-hidden="true">←</span>
                </button>
                <button type="button" onClick={() => hero.step(1)} aria-label={t.hero.next}>
                  <span aria-hidden="true">→</span>
                </button>
              </div>
              <ol className="pl-hero__progress" aria-label={t.hero.carouselLabel}>
                {HERO_SLIDES.map((slide, index) => (
                  <li key={slide.id}>
                    <button
                      type="button"
                      className={index === hero.index ? 'is-active' : ''}
                      onClick={() => hero.goTo(index)}
                      aria-label={`${index + 1}: ${slide.name[locale]}`}
                      aria-current={index === hero.index ? 'true' : undefined}
                    >
                      <span />
                    </button>
                  </li>
                ))}
              </ol>
              <p className="pl-hero__swipe">
                <span aria-hidden="true">↔</span> {t.hero.swipe}
              </p>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------- 2 · invitation */}
        <section className="pl-invite" id="about" aria-labelledby="invite-title">
          <div className="pl-invite__bg">
            <img src={IMG(21)} alt={t.invitation.alt} loading="lazy" />
          </div>
          <div className="pl-invite__body pl-bleed">
            <p className="pl-label pl-label--light" data-reveal="copy">
              {t.invitation.label}
            </p>
            <h2 className="pl-display pl-invite__title" id="invite-title" data-reveal="heading">
              {t.invitation.title}
            </h2>
            <p className="pl-invite__copy" data-reveal="copy">
              {t.invitation.body}
            </p>
            <dl className="pl-facts pl-facts--manifesto" data-reveal="copy">
              {t.invitation.facts.map((fact, index) => (
                <div key={fact.k}>
                  <span className="pl-facts__index" aria-hidden="true">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <dt>{fact.k}</dt>
                  <dd>{fact.v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ------------------------------------------ 3 · four rhythms */}
        <section className="pl-ivory pl-ways pl-flow pl-flow--warm pl-space--editorial" id="ways" aria-labelledby="ways-title">
          <div className="pl-bleed pl-ways__head" data-reveal="heading">
            <div>
              <p className="pl-label">{t.ways.label}</p>
              <h2 className="pl-display pl-ways__title" id="ways-title">
                {t.ways.title}
              </h2>
              <p className="pl-note">{t.ways.note}</p>
            </div>
          </div>

          <ol className="pl-rhythms pl-bleed" aria-label={t.ways.label}>
            {WAYS.map((way) => (
              <li className={`pl-rhythm pl-rhythm--${way.id}`} key={way.id}>
                <p className="pl-rhythm__meta">
                  <span>{way.number}</span>
                  <span>{way.verb}</span>
                </p>
                <figure className="pl-rhythm__media" data-reveal="image">
                  <img src={way.image} alt={way.alt[locale]} loading="lazy" />
                </figure>
                <div className="pl-rhythm__copy">
                  <h3 className="pl-display pl-rhythm__title">{way.title[locale]}</h3>
                  <p className="pl-rhythm__line">{way.line[locale]}</p>
                </div>
              </li>
            ))}
          </ol>

        </section>

        {/* -------------------------------------------------- 4 · location */}
        <section className="pl-place pl-flow pl-flow--quiet pl-space--breathe" aria-labelledby="place-title">
          <div className="pl-bleed pl-place__grid" data-reveal="split">
            <div>
              <p className="pl-label">{t.location.label}</p>
              <h2 className="pl-display pl-place__title" id="place-title">
                {t.location.title}
              </h2>
            </div>
            <p className="pl-place__body">{t.location.body}</p>
          </div>
          <figure className="pl-place__media" data-reveal="image">
            <img src={IMG(18)} alt={t.location.alt} loading="lazy" />
            <figcaption>PLAYA · DOSAN-DAERO · SEOUL</figcaption>
          </figure>
        </section>

        {/* ----------------------------------------- 5 · two hours at PLAYA */}
        <section className="pl-journey-section" aria-labelledby="journey-title">
          <div className="pl-journey pl-bleed">
            <div className="pl-journey__head" data-reveal="heading">
              <p className="pl-label">{t.ways.journeyLabel}</p>
              <h2 className="pl-display pl-journey__title" id="journey-title">
                {t.ways.journeyTitle}
              </h2>
            </div>
            <ol className="pl-journey__steps">
              {t.ways.journey.map((step, index) => (
                <li key={step.time} data-reveal="copy">
                  <div className="pl-journey__time">
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <time>{step.time}</time>
                  </div>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ------------------------------------------------ 6 · a day at */}
        <section className="pl-day" aria-labelledby="day-title">
          <div className="pl-day__bg">
            <img src={IMG(12)} alt={t.day.alt} loading="lazy" />
          </div>
          <div className="pl-day__body" data-reveal="heading">
            <p className="pl-label pl-label--light">{t.day.label}</p>
            <p className="pl-day__mark">PLAYA</p>
            <p className="pl-display pl-day__quote" id="day-title">
              {t.day.quote}
            </p>
          </div>
        </section>

        {/* ------------------------------------------------ 6 · community */}
        <section className="pl-ivory pl-comm pl-flow pl-flow--warm pl-space--editorial" id="community" aria-labelledby="comm-title">
          <div className="pl-bleed pl-comm__head" data-reveal="heading">
            <div>
              <p className="pl-label">{t.community.label}</p>
              <h2 className="pl-display pl-comm__title" id="comm-title">
                {t.community.title}
              </h2>
            </div>
            <div className="pl-comm__side">
              <p className="pl-comm__line">{t.community.line}</p>
              <a className="pl-textlink pl-comm__instagram" href={INSTAGRAM_URL} target="_blank" rel="noreferrer">
                {t.community.follow}
              </a>
            </div>
          </div>

          <ul className="pl-events">
            {EVENTS.map((event, i) => (
              <li className={`pl-event pl-event--${i + 1}`} key={event.id} data-reveal="event">
                <figure className="pl-event__media">
                  <video
                    ref={(node) => { eventVideosRef.current[i] = node }}
                    src={event.video}
                    poster={event.image}
                    aria-label={event.alt[locale]}
                    muted
                    loop
                    playsInline
                    preload="none"
                    disablePictureInPicture
                  />
                </figure>
                <p className="pl-event__num" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </p>
                <p className="pl-event__meta">{event.meta[locale]}</p>
                <h3 className="pl-event__title">{event.title[locale]}</h3>
                <p className="pl-event__body">{event.body[locale]}</p>
                <a
                  className="pl-textlink pl-event__source"
                  href={event.url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${t.community.source}: ${event.title[locale]}`}
                >
                  {t.community.source}
                </a>
              </li>
            ))}
          </ul>
        </section>

        {/* ---------------------------------------------------- 7 · members */}
        <section className="pl-members pl-flow pl-flow--quiet pl-space--breathe" aria-labelledby="members-title">
          <div className="pl-bleed pl-members__intro">
            <p className="pl-label" data-reveal="copy">{t.members.label}</p>
            <div className="pl-members__heading">
              <h2 className="pl-display pl-members__title" id="members-title" data-reveal="heading">
                {t.members.title}
              </h2>
              <p className="pl-members__body" data-reveal="copy">{t.members.body}</p>
            </div>
          </div>

          <div className="pl-bleed pl-members__facts pl-members__portrait">
            <div className="pl-members__age" data-reveal="number">
              <div className="pl-members__orbit" aria-hidden="true">
                <i /><i /><i />
                <span>PLAYA · MEMBERS</span>
              </div>
              <div className="pl-members__age-value">
                <strong>39</strong>
                <span>{t.members.ageLabel}</span>
              </div>
            </div>

            <div className="pl-members__composition" data-reveal="measure">
              <p className="pl-label">{t.members.composition}</p>
              <ol className="pl-members__sequence">
                {[65, 11, 9, 5, 10].map((percentage, index) => (
                  <li key={t.members.categories[index]} style={{ '--member-share': percentage } as React.CSSProperties}>
                    <span className="pl-members__rank" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                    <span className="pl-members__bar" aria-hidden="true"><i /></span>
                    <span className="pl-members__percentage">{percentage}%</span>
                    <span className="pl-members__category">{t.members.categories[index]}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div className="pl-bleed pl-members__profiles" data-reveal="profiles">
            <ol>
              {t.members.personas.map((persona, index) => (
                <li key={persona}>
                  <span>Member {String.fromCharCode(65 + index)}</span>
                  <p>{persona}</p>
                </li>
              ))}
            </ol>
            <p className="pl-members__privacy">{t.members.privacy}</p>
          </div>
        </section>

        {/* ----------------------------------------------- 8 · collaborations */}
        <section className="pl-collabs pl-flow pl-flow--deep pl-space--dense" aria-labelledby="collabs-title">
          <div className="pl-bleed pl-collabs__head">
            <p className="pl-label pl-label--light" data-reveal="copy">{t.collaborations.label}</p>
            <div className="pl-collabs__intro">
              <h2 className="pl-display pl-collabs__title" id="collabs-title" data-reveal="heading">{t.collaborations.title}</h2>
              <p className="pl-collabs__body" data-reveal="copy">{t.collaborations.body}</p>
            </div>
          </div>
          <ol className="pl-bleed pl-collabs__grid">
            {COLLABORATIONS.map((collaboration, index) => {
              const copy = t.collaborations.items[index]
              return <li className={`pl-collab pl-collab--${index + 1}`} key={collaboration.id} data-reveal="image">
                <a href={collaboration.url} target="_blank" rel="noreferrer" aria-label={`${t.collaborations.source}: ${copy.title}`}>
                  <figure className="pl-collab__media">
                    <img src={collaboration.image} alt={copy.alt} loading="lazy" width="1440" height={index === 1 ? 1800 : 1920} />
                  </figure>
                  <div className="pl-collab__copy">
                    <p>{copy.meta}</p>
                    <h3>{copy.title}</h3>
                    <span>{copy.body}</span>
                    <i>{t.collaborations.source} ↗</i>
                  </div>
                </a>
              </li>
            })}
          </ol>
        </section>

        {/* -------------------------------------------------- 9 · lounges */}
        <section className="pl-lounges pl-flow pl-flow--quiet pl-space--editorial" id="lounges" aria-labelledby="lounges-title">
          <div className="pl-bleed pl-lounges__head" data-reveal="heading">
            <div>
              <p className="pl-label pl-label--light">{t.lounges.label}</p>
              <h2 className="pl-display pl-lounges__title" id="lounges-title">
                {t.lounges.title}
              </h2>
            </div>
            <p className="pl-lounges__note">{t.lounges.note}</p>
          </div>

          <article className="pl-lounge pl-lounge--playa pl-bleed" aria-labelledby="playa-lounge-title">
            <div className="pl-lounge__copy" data-reveal="split">
              <p className="pl-lounge__index" aria-hidden="true">01</p>
              <div>
                <p className="pl-lounge__meta">{t.lounges.playaMeta}</p>
                <h3 className="pl-display pl-lounge__name" id="playa-lounge-title">{t.lounges.playaName}</h3>
                <p className="pl-lounge__body">{t.lounges.playaBody}</p>
              </div>
            </div>
            <div className="pl-lounge__gallery pl-lounge__gallery--playa">
              {[1, 2, 3].map((image, index) => (
                <figure className={`pl-lounge__media pl-lounge__media--${index + 1}`} data-reveal="image" key={image}>
                  <img
                    src={`/images/playa-instagram-facilities/playa-lounge-${image}.webp`}
                    alt={t.lounges.alts[index]}
                    loading="lazy"
                  />
                </figure>
              ))}
            </div>
          </article>

          <article className="pl-lounge pl-lounge--audio pl-bleed" aria-labelledby="audio-lounge-title">
            <div className="pl-lounge__copy" data-reveal="split">
              <p className="pl-lounge__index" aria-hidden="true">02</p>
              <div>
                <p className="pl-lounge__meta">{t.lounges.audioMeta}</p>
                <h3 className="pl-display pl-lounge__name" id="audio-lounge-title">{t.lounges.audioName}</h3>
                <p className="pl-lounge__body">{t.lounges.audioBody}</p>
              </div>
            </div>
            <div className="pl-lounge__gallery pl-lounge__gallery--audio">
              {[
                '/images/playa-audio-lounge-official/site-05.jpg',
                '/images/playa-audio-lounge-official/site-10.jpg',
                '/images/playa-audio-lounge-official/site-04.jpg',
              ].map((image, index) => (
                <figure className={`pl-lounge__media pl-lounge__media--${index + 1}`} data-reveal="image" key={image}>
                  <img src={image} alt={t.lounges.alts[index + 3]} loading="lazy" />
                </figure>
              ))}
            </div>
          </article>
        </section>

        {/* --------------------------------------------------- 8 · spaces */}
        <section className="pl-spaces pl-flow pl-flow--deep pl-space--dense" id="spaces" aria-labelledby="spaces-title">
          <div className="pl-bleed pl-spaces__head" data-reveal="heading">
            <div>
              <p className="pl-label pl-label--light">{t.spaces.label}</p>
              <h2 className="pl-display pl-spaces__title" id="spaces-title">
                {t.spaces.title}
              </h2>
              <p className="pl-note pl-note--light">{t.spaces.note}</p>
            </div>
            <RailControls
              index={spaceRail.index}
              count={SPACES.length}
              onPrev={() => spaceRail.scrollBy(-1)}
              onNext={() => spaceRail.scrollBy(1)}
              prevLabel={t.prev}
              nextLabel={t.next}
              tone="light"
              hint={locale === 'ko' ? '옆으로 넘겨 공간 더 보기' : 'Swipe to explore more spaces'}
            />
          </div>

          <ul className="pl-rail pl-rail--slides" ref={spaceRef} aria-label={`${t.spaces.label} — ${t.railLabel}`}>
            {SPACES.map((space, index) => (
              <li
                className={`pl-slide${space.image || space.imagePath ? '' : ' pl-slide--type'}${spaceRail.index === index ? ' is-active' : ''}`}
                key={space.id}
                aria-current={spaceRail.index === index ? 'true' : undefined}
              >
                <span className="pl-slide__index" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                {(space.image || space.imagePath) && space.alt ? (
                  <img
                    src={space.imagePath ?? IMG(space.image as number)}
                    alt={space.alt[locale]}
                    loading="lazy"
                  />
                ) : (
                  <div className="pl-slide__type-field" aria-hidden="true">
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <i>PLAYA · SEOUL</i>
                  </div>
                )}
                <div className="pl-slide__veil" aria-hidden="true" />
                <div className="pl-slide__text pl-bleed">
                  <h3 className="pl-display pl-slide__name">{space.name[locale]}</h3>
                  <p className="pl-slide__line">{space.line[locale]}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* ------------------------------------------------- 8 · one club */}
        <section className="pl-ivory pl-one pl-flow pl-flow--warm pl-space--breathe" aria-labelledby="one-title">
          <div className="pl-bleed pl-one__grid" data-reveal="split">
            <h2 className="pl-display pl-one__title" id="one-title">
              {t.overview.title}
            </h2>
            <p className="pl-one__body">{t.overview.body}</p>
          </div>
          <figure className="pl-wide" data-reveal="image">
            <img src={IMG(1)} alt={t.overview.alt} loading="lazy" />
            <figcaption className="pl-bleed">{t.overview.caption}</figcaption>
          </figure>
        </section>

        {/* --------------------------------------- 9 · membership proof */}
        <section className="pl-ivory pl-proof pl-flow pl-flow--quiet pl-space--dense" aria-labelledby="proof-title">
          <div className="pl-bleed" data-reveal="heading">
            <p className="pl-label">{t.proof.label}</p>
            <p className="pl-display pl-proof__line" id="proof-title">
              {t.proof.line}
            </p>
            <p className="pl-proof__support">{t.proof.support}</p>
          </div>
        </section>

        {/* ------------------------------------------------ 10 · final CTA */}
        <section className="pl-final" id="membership" aria-labelledby="final-title">
          <div className="pl-final__bg">
            <img src={IMG(9)} alt={t.cta.alt} loading="lazy" />
          </div>
          <div className="pl-final__body pl-bleed" data-reveal="heading">
            <h2 className="pl-display pl-final__title" id="final-title">
              {t.cta.title}
            </h2>
            <p className="pl-final__actions">
              <Link className="pl-underline pl-underline--light" to={locale === 'ko' ? '/apply' : '/en/apply'}>
                {t.cta.apply}
              </Link>
              <a
                className="pl-underline pl-underline--light"
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noreferrer noopener"
              >
                {t.cta.instagram}
              </a>
            </p>
          </div>
        </section>
      </main>

      {/* ------------------------------------------------------- 12 · footer */}
      <footer className="pl-footer">
        <div className="pl-bleed">
          <div className="pl-footer__top">
            <div>
              <p className="pl-footer__mark">PLAYA</p>
              <p className="pl-footer__tag">{t.footer.tag}</p>
            </div>
            <div className="pl-footer__col">
              <h2>{t.footer.spaces}</h2>
              <ul>
                {footerSpaces.map((space) => <li key={space}><a href="#spaces">{space}</a></li>)}
              </ul>
            </div>
            <div className="pl-footer__col">
              <h2>{t.footer.more}</h2>
              <ul>
                <li><Link to={locale === 'ko' ? '/apply' : '/en/apply'}>{t.apply}</Link></li>
                <li><a href={INSTAGRAM_URL} target="_blank" rel="noreferrer noopener">{t.footer.instagram}</a></li>
              </ul>
            </div>
          </div>

          <div className="pl-footer__bottom">
            <span>
              © {new Date().getFullYear()} PLAYA. {t.footer.rights}
            </span>
            <a
              className="pl-footer__backed"
              href="https://www.hashed.com/"
              target="_blank"
              rel="noreferrer noopener"
              aria-label="Backed by Hashed"
            >
              <span>Backed by</span>
              <img src="/brand/hashed-logo.svg" alt="Hashed" />
            </a>
            {languageSwitch}
          </div>
        </div>
      </footer>
    </div>
  )
}
