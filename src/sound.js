/** A soft, original synthesized "booo". No microphone, downloads or services. */
const SAMPLE_RATE = 24000;
const DURATION = 0.58;
const VOLUME = 0.32;
const MAX_VOICES = 2;
let enabled = true;
let context = null;
let buffer = null;
const voices = new Set();

export function createBooSamples(sampleRate = SAMPLE_RATE) {
  const samples = new Float32Array(Math.ceil(sampleRate * DURATION));
  const harmonics = Array.from({ length: 12 }, (_, i) => {
    const n = i + 1, f = n * 285;
    // Rounded /u/ vowel, rather than a pure electronic beep.
    const formants = 0.9 * Math.exp(-0.5 * ((f - 360) / 150) ** 2)
      + 0.5 * Math.exp(-0.5 * ((f - 850) / 170) ** 2)
      + 0.12 * Math.exp(-0.5 * ((f - 2100) / 300) ** 2);
    return formants / n ** 0.9;
  });
  let phase = 0, noise = 0, seed = 719, peak = 0;
  for (let i = 0; i < samples.length; i++) {
    const t = i / sampleRate, u = t / DURATION;
    const frequency = 285 + 28 * Math.sin(Math.PI * u) - 50 * u;
    phase += Math.PI * 2 * frequency / sampleRate;
    let vowel = 0;
    for (let h = 0; h < harmonics.length; h++) {
      vowel += harmonics[h] * Math.sin(phase * (h + 1));
    }
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    noise = noise * 0.85 + (seed / 0xffffffff * 2 - 1) * 0.15;
    const attack = Math.sin(Math.min(1, t / 0.055) * Math.PI / 2) ** 2;
    const release = Math.cos(Math.min(1, Math.max(0, (t - 0.30) / 0.28)) * Math.PI / 2) ** 2;
    const breath = 0.025 + 0.10 * Math.exp(-(((t - 0.022) / 0.014) ** 2));
    samples[i] = (vowel + noise * breath) * attack * release;
    peak = Math.max(peak, Math.abs(samples[i]));
  }
  // Quiet source plus a low playback gain; the envelope avoids sharp clicks.
  for (let i = 0; i < samples.length; i++) samples[i] *= 0.22 / (peak || 1);
  return samples;
}

function stopVoice(voice, fade = 0) {
  voices.delete(voice);
  const now = context.currentTime;
  voice.gain.gain.cancelScheduledValues(now);
  voice.gain.gain.setValueAtTime(fade ? VOLUME : 0, now);
  if (fade) voice.gain.gain.linearRampToValueAtTime(0, now + fade);
  try { voice.source.stop(now + fade); } catch (_) { /* Already ended. */ }
}

export function setBooEnabled(value) {
  enabled = Boolean(value);
  if (!enabled && context) [...voices].forEach(voice => stopVoice(voice));
}

/** Called directly from a click, touch or keyboard gesture; never delays maths. */
export function playBoo(keyId = '0') {
  if (!enabled) return false;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return false;
    if (!context || context.state === 'closed') {
      context = new AudioContext({ latencyHint: 'interactive' });
      buffer = null;
    }
    if (context.state !== 'running') context.resume().catch(() => {});
    if (!buffer) {
      const samples = createBooSamples();
      buffer = context.createBuffer(1, samples.length, SAMPLE_RATE);
      buffer.copyToChannel(samples, 0);
    }
    // Rapid typing replaces the oldest voice with a short fade, avoiding a roar.
    while (voices.size >= MAX_VOICES) stopVoice(voices.values().next().value, 0.025);
    const source = context.createBufferSource();
    const gain = context.createGain();
    const variant = [...String(keyId)].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
    source.buffer = buffer;
    source.playbackRate.value = 1 + ((variant % 7) - 3) * 0.015;
    gain.gain.value = VOLUME;
    source.connect(gain);
    gain.connect(context.destination);
    const voice = { source, gain };
    voices.add(voice);
    source.onended = () => {
      voices.delete(voice);
      source.disconnect();
      gain.disconnect();
    };
    source.start();
    return true;
  } catch (_) {
    // Unsupported or unavailable audio must never interrupt calculator input.
    return false;
  }
}
