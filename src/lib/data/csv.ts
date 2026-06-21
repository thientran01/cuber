import type { Penalty, Solve } from '@/lib/types'

export interface ParsedSolve {
  timeMs: number
  penalty: Penalty
  scramble: string
  createdAt: number
}

/** Export solves to a simple, re-importable CSV (raw time + penalty + scramble + date). */
export function solvesToCsv(solves: Solve[]): string {
  const header = 'time,penalty,scramble,date'
  const rows = solves.map((s) => {
    const time = (s.timeMs / 1000).toFixed(2)
    const scramble = `"${s.scramble.replace(/"/g, '""')}"`
    const date = new Date(s.createdAt).toISOString()
    return `${time},${s.penalty},${scramble},${date}`
  })
  return [header, ...rows].join('\n')
}

function splitLine(line: string, delim: string): string[] {
  const out: string[] = []
  let cur = ''
  let inQ = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (inQ) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"'
          i++
        } else {
          inQ = false
        }
      } else {
        cur += ch
      }
    } else if (ch === '"') {
      inQ = true
    } else if (ch === delim) {
      out.push(cur)
      cur = ''
    } else {
      cur += ch
    }
  }
  out.push(cur)
  return out
}

function parseSeconds(raw: string): number | null {
  const s = raw.trim()
  if (!s || /dnf/i.test(s)) return null
  if (s.includes(':')) {
    const [m, sec] = s.split(':')
    const mm = parseFloat(m)
    const ss = parseFloat(sec)
    return Number.isNaN(mm) || Number.isNaN(ss) || mm < 0 || ss < 0 ? null : mm * 60 + ss
  }
  const v = parseFloat(s)
  return Number.isNaN(v) || v < 0 ? null : v
}

/**
 * Lenient CSV import. Round-trips this app's export, and makes a best effort at
 * csTimer-style CSV (`;`-delimited, Time/Scramble/Date/P columns). The numeric
 * time is treated as the raw solve time; penalty comes from a +/DNF marker or a
 * penalty column.
 */
export function parseCsv(text: string): ParsedSolve[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0)
  if (lines.length === 0) return []

  const semis = (lines[0].match(/;/g) ?? []).length
  const commas = (lines[0].match(/,/g) ?? []).length
  const delim = semis > commas ? ';' : ','

  let start = 0
  let idx = { time: 0, penalty: 1, scramble: 2, date: 3 }
  const head = splitLine(lines[0], delim).map((h) => h.trim().toLowerCase())
  const isHeader = head.some((h) => h.includes('time')) && !/^[\d.]/.test(lines[0].trim())
  if (isHeader) {
    start = 1
    const find = (re: RegExp, def: number) => {
      const i = head.findIndex((h) => re.test(h))
      return i >= 0 ? i : def
    }
    idx = {
      time: find(/time/, 0),
      penalty: find(/penalty|^p\.?$/, -1),
      scramble: find(/scramble/, 2),
      date: find(/date|timestamp/, -1),
    }
  }

  const out: ParsedSolve[] = []
  for (let i = start; i < lines.length; i++) {
    const f = splitLine(lines[i], delim)
    const rawTime = (f[idx.time] ?? '').trim()
    if (!rawTime) continue

    let penalty: Penalty = 'none'
    let timeStr = rawTime
    if (/dnf/i.test(timeStr)) penalty = 'dnf'
    else if (timeStr.endsWith('+')) {
      penalty = 'plus2'
      timeStr = timeStr.slice(0, -1)
    }
    if (idx.penalty >= 0 && f[idx.penalty] != null) {
      const p = f[idx.penalty].trim().toLowerCase()
      if (/dnf|-1/.test(p)) penalty = 'dnf'
      else if (/plus2|\+2|^2$|^2000$/.test(p)) penalty = penalty === 'dnf' ? 'dnf' : 'plus2'
    }

    const seconds = parseSeconds(timeStr)
    if (seconds == null && penalty !== 'dnf') continue

    const scramble = (f[idx.scramble] ?? '').trim()
    const dateStr = idx.date >= 0 ? (f[idx.date] ?? '').trim() : ''
    const parsedDate = dateStr ? Date.parse(dateStr) : NaN

    out.push({
      timeMs: Math.round((seconds ?? 0) * 1000),
      penalty,
      scramble,
      createdAt: Number.isNaN(parsedDate) ? Date.now() : parsedDate,
    })
  }
  return out
}

/** Trigger a browser download of CSV text. */
export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  // Revoke after the click is processed — a synchronous revoke can break the
  // download on Safari/Firefox (they fetch the blob URL asynchronously).
  setTimeout(() => {
    URL.revokeObjectURL(url)
    a.remove()
  }, 0)
}
