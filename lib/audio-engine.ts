/**
 * ARGUS-FATE Audio Engine — Web Audio API Synthesizer
 * Generates all sci-fi sounds programmatically. Zero external audio files.
 */

let _ctx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!_ctx || _ctx.state === 'closed') {
    _ctx = new AudioContext()
  }
  return _ctx
}

function resumeCtx(): Promise<void> {
  const ctx = getCtx()
  if (ctx.state === 'suspended') return ctx.resume()
  return Promise.resolve()
}

/** Master mute flag */
let muted = false
export function setMuted(val: boolean) { muted = val }
export function isMuted() { return muted }

/** Play a quick digital bip for keypresses in the terminal */
export async function playTypingBip() {
  if (muted) return
  try {
    await resumeCtx()
    const ctx = getCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'square'
    osc.frequency.setValueAtTime(880 + Math.random() * 440, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.04)
    gain.gain.setValueAtTime(0.04, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.045)
  } catch { /* ignore if AudioContext not available */ }
}

/** Radar ping / sonar sound — plays when a target is plotted on the map */
export async function playRadarPing() {
  if (muted) return
  try {
    await resumeCtx()
    const ctx = getCtx()
    const t = ctx.currentTime

    // Main ping tone
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.setValueAtTime(1200, t)
    osc.frequency.exponentialRampToValueAtTime(600, t + 0.4)
    gain.gain.setValueAtTime(0.18, t)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4)
    osc.start(t)
    osc.stop(t + 0.42)

    // Echo decay
    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.connect(gain2)
    gain2.connect(ctx.destination)
    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(600, t + 0.25)
    osc2.frequency.exponentialRampToValueAtTime(300, t + 0.7)
    gain2.gain.setValueAtTime(0.07, t + 0.25)
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.7)
    osc2.start(t + 0.25)
    osc2.stop(t + 0.72)
  } catch { }
}

/** Alert / breach alarm — for bad security grade targets */
export async function playAlertAlarm() {
  if (muted) return
  try {
    await resumeCtx()
    const ctx = getCtx()

    for (let i = 0; i < 3; i++) {
      const t = ctx.currentTime + i * 0.22
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(180 + i * 40, t)
      osc.frequency.setValueAtTime(80, t + 0.15)
      gain.gain.setValueAtTime(0.14, t)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.19)
      osc.start(t)
      osc.stop(t + 0.2)
    }
  } catch { }
}

/** Success chime — clean security grade target */
export async function playSuccessChime() {
  if (muted) return
  try {
    await resumeCtx()
    const ctx = getCtx()
    const notes = [523, 659, 784]

    notes.forEach((freq, i) => {
      const t = ctx.currentTime + i * 0.1
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, t)
      gain.gain.setValueAtTime(0.1, t)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3)
      osc.start(t)
      osc.stop(t + 0.32)
    })
  } catch { }
}

/** Scan sweep sound — plays when recon is initiated */
export async function playScanSweep() {
  if (muted) return
  try {
    await resumeCtx()
    const ctx = getCtx()
    const t = ctx.currentTime

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const filter = ctx.createBiquadFilter()
    osc.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)

    filter.type = 'bandpass'
    filter.frequency.setValueAtTime(200, t)
    filter.frequency.exponentialRampToValueAtTime(4000, t + 1.2)
    filter.Q.setValueAtTime(8, t)

    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(60, t)
    osc.frequency.exponentialRampToValueAtTime(2400, t + 1.2)

    gain.gain.setValueAtTime(0.08, t)
    gain.gain.setValueAtTime(0.08, t + 0.9)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.3)

    osc.start(t)
    osc.stop(t + 1.35)
  } catch { }
}
