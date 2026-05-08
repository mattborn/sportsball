const g = id => document.getElementById(id)

const YEAR = 2026
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const TARGET = 3000

const now = new Date()
const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
const todayKey = `${YEAR}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

// Calendar
const schedule = g('schedule')
const allDays = []
const monthSections = []

MONTHS.forEach((name, mi) => {
  const count = new Date(YEAR, mi + 1, 0).getDate()
  const section = document.createElement('section')
  section.className = 'month'

  const h2 = document.createElement('h2')
  h2.textContent = name
  section.appendChild(h2)

  const grid = document.createElement('div')
  grid.className = 'days'

  for (let d = 1; d <= count; d++) {
    const key = `${YEAR}-${String(mi + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const date = new Date(YEAR, mi, d)
    const el = document.createElement('div')
    el.className = 'day'
    el.dataset.date = key
    if (date < today) el.classList.add('past')
    if (key === todayKey) el.classList.add('today')
    el.appendChild(Object.assign(document.createElement('span'), { className: 'dow', textContent: DAYS[date.getDay()] }))
    el.appendChild(Object.assign(document.createElement('span'), { className: 'num', textContent: d }))
    grid.appendChild(el)
    allDays.push(el)
  }

  section.appendChild(grid)
  schedule.appendChild(section)
  monthSections.push(section)
})

// Sweep
let scrollFrom = 0, scrollDest = 0
const sweep = (items, duration, ease, onDone) => {
  let last = -1, prev = null
  const start = performance.now()
  const step = ts => {
    const t = Math.min((ts - start) / duration, 1)
    const idx = Math.floor(ease(t) * (items.length - 1))
    if (idx !== last) {
      if (prev) prev.classList.remove('active')
      items[idx].classList.add('active')
      prev = items[idx]
      last = idx
    }
    window.scrollTo(0, scrollFrom + (scrollDest - scrollFrom) * ease(t))
    if (t < 1) requestAnimationFrame(step)
    else onDone?.()
  }
  requestAnimationFrame(step)
}

// Filter
const todayEl = allDays.find(el => el.classList.contains('today'))

const applyFilter = sport => {
  allDays.forEach(el => {
    const match = sport === 'all' || el.dataset.sport?.includes(sport) || el.classList.contains('today')
    el.classList.toggle('hidden', !match)
  })
  if (todayEl) {
    const noEvents = todayEl.querySelector('.no-events')
    const hasMatch = sport === 'all' || todayEl.dataset.sport?.includes(sport)
    if (!hasMatch && !noEvents) todayEl.appendChild(Object.assign(document.createElement('span'), { className: 'no-events', textContent: 'No events' }))
    else if (hasMatch && noEvents) noEvents.remove()
  }
  monthSections.forEach(s => s.classList.toggle('hidden', !s.querySelector('.day:not(.hidden)')))
}

const findLandingIndex = visible => {
  const exact = visible.findIndex(el => el.dataset.date === todayKey)
  if (exact >= 0) return exact
  const next = visible.findIndex(el => el.dataset.date >= todayKey)
  return next >= 0 ? next : visible.length - 1
}

const runAnimation = () => {
  const visible = allDays.filter(el => !el.classList.contains('hidden'))
  const landIdx = findLandingIndex(visible)
  const ms = TARGET / visible.length
  scrollFrom = 0
  scrollDest = document.documentElement.scrollHeight - window.innerHeight

  sweep(visible, TARGET, t => t * t, () => {
    const back = visible.slice(landIdx).reverse()
    scrollFrom = window.scrollY
    scrollDest = visible[landIdx].getBoundingClientRect().top + window.scrollY - window.innerHeight / 2
    sweep(back, back.length * ms, t => 1 - (1 - t) ** 3)
  })
}

// Filters UI
const filters = g('filters')
const sports = ['All', 'F1']
const groups = ['All']

const makeFilters = (items, attr, defaultVal) => items.forEach(label => {
  const btn = document.createElement('button')
  btn.textContent = label
  btn.dataset[attr] = label.toLowerCase()
  if (label.toLowerCase() === defaultVal) btn.classList.add('active')
  filters.appendChild(btn)
})

makeFilters(sports, 'sport', 'f1')
filters.appendChild(Object.assign(document.createElement('div'), { className: 'divider' }))
makeFilters(groups, 'group', 'all')

filters.addEventListener('click', e => {
  const btn = e.target.closest('button')
  if (!btn) return
  const attr = btn.dataset.sport !== undefined ? 'sport' : 'group'
  filters.querySelectorAll(`[data-${attr}]`).forEach(b => b.classList.remove('active'))
  btn.classList.add('active')
  if (btn.dataset.sport !== undefined) {
    applyFilter(btn.dataset.sport)
    const visible = allDays.filter(el => !el.classList.contains('hidden'))
    const land = visible[findLandingIndex(visible)]
    if (land) land.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
})

// Load events then animate
fetch('f1.json')
  .then(r => r.json())
  .then(data => {
    data.events.forEach(e => {
      const el = allDays.find(d => d.dataset.date === e.date)
      if (!el) return
      el.dataset.sport = 'f1'
      el.appendChild(Object.assign(document.createElement('span'), { className: 'event', textContent: e.name }))
      el.appendChild(Object.assign(document.createElement('span'), { className: 'location', textContent: e.location.split(', ')[0] }))
    })
    applyFilter('f1')
    runAnimation()
  })
