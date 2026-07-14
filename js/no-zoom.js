/* ==========================================================================
   NO-ZOOM — JavaScript Zoom Prevention
   Intercepts and blocks all user-initiated zoom methods that can be
   controlled via JavaScript. Covers keyboard shortcuts, mouse wheel,
   touch gestures, and gesture events.

   BROWSER LIMITATIONS (cannot be bypassed):
   - Browser menu zoom (View > Zoom In/Out) — controlled by the browser UI,
     not accessible to web pages.
   - Browser address bar zoom controls — same as above.
   - OS-level accessibility zoom (e.g., Windows Magnifier, macOS Zoom,
     Android Magnification) — these operate at the OS compositor level.
   - Some browsers (especially Firefox) may ignore certain preventDefault()
     calls on wheel events for accessibility reasons.
   - Mobile Safari may partially override viewport meta tag zoom restrictions
     in newer iOS versions for accessibility compliance.
   ========================================================================== */

(function () {
  'use strict';

  // ─── 1. Prevent Ctrl/Cmd + Mouse Wheel Zoom ────────────────────
  // Intercepts the 'wheel' event when Ctrl (or Cmd on macOS) is held,
  // which triggers browser zoom. Uses passive: false to allow preventDefault.
  document.addEventListener('wheel', function (e) {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
    }
  }, { passive: false });


  // ─── 2. Prevent Keyboard Zoom Shortcuts ─────────────────────────
  // Blocks the following combinations on both Windows/Linux (Ctrl) and macOS (Cmd):
  //   Ctrl/Cmd + Plus  (+)      → Zoom In
  //   Ctrl/Cmd + Equal (=)      → Zoom In (non-numpad)
  //   Ctrl/Cmd + NumpadAdd      → Zoom In (numpad)
  //   Ctrl/Cmd + Minus (-)      → Zoom Out
  //   Ctrl/Cmd + NumpadSubtract → Zoom Out (numpad)
  //   Ctrl/Cmd + 0              → Reset Zoom
  //   Ctrl/Cmd + Numpad0        → Reset Zoom (numpad)
  var ZOOM_KEYS = [
    'Equal',          // + / = key (Zoom In)
    'Minus',          // - key (Zoom Out)
    'Digit0',         // 0 key (Reset Zoom)
    'NumpadAdd',      // Numpad + (Zoom In)
    'NumpadSubtract', // Numpad - (Zoom Out)
    'Numpad0'         // Numpad 0 (Reset Zoom)
  ];

  document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && ZOOM_KEYS.indexOf(e.code) !== -1) {
      e.preventDefault();
    }
  }, { passive: false });


  // ─── 3. Prevent Touch Pinch-to-Zoom ─────────────────────────────
  // Although CSS `touch-action: manipulation` handles most cases, this
  // provides an additional JavaScript layer for browsers that may not
  // fully respect the CSS property. Blocks multi-touch (2+ fingers)
  // on the document to prevent pinch gestures.
  document.addEventListener('touchstart', function (e) {
    if (e.touches.length > 1) {
      e.preventDefault();
    }
  }, { passive: false });

  // Also prevent the touchmove with multiple fingers (active pinch gesture)
  document.addEventListener('touchmove', function (e) {
    if (e.touches.length > 1) {
      e.preventDefault();
    }
  }, { passive: false });


  // ─── 4. Prevent Double-Tap Zoom on Touch Devices ────────────────
  // Some mobile browsers zoom on double-tap even with touch-action: manipulation.
  // This detects rapid successive taps (<300ms apart) and blocks the second tap.
  var lastTouchEnd = 0;

  document.addEventListener('touchend', function (e) {
    var now = Date.now();
    if (now - lastTouchEnd <= 300) {
      e.preventDefault();
    }
    lastTouchEnd = now;
  }, { passive: false });


  // ─── 5. Prevent Gesture Events (Safari / WebKit) ────────────────
  // Safari fires 'gesturestart', 'gesturechange', and 'gestureend' events
  // for pinch/rotate gestures. Blocking these prevents Safari-specific zoom.
  document.addEventListener('gesturestart', function (e) {
    e.preventDefault();
  }, { passive: false });

  document.addEventListener('gesturechange', function (e) {
    e.preventDefault();
  }, { passive: false });

  document.addEventListener('gestureend', function (e) {
    e.preventDefault();
  }, { passive: false });


  // ─── 6. Prevent Context Menu on Long Press (Optional Hardening) ─
  // On some mobile browsers, long-press can trigger context menus that
  // offer zoom options. This is an optional additional layer.
  // Uncomment the block below if you also want to disable right-click/
  // long-press context menu:
  //
  // document.addEventListener('contextmenu', function (e) {
  //   e.preventDefault();
  // }, { passive: false });

})();
