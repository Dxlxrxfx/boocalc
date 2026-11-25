import { getBooCaptureStream, stopBooCapture } from './sound.js';

// Each key goes through the ordinary application handler. Results are read back
// from the actual calculator; the presentation never supplies display values.
const key = (id, wait = 680) => ({ key: id, wait });
const pause = wait => ({ wait });
const control = (id, value, wait = 900) => ({ control: id, value, wait });

export const DEMO_SCRIPT = [
  { title: 'A little ghost behind every number.', caption: 'A real calculator in a friendly kawaii cemetery.', actions: [key('ac', 1100), pause(2800)] },
  { title: 'Numbers you can hear.', caption: '1 is C. 2 is D. Each number has its own musical “booo”.', actions: [...['1','2','3','4','5','6','7','8'].map(id => key(id, 740)), pause(1300), key('ac', 1500)] },
  { title: 'Addition gets them excited.', caption: '2 + 3 = 5. The ghosts bounce; the answer stays clear.', reaction: 'add', expect: '5', actions: [key('2'), key('add', 3700), key('3'), key('eq', 4050)] },
  { title: 'Subtraction brings little tears.', caption: '9 − 12 = −3. Every operation has its own reaction.', reaction: 'sub', expect: '-3', actions: [key('ac', 450), key('9'), key('sub', 3700), key('1'), key('2'), key('eq', 4050)] },
  { title: 'Multiplication brings them together.', caption: '6 × 7 = 42. A tiny ghost hug in the display.', reaction: 'mul', expect: '42', actions: [key('ac', 450), key('6'), key('mul', 3700), key('7'), key('eq', 4050)] },
  { title: 'Division makes little groups.', caption: '12 ÷ 3 = 4. The ghosts gather into little huddles.', reaction: 'div', expect: '4', actions: [key('ac', 450), key('1'), key('2'), key('div', 4050), key('3'), key('eq', 4050)] },
  { title: 'A little attitude.', caption: '50% really calculates 0.5. This ghost still has a question.', reaction: 'pct', expect: '0.5', actions: [key('ac', 450), key('5'), key('0'), key('pct', 5600)] },
  { title: 'Every result deserves a dance.', caption: 'Equals reveals the answer and starts the celebration.', reaction: 'eq', expect: '5', actions: [key('ac', 450), key('2'), key('add', 680), key('3'), key('eq', 4300)] },
  { title: 'Real arithmetic, underneath the magic.', caption: 'Standard precedence: 2 + 3 × 4 = 14.', expect: '14', actions: [key('ac', 450), key('2'), key('add'), key('3'), key('mul'), key('4'), key('eq', 4050)] },
  { title: 'Quiet or still, whenever you want.', caption: 'Motion and sound have separate controls. Arithmetic keeps working.', expect: '4', actions: [control('motion', false), control('sound', false), key('ac', 450), key('8'), key('div'), key('2'), key('eq', 1900), control('sound', true), control('motion', true)] },
  { title: 'A friendly cemetery, in two languages.', caption: 'Spanish and English. Keyboard input. One free offline HTML file.', actions: [control('lang', false, 2200), control('lang', true, 1800), key('ac', 450)] },
  { title: 'Meet BooCalc.', caption: 'Built with Kiro CLI. Illustrated ghosts. Musical boos. Real calculations.', expect: '5', actions: [key('2'), key('add'), key('3'), key('eq', 4300), pause(2200)] },
];

export function getDemoDurationMs() {
  return DEMO_SCRIPT.reduce((total, scene) => total + scene.actions.reduce((n, action) => n + action.wait, 0), 0);
}

export function initDemo() {
  document.body.classList.add('demo-mode');
  document.title = 'BooCalc — presentación y grabación';
  const panel = document.createElement('aside');
  panel.className = 'demo-panel';
  panel.innerHTML = `
    <p class="demo-eyebrow">BOOCALC · KIROWEEN 2026</p>
    <div class="demo-story" aria-live="polite">
      <h2 id="demo-title">A little ghost behind every number.</h2>
      <p id="demo-caption">A real calculator in a friendly kawaii cemetery.</p>
    </div>
    <a class="demo-source" href="https://github.com/Dxlxrxfx/boocalc" target="_blank" rel="noopener">github.com/Dxlxrxfx/boocalc</a>
    <div class="demo-toolbar">
      <button id="demo-preview" type="button">Ver presentación</button>
      <button id="demo-record" type="button">Grabar video con sonido</button>
      <button id="demo-stop" type="button" hidden>Detener</button>
      <a id="demo-download" class="demo-download" hidden>Descargar video</a>
    </div>
    <p id="demo-status" role="status">Presentación automática de ${Math.ceil(getDemoDurationMs() / 1000)} segundos, con textos en inglés.</p>
    <p class="demo-instructions">Al grabar, selecciona esta pestaña de BooCalc. Mantén la pestaña visible hasta terminar. Se guarda un video en tu equipo con el sonido de la calculadora.</p>
    <p id="demo-results" hidden></p>
    <video id="demo-playback" controls playsinline hidden aria-label="Video grabado de BooCalc"></video>
  `;
  document.body.append(panel);
  const title = document.getElementById('demo-title');
  const caption = document.getElementById('demo-caption');
  const status = document.getElementById('demo-status');
  const results = document.getElementById('demo-results');
  const previewButton = document.getElementById('demo-preview');
  const recordButton = document.getElementById('demo-record');
  const stopButton = document.getElementById('demo-stop');
  const download = document.getElementById('demo-download');
  const playback = document.getElementById('demo-playback');
  let generation = 0, running = false, recorder = null, screen = null;
  let completed = false, savedPreferences = null, outputUrl = null;
  let chunks = [], outputMime = '', recordError = false;
  const observed = [];
  const pressed = id => document.getElementById('ctrl-' + id).getAttribute('aria-pressed') === 'true';
  const setControl = (id, value) => { if (pressed(id) !== value) document.getElementById('ctrl-' + id).click(); };
  const stopTracks = () => {
    screen?.getTracks().forEach(track => { track.onended = null; track.stop(); });
    screen = null;
    stopBooCapture();
  };
  const restorePreferences = () => {
    if (!savedPreferences) return;
    for (const [id, value] of Object.entries(savedPreferences)) setControl(id, value);
    savedPreferences = null;
  };
  const busy = value => {
    previewButton.disabled = value;
    recordButton.disabled = value;
    stopButton.hidden = !value;
    document.body.classList.toggle('demo-running', value);
  };
  function wait(ms, token) {
    return new Promise(resolve => setTimeout(resolve, ms)).then(() => {
      if (token !== generation) throw new DOMException('Presentation stopped', 'AbortError');
    });
  }
  function finish(message, success = false) {
    generation++;
    running = false;
    completed = success;
    status.textContent = message;
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop();
    } else {
      stopTracks(); restorePreferences(); busy(false);
    }
  }
  function saveRecording() {
    const failed = recordError;
    recorder = null;
    stopTracks();
    restorePreferences();
    busy(false);
    if (failed || !chunks.length) {
      status.textContent = 'No se pudo guardar una grabación válida. Puedes volver a intentarlo.';
      return;
    }
    const blob = new Blob(chunks, { type: outputMime });
    chunks = [];
    if (outputUrl) URL.revokeObjectURL(outputUrl);
    outputUrl = URL.createObjectURL(blob);
    const extension = outputMime.includes('mp4') ? 'mp4' : 'webm';
    download.href = outputUrl;
    download.download = (completed ? 'BooCalc_Kiroween_Fluid_Demo' : 'BooCalc_Grabacion_Parcial') + '.' + extension;
    download.hidden = false;
    playback.src = outputUrl;
    playback.hidden = false;
    if (completed) {
      title.textContent = 'Your little cemetery is ready.';
      caption.textContent = 'A real screen recording, with live musical boos and English captions.';
      status.textContent = 'Grabación completa. Descarga el video para revisarlo o subirlo a YouTube.';
      download.click();
    } else {
      status.textContent = 'Grabación interrumpida. Puedes descargar el fragmento o repetir la presentación.';
    }
  }
  function prepare() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      throw new Error('La preferencia del sistema reduce las animaciones. Desactívala para grabar las reacciones completas.');
    }
    savedPreferences = { lang: pressed('lang'), sound: pressed('sound'), motion: pressed('motion') };
    setControl('lang', true); setControl('sound', true); setControl('motion', true);
    results.hidden = true;
    observed.length = 0;
    completed = false;
    recordError = false;
    playback.pause(); playback.hidden = true; download.hidden = true;
    return getBooCaptureStream(); // Resumes Web Audio in the real start-button gesture.
  }
  async function present(token) {
    running = true;
    for (const scene of DEMO_SCRIPT) {
      title.textContent = scene.title;
      caption.textContent = scene.caption;
      for (const action of scene.actions) {
        if (token !== generation) throw new DOMException('Presentation stopped', 'AbortError');
        if (action.key) {
          const button = document.querySelector(`[data-key="${action.key}"]`);
          button.classList.add('demo-hit');
          button.click();
          setTimeout(() => button.classList.remove('demo-hit'), 300);
        } else if (action.control) setControl(action.control, action.value);
        await wait(action.wait, token);
      }
      if (scene.expect !== undefined) {
        const actual = document.getElementById('display-value').textContent.trim().replace(/−/g, '-');
        if (actual !== scene.expect) throw new Error('La demostración se detuvo porque un resultado no coincidió.');
        observed.push(actual);
      }
    }
    results.textContent = 'Resultados comprobados en la app: ' + observed.join(' · ');
    results.hidden = false;
  }
  async function start(record) {
    if (previewButton.disabled) return;
    busy(true);
    const token = ++generation;
    try {
      if (record && (!navigator.mediaDevices?.getDisplayMedia || !window.MediaRecorder)) {
        throw new Error('Usa Chrome o Edge de escritorio para grabar desde esta página. También puedes ver la presentación y usar tu grabador habitual.');
      }
      const audio = prepare();
      if (record) {
        status.textContent = 'Selecciona esta pestaña de BooCalc en el cuadro del navegador.';
        screen = await navigator.mediaDevices.getDisplayMedia({
          video: { displaySurface: 'browser', frameRate: { ideal: 30, max: 30 } },
          audio: false, preferCurrentTab: true, selfBrowserSurface: 'include',
          monitorTypeSurfaces: 'exclude', systemAudio: 'exclude', surfaceSwitching: 'exclude',
        });
        if (token !== generation) { stopTracks(); return; }
        const videoTrack = screen.getVideoTracks()[0];
        if (videoTrack.getSettings().displaySurface && videoTrack.getSettings().displaySurface !== 'browser') {
          throw new Error('Selecciona la pestaña de BooCalc para grabar únicamente la aplicación.');
        }
        const candidates = ['video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4'];
        outputMime = candidates.find(mime => MediaRecorder.isTypeSupported(mime));
        if (!outputMime) throw new Error('Este navegador no ofrece un formato de grabación compatible.');
        const recording = new MediaStream([...screen.getVideoTracks(), ...audio.getAudioTracks()]);
        recorder = new MediaRecorder(recording, { mimeType: outputMime, videoBitsPerSecond: 4000000, audioBitsPerSecond: 128000 });
        chunks = [];
        recorder.ondataavailable = event => { if (event.data.size) chunks.push(event.data); };
        recorder.onstop = saveRecording;
        recorder.onerror = () => { recordError = true; finish('La grabación se interrumpió por un error.'); };
        videoTrack.onended = () => finish('La captura de pantalla se detuvo.');
      }
      for (const count of [3, 2, 1]) { status.textContent = `La presentación comienza en ${count}…`; await wait(1000, token); }
      status.textContent = record ? 'Grabando la presentación y los sonidos de BooCalc…' : 'Reproduciendo la presentación…';
      recorder?.start(1000);
      await present(token);
      finish(record ? 'Finalizando el video…' : 'Presentación completa. Lista para grabar.', true);
    } catch (error) {
      if (token !== generation) return;
      const message = error.name === 'NotAllowedError' ? 'La captura no se autorizó. Puedes volver a elegir la pestaña de BooCalc.' : error.message;
      finish(message || 'No se pudo iniciar la presentación.');
    }
  }
  previewButton.addEventListener('click', () => start(false));
  recordButton.addEventListener('click', () => start(true));
  stopButton.addEventListener('click', () => finish('Presentación detenida.'));
  document.addEventListener('keydown', event => {
    if (!running || !event.isTrusted) return;
    if (event.key === 'Escape') { event.preventDefault(); event.stopImmediatePropagation(); finish('Presentación detenida.'); }
    else if (/^[0-9+*/%=.,-]$/.test(event.key) || ['Enter','Backspace'].includes(event.key)) { event.preventDefault(); event.stopImmediatePropagation(); }
  }, true);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && running && recorder?.state === 'recording') finish('La pestaña dejó de estar visible. Repite la grabación manteniendo BooCalc al frente.');
  });
  window.addEventListener('pagehide', () => { stopTracks(); if (outputUrl) URL.revokeObjectURL(outputUrl); });
}
