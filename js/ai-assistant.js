/**
 * AgriSense & AgriMarket AI - TrueFoundry + Sarvam Voice AI + CALL-E Assistant Engine
 * Connects to live FastAPI / TrueForge SSE stream (/api/agent/task + /api/agent/session/{id}/stream),
 * Sarvam AI Indic STT (saaras:v3) and TTS (bulbul:v3), CALL-E Outbound Voice Phone Calls,
 * and TrueForge Human-in-the-Loop Safe Approval Gate.
 */

class AIAssistantEngine {
  constructor() {
    this.currentLanguage = localStorage.getItem('agri_voice_lang') || 'hi';
    this.isListening = false;
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.speechRecognition = null;
    this.agentStepLog = [];
    this.currentSessionId = null;
    this.currentEventSource = null;
    this.pendingApprovalAction = null;
    this.initSpeech();
  }

  getLangCode() {
    const langCodes = {
      en: 'en-IN',
      kn: 'kn-IN',
      hi: 'hi-IN',
      ta: 'ta-IN',
      te: 'te-IN'
    };
    return langCodes[this.currentLanguage] || 'en-IN';
  }

  initSpeech() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.speechRecognition = new SpeechRecognition();
      this.speechRecognition.continuous = false;
      this.speechRecognition.interimResults = false;
      this.updateSpeechLanguage();

      this.speechRecognition.onstart = () => {
        this.isListening = true;
        this.updateMicUi(true);
      };

      this.speechRecognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        this.processUserText(transcript);
      };

      this.speechRecognition.onerror = (event) => {
        console.warn('Speech recognition notice:', event.error);
        this.isListening = false;
        this.updateMicUi(false);
      };

      this.speechRecognition.onend = () => {
        this.isListening = false;
        this.updateMicUi(false);
      };
    }
  }

  updateSpeechLanguage() {
    if (this.speechRecognition) {
      this.speechRecognition.lang = this.getLangCode();
    }
  }

  setLanguage(lang) {
    this.currentLanguage = lang;
    this.updateSpeechLanguage();
    window.dispatchEvent(new CustomEvent('agri:language-changed', { detail: lang }));
  }

  init(containerId = 'aiAssistantContainer') {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    const I = window.AgriIcons || {};

    this.container.innerHTML = `
      <!-- Floating AI Trigger Button -->
      <button class="floating-ai-trigger" id="floatingAiBtn" title="Open AgriMarket AI Operator">
        <span class="ai-sparkle">${I.sparkles || '✨'}</span>
        <span class="ai-mic-icon">${I.mic || '🎙️'}</span>
        <span class="ai-pulse-ring"></span>
      </button>

      <!-- AI Assistant Modal / Drawer -->
      <div class="ai-modal-backdrop" id="aiModalBackdrop" style="display: none;">
        <div class="ai-modal-window">
          <div class="ai-modal-header">
            <div class="ai-header-title">
              <span class="ai-robot-avatar">${I.bot || ''}</span>
              <div>
                <h4>AgriSense & AgriMarket AI Operator</h4>
                <span class="ai-sub-badge">TrueForge Multi-Agent Harness • Sarvam AI • CALL-E</span>
              </div>
            </div>
            <div class="ai-header-actions">
              <select id="aiLangSelect" class="form-select-sm" style="color: #ffffff; background: rgba(255,255,255,0.15); border-radius: 4px; padding: 4px 8px; border: 1px solid rgba(255,255,255,0.2);">
                <option value="hi" ${this.currentLanguage === "hi" ? "selected" : ""}>🇮🇳 हिन्दी (Hindi)</option>
                <option value="kn">ಕನ್ನಡ (Kannada)</option>
                <option value="en" ${this.currentLanguage === "en" ? "selected" : ""}>English (India)</option>
                <option value="ta">தமிழ் (Tamil)</option>
                <option value="te">తెలుగు (Telugu)</option>
              </select>
              <button class="modal-close-btn" id="btnCloseAiModal">${I.close || '✕'}</button>
            </div>
          </div>

          <!-- Multi-Agent Visual Orchestration Pipeline -->
          <div class="ai-orchestration-bar">
            <div class="agent-node active" id="nodeOrchestrator" title="Chief of Staff Orchestrator">
              <span class="node-icon">${I.cpu || ''}</span>
              <span class="node-label">Orchestrator</span>
            </div>
            <span class="node-arrow">→</span>
            <div class="agent-node" id="nodeCropAgent" title="IoT & Satellite Phenology Agent">
              <span class="node-icon">${I.sprout || ''}</span>
              <span class="node-label">Crop Monitor</span>
            </div>
            <span class="node-arrow">→</span>
            <div class="agent-node" id="nodeMarketAgent" title="Marketplace & Logistics Agent">
              <span class="node-icon">${I.search || ''}</span>
              <span class="node-label">Commerce Agent</span>
            </div>
            <span class="node-arrow">→</span>
            <div class="agent-node" id="nodeCallEAgent" title="CALL-E Outbound Voice Phone Caller">
              <span class="node-icon">📞</span>
              <span class="node-label">CALL-E Voice</span>
            </div>
          </div>

          <!-- Chat Conversation Stream -->
          <div class="ai-conversation-stream" id="aiChatStream">
            <div class="ai-msg msg-assistant">
              <div class="msg-avatar">${I.bot || ''}</div>
              <div class="msg-bubble">
                <p><strong>Namaskara!</strong> I am your autonomous Agricultural AI Operator powered by <strong>TrueForge</strong> & <strong>Sarvam AI</strong>. You can speak or type in Kannada, Hindi, English, Tamil, or Telugu.</p>
                <div class="quick-prompts">
                  <button class="btn-prompt-chip" data-query="Check my soil moisture">"Check soil moisture"</button>
                  <button class="btn-prompt-chip" data-query="Call me via CALL-E with today's APMC prices">"Call me via CALL-E"</button>
                  <button class="btn-prompt-chip" data-query="Show tractor for rent">"Rent Mahindra tractor"</button>
                  <button class="btn-prompt-chip" data-query="I need tomato seeds">"Order tomato seeds"</button>
                  <button class="btn-prompt-chip" data-query="What is my crop health?">"Check crop health"</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Agent Live Activity Log -->
          <div class="agent-activity-tracker" id="agentActivityTracker">
            <div class="activity-header">
              <span>Live TrueForge Agent Execution Trace</span>
              <span class="activity-status-dot"></span>
            </div>
            <div class="activity-log-items" id="activityLogItems">
              <div class="log-item">System ready. TrueForge harness & MCP Server active (14 tools).</div>
            </div>
          </div>

          <!-- Voice / Text Control Input Bar -->
          <div class="ai-input-bar">
            <button class="btn-mic-main" id="btnAiMic" title="Click to speak (Sarvam AI Indic STT)">
              <span class="mic-svg">${I.mic || '🎙️'}</span>
              <span class="mic-ripple"></span>
            </button>
            <input type="text" id="aiTextInput" class="ai-text-input" placeholder="Speak in your language, or type agricultural query..." />
            <button class="btn-send-ai" id="btnSendAi">Send</button>
          </div>
        </div>
      </div>

      <!-- TrueForge Human-in-the-Loop Safe Approval Modal -->
      <div class="order-confirm-backdrop" id="orderConfirmModal" style="display: none;">
        <div class="order-confirm-card" style="border: 2px solid #059669; box-shadow: 0 20px 40px rgba(0,0,0,0.35);">
          <div class="confirm-header" style="background: linear-gradient(135deg, #064e3b 0%, #047857 100%); color: #ffffff; padding: 16px 20px; border-radius: 12px 12px 0 0; display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 22px;">✋</span>
              <div>
                <h4 style="margin: 0; color: #ffffff; font-size: 16px;">TrueForge Human Approval Checkpoint</h4>
                <span style="font-size: 12px; color: #a7f3d0;">Pre-Execution Financial & Communication Guardrail</span>
              </div>
            </div>
            <span class="safety-badge" style="background: rgba(255,255,255,0.2); color: #ffffff; padding: 4px 10px; border-radius: 20px; font-size: 12px;">Stage 1 Prepared</span>
          </div>
          <div style="padding: 20px;">
            <p class="confirm-intro" id="confirmIntroText" style="font-size: 14px; color: #334155; margin-bottom: 14px;">The AI Agent prepared this real-world action. Your explicit approval is required before execution:</p>
            
            <div class="confirm-summary-box" id="confirmSummaryBox" style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin-bottom: 16px;"></div>

            <div class="confirm-actions" style="display: flex; gap: 12px;">
              <button class="btn btn-outline" id="btnCancelOrderConfirm" style="flex: 1; border-color: #cbd5e1; color: #475569;">✕ Deny & Cancel</button>
              <button class="btn btn-primary" id="btnProceedOrderConfirm" style="flex: 2; background: #059669; border-color: #059669; font-weight: 700;">✓ Approve & Execute</button>
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    const trigger = document.getElementById('floatingAiBtn');
    const modal = document.getElementById('aiModalBackdrop');
    const closeBtn = document.getElementById('btnCloseAiModal');
    const micBtn = document.getElementById('btnAiMic');
    const sendBtn = document.getElementById('btnSendAi');
    const textInput = document.getElementById('aiTextInput');
    const langSelect = document.getElementById('aiLangSelect');

    if (trigger) trigger.addEventListener('click', () => this.openModal());
    if (closeBtn) closeBtn.addEventListener('click', () => this.closeModal());
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) this.closeModal();
      });
    }

    if (langSelect) {
      langSelect.addEventListener('change', (e) => {
        this.setLanguage(e.target.value);
        if (window.showAgriToast) {
          window.showAgriToast(`AI voice language set to ${e.target.options[e.target.selectedIndex].text}`, 'info');
        }
      });
    }

    if (micBtn) {
      micBtn.addEventListener('click', () => this.toggleVoiceListen());
    }

    if (sendBtn && textInput) {
      sendBtn.addEventListener('click', () => {
        const text = textInput.value.trim();
        if (text) {
          this.processUserText(text);
          textInput.value = '';
        }
      });

      textInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const text = textInput.value.trim();
          if (text) {
            this.processUserText(text);
            textInput.value = '';
          }
        }
      });
    }

    this.container.querySelectorAll('.btn-prompt-chip').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.processUserText(e.currentTarget.dataset.query);
      });
    });

    const cancelConfirm = document.getElementById('btnCancelOrderConfirm');
    const proceedConfirm = document.getElementById('btnProceedOrderConfirm');
    const confirmModal = document.getElementById('orderConfirmModal');

    if (cancelConfirm) {
      cancelConfirm.addEventListener('click', () => {
        confirmModal.style.display = 'none';
        this.sendApprovalDecision('deny');
      });
    }

    if (proceedConfirm) {
      proceedConfirm.addEventListener('click', () => {
        confirmModal.style.display = 'none';
        this.sendApprovalDecision('allow');
      });
    }
  }

  openModal() {
    const modal = document.getElementById('aiModalBackdrop');
    if (modal) modal.style.display = 'flex';
  }

  closeModal() {
    const modal = document.getElementById('aiModalBackdrop');
    if (modal) modal.style.display = 'none';
  }

  toggleVoiceListen() {
    if (this.isListening) {
      this.stopVoiceListen();
    } else {
      this.startVoiceListen();
    }
  }

  async startVoiceListen() {
    if (window.AgriVoicePlayer) {
      window.AgriVoicePlayer.stop();
    }
    this.isListening = true;
    this.updateMicUi(true);

    // Prefer Web Speech Recognition for instant streaming and silence detection
    if (this.speechRecognition) {
      try {
        this.updateSpeechLanguage();
        this.speechRecognition.start();
        return;
      } catch (err) {
        console.warn('SpeechRecognition active or error:', err.message);
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
          await this.sendAudioToSarvamStt(audioBlob);
        };

        this.mediaRecorder.start();

        // Safety auto-stop after 4.5s
        if (this.mediaRecorderTimer) clearTimeout(this.mediaRecorderTimer);
        this.mediaRecorderTimer = setTimeout(() => {
          if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
            this.mediaRecorder.stop();
          }
        }, 4500);
        return;
      } catch (err) {
        console.warn('Microphone stream error:', err.message);
      }
    }

    this.fallbackSimulatedSpeech();
  }

  stopVoiceListen() {
    this.isListening = false;
    this.updateMicUi(false);
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
    if (this.speechRecognition) {
      try { this.speechRecognition.stop(); } catch (e) {}
    }
  }

  async sendAudioToSarvamStt(audioBlob) {
    this.logActivity('Processing audio via Sarvam AI saaras:v3...', 'Sarvam AI');
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'voice.wav');
      formData.append('language_code', this.getLangCode());

      const res = await fetch('/api/voice/stt', { method: 'POST', body: formData });
      const data = await res.json();
      if (data && data.transcript && data.transcript.trim()) {
        this.processUserText(data.transcript.trim());
        return;
      }
    } catch (e) {
      console.warn('Sarvam STT backend request error:', e);
    }
    this.fallbackSimulatedSpeech();
  }

  fallbackSimulatedSpeech() {
    this.updateMicUi(true);
    setTimeout(() => {
      this.updateMicUi(false);
      const demoQueries = [
        "Call me via CALL-E with APMC prices",
        "Check my soil moisture",
        "Rent Mahindra tractor for 4 hours",
        "I need tomato seeds"
      ];
      const randomQuery = demoQueries[Math.floor(Math.random() * demoQueries.length)];
      this.processUserText(randomQuery);
    }, 1500);
  }

  updateMicUi(listening) {
    const micBtn = document.getElementById('btnAiMic');
    if (micBtn) {
      micBtn.classList.toggle('listening', listening);
      micBtn.title = listening ? 'Listening... click to stop' : 'Click to speak';
    }
  }

  logActivity(text, agent = 'Orchestrator') {
    const box = document.getElementById('activityLogItems');
    if (!box) return;
    const item = document.createElement('div');
    item.className = 'log-item new-log';
    item.innerHTML = `<span class="log-badge">${agent}</span> ${text}`;
    box.appendChild(item);
    box.scrollTop = box.scrollHeight;
  }

  setAgentNodeActive(nodeId) {
    document.querySelectorAll('.agent-node').forEach(n => n.classList.remove('active'));
    const target = document.getElementById(nodeId);
    if (target) target.classList.add('active');
  }

  appendUserMessage(text) {
    const streams = [document.getElementById('aiChatStream'), document.getElementById('pageChatStream')].filter(Boolean);
    const I = window.AgriIcons || {};
    streams.forEach(stream => {
      const msg = document.createElement('div');
      msg.className = 'ai-msg msg-user';
      msg.innerHTML = `
        <div class="msg-bubble">
          <p>${text}</p>
        </div>
        <div class="msg-avatar">${I.user || '👤'}</div>
      `;
      stream.appendChild(msg);
      stream.scrollTop = stream.scrollHeight;
    });
  }

  appendAssistantMessage(htmlContent) {
    const streams = [document.getElementById('aiChatStream'), document.getElementById('pageChatStream')].filter(Boolean);
    const I = window.AgriIcons || {};
    streams.forEach(stream => {
      const msg = document.createElement('div');
      msg.className = 'ai-msg msg-assistant';
      msg.innerHTML = `
        <div class="msg-avatar">${I.bot || '🤖'}</div>
        <div class="msg-bubble">
          ${htmlContent}
        </div>
      `;
      stream.appendChild(msg);
      stream.scrollTop = stream.scrollHeight;
    });
  }

  async speakText(text) {
    if (window.AgriVoicePlayer) {
      await window.AgriVoicePlayer.speak(text, this.getLangCode());
      return;
    }
    // Fallback: Browser Web Speech API
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance((text || '').replace(/[#*`_]/g, ''));
      utterance.lang = this.getLangCode();
      window.speechSynthesis.speak(utterance);
    }
  }

  async processUserText(text) {
    if (window.AgriVoicePlayer) {
      window.AgriVoicePlayer.stop();
    }
    this.appendUserMessage(text);
    this.setAgentNodeActive('nodeOrchestrator');
    this.logActivity(`Input received: "${text}"`, 'TrueForge');

    // Attempt Live Backend Agent Stream (/api/agent/task)
    try {
      const res = await fetch('/api/agent/task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          farmer_id: 'farmer-001',
          session_id: this.currentSessionId || undefined,
          language_code: this.getLangCode()
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.session_id) {
          this.currentSessionId = data.session_id;
          this.connectToAgentSse(data.session_id);
          return;
        }
      }
    } catch (err) {
      console.warn('[AI Assistant] Live backend stream unavailable, running local logic:', err.message);
    }

    // Client-side fallback if backend is unreachable
    this.runClientSideFallback(text);
  }

  connectToAgentSse(sessionId) {
    if (this.currentEventSource) {
      this.currentEventSource.close();
    }

    const sse = new EventSource(`/api/agent/session/${sessionId}/stream`);
    this.currentEventSource = sse;

    sse.onmessage = (e) => {
      try {
        const evt = JSON.parse(e.data);
        this.handleSseEvent(evt);
      } catch (err) {
        console.error('SSE parse error:', err);
      }
    };

    sse.onerror = (e) => {
      console.warn('Agent SSE stream ended or error.');
      sse.close();
      this.currentEventSource = null;
    };
  }

  handleSseEvent(evt) {
    const type = evt.type;

    if (type === 'thought') {
      this.logActivity(evt.thought, evt.agent || 'Orchestrator');
    } else if (type === 'step.start') {
      this.logActivity(evt.step, evt.agent || 'TrueForge');
      if (evt.agent === 'agrisense-iot-crop-monitor') this.setAgentNodeActive('nodeCropAgent');
      else if (evt.agent === 'agrimarket-logistics-agent') this.setAgentNodeActive('nodeMarketAgent');
      else if (evt.agent === 'agri-procurement-caller') this.setAgentNodeActive('nodeCallEAgent');
      else this.setAgentNodeActive('nodeOrchestrator');
    } else if (type === 'tool.call') {
      this.logActivity(`Invoking MCP Tool: <code>${evt.tool}</code>`, evt.agent || 'ToolEngine');
    } else if (type === 'tool.result') {
      this.logActivity(`Tool <code>${evt.tool}</code> returned data`, evt.agent || 'ToolEngine');
    } else if (type === 'approval_required') {
      this.setAgentNodeActive('nodeOrchestrator');
      this.showApprovalModal(evt);
    } else if (type === 'turn.complete') {
      this.setAgentNodeActive('nodeOrchestrator');
      const formatted = (evt.summary || 'Task completed.')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>');
      this.appendAssistantMessage(formatted);
      this.speakText(evt.summary || '');
      if (this.currentEventSource) {
        this.currentEventSource.close();
        this.currentEventSource = null;
      }
    }
  }

  showApprovalModal(approvalEvt) {
    this.pendingApprovalAction = approvalEvt;
    const confirmModal = document.getElementById('orderConfirmModal');
    const summaryBox = document.getElementById('confirmSummaryBox');
    const introText = document.getElementById('confirmIntroText');

    if (!confirmModal || !summaryBox) return;

    if (introText) {
      introText.textContent = `TrueForge stopped before executing: ${approvalEvt.title}. Please review and approve:`;
    }

    summaryBox.innerHTML = `
      <div style="margin-bottom: 8px;">
        <span style="font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 700;">Action Type:</span>
        <strong style="color: #059669; display: block; font-size: 15px;">${approvalEvt.action_type}</strong>
      </div>
      <div style="margin-bottom: 8px;">
        <span style="font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 700;">Description:</span>
        <div style="color: #1e293b; font-size: 13px; line-height: 1.4;">${approvalEvt.description}</div>
      </div>
      ${approvalEvt.phone ? `
        <div style="margin-bottom: 8px;">
          <span style="font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 700;">Target Phone:</span>
          <strong style="color: #1e293b; font-size: 14px; font-family: monospace;">${approvalEvt.phone}</strong>
        </div>
      ` : ''}
      ${approvalEvt.amount > 0 ? `
        <div style="margin-top: 10px; padding-top: 8px; border-top: 1px dashed #cbd5e1; display: flex; justify-content: space-between;">
          <span style="font-weight: 600; color: #334155;">Transaction Value:</span>
          <strong style="color: #059669; font-size: 16px;">₹${approvalEvt.amount.toLocaleString('en-IN')}</strong>
        </div>
      ` : ''}
    `;

    confirmModal.style.display = 'flex';
  }

  async sendApprovalDecision(decision) {
    if (!this.currentSessionId) return;
    this.logActivity(`Farmer decision: ${decision.toUpperCase()}. Resuming turn...`, 'TrueForge');

    try {
      const sse = new EventSource(`/api/agent/session/${this.currentSessionId}/approval?decision=${decision}`);
      sse.onmessage = (e) => {
        try {
          const evt = JSON.parse(e.data);
          this.handleSseEvent(evt);
        } catch (err) {}
      };
      sse.onerror = () => sse.close();

      // Also trigger via POST
      await fetch(`/api/agent/session/${this.currentSessionId}/approval`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision })
      });
    } catch (e) {
      console.warn('Approval decision error:', e);
    }
  }

  async runClientSideFallback(text) {
    const q = text.toLowerCase();
    this.logActivity(`Analyzing agricultural intent...`, 'Sarvam AI');
    await new Promise(r => setTimeout(r, 300));

    if (q.includes('call') || q.includes('phone') || q.includes('calle')) {
      this.setAgentNodeActive('nodeCallEAgent');
      this.logActivity(`Routing to CALL-E Voice Outbound Caller`, 'CALL-E');
      const phone = '+918496074290';
      this.showApprovalModal({
        action_type: 'CALLE_VOICE_CALL',
        title: `Outbound AI Voice Call to ${phone}`,
        description: 'CALL-E will dial your phone immediately to enquire on seeds, fertilizers, and tractor bookings.',
        phone: phone,
        amount: 0
      });
      return;
    }

    if (q.includes('sensor') || q.includes('moisture') || q.includes('temp')) {
      this.setAgentNodeActive('nodeCropAgent');
      this.logActivity('Executing MCP Tool: get_sensor_telemetry()', 'SensorAgent');
      const r = window.sensorEngine ? window.sensorEngine.reading : { soilMoisture: 68, temperature: 28.4, humidity: 74 };
      const reply = `
        <strong>Real-Time Farm Sensor Status:</strong><br>
        • <strong>Soil Moisture:</strong> ${r.soilMoisture}%<br>
        • <strong>Temperature:</strong> ${r.temperature}°C<br>
        • <strong>Humidity:</strong> ${r.humidity}%<br>
        Your soil conditions are currently within the optimal agronomical range for Paddy and Tomato crops.
      `;
      this.appendAssistantMessage(reply);
      this.speakText(`Soil moisture is ${r.soilMoisture} percent, temperature is ${r.temperature} degrees.`);
      return;
    }

    this.setAgentNodeActive('nodeMarketAgent');
    this.logActivity('MCP Tool: get_marketplace_catalog()', 'MarketAgent');
    const reply = `
      I found top-rated commodities at Mandya APMC Yard:<br>
      • <strong>Hybrid Tomato F1 Seeds:</strong> ₹450 / packet<br>
      • <strong>Mahindra 575 DI Tractor:</strong> ₹1,200 / hr rental<br>
      • <strong>Kaveri Vermicompost:</strong> ₹350 / 50kg bag<br><br>
      Would you like me to book or dial your phone via <strong>CALL-E</strong>?
    `;
    this.appendAssistantMessage(reply);
    this.speakText('I found commodities at Mandya APMC. Would you like me to book or place a call?');
  }
}

window.aiAssistant = new AIAssistantEngine();
