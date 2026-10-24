/**
 * AgriSense & AgriMarket - Gemma On-Device Voice Translator
 * Powered by Google Gemma 4 (gemma4-e2b via LiteRT-LM) and Moonshine STT/TTS
 */

(function () {
  'use strict';

  const SUPPORTED_LANGUAGES = [
    { code: 'en', name: 'English', ttsLang: 'en' },
    { code: 'es', name: 'Spanish (Español)', ttsLang: 'es' },
    { code: 'ar', name: 'Arabic (العربية)', ttsLang: 'ar' },
    { code: 'hi', name: 'Hindi (हिन्दी)', ttsLang: 'hi' },
    { code: 'ja', name: 'Japanese (日本語)', ttsLang: 'ja' },
    { code: 'zh', name: 'Chinese (中文)', ttsLang: 'zh' },
    { code: 'de', name: 'German (Deutsch)', ttsLang: 'de' }
  ];

  class GemmaTranslatorService {
    constructor() {
      this.isRecording = false;
      this.audioContext = null;
      this.mediaStream = null;
      this.processor = null;
      this.audioChunks = [];
      this.status = {
        online: false,
        activeModel: 'gemma4-e2b',
        litertOnline: false,
        translatorOnline: false
      };
      this.sourceLang = 'en';
      this.targetLang = 'es';
      this.currentAudioPlayer = null;
    }

    async checkStatus() {
      try {
        const resp = await fetch('/api/v1/gemma/status');
        if (resp.ok) {
          this.status = await resp.json();
        }
      } catch (err) {
        this.status.online = false;
      }
      return this.status;
    }

    async startRecording() {
      if (this.isRecording || this.isStarting) return false;
      this.isStarting = true;
      this.stopRequested = false;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            channelCount: 1,
            sampleRate: 16000,
            echoCancellation: true,
            noiseSuppression: true
          }
        });

        if (this.stopRequested) {
          stream.getTracks().forEach(t => t.stop());
          this.isStarting = false;
          return false;
        }

        this.mediaStream = stream;
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
          sampleRate: 16000
        });
        const source = this.audioContext.createMediaStreamSource(stream);
        this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);
        this.audioChunks = [];

        this.processor.onaudioprocess = (e) => {
          if (!this.isRecording) return;
          const inputData = e.inputBuffer.getChannelData(0);
          this.audioChunks.push(new Float32Array(inputData));
        };

        source.connect(this.processor);
        this.processor.connect(this.audioContext.destination);
        this.isRecording = true;
        this.isStarting = false;
        this.updateRecordingUI(true);
        return true;
      } catch (err) {
        this.isStarting = false;
        this.isRecording = false;
        console.error('[GEMMA TRANSLATOR] Mic access error:', err);
        alert('Could not access microphone: ' + err.message);
        return false;
      }
    }

    async stopRecording() {
      if (this.isStarting) {
        this.stopRequested = true;
      }
      if (!this.isRecording) {
        this.updateRecordingUI(false);
        return null;
      }
      this.isRecording = false;
      this.updateRecordingUI(false);

      if (this.processor) {
        this.processor.disconnect();
        this.processor = null;
      }
      if (this.audioContext) {
        try { await this.audioContext.close(); } catch(e) {}
        this.audioContext = null;
      }
      if (this.mediaStream) {
        this.mediaStream.getTracks().forEach(t => t.stop());
        this.mediaStream = null;
      }

      if (!this.audioChunks || this.audioChunks.length === 0) {
        return null;
      }

      // Merge Float32 chunks
      let totalLength = 0;
      for (const chunk of this.audioChunks) {
        totalLength += chunk.length;
      }
      if (totalLength === 0) return null;

      const merged = new Float32Array(totalLength);
      let offset = 0;
      for (const chunk of this.audioChunks) {
        merged.set(chunk, offset);
        offset += chunk.length;
      }
      this.audioChunks = [];

      // Non-blocking FileReader base64 encoding (native C++ browser stream)
      const blob = new Blob([merged.buffer], { type: 'application/octet-stream' });
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result) {
            resolve(reader.result.split(',')[1]);
          } else {
            resolve(null);
          }
        };
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      });
    }

    async transcribeAudioBase64(base64Data, langCode) {
      const resp = await fetch('/api/stt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audio_base64: base64Data,
          language: langCode || this.sourceLang
        })
      });
      if (!resp.ok) {
        throw new Error(`STT failed: ${resp.status}`);
      }
      const data = await resp.json();
      return data.text || '';
    }

    async translateText(text, targetLang, sourceLang) {
      const srcCode = sourceLang || this.sourceLang;
      const tgtCode = targetLang || this.targetLang;
      const srcName = SUPPORTED_LANGUAGES.find(l => l.code === srcCode)?.name || srcCode;
      const tgtName = SUPPORTED_LANGUAGES.find(l => l.code === tgtCode)?.name || tgtCode;

      let systemPrompt = `You are a professional, accurate multilingual translator for agricultural commerce and farming. 
Translate the provided text from ${srcName} into ${tgtName}.`;

      if (tgtCode === 'hi') {
        systemPrompt += ` Translate directly into natural, simple Hindi in Devanagari script (e.g. "मिट्टी की नमी सामान्य है"). Do NOT output English explanations, Latin transliterations, or multiple options.`;
      }

      systemPrompt += `\nYou MUST respond with ONLY a valid JSON object in this exact format:
{"translation": "your translated text here"}`;

      const payload = {
        model: 'gemma4-e2b',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text }
        ],
        max_tokens: 150,
        temperature: 0.1
      };

      const targetUrl = 'http://localhost:9379/v1/chat/completions';
      const fetchUrl = `/proxy?url=${encodeURIComponent(targetUrl)}`;

      const startTime = Date.now();
      const resp = await fetch(fetchUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!resp.ok) {
        const errText = await resp.text();
        throw new Error(`Translation API error: ${resp.status} ${errText}`);
      }

      const data = await resp.json();
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      let modelResponse = data.choices?.[0]?.message?.content || '';

      let cleanJson = modelResponse.trim();
      if (cleanJson.startsWith('```json')) cleanJson = cleanJson.slice(7);
      if (cleanJson.startsWith('```')) cleanJson = cleanJson.slice(3);
      if (cleanJson.endsWith('```')) cleanJson = cleanJson.slice(0, -3);
      cleanJson = cleanJson.trim();

      let translatedText = '';
      try {
        const match = cleanJson.match(/\{[\s\S]*"translation"\s*:\s*"((?:[^"\\]|\\.)*)"[\s\S]*\}/);
        if (match && match[1]) {
          try {
            translatedText = JSON.parse(`"${match[1]}"`);
          } catch (e) {
            translatedText = match[1];
          }
        } else {
          const parsed = JSON.parse(cleanJson);
          translatedText = parsed.translation || modelResponse;
        }
      } catch (e) {
        translatedText = modelResponse;
      }

      return {
        translation: translatedText,
        duration: duration,
        tokens: data.usage?.total_tokens || 0
      };
    }

    async playTTS(text, lang) {
      if (!text) return;
      if (this.currentAudioPlayer) {
        try { this.currentAudioPlayer.pause(); } catch(e) {}
        this.currentAudioPlayer = null;
      }
      const ttsLang = lang || this.targetLang;
      const audioUrl = `/api/tts?text=${encodeURIComponent(text)}&lang=${encodeURIComponent(ttsLang)}`;
      const audio = new Audio(audioUrl);
      this.currentAudioPlayer = audio;

      audio.onerror = () => {
        console.warn('[GEMMA TRANSLATOR] Backend TTS error, falling back to browser speech synthesis');
        this.speakBrowserFallback(text, ttsLang);
      };

      try {
        await audio.play();
      } catch (err) {
        console.warn('[GEMMA TRANSLATOR] Autoplay notice:', err.message);
      }
    }

    speakBrowserFallback(text, lang) {
      if (!('speechSynthesis' in window)) return;
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang === 'hi' ? 'hi-IN' : (lang === 'es' ? 'es-ES' : (lang === 'ar' ? 'ar-SA' : 'en-US'));
        utterance.rate = 0.95;
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.warn('Browser speech synthesis fallback error:', e);
      }
    }

    updateRecordingUI(recording) {
      const micBtn = document.getElementById('btnGemmaRecord');
      const micStatus = document.getElementById('gemmaMicStatus');
      if (micBtn) {
        if (recording) {
          micBtn.classList.add('recording-pulse');
          if (micStatus) micStatus.textContent = 'Listening... Speak now';
        } else {
          micBtn.classList.remove('recording-pulse');
          if (micStatus) micStatus.textContent = 'Click to speak';
        }
      }
    }
  }

  window.gemmaTranslator = new GemmaTranslatorService();
})();
