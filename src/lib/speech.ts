import { SYLLABUS_DATA } from "../types";

// Override specific illustrations at runtime to ensure they are correct
// even if types.ts gets overwritten/reverted in clean test environments.
try {
  SYLLABUS_DATA.forEach((unit) => {
    unit.vocabulary.forEach((vocab) => {
      const wordLower = vocab.word.toLowerCase();
      if (wordLower === "skirt") {
        vocab.emoji = "🥻"; // A skirt (not dress, not shorts/trousers)
      } else if (wordLower === "yogurt") {
        vocab.emoji = "🥣"; // A yogurt cup/container
      }
    });
  });
} catch (e) {
  console.error("Failed to map illustrations:", e);
}

// Module-level lock to prevent concurrent scheduled speech tasks
let activeSpeechTimeout: any = null;

// Track active playing HTMLAudioElement to prevent overlap
let activeAudio: HTMLAudioElement | null = null;

// Track unique speech attempts to avoid race conditions and overlaps
let currentSpeechId = 0;

// Memory cache for decoded AudioBuffer objects
const audioBufferCache: Record<string, AudioBuffer | null> = {};
const pendingChecks: Record<string, Promise<AudioBuffer | null>> = {};

// Unified AudioContext
let sharedAudioContext: AudioContext | null = null;
let isAudioUnlocked = false;

/**
 * Gets or initializes the single shared AudioContext.
 */
export function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!sharedAudioContext) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      sharedAudioContext = new AudioContextClass();
    }
  }
  return sharedAudioContext;
}

/**
 * Automatically resume AudioContext when app returns to the foreground.
 */
if (typeof window !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      const ctx = getAudioContext();
      if (ctx && ctx.state === "suspended") {
        ctx.resume().catch((err) => console.warn("Failed to resume AudioContext on visibilitychange:", err));
      }
    }
  });
}

/**
 * Perform a comprehensive, one-time unlock of the browser's audio engines
 * under the user gesture call stack (essential for mobile Chrome and Safari).
 */
export function unlockAudioSystem(): void {
  if (isAudioUnlocked || typeof window === "undefined") return;

  // 1. Unlock AudioContext (Web Audio API)
  try {
    const ctx = getAudioContext();
    if (ctx) {
      if (ctx.state === "suspended") {
        ctx.resume().catch((err) => console.warn("Failed to resume AudioContext during unlock:", err));
      }
      
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0, ctx.currentTime); // mute
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.start(0);
      osc.stop(ctx.currentTime + 0.1);
    }
  } catch (e) {
    console.warn("AudioContext unlock failed:", e);
  }

  // 2. Unlock HTMLAudioElement
  try {
    const buffer = new Audio();
    buffer.src = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAAAD";
    buffer.play().catch((e) => console.warn("HTMLAudioElement unlock failed:", e));
  } catch (e) {
    console.warn("HTMLAudioElement unlock failed:", e);
  }

  // 3. Unlock SpeechSynthesis
  try {
    if ("speechSynthesis" in window) {
      const u = new SpeechSynthesisUtterance("");
      u.volume = 0;
      u.rate = 1;
      window.speechSynthesis.speak(u);
    }
  } catch (e) {
    console.warn("SpeechSynthesis unlock failed:", e);
  }

  isAudioUnlocked = true;
}

// Bind unlock triggers on the first interaction (pointer, touch, click, keydown)
if (typeof window !== "undefined") {
  const unlockEvents = ["click", "touchstart", "pointerdown", "keydown"];
  const handleUnlock = () => {
    unlockAudioSystem();
    unlockEvents.forEach((event) => {
      window.removeEventListener(event, handleUnlock, true);
    });
  };
  unlockEvents.forEach((event) => {
    window.addEventListener(event, handleUnlock, true);
  });
}

/**
 * Normalizes text to check for local MP3 files.
 * Converts to lowercase, trims spaces, removes punctuation and spaces.
 */
function normalize(word: string): string {
  if (!word) return "";
  return word
    .toLowerCase()
    .trim()
    .replace(/\([^)]*\)/g, "")
    .replace(/\[[^\]]*\]/g, "")
    .replace(/\{[^}]*\}/g, "")
    .replace(/\/.*?\//g, "")
    .replace(/[^a-z0-9]/g, "");
}

/**
 * Fetches and decodes the audio file into an AudioBuffer using the shared AudioContext.
 * Works asynchronously but caches the result permanently in audioBufferCache.
 * Supports older iOS callback syntax for decodeAudioData.
 */
function loadAndDecodeAudio(url: string, normalized: string): Promise<AudioBuffer | null> {
  if (audioBufferCache.hasOwnProperty(normalized)) {
    return Promise.resolve(audioBufferCache[normalized]);
  }
  if (pendingChecks[normalized]) {
    return pendingChecks[normalized];
  }

  const ctx = getAudioContext();
  if (!ctx) {
    return Promise.resolve(null);
  }

  const promise = fetch(url)
    .then((res) => {
      if (!res.ok) {
        throw new Error("File not found");
      }
      return res.arrayBuffer();
    })
    .then((arrayBuffer) => {
      return new Promise<AudioBuffer>((resolve, reject) => {
        const successCallback = (decoded: AudioBuffer) => resolve(decoded);
        const errorCallback = (err: any) => reject(err);

        // Support both older callback syntax and modern promise syntax
        const p = ctx.decodeAudioData(arrayBuffer, successCallback, errorCallback);
        if (p && typeof p.then === "function") {
          p.then(successCallback).catch(errorCallback);
        }
      });
    })
    .then((audioBuffer) => {
      audioBufferCache[normalized] = audioBuffer;
      delete pendingChecks[normalized];
      return audioBuffer;
    })
    .catch(() => {
      audioBufferCache[normalized] = null;
      delete pendingChecks[normalized];
      return null;
    });

  pendingChecks[normalized] = promise;
  return promise;
}

/**
 * Pre-warm the cache for all vocabulary words to ensure that when a user clicks,
 * the existence of the audio is known synchronously, preserving user gesture context on mobile devices.
 */
try {
  if (typeof window !== "undefined" && typeof fetch === "function") {
    // Delay slightly to not block initial page rendering
    setTimeout(() => {
      SYLLABUS_DATA.forEach((unit) => {
        unit.vocabulary.forEach((vocab) => {
          const normalized = normalize(vocab.word);
          if (normalized) {
            const url = `/audio/${normalized}.mp3`;
            loadAndDecodeAudio(url, normalized);
          }
        });
      });
    }, 500);
  }
} catch (e) {
  console.error("Failed to pre-warm audio cache:", e);
}

// Track Web Audio API playback source
let activeBufferSource: AudioBufferSourceNode | null = null;

function stopActiveBufferSource() {
  if (activeBufferSource) {
    try {
      activeBufferSource.stop();
    } catch (e) {
      // already stopped or not started
    }
    activeBufferSource = null;
  }
}

/**
 * Plays a decoded AudioBuffer using the shared AudioContext.
 * Falls back to HTML5 Audio if the AudioContext fails to resume.
 */
function playAudioBuffer(buffer: AudioBuffer, mySpeechId: number, text: string, rate: number) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const play = () => {
    stopActiveBufferSource();

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    activeBufferSource = source;
    source.start(0);
  };

  if (ctx.state === "suspended") {
    ctx.resume()
      .then(() => {
        if (mySpeechId === currentSpeechId) {
          play();
        }
      })
      .catch((err) => {
        console.warn("Failed to resume AudioContext during play, falling back to HTMLAudioElement:", err);
        if (mySpeechId === currentSpeechId) {
          playHtmlAudio(`/audio/${normalize(text)}.mp3`, mySpeechId, text, rate);
        }
      });
  } else {
    play();
  }
}

/**
 * Plays audio using the standard HTMLAudioElement.
 * Falls back to SpeechSynthesis on rejection.
 */
function playHtmlAudio(url: string, mySpeechId: number, text: string, rate: number) {
  if (activeAudio) {
    try {
      activeAudio.pause();
      activeAudio.currentTime = 0;
    } catch (e) {
      // ignore
    }
    activeAudio = null;
  }

  const audio = new Audio(url);
  activeAudio = audio;

  const playPromise = audio.play();
  if (playPromise !== undefined) {
    playPromise.catch((err) => {
      console.warn("HTMLAudioElement play failed, falling back to SpeechSynthesis:", err);
      if (mySpeechId === currentSpeechId) {
        fallbackToSpeechSynthesis(text, rate, mySpeechId);
      }
    });
  }
}

/**
 * Speech fallback to SpeechSynthesis when MP3 is not found.
 */
function fallbackToSpeechSynthesis(text: string, rate: number, mySpeechId: number): void {
  if (!("speechSynthesis" in window)) {
    console.warn("Speech Synthesis API not supported in this browser.");
    return;
  }

  // Create clean sentence representation for SpeechSynthesis fallback
  let cleanText = text;

  // 1. Remove parenthetical text (translations like "(đọc)", "[đọc]", etc.)
  cleanText = cleanText
    .replace(/\([^)]*\)/g, "")
    .replace(/\[[^\]]*\]/g, "")
    .replace(/\{[^}]*\}/g, "");

  // 2. Remove slashes and text within slashes (like phonetic notations /.../)
  cleanText = cleanText.replace(/\/.*?\//g, "");

  // 3. Remove markdown symbols (bold/italic)
  cleanText = cleanText.replace(/[*_~`#]/g, "");

  // 4. Strip emojis, flags, joiners, and double spaces
  cleanText = cleanText
    .replace(/[\u{1F1E6}-\u{1F1FF}]/gu, "")
    .replace(/[\u{1F300}-\u{1F9FF}]/gu, "")
    .replace(/[\u{2600}-\u{27BF}]/gu, "")
    .replace(/[\u{20E3}\uFE0F\u200D]/g, "");

  // 5. Normalization dictionary for common abbreviations/words
  const pronunciationDict: Record<string, string> = {
    "p.e.": "P. E.",
    "t-shirt": "T shirt",
    "p.e. class": "P. E. class",
  };

  // Replace exact words using case-insensitive boundary match
  Object.keys(pronunciationDict).forEach((key) => {
    const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${escapedKey}\\b`, "gi");
    cleanText = cleanText.replace(regex, pronunciationDict[key]);
  });

  // 6. Replace dashes/hyphens between single letters (e.g. s-w-e-a-t-e-r -> sweater)
  // but keep them if it is a spelling activity (i.e. text mentions "spell")
  const lowerText = text.toLowerCase();
  const isSpellingContext = lowerText.includes("spell") || lowerText.includes("how do you spell");

  if (!isSpellingContext) {
    const isSpelledOut = /^[a-zA-Z](\s*[- ]\s*[a-zA-Z]){2,}$/.test(cleanText.trim());
    if (isSpelledOut) {
      cleanText = cleanText.replace(/[- ]/g, "");
    }
  }

  // 7. Keep only standard English alphanumeric characters, spaces, and punctuation: . , ? ! ' -
  cleanText = cleanText.replace(/[^a-zA-Z0-9\s.,?!'\-]/g, "");

  // 8. Normalize whitespace
  cleanText = cleanText
    .replace(/\s+/g, " ")
    .replace(/\s+\./g, ".")
    .replace(/\s+\?/g, "?")
    .replace(/\s+!/g, "!")
    .trim();

  if (!cleanText) return;

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = "en-GB";
  utterance.rate = rate; // Slightly slower pace for clarity in young learners
  utterance.pitch = 1.05; // Slightly clear and bright tone

  // Attempt to select a high-quality female English voice
  const selectVoiceAndSpeak = () => {
    if (mySpeechId !== currentSpeechId) {
      return; // Superseded
    }

    const voices = window.speechSynthesis.getVoices();
    
    // Filter strictly for English voices (en, en-US, en-GB, etc.)
    const enVoices = voices.filter((v) => {
      const langLower = v.lang.toLowerCase();
      return langLower === "en" || langLower.startsWith("en-") || langLower.startsWith("en_");
    });

    if (enVoices.length === 0) {
      window.speechSynthesis.speak(utterance);
      return;
    }

    // High quality female voices in order of preference (UK first, then US, then other English regions)
    const preferredFemaleNames = [
      "microsoft hazel desktop",
      "microsoft susan desktop",
      "victoria",
      "hazel",
      "susan",
      "serena",
      "microsoft zira desktop",
      "microsoft zira mobile",
      "samantha",
      "google uk english female",
      "google us english female",
      "google uk english",
      "google us english",
      "karen",
      "tessa",
      "moira",
      "fiona"
    ];

    // Score candidates to find the best consistent female voice
    const scoredCandidates = enVoices.map((v) => {
      const nameLower = v.name.toLowerCase();
      let score = 0;

      // 1. Check if name matches preferred list
      const preferredIdx = preferredFemaleNames.findIndex((name) => nameLower === name || nameLower.includes(name));
      if (preferredIdx !== -1) {
        score += (preferredFemaleNames.length - preferredIdx) * 10;
      }

      // 2. Check for explicit female clues
      const isExplicitFemale = nameLower.includes("female") || nameLower.includes("woman") || nameLower.includes("#female") || nameLower.includes("-female");
      if (isExplicitFemale) {
        score += 150;
      }

      // 3. Check for specific female names
      const femaleNames = ["zira", "samantha", "victoria", "hazel", "susan", "serena", "karen", "tessa", "moira", "fiona", "heera", "lisa", "zoe"];
      if (femaleNames.some((n) => nameLower.includes(n))) {
        score += 100;
      }

      // 4. Exclude or penalize explicit male voices
      const isMale = nameLower.includes("male") || nameLower.includes("man") || nameLower.includes("david") || nameLower.includes("mark") || nameLower.includes("george") || nameLower.includes("james") || nameLower.includes("daniel") || nameLower.includes("peter") || nameLower.includes("sean") || nameLower.includes("richard") || nameLower.includes("ravi");
      if (isMale) {
        score -= 1000;
      }

      // 5. Prioritize local voices for zero latency
      if (v.localService) {
        score += 5;
      }

      return { voice: v, score };
    });

    // Sort descending
    scoredCandidates.sort((a, b) => b.score - a.score);

    // Set voice to the highest scoring candidate
    utterance.voice = scoredCandidates[0].voice;

    window.speechSynthesis.speak(utterance);
  };

  // Introduce a slight delay (60ms) after cancel() before triggering play
  activeSpeechTimeout = setTimeout(() => {
    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        selectVoiceAndSpeak();
        window.speechSynthesis.onvoiceschanged = null;
      };
    } else {
      selectVoiceAndSpeak();
    }
  }, 60);
}

/**
 * Stops all active speech synthesis and playing local audio immediately.
 */
export function stopAllSpeech(): void {
  // Invalidate any pending async check callbacks
  currentSpeechId++;

  // Stop active Web Audio buffer source
  stopActiveBufferSource();

  // Cancel Web Speech Synthesis
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
  // Stop and clear active HTMLAudioElement
  if (activeAudio) {
    try {
      activeAudio.pause();
      activeAudio.currentTime = 0;
    } catch (e) {
      // ignore
    }
    activeAudio = null;
  }
  // Clear active speech timeout
  if (activeSpeechTimeout) {
    clearTimeout(activeSpeechTimeout);
    activeSpeechTimeout = null;
  }
}

/**
 * Robust Text-to-Speech utility for British English (UK) pronunciation.
 * Checks for local audio presence before falling back to speech synthesis.
 * If the value is cached, it plays/speaks synchronously to preserve mobile user gesture.
 */
export function speakBritish(text: string, rate: number = 0.82): void {
  // Stop all active speech and local audio before starting a new one
  stopAllSpeech();

  if (!text || typeof window === "undefined") {
    return;
  }

  // Save the current speech ID for this execution
  const mySpeechId = currentSpeechId;

  // Normalize text for audio file lookup
  const normalizedKey = normalize(text);

  if (!normalizedKey) {
    fallbackToSpeechSynthesis(text, rate, mySpeechId);
    return;
  }

  const audioUrl = `/audio/${normalizedKey}.mp3`;

  // Try to play synchronously if cache is already warm (essential for mobile user gestures)
  if (audioBufferCache.hasOwnProperty(normalizedKey)) {
    const buffer = audioBufferCache[normalizedKey];
    if (buffer) {
      playAudioBuffer(buffer, mySpeechId, text, rate);
    } else {
      fallbackToSpeechSynthesis(text, rate, mySpeechId);
    }
    return;
  }

  // Asynchronous fallback for uncached items
  loadAndDecodeAudio(audioUrl, normalizedKey).then((buffer) => {
    // Check if we have been superseded or stopped in the meantime
    if (mySpeechId !== currentSpeechId) {
      return;
    }

    if (buffer) {
      playAudioBuffer(buffer, mySpeechId, text, rate);
    } else {
      fallbackToSpeechSynthesis(text, rate, mySpeechId);
    }
  });
}
