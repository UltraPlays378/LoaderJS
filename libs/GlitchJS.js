// ===============================
//        GlitchJS Library
// ===============================

/**
 * GlitchJS - lightweight utility library
 * UMD compatible: works in Browser, Node (CJS), AMD, and ESM consumers.
 */
const GlitchJS = (() => {
  "use strict";
// -----------------------------
// ERROR CODES
// -----------------------------
function GJSError(code, message) {
  const id = String(code).padStart(3, "0");
  const err = new Error(`GJS-${id}: ${message}`);
  err.code = `GJS-${id}`;
  return err;
}
// ----------------------------
// ACKNOWLEDGE GLITCHJS EXISTENCE
// ----------------------------
function isExist() {
  console.log("GlitchJS is existing.");
}
// -----------------------------
// ERROR LOGGING
// -----------------------------
let GJS_DEBUG = true; // off by default

function GJSLogError(err, context = "") {
  if (!GJS_DEBUG) return;

  const time = new Date().toISOString();
  const ctx = context ? ` [${context}]` : "";

  console.error(
    `%c[GlitchJS ERROR]${ctx} ${time}\n` +
    `Code: ${err.code}\n` +
    `Message: ${err.message}\n` +
    `Stack:\n${err.stack}`,
    "color:#ff4d4d;font-weight:bold;"
  );
}

function GJSSetDebugMode(on = true) {
  GJS_DEBUG = Boolean(on);
}


  // -----------------------------
  // Environment checks
  // -----------------------------
  function isNode() {
    return (
      typeof process !== "undefined" &&
      typeof process.versions === "object" &&
      typeof process.versions.node === "string"
    );
  }

  function isBrowser() {
    return typeof window !== "undefined" && typeof document !== "undefined";
  }

function isTouchDevice() {
  if (!isBrowser()) return false;

  try {
    const ua = navigator.userAgent || "";
    const maxPoints = navigator.maxTouchPoints || navigator.msMaxTouchPoints || 0;

    // Detect OS
    const isWindows = /Windows/i.test(ua);
    const isAndroid = /Android/i.test(ua);
    const isIOS = /iPhone|iPad|iPod/i.test(ua);
    const isMac = /Mac OS X/i.test(ua);
    const isLinux = /Linux/i.test(ua) && !isAndroid; // Android also reports Linux

    // --- Mobile OS: always touch ---
    if (isAndroid || isIOS) return true;

    // --- macOS: never touch ---
    if (isMac) return false;

    // --- Windows: touchscreens exist, but trackpads lie ---
    if (isWindows) {
      // Real touchscreens usually report 5–10 points
      if (maxPoints >= 5) return true;
      return false;
    }

    // --- Linux: treat like Windows but stricter ---
    if (isLinux) {
      if (maxPoints >= 5) return true;
      return false;
    }

    // Fallback
    return ("ontouchstart" in window) || maxPoints >= 5;
  } catch {
    return false;
  }
}

function isMobile() {
  if (!isBrowser()) return false;

  try {
    const ua = navigator.userAgent || "";

    const isAndroid = /Android/i.test(ua);
    const isIOS = /iPhone|iPad|iPod/i.test(ua);

    // Mobile OS = always mobile
    if (isAndroid || isIOS) return true;

    // Everything else = not mobile
    return false;
  } catch {
    return false;
  }
}

  // -----------------------------
  // Basic utilities
  // -----------------------------
  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function randItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function clamp(num, min, max) {
    return Math.min(Math.max(num, min), max);
  }

  function map(num, inMin, inMax, outMin, outMax) {
    return ((num - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  // -----------------------------
  // DOM helpers (browser-only)
  // -----------------------------
  /**
   * Create an element with attributes, properties, and children.
   * attrs: keys starting with "on" and functions are attached as event handlers.
   */
function create(tag, attrs = {}, children = []) {
if (!isBrowser()) {
  const err = GJSError(1, "create() is only available in browsers.");
  GJSLogError(err, "create()");
  throw err;
}
  const el = document.createElement(tag);

  for (const [k, v] of Object.entries(attrs)) {
    if (k.startsWith("on") && typeof v === "function") {
      // event handler: onclick, oninput, etc.
      el[k] = v;
    } else if (k === "style" && v && typeof v === "object") {
      // style object: { color: "red", fontSize: "16px" }
      Object.assign(el.style, v);
    } else if (k === "dataset" && v && typeof v === "object") {
      // dataset object: { id: "foo", role: "bar" } -> data-id, data-role
      Object.assign(el.dataset, v);
    } else if (k in el && typeof v !== "object") {
      // prefer setting DOM property when available (value, checked, className, etc.)
      try {
        el[k] = v;
      } catch {
        el.setAttribute(k, String(v));
      }
    } else {
      el.setAttribute(k, String(v));
    }
  }

  children.forEach((c) =>
    el.appendChild(typeof c === "string" ? document.createTextNode(c) : c)
  );
  return el;
}
  function $(selector) {
    if (!isBrowser()) return null;
    return document.querySelector(selector);
  }

  function $all(selector) {
    if (!isBrowser()) return [];
    return Array.from(document.querySelectorAll(selector));
  }

  // -----------------------------
  // Timing helpers
  // -----------------------------
  function debounce(fn, delay = 200) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  }

  function throttle(fn, limit = 200) {
    let waiting = false;
    return (...args) => {
      if (!waiting) {
        fn(...args);
        waiting = true;
        setTimeout(() => (waiting = false), limit);
      }
    };
  }

  function wait(ms) {
    return new Promise((res) => setTimeout(res, ms));
  }

  // -----------------------------
  // Time & audio helpers
  // -----------------------------
  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${s}`;
  }

  function loadAudio(src) {
    if (!isBrowser()) {
      throw new Error("loadAudio() is only available in browsers.");
    }
    const audio = new Audio(src);
    audio.preload = "auto";
    return audio;
  }

  // -----------------------------
  // UUID with fallback
  // -----------------------------
  function uuid() {
    try {
      if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
      }
    } catch {
      // ignore and fallback
    }
    // RFC4122 v4-like fallback
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  // -----------------------------
  // Redirect helpers (safe)
  // -----------------------------
  function redirect(link) {
    if (!isBrowser()) {
      throw new Error("redirect() is only available in browsers.");
    }
    try {
      // Resolve relative URLs against current location
      const url = new URL(link, window.location.href);
      // Allow only http(s) protocols for safety
      if (url.protocol === "http:" || url.protocol === "https:") {
        window.location.href = url.toString();
      } else {
        console.warn("GlitchJS.redirect blocked unsafe protocol:", url.protocol);
      }
    } catch (e) {
      console.warn("GlitchJS.redirect: invalid URL:", link);
    }
  }

  async function redirectDelay(ms, link) {
    await wait(ms);
    redirect(link);
  }

  function redirectIf(condition, link) {
    const ok = typeof condition === "function" ? Boolean(condition()) : Boolean(condition);
    if (ok) redirect(link);
  }

  // -----------------------------
  // Device info & capabilities
  // -----------------------------
  function deviceInfo() {
    const node = isNode();
    const browser = isBrowser();

    let os = "Unknown";
    if (node) {
      os = process.platform || "Unknown";
    } else if (browser) {
      const ua = navigator.userAgent || "";
      if (/Windows/i.test(ua)) os = "Windows";
      else if (/Mac OS X/i.test(ua)) os = "macOS";
      else if (/Linux/i.test(ua)) os = "Linux";
      else if (/Android/i.test(ua)) os = "Android";
      else if (/iPhone|iPad|iPod/i.test(ua)) os = "iOS";
    }

    return {
      environment: node ? "Node.js" : browser ? "Browser" : "Unknown",
      os,
      mobile: isMobile(),
      touch: isTouchDevice(),
      userAgent: browser ? navigator.userAgent : null,
    };
  }

  function capabilities() {
    const browser = isBrowser();
    // Node-safe nodeFS detection
    let nodeFS = false;
    let nodeVersion = null;
    if (isNode()) {
      try {
        // require may be blocked by bundlers; wrap in try/catch
        // eslint-disable-next-line global-require
        nodeFS = !!require("fs");
      } catch {
        nodeFS = false;
      }
      nodeVersion = process.versions && process.versions.node ? process.versions.node : null;
    }

    // Browser capability checks with cleanup
    let audioCap = false;
    let videoCap = false;
    let webglCap = false;
    try {
      if (browser) {
        const a = document.createElement("audio");
        audioCap = typeof a.canPlayType === "function";
        const v = document.createElement("video");
        videoCap = typeof v.canPlayType === "function";
        const canvas = document.createElement("canvas");
        webglCap = !!(canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
        // allow GC
      }
    } catch {
      audioCap = videoCap = webglCap = false;
    }

    const localStorageCap = browser
      ? (() => {
          try {
            localStorage.setItem("_glitchjs_test", "1");
            localStorage.removeItem("_glitchjs_test");
            return true;
          } catch {
            return false;
          }
        })()
      : false;

    const cookiesCap = browser ? Boolean(navigator.cookieEnabled) : false;
    const onlineCap = browser ? Boolean(navigator.onLine) : false;
    const hardwareConcurrency = browser ? navigator.hardwareConcurrency || null : null;
    const clipboardCap = browser ? !!(navigator.clipboard && typeof navigator.clipboard.readText === "function") : false;

    return {
      audio: audioCap,
      video: videoCap,
      localStorage: localStorageCap,
      cookies: cookiesCap,
      online: onlineCap,
      hardwareConcurrency,
      webgl: webglCap,
      clipboard: clipboardCap,
      nodeFS,
      nodeVersion,
    };
  }
async function permissions(name, mode = "for-this-time") {
  if (!isBrowser()) {
    const err = GJSError(1, "permissions() is only available in browsers.");
    GJSLogError(err, "permissions()");
    throw err;
  }

  // Validate permission name
  const valid = ["geolocation","notifications","camera","microphone","clipboard-read"];
  if (!valid.includes(name)) {
    const err = GJSError(2, `Invalid permission name: ${name}`);
    GJSLogError(err, "permissions()");
    throw err;
  }

  const key = `_glitchjs_perm_${name}`;
  // Handle "never"
  if (mode === "never") {
    localStorage.setItem(key, "never");
    return { state: "denied" };
  }

  // Handle saved "never"
  const saved = localStorage.getItem(key);
  if (saved === "never") {
    return { state: "denied" };
  }

  // Handle saved "always"
  if (saved === "always") {
    return await requestPermission(name);
  }

  // Handle "always" (new)
  if (mode === "always") {
    localStorage.setItem(key, "always");
    return await requestPermission(name);
  }

  // Default: "for-this-time"
  return await requestPermission(name);
}
// localhost checker
function isLocalhost() {
  if (!isBrowser()) return false;

  const host = window.location.hostname;

  return (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "::1" ||
    // 127.0.0.0/8 block (127.x.x.x)
    /^127\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.test(host)
  );
}
// Internal helper
async function requestPermission(name) {
  try {
    switch (name) {
      case "geolocation":
        return await new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            () => resolve({ state: "granted" }),
            () => resolve({ state: "denied" })
          );
        });

      case "notifications":
        if (!("Notification" in window)) return { state: "denied" };
        const n = await Notification.requestPermission();
        return { state: n };

      case "camera":
      case "microphone":
        try {
          await navigator.mediaDevices.getUserMedia({
            video: name === "camera",
            audio: name === "microphone"
          });
          return { state: "granted" };
        } catch {
          return { state: "denied" };
        }

      case "clipboard-read":
        try {
          await navigator.clipboard.readText();
          return { state: "granted" };
        } catch {
          return { state: "denied" };
        }

      default:
        return { state: "denied" };
    }
  } catch {
    return { state: "denied" };
  }
}
// online status
const isOnline = typeof navigator !== "undefined" ? navigator.onLine : false;
window.addEventListener("online", () => {
  GlitchJS.isOnline = true;
});

window.addEventListener("offline", () => {
  GlitchJS.isOnline = false;
});
  // -----------------------------
  // Expose API
  // -----------------------------
  return {
    // utilities
    isOnline,
    randInt,
    randItem,
    shuffle,
    clamp,
    map,
    lerp,
    debug: GJSSetDebugMode,
    // DOM
    create,
    $,
    $all,
    // timing
    debounce,
    throttle,
    wait,
    // media/time
    formatTime,
    loadAudio,
    // ids
    uuid,
    // redirects
    redirect,
    redirectDelay,
    redirectIf,
    // environment
    isNode,
    isBrowser,
    isMobile,
    isTouchDevice,
    deviceInfo,
    capabilities,
    isLocalhost,
    // permissions
    permissions,
  };
})();

// UMD / CommonJS / AMD / Browser global export
(function (root, factory) {
  if (typeof define === "function" && define.amd) {
    // AMD
    define([], function () {
      return factory();
    });
  } else if (typeof module === "object" && module.exports) {
    // CommonJS
    module.exports = factory();
  } else {
    // Browser global
    root.GlitchJS = factory();
  }
})(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : this, function () {
  return GlitchJS;
});

