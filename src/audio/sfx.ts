// Synthesised sound effects (Web Audio). Every sound is an oscillator plus a gain envelope.
import type { GameEvent } from '../game/types'

type Sound = GameEvent['kind'] | 'hint'

let ctx: AudioContext | null = null
let muted = false

export function setMuted(value: boolean): void {
  muted = value
}

interface WindowWithWebkit {
  AudioContext?: typeof AudioContext
  webkitAudioContext?: typeof AudioContext
}

// Only called from user gestures: creating or resuming a context outside one is blocked on iOS.
function context(): AudioContext | null {
  if (!ctx) {
    const w = window as unknown as WindowWithWebkit
    const Ctor = w.AudioContext ?? w.webkitAudioContext
    if (!Ctor) return null
    try {
      ctx = new Ctor()
    } catch {
      return null
    }
  }
  if (ctx.state === 'suspended') void ctx.resume().catch(() => {})
  return ctx
}

// Call on the first pointer gesture so later sounds are allowed to play.
export function unlockAudio(): void {
  context()
}

interface Tone {
  at: number // seconds from now
  dur: number
  freq: number
  // frequency waypoints as [fraction of dur, Hz] after the start
  glide?: [number, number][]
  type?: OscillatorType
  gain?: number
  lowpass?: number
}

function play(tones: Tone[]): void {
  if (muted) return
  const c = context()
  if (!c) return
  const now = c.currentTime
  for (const t of tones) {
    const start = now + t.at
    const end = start + t.dur
    const osc = c.createOscillator()
    const amp = c.createGain()
    osc.type = t.type ?? 'sine'
    osc.frequency.setValueAtTime(t.freq, start)
    for (const [f, hz] of t.glide ?? []) osc.frequency.exponentialRampToValueAtTime(hz, start + t.dur * f)
    const peak = t.gain ?? 0.15
    amp.gain.setValueAtTime(0.0001, start)
    amp.gain.linearRampToValueAtTime(peak, start + Math.min(0.01, t.dur / 4))
    amp.gain.exponentialRampToValueAtTime(0.0001, end)
    let node: AudioNode = osc
    if (t.lowpass) {
      const filter = c.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.value = t.lowpass
      osc.connect(filter)
      node = filter
    }
    node.connect(amp).connect(c.destination)
    osc.start(start)
    osc.stop(end + 0.02)
  }
}

const note = (at: number, freq: number, dur = 0.14, gain = 0.14): Tone => ({
  at,
  dur,
  freq,
  gain,
  type: 'triangle',
})

const SOUNDS: Record<Sound, Tone[]> = {
  cross: [{ at: 0, dur: 0.04, freq: 700, gain: 0.1, type: 'triangle' }],
  uncross: [{ at: 0, dur: 0.04, freq: 700, gain: 0.1, type: 'triangle' }],
  undo: [{ at: 0, dur: 0.05, freq: 420, gain: 0.1, type: 'triangle' }],
  // "mew": the pitch glides up then down, low-pass filtered
  cat: [
    {
      at: 0,
      dur: 0.25,
      freq: 520,
      glide: [
        [0.4, 900],
        [1, 600],
      ],
      type: 'sawtooth',
      gain: 0.16,
      lowpass: 1500,
    },
  ],
  miss: [{ at: 0, dur: 0.2, freq: 120, glide: [[1, 85]], type: 'sawtooth', gain: 0.14, lowpass: 600 }],
  win: [note(0, 523.25), note(0.11, 659.25), note(0.22, 783.99), note(0.33, 1046.5, 0.4)],
  lose: [note(0, 392, 0.18), note(0.17, 329.63, 0.18), note(0.34, 261.63, 0.4)],
  hint: [note(0, 880, 0.12, 0.1), note(0.1, 1318.5, 0.22, 0.1)],
}

export function playSound(sound: Sound): void {
  play(SOUNDS[sound])
}
