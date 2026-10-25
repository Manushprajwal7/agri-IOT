/**

 * AgriSense & AgriMarket AI — Handsfree Multilingual Voice Controller & Site Navigator

 * Powered by Sarvam AI:

 * - STT: saaras:v3 (Multilingual Indic Speech-to-Text)

 * - TTS: bulbul:v3 (Natural Indic Neural Voice Synthesis - kavya)

 * - NMT: mayura:v1 (Indic Neural Machine Translation)

 * 

 * Supports Handsfree Voice Navigation across all 10 views in Hindi (हिन्दी),

 * Kannada (ಕನ್ನಡ), English (India), Tamil (தமிழ்), and Telugu (తెలుగు).

 */



// -------------------------------------------------------------

// CENTRALIZED SINGLE AUDIO PLAYER (Zero Voice Overlap)

// -------------------------------------------------------------

window.AgriVoicePlayer = window.AgriVoicePlayer || {

  activeAudio: null,

  activeUtterance: null,

  currentPlayId: 0,

  abortController: null,

  isSpeaking: false,



  stop() {

    this.isSpeaking = false;

    this.currentPlayId++;

    if (this.abortController) {

      try { this.abortController.abort(); } catch (e) {}

      this.abortController = null;

    }

    if (this.activeAudio) {

      try {

        this.activeAudio.pause();

        this.activeAudio.currentTime = 0;

        this.activeAudio.src = '';

      } catch (e) {}

      this.activeAudio = null;

    }

    if ('speechSynthesis' in window) {

      try {

        window.speechSynthesis.cancel();

      } catch (e) {}

    }

    this.activeUtterance = null;

  },



  async speak(text, langCode) {

    this.stop();

    const cleanText = (text || '').replace(/[*#`_]/g, '').trim();

    if (!cleanText) return;



    this.isSpeaking = true;

    const playId = this.currentPlayId;

    const targetLang = langCode || 'hi-IN';



    this.abortController = new AbortController();



    // 1. Try Sarvam AI bulbul:v3 via backend TTS

    try {

      const res = await fetch('/api/voice/tts', {

        method: 'POST',

        headers: { 'Content-Type': 'application/json' },

        signal: this.abortController.signal,

        body: JSON.stringify({

          text: cleanText,

          language_code: targetLang

        })

      });

      const data = await res.json();



      // Ensure no newer speech call took over while fetching

      if (this.currentPlayId !== playId) {

        return;

      }



      if (data && data.success && data.audio_base64) {

        if (this.activeAudio) {

          try { this.activeAudio.pause(); } catch (e) {}

        }

        const audio = new Audio(`data:audio/${data.format || 'wav'};base64,${data.audio_base64}`);

        this.activeAudio = audio;

        audio.onended = () => {

          if (this.currentPlayId === playId) {

            this.isSpeaking = false;

            this.activeAudio = null;

          }

        };

        audio.onerror = () => {

          if (this.currentPlayId === playId) {

            this.isSpeaking = false;

            this.activeAudio = null;

          }

        };

        await audio.play();

        return;

      }

    } catch (e) {

      if (this.currentPlayId !== playId) return;

      console.warn('[AgriVoicePlayer] Backend TTS notice, using Web Speech fallback:', e.message);

    }



    if (this.currentPlayId !== playId) return;



    // 2. Fallback: Browser Web Speech API

    if ('speechSynthesis' in window) {

      try {

        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(cleanText);

        utterance.lang = targetLang;

        utterance.rate = 1.0;

        utterance.onend = () => {

          if (this.currentPlayId === playId) {

            this.isSpeaking = false;

            this.activeUtterance = null;

          }

        };

        utterance.onerror = () => {

          if (this.currentPlayId === playId) {

            this.isSpeaking = false;

            this.activeUtterance = null;

          }

        };

        this.activeUtterance = utterance;

        window.speechSynthesis.speak(utterance);

      } catch (err) {

        this.isSpeaking = false;

      }

    } else {

      this.isSpeaking = false;

    }

  }

};



class AgriVoiceNavigator {

  constructor() {

    this.currentLanguage = localStorage.getItem('agri_voice_lang') || 'hi';

    this.isListening = false;

    this.handsfreeMode = false;

    this.recognition = null;

    this.mediaRecorder = null;

    this.mediaRecorderTimer = null;

    this.audioChunks = [];

    this.supportedLanguages = {

      hi: { code: 'hi-IN', name: 'हिन्दी', prompt: 'बोलें: मार्केटप्लेस खोलो, ऑर्डर दिखाओ, या मिट्टी की नमी कितनी है?...' },

      kn: { code: 'kn-IN', name: 'ಕನ್ನಡ', prompt: 'ಹೇಳಿ: ಮಾರುಕಟ್ಟೆಗೆ ಹೋಗಿ, ಆರ್ಡರ್ ತೋರಿಸಿ, ಅಥವಾ ಮಣ್ಣಿನ ತೇವಾಂಶ ಎಷ್ಟಿದೆ?...' },

      en: { code: 'en-IN', name: 'English', prompt: 'Say: Go to Marketplace, Show Orders, or What is soil moisture?...' },

      ta: { code: 'ta-IN', name: 'தமிழ்', prompt: 'சந்தைக்குச் செல்லுங்கள் அல்லது மண் ஈரப்பதத்தைக் கேளுங்கள்...' },

      te: { code: 'te-IN', name: 'తెలుగు', prompt: 'మార్కెట్‌కి వెళ్లండి లేదా నేಲ తేమను అడಗಂಡಿ...' }

    };



    this.init();

  }



  getLangCode() {

    return this.supportedLanguages[this.currentLanguage]?.code || 'hi-IN';

  }



  init() {

    this.injectStyles();

    this.renderOverlay();

    this.initSpeechRecognition();

    this.bindEvents();

  }



  injectStyles() {

    if (document.getElementById('voiceNavStyles')) return;

    const style = document.createElement('style');

    style.id = 'voiceNavStyles';

    style.textContent = `

      /* Sarvam AI Topbar Badge */

      .sarvam-header-badge {

        display: inline-flex;

        align-items: center;

        gap: 6px;

        background: rgba(16, 185, 129, 0.12);

        border: 1px solid rgba(16, 185, 129, 0.4);

        padding: 4px 10px;

        border-radius: 20px;

        font-size: 11px;

        font-weight: 700;

        color: #065f46;

        cursor: pointer;

        transition: all 0.2s ease;

      }

      .sarvam-header-badge:hover {

        background: rgba(16, 185, 129, 0.2);

        border-color: #10b981;

      }

      .sarvam-pulse-dot {

        width: 7px;

        height: 7px;

        border-radius: 50%;

        background: #10b981;

        box-shadow: 0 0 8px rgba(16, 185, 129, 0.8);

        animation: pulseRing 1.5s infinite;

      }

      @keyframes pulseRing {

        0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }

        70% { transform: scale(1.1); box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }

        100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }

      }



      /* Handsfree Voice Navigation Floating HUD */

      .handsfree-voice-overlay {

        position: fixed;

        bottom: 24px;

        left: 50%;

        transform: translateX(-50%) translateY(120px);

        width: 92%;

        max-width: 640px;

        background: rgba(15, 23, 42, 0.96);

        backdrop-filter: blur(14px);

        border: 1px solid rgba(16, 185, 129, 0.4);

        border-radius: 18px;

        box-shadow: 0 20px 45px rgba(0, 0, 0, 0.5), 0 0 25px rgba(16, 185, 129, 0.25);

        color: #ffffff;

        padding: 16px 20px;

        z-index: 10000;

        opacity: 0;

        pointer-events: none;

        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);

        font-family: 'Inter', system-ui, sans-serif;

      }

      .handsfree-voice-overlay.active {

        transform: translateX(-50%) translateY(0);

        opacity: 1;

        pointer-events: auto;

      }

      .voice-hud-header {

        display: flex;

        align-items: center;

        justify-content: space-between;

        margin-bottom: 12px;

        padding-bottom: 10px;

        border-bottom: 1px solid rgba(255, 255, 255, 0.1);

      }

      .voice-hud-title {

        display: flex;

        align-items: center;

        gap: 8px;

        font-size: 13px;

        font-weight: 700;

        color: #a7f3d0;

      }

      .voice-sarvam-tag {

        background: rgba(16, 185, 129, 0.25);

        color: #34d399;

        font-size: 10px;

        padding: 2px 7px;

        border-radius: 12px;

        font-weight: 800;

        letter-spacing: 0.5px;

      }

      .voice-hud-controls {

        display: flex;

        align-items: center;

        gap: 12px;

      }

      .btn-voice-close {

        background: none;

        border: none;

        color: #94a3b8;

        font-size: 18px;

        cursor: pointer;

        padding: 2px 6px;

        line-height: 1;

      }

      .btn-voice-close:hover {

        color: #ffffff;

      }



      /* Language Switcher Chips */

      .voice-lang-chips {

        display: flex;

        gap: 8px;

        margin-bottom: 12px;

        overflow-x: auto;

        padding-bottom: 4px;

      }

      .lang-chip {

        background: rgba(255, 255, 255, 0.08);

        border: 1px solid rgba(255, 255, 255, 0.15);

        color: #cbd5e1;

        font-size: 12px;

        padding: 5px 12px;

        border-radius: 14px;

        cursor: pointer;

        white-space: nowrap;

        font-weight: 600;

        transition: all 0.2s;

      }

      .lang-chip:hover {

        background: rgba(255, 255, 255, 0.16);

        color: #ffffff;

      }

      .lang-chip.active {

        background: #10b981;

        color: #ffffff;

        border-color: #10b981;

        box-shadow: 0 0 12px rgba(16, 185, 129, 0.6);

        font-weight: 700;

      }



      /* Live Visualizer & Transcript */

      .voice-live-row {

        display: flex;

        align-items: center;

        gap: 14px;

        background: rgba(0, 0, 0, 0.35);

        border-radius: 12px;

        padding: 12px 16px;

        border: 1px solid rgba(255, 255, 255, 0.08);

      }

      .voice-mic-indicator {

        width: 44px;

        height: 44px;

        border-radius: 50%;

        background: #10b981;

        display: flex;

        align-items: center;

        justify-content: center;

        color: #ffffff;

        cursor: pointer;

        flex-shrink: 0;

        box-shadow: 0 0 16px rgba(16, 185, 129, 0.5);

        transition: transform 0.2s;

      }

      .voice-mic-indicator.listening {

        background: #ef4444;

        box-shadow: 0 0 20px rgba(239, 68, 68, 0.7);

        animation: pulseMic 1.2s infinite;

      }

      @keyframes pulseMic {

        0% { transform: scale(1); }

        50% { transform: scale(1.08); }

        100% { transform: scale(1); }

      }

      .voice-transcript-box {

        flex: 1;

        min-width: 0;

      }

      .voice-transcript-text {

        font-size: 14px;

        font-weight: 600;

        color: #ffffff;

        margin: 0;

        white-space: nowrap;

        overflow: hidden;

        text-overflow: ellipsis;

      }

      .voice-status-sub {

        font-size: 11px;

        color: #94a3b8;

        margin-top: 3px;

        display: flex;

        align-items: center;

        gap: 6px;

      }

      .voice-equalizer-bars {

        display: flex;

        align-items: center;

        gap: 2px;

        height: 12px;

      }

      .voice-eq-bar {

        width: 3px;

        height: 4px;

        background: #10b981;

        border-radius: 2px;

        animation: eqPulse 0.8s infinite ease-in-out alternate;

      }

      .voice-eq-bar:nth-child(2) { animation-delay: 0.15s; }

      .voice-eq-bar:nth-child(3) { animation-delay: 0.3s; }

      .voice-eq-bar:nth-child(4) { animation-delay: 0.45s; }

      @keyframes eqPulse {

        0% { height: 4px; }

        100% { height: 14px; }

      }



      /* Quick Command Chips */

      .voice-quick-chips {

        display: flex;

        gap: 6px;

        margin-top: 10px;

        flex-wrap: wrap;

      }

      .voice-cmd-chip {

        background: rgba(255, 255, 255, 0.06);

        border: 1px dashed rgba(255, 255, 255, 0.2);

        color: #a7f3d0;

        font-size: 11px;

        padding: 4px 9px;

        border-radius: 8px;

        cursor: pointer;

        transition: all 0.2s;

      }

      .voice-cmd-chip:hover {

        background: rgba(16, 185, 129, 0.2);

        border-color: #10b981;

        color: #ffffff;

      }



      /* Response feedback box */

      .voice-feedback-card {

        margin-top: 10px;

        background: rgba(16, 185, 129, 0.15);

        border: 1px solid rgba(16, 185, 129, 0.3);

        border-radius: 10px;

        padding: 10px 14px;

        font-size: 13px;

        color: #d1fae5;

        display: none;

      }

    `;

    document.head.appendChild(style);

  }



  renderOverlay() {

    if (document.getElementById('handsfreeVoiceOverlay')) return;



    const overlay = document.createElement('div');

    overlay.id = 'handsfreeVoiceOverlay';

    overlay.className = 'handsfree-voice-overlay';



    overlay.innerHTML = `

      <div class="voice-hud-header">

        <div class="voice-hud-title">

          <span>🎙️ Handsfree Voice Navigation</span>

          <span class="voice-sarvam-tag">Sarvam AI + Indic TTS</span>

        </div>

        <div class="voice-hud-controls">

          <label style="display: flex; align-items: center; gap: 6px; font-size: 11px; color: #cbd5e1; cursor: pointer;">

            <input type="checkbox" id="chkAutoHandsfree" style="accent-color: #10b981;" />

            <span>Continuous Mode</span>

          </label>

          <button class="btn-voice-close" id="btnCloseVoiceHud" title="Close HUD">✕</button>

        </div>

      </div>



      <!-- Language selector chips -->

      <div class="voice-lang-chips" id="voiceLangChips">

        <button class="lang-chip ${this.currentLanguage === 'hi' ? 'active' : ''}" data-lang="hi">🇮🇳 हिन्दी (Hindi)</button>

        <button class="lang-chip ${this.currentLanguage === 'kn' ? 'active' : ''}" data-lang="kn">ಕನ್ನಡ (Kannada)</button>

        <button class="lang-chip ${this.currentLanguage === 'en' ? 'active' : ''}" data-lang="en">English (India)</button>

        <button class="lang-chip ${this.currentLanguage === 'ta' ? 'active' : ''}" data-lang="ta">தமிழ் (Tamil)</button>

        <button class="lang-chip ${this.currentLanguage === 'te' ? 'active' : ''}" data-lang="te">తెలుగు (Telugu)</button>

      </div>



      <!-- Live mic & transcript box -->

      <div class="voice-live-row">

        <div class="voice-mic-indicator" id="voiceHudMicBtn" title="Click to speak">

          <svg class="svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 20px; height: 20px;"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>

        </div>

        <div class="voice-transcript-box">

          <p class="voice-transcript-text" id="voiceTranscriptText">

            ${this.supportedLanguages[this.currentLanguage]?.prompt || 'Speak or click a suggestion below...'}

          </p>

          <div class="voice-status-sub" id="voiceStatusSub">

            <span id="voiceStatusLabel">Ready to listen</span>

            <div class="voice-equalizer-bars" id="voiceEqBars" style="display: none;">

              <span class="voice-eq-bar"></span>

              <span class="voice-eq-bar"></span>

              <span class="voice-eq-bar"></span>

              <span class="voice-eq-bar"></span>

            </div>

          </div>

        </div>

      </div>



      <!-- Spoken answer feedback card -->

      <div class="voice-feedback-card" id="voiceFeedbackCard"></div>



      <!-- Dynamic Quick Suggestion Chips -->

      <div class="voice-quick-chips" id="voiceQuickChips"></div>

    `;



    document.body.appendChild(overlay);

    this.renderQuickChips();

  }



  renderQuickChips() {

    const container = document.getElementById('voiceQuickChips');

    if (!container) return;



    const chipsByLang = {

      hi: [

        { text: 'मार्केटप्लेस खोलो', cmd: 'मार्केटप्लेस खोलो' },

        { text: 'ऑर्डर दिखाओ', cmd: 'ऑर्डर दिखाओ' },

        { text: 'मिट्टी की नमी कितनी है?', cmd: 'मिट्टी की नमी कितनी है' },

        { text: 'फसल रोग जांच', cmd: 'फसल की जानकारी' },

        { text: 'कॉल करो (CALL-E)', cmd: 'कॉल करो' },

        { text: 'डैशबोर्ड', cmd: 'डैशबोर्ड खोलो' }

      ],

      kn: [

        { text: 'ಮಾರುಕಟ್ಟೆಗೆ ಹೋಗಿ', cmd: 'ಮಾರುಕಟ್ಟೆಗೆ ಹೋಗಿ' },

        { text: 'ಆರ್ಡರ್ ತೋರಿಸಿ', cmd: 'ಆರ್ಡರ್ ತೋರಿಸಿ' },

        { text: 'ಮಣ್ಣಿನ ತೇವಾಂಶ ಎಷ್ಟಿದೆ?', cmd: 'ಮಣ್ಣಿನ ತೇವಾಂಶ ಎಷ್ಟಿದೆ' },

        { text: 'ಬೆಳೆ ಮಾಹಿತಿ', cmd: 'ಬೆಳೆ ಮಾಹಿತಿ' },

        { text: 'ಕಾಲ್ ಮಾಡಿ (CALL-E)', cmd: 'ಕಾಲ್ ಮಾಡಿ' },

        { text: 'ಮುಖಪುಟ', cmd: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್' }

      ],

      en: [

        { text: 'Go to Marketplace', cmd: 'Go to Marketplace' },

        { text: 'Show Orders', cmd: 'Show Orders' },

        { text: 'What is Soil Moisture?', cmd: 'Check soil moisture' },

        { text: 'Crop Intelligence', cmd: 'Show crop intelligence' },

        { text: 'Call Farmer via CALL-E', cmd: 'Call me' },

        { text: 'Main Dashboard', cmd: 'Go to Dashboard' }

      ],

      ta: [

        { text: 'சந்தை', cmd: 'சந்தைக்குச் செல்' },

        { text: 'ஆர்டர்கள்', cmd: 'ஆர்டர்கள்' },

        { text: 'மண் ஈரப்பதம்', cmd: 'மண் ஈரப்பதம்' }

      ],

      te: [

        { text: 'మార్కెట్', cmd: 'మార్కెట్‌కి వెళ్లండి' },

        { text: 'ఆర్డర్లు', cmd: 'ఆర్ಡర్లు' },

        { text: 'నేల తేమ', cmd: 'నేల తేమ' }

      ]

    };



    const chips = chipsByLang[this.currentLanguage] || chipsByLang.hi;

    container.innerHTML = chips.map(c => `

      <button class="voice-cmd-chip" data-cmd="${c.cmd}">💡 ${c.text}</button>

    `).join('');



    container.querySelectorAll('.voice-cmd-chip').forEach(btn => {

      btn.addEventListener('click', (e) => {

        const cmd = e.currentTarget.dataset.cmd;

        this.processVoiceCommand(cmd);

      });

    });

  }



  bindEvents() {

    // Language chips

    document.querySelectorAll('.lang-chip').forEach(btn => {

      btn.addEventListener('click', (e) => {

        const lang = e.currentTarget.dataset.lang;

        this.setLanguage(lang);

      });

    });



    // Close HUD

    const closeBtn = document.getElementById('btnCloseVoiceHud');

    if (closeBtn) {

      closeBtn.addEventListener('click', () => this.hideOverlay());

    }



    // Mic button inside HUD

    const micBtn = document.getElementById('voiceHudMicBtn');

    if (micBtn) {

      micBtn.addEventListener('click', () => this.toggleListening());

    }



    // Topbar Speak to AI buttons & Handsfree Buttons

    document.querySelectorAll('.btn-handsfree-voice, #btnHandsfreeVoice, #sarvamStatusPill').forEach(btn => {

      btn.addEventListener('click', (e) => {

        e.preventDefault();

        this.showOverlay();

        this.startListening();

      });

    });



    // Sync with global language selector

    const globalSelect = document.getElementById('globalLangSelect');

    if (globalSelect) {

      globalSelect.addEventListener('change', (e) => {

        this.setLanguage(e.target.value);

      });

    }



    // Continuous mode checkbox

    const chk = document.getElementById('chkAutoHandsfree');

    if (chk) {

      chk.addEventListener('change', (e) => {

        this.handsfreeMode = e.target.checked;

      });

    }



    // Keyboard shortcut: Press Shift + Space to toggle voice navigation anywhere!

    window.addEventListener('keydown', (e) => {

      if (e.shiftKey && e.code === 'Space') {

        e.preventDefault();

        this.showOverlay();

        this.toggleListening();

      }

    });

  }



  setLanguage(lang, announce = true) {

    if (!this.supportedLanguages[lang]) return;

    this.currentLanguage = lang;

    localStorage.setItem('agri_voice_lang', lang);



    document.querySelectorAll('.lang-chip').forEach(btn => {

      btn.classList.toggle('active', btn.dataset.lang === lang);

    });



    const promptText = document.getElementById('voiceTranscriptText');

    if (promptText && !this.isListening) {

      promptText.textContent = this.supportedLanguages[lang].prompt;

    }



    this.renderQuickChips();



    // Update Web Speech Recognition language

    if (this.recognition) {

      this.recognition.lang = this.getLangCode();

    }



    // Synchronize global language selector if present

    const globalSelect = document.getElementById('globalLangSelect');

    if (globalSelect && globalSelect.value !== lang) {

      globalSelect.value = lang;

      if (window.agriApp && window.agriApp.setLanguage) {

        window.agriApp.setLanguage(lang);

      }

    }



    // Synchronize AI Assistant

    if (window.aiAssistant && window.aiAssistant.setLanguage) {

      window.aiAssistant.setLanguage(lang);

    }



    if (announce && window.showAgriToast) {

      window.showAgriToast(`Voice language set to ${this.supportedLanguages[lang].name}`, 'info');

    }

  }



  showOverlay() {

    const overlay = document.getElementById('handsfreeVoiceOverlay');

    if (overlay) overlay.classList.add('active');

  }



  hideOverlay() {

    this.stopListening();

    const overlay = document.getElementById('handsfreeVoiceOverlay');

    if (overlay) overlay.classList.remove('active');

  }



  initSpeechRecognition() {

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {

      this.recognition = new SpeechRecognition();

      this.recognition.continuous = false;

      this.recognition.interimResults = true;

      this.recognition.lang = this.getLangCode();



      this.recognition.onstart = () => {

        this.isListening = true;

        this.updateListeningUi(true);

      };



      this.recognition.onresult = (event) => {

        let transcript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {

          transcript += event.results[i][0].transcript;

        }



        const transcriptEl = document.getElementById('voiceTranscriptText');

        if (transcriptEl) {

          transcriptEl.textContent = `"${transcript}"`;

        }



        if (event.results[0].isFinal) {

          this.processVoiceCommand(transcript);

        }

      };



      this.recognition.onerror = (event) => {

        console.warn('[Voice Nav] Recognition notice:', event.error);

        this.isListening = false;

        this.updateListeningUi(false);

      };



      this.recognition.onend = () => {

        this.isListening = false;

        this.updateListeningUi(false);

        if (this.handsfreeMode) {

          setTimeout(() => this.startListening(), 1500);

        }

      };

    }

  }



  toggleListening() {

    if (this.isListening) {

      this.stopListening();

    } else {

      this.startListening();

    }

  }



  async startListening() {

    // 1. Stop any playing audio before listening

    window.AgriVoicePlayer.stop();



    // 2. Stop AI Assistant modal mic so two mics never listen simultaneously!

    if (window.aiAssistant && window.aiAssistant.stopVoiceListen) {

      window.aiAssistant.stopVoiceListen();

    }



    this.isListening = true;

    this.updateListeningUi(true);



    const transcriptEl = document.getElementById('voiceTranscriptText');

    if (transcriptEl) {

      transcriptEl.textContent = `Listening in ${this.supportedLanguages[this.currentLanguage]?.name || 'Hindi'}... Speak naturally`;

    }



    // Prefer Web Speech Recognition for instant streaming & silence detection

    if (this.recognition) {

      try {

        this.recognition.lang = this.getLangCode();

        this.recognition.start();

        return;

      } catch (e) {

        console.warn('[Voice Nav] SpeechRecognition active/notice:', e.message);

      }

    }



    // Fallback: MediaRecorder if SpeechRecognition is unsupported

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {

      try {

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        this.mediaRecorder = new MediaRecorder(stream);

        this.audioChunks = [];



        this.mediaRecorder.ondataavailable = (e) => {

          if (e.data && e.data.size > 0) this.audioChunks.push(e.data);

        };



        this.mediaRecorder.onstop = async () => {

          stream.getTracks().forEach(t => t.stop());

          const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });

          await this.sendAudioToSarvam(audioBlob);

        };



        this.mediaRecorder.start();



        // Safety auto-stop after 4.5 seconds

        if (this.mediaRecorderTimer) clearTimeout(this.mediaRecorderTimer);

        this.mediaRecorderTimer = setTimeout(() => {

          if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {

            this.mediaRecorder.stop();

          }

        }, 4500);

        return;

      } catch (err) {

        console.warn('Microphone stream fallback error:', err.message);

      }

    }

  }



  stopListening() {

    this.isListening = false;

    this.updateListeningUi(false);

    if (this.mediaRecorderTimer) clearTimeout(this.mediaRecorderTimer);



    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {

      try { this.mediaRecorder.stop(); } catch (e) {}

    }

    if (this.recognition) {

      try { this.recognition.stop(); } catch (e) {}

    }

  }



  updateListeningUi(listening) {

    const mic = document.getElementById('voiceHudMicBtn');

    const eq = document.getElementById('voiceEqBars');

    const status = document.getElementById('voiceStatusLabel');



    if (mic) mic.classList.toggle('listening', listening);

    if (eq) eq.style.display = listening ? 'flex' : 'none';

    if (status) status.textContent = listening ? `Listening in ${this.supportedLanguages[this.currentLanguage]?.name} (${this.getLangCode()})...` : 'Ready to listen';

  }



  async sendAudioToSarvam(audioBlob) {

    const status = document.getElementById('voiceStatusLabel');

    if (status) status.textContent = 'Transcribing with Sarvam AI saaras:v3...';



    try {

      const formData = new FormData();

      formData.append('file', audioBlob, 'speech.wav');

      formData.append('language_code', this.getLangCode());



      const res = await fetch('/api/voice/stt', { method: 'POST', body: formData });

      const data = await res.json();

      if (data && data.transcript && data.transcript.trim()) {

        const transcriptEl = document.getElementById('voiceTranscriptText');

        if (transcriptEl) transcriptEl.textContent = `"${data.transcript.trim()}"`;

        this.processVoiceCommand(data.transcript.trim());

        return;

      }

    } catch (e) {

      console.warn('Sarvam STT failed:', e);

    }



    this.updateListeningUi(false);

  }



  /**

   * Intelligently detects whether text is Hindi, Kannada, Tamil, Telugu, or English.

   */

  detectLanguage(text) {

    if (!text) return this.currentLanguage;

    const lower = text.toLowerCase().trim();



    // 1. Hindi Check (Devanagari script OR Romanized Hinglish keywords)

    const hasDevanagari = /[\u0900-\u097F]/.test(text);

    const hindiKeywords = [

      'kholo', 'khol', 'dikhao', 'dekho', 'batao', 'jao', 'jana', 'karo', 'karna',

      'hai', 'hain', 'kya', 'kaise', 'kitna', 'kitni', 'kisan', 'khet', 'fasal',

      'mandi', 'nami', 'taapman', 'beej', 'khad', 'dawa', 'namaste', 'shukriya',

      'chahiye', 'mera', 'meri', 'mere', 'sabse', 'accha', 'acchi', 'pani', 'sinchai',

      'badhao', 'rokna', 'kharidna', 'kharido'

    ];

    const hasHindiWord = hindiKeywords.some(w => new RegExp('\\b' + w + '\\b', 'i').test(lower));



    if (hasDevanagari || hasHindiWord) {

      return 'hi';

    }



    // 2. Kannada Check (Kannada script OR Romanized Kannada keywords)

    const hasKannadaScript = /[\u0C80-\u0CFF]/.test(text);

    const kannadaKeywords = [

      'hogi', 'hogu', 'torisi', 'tori', 'nodona', 'madu', 'agide', 'neeru',

      'eshtu', 'elli', 'hege', 'yelli', 'namaskara', 'beku', 'thotada', 'krushi',

      'marukatte', 'beeja', 'gobbar'

    ];

    const hasKannadaWord = kannadaKeywords.some(w => new RegExp('\\b' + w + '\\b', 'i').test(lower));



    if (hasKannadaScript || hasKannadaWord) {

      return 'kn';

    }



    // 3. Tamil / Telugu checks

    if (/[\u0B80-\u0BFF]/.test(text)) return 'ta';

    if (/[\u0C00-\u0C7F]/.test(text)) return 'te';



    return this.currentLanguage || 'en';

  }



  matchesAny(str, keywords) {

    const s = str.toLowerCase();

    return keywords.some(k => s.includes(k.toLowerCase()));

  }



  /**

   * Deterministic Multilingual Voice Command & Navigation Intent Classifier

   */

  async processVoiceCommand(rawText) {

    if (!rawText || !rawText.trim()) return;

    const text = rawText.trim().toLowerCase();



    // 1. Detect language from spoken input and synchronize UI

    const detectedLang = this.detectLanguage(rawText);

    if (detectedLang !== this.currentLanguage) {

      this.setLanguage(detectedLang, false);

    }

    const lang = detectedLang;

    const langCode = this.getLangCode();



    const feedback = document.getElementById('voiceFeedbackCard');

    if (feedback) {

      feedback.style.display = 'block';

      feedback.innerHTML = `<strong>Processing:</strong> "${rawText}"...`;

    }



    // Stop any audio before new action

    window.AgriVoicePlayer.stop();



    // -------------------------------------------------------------

    // INTENT 1: MARKETPLACE / BUY SEEDS / TRACTOR / MANDI

    // -------------------------------------------------------------

    if (

      this.matchesAny(text, [

        'market', 'marketplace', 'seed', 'seeds', 'tractor', 'fertilizer', 'shop', 'buy', 'mandi',

        'rent tractor', 'order seeds', 'apmc'

      ]) ||

      this.matchesAny(text, [

        'मार्केट', 'मार्केटप्लेस', 'मंडी', 'दुकान', 'बीज', 'ट्रैक्टर', 'खाद', 'उर्वरक', 'खरीद', 'खरीदना',

        'किराया', 'किराये'

      ]) ||

      this.matchesAny(text, [

        'beej', 'khad', 'kharidna', 'kharido', 'tractor', 'kiraya', 'mandi kholo', 'market kholo'

      ]) ||

      this.matchesAny(text, [

        'ಮಾರುಕಟ್ಟೆ', 'ಬೀಜ', 'ಟ್ರಾಕ್ಟರ್', 'ಖರೀದಿ', 'ಗೊಬ್ಬರ', 'ರಸಗೊಬ್ಬರ', 'ಬಾಡಿಗೆ'

      ]) ||

      this.matchesAny(text, ['marukatte', 'beeja', 'gobbar', 'badige'])

    ) {

      let reply = '';

      if (lang === 'hi') {

        reply = 'मार्केटप्लेस खोला गया है। यहाँ आप प्रमाणित बीज, जैविक खाद और किराए पर ट्रैक्टर बुक कर सकते हैं।';

      } else if (lang === 'kn') {

        reply = 'ಅಗ್ರಿಮಾರ್ಕೆಟ್‌ಗೆ ಹೋಗಲಾಗಿದೆ. ಇಲ್ಲಿ ನೀವು ಬಿತ್ತನೆ ಬೀಜಗಳು, ರಸಗೊಬ್ಬರ ಮತ್ತು ಟ್ರಾಕ್ಟರ್ ಬಾಡಿಗೆ ಪಡೆಯಬಹುದು.';

      } else {

        reply = 'Navigating to AgriMarket. Here you can buy certified seeds, fertilizers, and rent tractors.';

      }



      this.showFeedback(reply, 'AgriMarket');

      if (window.agriApp) window.agriApp.switchView('marketplace');

      window.AgriVoicePlayer.speak(reply, langCode);

      return;

    }



    // -------------------------------------------------------------

    // INTENT 2: ORDERS & LOGISTICS / TRACKING / BOOKINGS

    // -------------------------------------------------------------

    if (

      this.matchesAny(text, [

        'order', 'orders', 'tracking', 'booking', 'logistics', 'delivery', 'deliveries', 'supply chain',

        'my orders', 'show orders'

      ]) ||

      this.matchesAny(text, [

        'ऑर्डर', 'आर्डर', 'बुकिंग', 'ट्रैकिंग', 'डिलीवरी', 'सप्लाई चेन', 'सामान'

      ]) ||

      this.matchesAny(text, [

        'order dikhao', 'order kholo', 'mere order', 'booking dikhao', 'tracking dikhao'

      ]) ||

      this.matchesAny(text, [

        'ಆರ್ಡರ್', 'ಆರ್ಡರ್‌ಗಳು', 'ಬುಕಿಂಗ್', 'ಟ್ರ್ಯಾಕಿಂಗ್', 'ವಿತರಣೆ'

      ]) ||

      this.matchesAny(text, ['order torisi', 'booking torisi'])

    ) {

      let reply = '';

      if (lang === 'hi') {

        reply = 'आपके सभी कृषि खरीद ऑर्डर और आपूर्ति श्रृंखला ट्रैकिंग खोल दी गई है।';

      } else if (lang === 'kn') {

        reply = 'ನಿಮ್ಮ ಕೃಷಿ ಖರೀದಿ ಆರ್ಡರ್‌ಗಳು ಮತ್ತು ಸಪ್ಲೈ ಚೈನ್ ಟ್ರ್ಯಾಕಿಂಗ್ ತೆರೆಯಲಾಗಿದೆ.';

      } else {

        reply = 'Opening Agricultural Purchase Orders and real-time supply chain tracking.';

      }



      this.showFeedback(reply, 'Orders & Logistics');

      if (window.agriApp) window.agriApp.switchView('orders');

      window.AgriVoicePlayer.speak(reply, langCode);

      return;

    }



    // -------------------------------------------------------------

    // INTENT 3: FARM MONITOR / SENSORS / SOIL MOISTURE / TEMPERATURE

    // -------------------------------------------------------------

    if (

      this.matchesAny(text, [

        'moisture', 'temperature', 'sensor', 'sensors', 'humidity', 'telemetry', 'farm monitor',

        'soil', 'water level'

      ]) ||

      this.matchesAny(text, [

        'नमी', 'सेंसर', 'तापमान', 'मिट्टी', 'आर्द्रता', 'पानी', 'सिंचाई', 'कितना आया', 'कितनी आयी', 'कितना है', 'कितनी है', 'आया', 'आयी'

      ]) ||

      this.matchesAny(text, [

        'nami', 'taapman', 'sensor kholo', 'sensor dikhao', 'mitti ki nami', 'farm monitor', 'kitna aaya', 'kitni aayi', 'kitna hai', 'kitni hai', 'aaya', 'aayi',

        'kitna hai', 'kitni hai', 'kitna', 'kitni', 'nami kitna hai', 'nami kitni hai'

      ]) ||

      this.matchesAny(text, [

        'कितना है', 'कितनी है', 'कितना', 'कितनी', 'नमी कितना है', 'नमी कितनी है'

      ]) ||

      this.matchesAny(text, [

        'ತೇವಾಂಶ', 'ಸೆನ್ಸರ್', 'ತಾಪಮಾನ', 'ಮಣ್ಣಿನ', 'ನೀರು', 'ಮಾನಿಟರ್'

      ]) ||

      this.matchesAny(text, ['tevamsha', 'neeru', 'tapamana', 'sensor torisi'])

    ) {

      try {

        const res = await fetch('/api/v1/sensors/telemetry');

        const tel = await res.json();



        let reply = '';

        if (lang === 'hi') {

          reply = `फार्म मॉनिटर खोला गया है। वर्तमान में मिट्टी की नमी ${tel.soil_moisture}% और तापमान ${tel.temperature}°C है। ${tel.soil_moisture < 35 ? 'सिंचाई शुरू करने की सलाह दी जाती है।' : 'स्थिति सामान्य है।'}`;

        } else if (lang === 'kn') {

          reply = `ಫಾರ್ಮ್ ಮಾನಿಟರ್ ತೆರೆಯಲಾಗಿದೆ. ಮಣ್ಣಿನ ತೇವಾಂಶ ಪ್ರಸ್ತುತ ${tel.soil_moisture}% ಮತ್ತು ತಾಪಮಾನ ${tel.temperature}°C ಆಗಿದೆ. ${tel.soil_moisture < 35 ? 'ನೀರಾವರಿ ಪ್ರಾರಂಭಿಸಲು ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ.' : 'ಸ್ಥಿತಿ ಸೂಕ್ತವಾಗಿದೆ.'}`;

        } else {

          reply = `Opening Farm Monitor. Current soil moisture is ${tel.soil_moisture}% and temperature is ${tel.temperature}°C. ${tel.soil_moisture < 35 ? 'Irrigation is recommended.' : 'Moisture is optimal.'}`;

        }



        this.showFeedback(reply, 'Farm Monitor');

        if (window.agriApp) window.agriApp.switchView('farm-monitor');

        window.AgriVoicePlayer.speak(reply, langCode);

        return;

      } catch (e) {

        let reply = lang === 'hi' ? 'फार्म मॉनिटर खोला गया है।' : (lang === 'kn' ? 'ಫಾರ್ಮ್ ಮಾನಿಟರ್ ತೆರೆಯಲಾಗಿದೆ.' : 'Opening Farm Monitor.');

        this.showFeedback(reply, 'Farm Monitor');

        if (window.agriApp) window.agriApp.switchView('farm-monitor');

        window.AgriVoicePlayer.speak(reply, langCode);

        return;

      }

    }



    // -------------------------------------------------------------

    // INTENT 4: CROP INTELLIGENCE & DISEASE DIAGNOSTICS

    // -------------------------------------------------------------

    if (

      this.matchesAny(text, [

        'crop', 'crops', 'disease', 'foliar', 'canopy', 'paddy', 'tomato', 'plant health',

        'crop intelligence'

      ]) ||

      this.matchesAny(text, [

        'फसल', 'फसलें', 'रोग', 'पत्ती', 'पत्ती रोग', 'कीट', 'बीमारी', 'धान', 'टमाटर'

      ]) ||

      this.matchesAny(text, [

        'fasal', 'faslen', 'patti rog', 'bimari', 'fasal dikhao', 'fasal kholo'

      ]) ||

      this.matchesAny(text, [

        'ಬೆಳೆ', 'ಬೆಳೆಗಳು', 'ರೋಗ', 'ಎಲೆ ರೋಗ', 'ಕೀಟ', 'ಭತ್ತ', 'ಟೊಮೆಟೊ'

      ]) ||

      this.matchesAny(text, ['bele', 'bele roga', 'ele roga'])

    ) {

      let reply = '';

      if (lang === 'hi') {

        reply = 'फसल बुद्धिमत्ता और एआई पत्ती रोग निदान खोला गया है।';

      } else if (lang === 'kn') {

        reply = 'ಬೆಳೆ ಮಾಹಿತಿ ಮತ್ತು ಎಐ ಎಲೆ ರೋಗ ಪತ್ತೆ ವಿಭಾಗವನ್ನು ತೆರೆಯಲಾಗುತ್ತಿದೆ.';

      } else {

        reply = 'Opening Crop Intelligence & MobileNetV2 Foliar Disease Diagnostics.';

      }



      this.showFeedback(reply, 'Crop Intelligence');

      if (window.agriApp) window.agriApp.switchView('crop');

      window.AgriVoicePlayer.speak(reply, langCode);

      return;

    }



    // -------------------------------------------------------------

    // INTENT 5: SATELLITE ANALYTICS & NDVI

    // -------------------------------------------------------------

    if (

      this.matchesAny(text, ['satellite', 'ndvi', 'spectral', 'vegetation', 'upgrah']) ||

      this.matchesAny(text, ['सैटेलाइट', 'उपग्रह', 'वनस्पति', 'हरियाली']) ||

      this.matchesAny(text, ['ಉಪಗ್ರಹ', 'ಉಪಗ್ರಹ ವಿಶ್ಲೇಷಣೆ', 'ಹಸಿರು ಸೂಚ್ಯಂಕ'])

    ) {

      let reply = '';

      if (lang === 'hi') {

        reply = 'सेंटिनल-2 सैटेलाइट और एनडीवीआई हरियाली विश्लेषण दिखाया जा रहा है।';

      } else if (lang === 'kn') {

        reply = 'ಉಪಗ್ರಹ ಎನ್‌ಡಿವಿಐ ಹಸಿರು ಸೂಚ್ಯಂಕ ವಿಶ್ಲೇಷಣೆಯನ್ನು ತೋರಿಸಲಾಗುತ್ತಿದೆ.';

      } else {

        reply = 'Showing Sentinel-2 Spectral NDVI Satellite Analytics.';

      }



      this.showFeedback(reply, 'Satellite Analysis');

      if (window.agriApp) window.agriApp.switchView('satellite');

      window.AgriVoicePlayer.speak(reply, langCode);

      return;

    }



    // -------------------------------------------------------------

    // INTENT 6: CALL-E LIVE OUTBOUND PHONE CALL

    // -------------------------------------------------------------

    if (

      this.matchesAny(text, ['call', 'call me', 'phone', 'dial', 'call-e', 'calle', 'ring']) ||

      this.matchesAny(text, ['कॉल', 'फोन करो', 'कॉल करो', 'डायल', 'कॉल लगाओ']) ||

      this.matchesAny(text, ['call karo', 'phone karo', 'mujhe call karo']) ||

      this.matchesAny(text, ['ಕಾಲ್', 'ಫೋನ್ ಮಾಡಿ', 'ಕರೆ ಮಾಡಿ', 'ಡಯಲ್']) ||

      this.matchesAny(text, ['call madi', 'phone madi', 'kare madi'])

    ) {

      let reply = '';

      if (lang === 'hi') {

        reply = 'कॉल-ई वॉयस एजेंट डायलर खोला जा रहा है। आपके मोबाइल पर कॉल आएगी।';

      } else if (lang === 'kn') {

        reply = 'ಕಾಲ್-ಇ ಎಐ ಧ್ವನಿ ಸಹಾಯಕವನ್ನು ಪ್ರಾರಂಭಿಸಲಾಗುತ್ತಿದೆ. ನಿಮ್ಮ ಫೋನ್ ರಿಂಗ್ ಆಗುತ್ತದೆ.';

      } else {

        reply = 'Initiating CALL-E Outbound Voice Agent to dial your phone.';

      }



      this.showFeedback(reply, 'CALL-E Voice Dialer');

      if (window.openCallEGlobalModal) {

        window.openCallEGlobalModal();

      } else if (window.agriMarket && window.agriMarket.openCallEModal) {

        window.agriMarket.openCallEModal();

      }

      window.AgriVoicePlayer.speak(reply, langCode);

      return;

    }



    // -------------------------------------------------------------

    // INTENT 7: ALERTS CENTER

    // -------------------------------------------------------------

    if (

      this.matchesAny(text, ['alert', 'alerts', 'warning', 'notifications', 'alarm']) ||

      this.matchesAny(text, ['अलर्ट', 'चेतावनी', 'सूचनाएं', 'अलार्म']) ||

      this.matchesAny(text, ['chetavani', 'alert kholo', 'alert dikhao']) ||

      this.matchesAny(text, ['ಎಚ್ಚರಿಕೆ', 'ಎಚ್ಚರಿಕೆಗಳು', 'ಸೂಚನೆ'])

    ) {

      let reply = lang === 'hi' ? 'अलर्ट और आपातकालीन चेतावनी केंद्र खोला गया है।' : (lang === 'kn' ? 'ಎಚ್ಚರಿಕೆ ಮತ್ತು ಅಧಿಸೂಚನೆ ಕೇಂದ್ರ ತೆರೆಯಲಾಗಿದೆ.' : 'Opening Alerts and Notifications Center.');

      this.showFeedback(reply, 'Alerts Center');

      if (window.agriApp) window.agriApp.switchView('alerts');

      window.AgriVoicePlayer.speak(reply, langCode);

      return;

    }



    // -------------------------------------------------------------

    // INTENT 8: IOT DEVICES / HARDWARE / ESP32

    // -------------------------------------------------------------

    if (

      this.matchesAny(text, ['device', 'devices', 'hardware', 'esp32', 'node', 'nodes']) ||

      this.matchesAny(text, ['उपकरण', 'डिवाइस', 'हार्डवेयर', 'ईएसपी32']) ||

      this.matchesAny(text, ['device kholo', 'device dikhao', 'upkaran']) ||

      this.matchesAny(text, ['ಸಾಧನ', 'ಸಾಧನಗಳು', 'ಯಂತ್ರಾಂಶ'])

    ) {

      let reply = lang === 'hi' ? 'ईएसपी32 हार्डवेयर उपकरण और आईओटी नोड्स स्थिति खोली गई है।' : (lang === 'kn' ? 'ಇಎಸ್‌ಪಿ32 ಹಾರ್ಡ್‌ವೇರ್ ಸಾಧನಗಳ ಸ್ಥಿತಿ ತೆರೆಯಲಾಗಿದೆ.' : 'Opening ESP32 Hardware IoT Nodes.');

      this.showFeedback(reply, 'IoT Devices');

      if (window.agriApp) window.agriApp.switchView('devices');

      window.AgriVoicePlayer.speak(reply, langCode);

      return;

    }



    // -------------------------------------------------------------

    // INTENT 9: DASHBOARD / HOME

    // -------------------------------------------------------------

    if (

      this.matchesAny(text, ['dashboard', 'home', 'overview', 'main', 'homepage']) ||

      this.matchesAny(text, ['डैशबोर्ड', 'होम', 'मुख्य', 'मुख्य पृष्ठ']) ||

      this.matchesAny(text, ['dashboard kholo', 'home jao', 'mukhya prishth']) ||

      this.matchesAny(text, ['ಡ್ಯಾಶ್‌ಬೋರ್ಡ್', 'ಮುಖಪುಟ', 'ಮುಖ್ಯ ಪುಟ'])

    ) {

      let reply = lang === 'hi' ? 'मुख्य फार्म डैशबोर्ड खोला गया है।' : (lang === 'kn' ? 'ಮುಖ್ಯ ಫಾರ್ಮ್ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಹಿಂತಿರುಗಲಾಗಿದೆ.' : 'Returning to Main Farm Dashboard.');

      this.showFeedback(reply, 'Dashboard');

      if (window.agriApp) window.agriApp.switchView('dashboard');

      window.AgriVoicePlayer.speak(reply, langCode);

      return;

    }



    // -------------------------------------------------------------

    // INTENT 10: TRANSLATOR

    // -------------------------------------------------------------

    if (

      this.matchesAny(text, ['translator', 'translation', 'translate', 'bhashini', 'gemma']) ||

      this.matchesAny(text, ['अनुवाद', 'अनुवादक', 'भाषांतर']) ||

      this.matchesAny(text, ['anuvad', 'anuvadak', 'translator kholo']) ||

      this.matchesAny(text, ['ಅನುವಾದಕ', 'ಭಾಷಾಂತರ', 'ಅನುವಾದ'])

    ) {

      let reply = lang === 'hi' ? 'बहुभाषी एआई अनुवादक खोला गया है।' : (lang === 'kn' ? 'ಬಹುಭಾಷಾ ಎಐ ಅನುವಾದಕ ವಿಭಾಗ ತೆರೆಯಲಾಗಿದೆ.' : 'Opening Multilingual AI Translator.');

      this.showFeedback(reply, 'Translator');

      if (window.agriApp) window.agriApp.switchView('translator');

      window.AgriVoicePlayer.speak(reply, langCode);

      return;

    }



    // -------------------------------------------------------------

    // INTENT 11: GENERAL QUERY TO AI ASSISTANT (No Overlapping Speech!)

    // -------------------------------------------------------------

    const statusMsg = lang === 'hi'

      ? `एआई ऑपरेटर "${rawText}" का विश्लेषण कर रहा है...`

      : (lang === 'kn' ? `ಎಐ ಆಪರೇಟರ್ "${rawText}" ಅನ್ನು ವಿಶ್ಲೇಷಿಸುತ್ತಿದೆ...` : `AI Operator analyzing "${rawText}"...`);



    this.showFeedback(statusMsg, 'AI Operator');



    if (window.aiAssistant) {

      window.aiAssistant.openModal();

      window.aiAssistant.setLanguage(lang);

      window.aiAssistant.processUserText(rawText);

    }

  }



  showFeedback(text, targetView) {

    const feedback = document.getElementById('voiceFeedbackCard');

    if (feedback) {

      feedback.style.display = 'block';

      feedback.innerHTML = `

        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">

          <strong style="color: #6ee7b7; font-size: 11px; text-transform: uppercase;">⚡ Target: ${targetView}</strong>

          <span style="font-size: 10px; color: #a7f3d0;">Sarvam AI Indic Voice</span>

        </div>

        <p style="margin: 0; line-height: 1.4;">${text}</p>

      `;

    }

  }



  speak(text) {

    window.AgriVoicePlayer.speak(text, this.getLangCode());

  }

}



// Global initialization

window.addEventListener('DOMContentLoaded', () => {

  window.agriVoiceNav = new AgriVoiceNavigator();

});

