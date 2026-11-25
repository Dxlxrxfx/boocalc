# Continuous BooCalc presentation

Open the deployed `/demo.html` page. The normal `/` calculator is unchanged.
`npm run build` also produces a standalone `dist/demo.html`.

- **Ver presentación** runs the actual calculator with English captions.
- **Grabar video con sonido** asks the browser to select the BooCalc tab, then
  runs the same presentation and records the real screen at a requested 30 fps.
- Keep the BooCalc tab visible until it finishes, approximately 95 seconds.
- Use **Descargar video** to save and review the resulting WebM (or MP4 if the
  browser selects that supported format). YouTube accepts the resulting video.

The browser must grant screen capture for each recording. The page never requests
a microphone. Live audio is branched from the same sound gains used by the app,
so the recording contains the real musical boos, without microphone/system noise.
No recording is uploaded by the page. Closing or stopping the capture releases
the capture tracks. Interrupted captures are labeled as partial recordings.

All key actions use the application's normal UI handlers and arithmetic engine.
The presentation checks displayed answers rather than supplying result text.
Both motion and sound preferences, and the original language, are restored after
the presentation. The preview honors the system's reduced-motion setting.

This feature prepares and records a demo. It does not itself submit the project
to Devpost or publish any video to YouTube. A completed recording must be checked
before submission. The older screenshot-based MP4 remains a separate draft.
