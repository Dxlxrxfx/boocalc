import test from 'node:test';
import assert from 'node:assert/strict';
import { getBooCaptureStream, stopBooCapture, playBoo, setBooEnabled } from '../src/sound.js';

test('recording receives the same live boo gain as speakers and releases its tracks', () => {
  const gains = [], sources = [], destinations = [];
  const originalWindow = globalThis.window;
  const speakers = {};
  class AudioContext {
    state = 'running';
    currentTime = 0;
    destination = speakers;
    createMediaStreamDestination() {
      const track = { readyState: 'live', stop() { this.readyState = 'ended'; } };
      const destination = { stream: { getAudioTracks: () => [track], getTracks: () => [track] }, disconnect() {} };
      destinations.push(destination);
      return destination;
    }
    createBuffer() { return { copyToChannel() {} }; }
    createBufferSource() {
      const source = { playbackRate: {}, connect() {}, disconnect() {}, start() {}, stop() {} };
      sources.push(source);
      return source;
    }
    createGain() {
      const gain = { outputs: [], gain: { value: 0, cancelScheduledValues() {}, setValueAtTime() {}, linearRampToValueAtTime() {} }, connect(output) { this.outputs.push(output); }, disconnect() {} };
      gains.push(gain);
      return gain;
    }
  }
  globalThis.window = { AudioContext };
  try {
    const stream = getBooCaptureStream();
    assert.equal(getBooCaptureStream(), stream);
    assert.equal(playBoo('1'), true);
    assert.deepEqual(gains[0].outputs, [speakers, destinations[0]]);
    assert.equal(gains[0].gain.value, 0.32);
    stopBooCapture();
    assert.equal(stream.getAudioTracks()[0].readyState, 'ended');
    assert.equal(playBoo('2'), true);
    assert.deepEqual(gains[1].outputs, [speakers]);
    const nextStream = getBooCaptureStream();
    assert.notEqual(nextStream, stream);
    assert.equal(nextStream.getAudioTracks()[0].readyState, 'live');
    setBooEnabled(false);
    assert.equal(playBoo('3'), false);
  } finally {
    sources.forEach(source => source.onended?.());
    stopBooCapture();
    setBooEnabled(true);
    if (originalWindow === undefined) delete globalThis.window;
    else globalThis.window = originalWindow;
  }
});
