/** A soft, original synthesized "booo". No microphone, downloads or services. */
const SAMPLE_RATE = 24000;
const DURATION = 0.58;
const VOLUME = 0.32;
const MAX_VOICES = 2;
let enabled = true;
let context = null;
let buffer = null;
const noteBuffers = new Map();
const voices = new Set();

export const BOO_NOTES = {
  '1': { name: 'Do4', semitones: 0 },
  '2': { name: 'Re4', semitones: 2 },
  '3': { name: 'Mi4', semitones: 4 },
  '4': { name: 'Fa4', semitones: 5 },
  '5': { name: 'Sol4', semitones: 7 },
  '6': { name: 'La4', semitones: 9 },
  '7': { name: 'Si4', semitones: 11 },
  '8': { name: 'Do5', semitones: 12 },
  '9': { name: 'Re5', semitones: 14 },
  '0': { name: 'Mi5', semitones: 16 },
};

export function getBooFrequency(keyId = '1') {
  return 261.6255653005986 * 2 ** ((BOO_NOTES[keyId]?.semitones || 0) / 12);
}

export function createBooSamples(sampleRate = SAMPLE_RATE, frequencyHz = getBooFrequency()) {
  const samples = new Float32Array(Math.ceil(sampleRate * DURATION));
  const harmonics = Array.from({ length: 12 }, (_, i) => {
    const n = i + 1, f = n * frequencyHz;
    // Rounded /u/ vowel, rather than a pure electronic beep.
    const formants = 0.9 * Math.exp(-0.5 * ((f - 360) / 150) ** 2)
      + 0.5 * Math.exp(-0.5 * ((f - 850) / 170) ** 2)
      + 0.12 * Math.exp(-0.5 * ((f - 2100) / 300) ** 2);
    return formants / n ** 0.9;
  });
  let phase = 0, noise = 0, seed = 719, peak = 0;
  for (let i = 0; i < samples.length; i++) {
    const t = i / sampleRate, u = t / DURATION;
    // A very small vibrato preserves a recognizable musical note.
    const frequency = frequencyHz * (1 + 0.0025 * Math.sin(Math.PI * 9 * t) * Math.sin(Math.PI * u));
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
      noteBuffers.clear();
    }
    if (context.state !== 'running') context.resume().catch(() => {});
    const frequency = getBooFrequency(keyId);
    buffer = noteBuffers.get(frequency);
    if (!buffer) {
      const samples = createBooSamples(SAMPLE_RATE, frequency);
      buffer = context.createBuffer(1, samples.length, SAMPLE_RATE);
      buffer.copyToChannel(samples, 0);
      noteBuffers.set(frequency, buffer);
    }
    // Rapid typing replaces the oldest voice with a short fade, avoiding a roar.
    while (voices.size >= MAX_VOICES) stopVoice(voices.values().next().value, 0.025);
    const source = context.createBufferSource();
    const gain = context.createGain();
    source.buffer = buffer;
    // Pitch is synthesized into the buffer: higher notes keep the same duration.
    source.playbackRate.value = 1;
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
