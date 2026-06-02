/* ========================================
   TRAVEL TRIPPY - AI Travel Chatbot Widget
   ======================================== */

window.TT = window.TT || {};

(function() {
  let isChatOpen = false;
  let hasGreetingShown = false;
  let activeView = 'chat'; // 'chat' or 'history'
  let chatMessagesHtmlBackup = '';

  const chatbotHtml = `
    <!-- Floating Action Button -->
    <button class="chat-fab" id="chat-fab-btn" aria-label="Open Chat Guide">
      <span class="chat-fab-icon">💬</span>
      <span class="chat-fab-badge" id="chat-fab-badge" style="display: none;">1</span>
    </button>

    <!-- Chat Panel Window -->
    <div class="chat-panel" id="chat-panel-win">
      <div class="chat-panel__header">
        <div class="chat-panel__profile">
          <div class="chat-panel__avatar">🤖</div>
          <div>
            <h4 class="chat-panel__name" id="chat-header-title">Trippy AI</h4>
            <span class="chat-panel__status" id="chat-header-status"><span class="status-dot"></span> Online Companion</span>
          </div>
        </div>
        <div style="display:flex; align-items:center; gap:var(--space-2);">
          <button class="chat-panel__btn" id="chat-history-btn" title="View Saved History"><i data-lucide="history" style="width:16px; height:16px;"></i></button>
          <button class="chat-panel__close" id="chat-close-btn" title="Close"><i data-lucide="x"></i></button>
        </div>
      </div>

      <div class="chat-panel__body" id="chat-msg-area">
        <!-- Messages loaded dynamically -->
      </div>

      <div class="chat-panel__suggestions" id="chat-suggestion-chips">
        <button class="suggestion-chip" data-query="weekend">Weekend Getaways 🚗</button>
        <button class="suggestion-chip" data-query="peaceful">Peaceful Solitude 🧘</button>
        <button class="suggestion-chip" data-query="food">Must Try Foods 🍛</button>
        <button class="suggestion-chip" data-query="adventure">Adventure Treks 🧗</button>
        <button class="suggestion-chip" data-query="northeast">North East Secrets 🌿</button>
      </div>

      <form class="chat-panel__footer" id="chat-input-form">
        <input type="text" class="chat-panel__input" id="chat-input-field" placeholder="Ask about destinations, food, plans..." required autocomplete="off">
        <button type="submit" class="chat-panel__send" aria-label="Send Message"><i data-lucide="send"></i></button>
      </form>
    </div>
  `;

  // Dynamic CSS injection for chatbot premium look and feel
  const style = document.createElement('style');
  style.textContent = `
    /* Chat FAB */
    .chat-fab {
      position: fixed;
      bottom: var(--space-6);
      right: var(--space-6);
      width: 60px;
      height: 60px;
      border-radius: var(--radius-full);
      background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
      box-shadow: 0 8px 30px rgba(14, 165, 233, 0.4);
      border: none;
      color: white;
      font-size: 1.8rem;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: var(--z-chatbot);
      transition: all var(--transition-base);
    }
    .chat-fab:hover {
      transform: scale(1.08) translateY(-3px);
      box-shadow: 0 12px 40px rgba(14, 165, 233, 0.5);
    }
    .chat-fab-badge {
      position: absolute;
      top: -3px;
      right: -3px;
      background: var(--color-danger);
      color: white;
      font-size: 0.75rem;
      font-weight: 700;
      width: 20px;
      height: 20px;
      border-radius: var(--radius-full);
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid var(--bg-primary);
      animation: pulse 2s infinite;
    }

    /* Chat Panel Window */
    .chat-panel {
      position: fixed;
      bottom: 96px;
      right: var(--space-6);
      width: 380px;
      height: 520px;
      max-height: calc(100vh - 120px);
      border-radius: var(--radius-xl);
      background: var(--glass-bg);
      backdrop-filter: blur(var(--glass-blur));
      -webkit-backdrop-filter: blur(var(--glass-blur));
      border: 1px solid var(--glass-border);
      box-shadow: var(--shadow-2xl);
      display: flex;
      flex-direction: column;
      z-index: var(--z-chatbot);
      overflow: hidden;
      opacity: 0;
      transform: translateY(20px) scale(0.95);
      pointer-events: none;
      transition: all var(--transition-base);
    }
    .chat-panel.open {
      opacity: 1;
      transform: translateY(0) scale(1);
      pointer-events: all;
    }
    
    .chat-panel__header {
      padding: var(--space-4) var(--space-5);
      background: linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-primary) 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    .chat-panel__profile {
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }
    .chat-panel__avatar {
      width: 36px;
      height: 36px;
      border-radius: var(--radius-full);
      background: rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
    }
    .chat-panel__name {
      font-size: var(--fs-base);
      font-weight: 600;
      font-family: var(--font-heading);
    }
    .chat-panel__status {
      font-size: var(--fs-xs);
      color: rgba(255, 255, 255, 0.8);
      display: flex;
      align-items: center;
      gap: var(--space-1);
    }
    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #10B981;
      display: inline-block;
      box-shadow: 0 0 8px #10B981;
    }
    
    .chat-panel__btn {
      color: rgba(255, 255, 255, 0.8);
      background: none;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-1);
      transition: color var(--transition-fast), transform var(--transition-fast);
    }
    .chat-panel__btn:hover {
      color: white;
      transform: scale(1.1);
    }
    
    .chat-panel__close {
      color: rgba(255, 255, 255, 0.8);
      font-size: 1.2rem;
      transition: color var(--transition-fast);
    }
    .chat-panel__close:hover {
      color: white;
    }

    .chat-panel__body {
      flex: 1;
      padding: var(--space-5);
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
      background: rgba(248, 250, 252, 0.3);
    }
    [data-theme="dark"] .chat-panel__body {
      background: rgba(15, 23, 42, 0.3);
    }

    /* Message styling */
    .chat-msg {
      max-width: 80%;
      padding: var(--space-3) var(--space-4);
      border-radius: var(--radius-lg);
      font-size: var(--fs-sm);
      line-height: 1.5;
      animation: slideInRight 0.3s var(--ease-out);
      white-space: pre-wrap;
    }
    .chat-msg--bot {
      background: var(--bg-card);
      color: var(--text-primary);
      border-bottom-left-radius: var(--radius-sm);
      border: 1px solid var(--border-color);
      align-self: flex-start;
      box-shadow: var(--shadow-sm);
    }
    .chat-msg--user {
      background: var(--color-primary);
      color: white;
      border-bottom-right-radius: var(--radius-sm);
      align-self: flex-end;
      box-shadow: var(--shadow-sm);
    }

    .chat-msg-time {
      font-size: 0.65rem;
      color: var(--text-muted);
      margin-top: var(--space-1);
      text-align: right;
    }
    .chat-msg--user .chat-msg-time {
      color: rgba(255, 255, 255, 0.7);
    }

    /* Typing Indicator */
    .typing-indicator {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: var(--space-2) var(--space-3) !important;
    }
    .typing-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--text-muted);
      animation: blink 1.4s infinite both;
    }
    .typing-dot:nth-child(2) { animation-delay: .2s; }
    .typing-dot:nth-child(3) { animation-delay: .4s; }

    @keyframes blink {
      0% { opacity: .2; }
      20% { opacity: 1; }
      100% { opacity: .2; }
    }

    /* Suggestions */
    .chat-panel__suggestions {
      padding: var(--space-3) var(--space-4);
      display: flex;
      gap: var(--space-2);
      overflow-x: auto;
      white-space: nowrap;
      border-top: 1px solid var(--border-color);
      background: var(--bg-primary);
      scrollbar-width: none; /* Hide for firefox */
    }
    .chat-panel__suggestions::-webkit-scrollbar {
      display: none; /* Hide for chrome */
    }
    .suggestion-chip {
      padding: var(--space-2) var(--space-4);
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-full);
      font-size: var(--fs-xs);
      font-weight: 500;
      color: var(--text-secondary);
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    .suggestion-chip:hover {
      background: var(--color-primary-light);
      color: white;
      border-color: var(--color-primary);
    }

    /* Footer */
    .chat-panel__footer {
      padding: var(--space-3) var(--space-4);
      border-top: 1px solid var(--border-color);
      display: flex;
      gap: var(--space-2);
      background: var(--bg-primary);
    }
    .chat-panel__input {
      flex: 1;
      padding: var(--space-2) var(--space-4);
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-full);
      font-size: var(--fs-sm);
      outline: none;
      transition: all var(--transition-fast);
    }
    .chat-panel__input:focus {
      border-color: var(--color-primary);
      background: var(--bg-primary);
      box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
    }
    .chat-panel__send {
      width: 36px;
      height: 36px;
      border-radius: var(--radius-full);
      background: var(--color-primary);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all var(--transition-fast);
    }
    .chat-panel__send:hover {
      background: var(--color-primary-dark);
      transform: scale(1.05);
    }

    /* SQLite History Visuals */
    .history-header {
      border-bottom: 1px solid var(--border-color);
      padding-bottom: var(--space-3);
      margin-bottom: var(--space-4);
    }
    .history-item {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: var(--space-3) var(--space-4);
      box-shadow: var(--shadow-sm);
      cursor: pointer;
      transition: all var(--transition-fast);
    }
    .history-item:hover {
      border-color: var(--color-primary-light);
      transform: translateY(-1px);
      box-shadow: var(--shadow-md);
    }
    .history-item__q {
      font-weight: 700;
      font-size: var(--fs-sm);
      color: var(--text-primary);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .history-item__a {
      font-size: var(--fs-xs);
      color: var(--text-secondary);
      margin-top: var(--space-1);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .history-item__time {
      font-size: 0.6rem;
      color: var(--text-muted);
    }

    @media (max-width: 480px) {
      .chat-panel {
        width: calc(100% - 32px);
        left: 16px;
        right: 16px;
        bottom: 80px;
        height: 460px;
      }
      .chat-fab {
        bottom: var(--space-4);
        right: var(--space-4);
      }
    }
  `;
  document.head.appendChild(style);

  TT.chatbot = {
    init: () => {
      const container = document.getElementById('chatbot-container');
      if (!container) return;

      container.innerHTML = chatbotHtml;
      lucide.createIcons({
        attrs: {
          class: 'lucide-icon'
        }
      });

      // Bind events
      const fab = document.getElementById('chat-fab-btn');
      const panel = document.getElementById('chat-panel-win');
      const closeBtn = document.getElementById('chat-close-btn');
      const historyBtn = document.getElementById('chat-history-btn');
      const form = document.getElementById('chat-input-form');
      const input = document.getElementById('chat-input-field');
      const msgArea = document.getElementById('chat-msg-area');
      const badge = document.getElementById('chat-fab-badge');

      // Unhide notification after 5 seconds to prompt user
      setTimeout(() => {
        if (!isChatOpen && !hasGreetingShown) {
          badge.style.display = 'flex';
        }
      }, 5000);

      fab.addEventListener('click', () => {
        isChatOpen = !isChatOpen;
        badge.style.display = 'none'; // Clear badge
        if (isChatOpen) {
          panel.classList.add('open');
          input.focus();
          if (!hasGreetingShown) {
            showGreeting();
          }
        } else {
          panel.classList.remove('open');
        }
      });

      closeBtn.addEventListener('click', () => {
        isChatOpen = false;
        panel.classList.remove('open');
      });

      historyBtn.addEventListener('click', () => {
        toggleHistoryMode();
      });

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = input.value.trim();
        if (!text) return;

        input.value = '';
        addUserMessage(text);
        respondToUser(text);
      });

      // Suggestion chips handler
      document.getElementById('chat-suggestion-chips').addEventListener('click', (e) => {
        const chip = e.target.closest('.suggestion-chip');
        if (!chip) return;
        const text = chip.textContent.trim().replace(/[^a-zA-Z0-9\s]/g, '').trim();
        addUserMessage(text);
        respondToUser(chip.getAttribute('data-query') || text);
      });

      function showGreeting() {
        hasGreetingShown = true;
        addBotMessage("Namaste! 🙏 I'm Trippy AI, your travel companion! I know India's best-kept secrets — hidden waterfalls, ancient villages, scenic trails, and local foods. What are you looking to explore? 🏔️🍜\n\nTry asking me:\n• \"Tell me about Spiti Valley\"\n• \"Suggest peaceful spots near Bangalore\"\n• \"Best food in Meghalaya\"\n• \"Plan a 3-day adventure trip\"");
      }

      function addUserMessage(text) {
        appendMessage(text, 'user');
      }

      function addBotMessage(text) {
        appendMessage(text, 'bot');
      }

      function appendMessage(text, sender) {
        const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
        const msgHtml = `
          <div class="chat-msg chat-msg--${sender}">
            <div class="chat-msg-text">${text}</div>
            <div class="chat-msg-time">${time}</div>
          </div>
        `;
        msgArea.insertAdjacentHTML('beforeend', msgHtml);
        msgArea.scrollTop = msgArea.scrollHeight;
      }

      function showTypingIndicator() {
        const indicatorHtml = `
          <div class="chat-msg chat-msg--bot typing-indicator" id="chat-typing-indicator">
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
          </div>
        `;
        msgArea.insertAdjacentHTML('beforeend', indicatorHtml);
        msgArea.scrollTop = msgArea.scrollHeight;
      }

      function removeTypingIndicator() {
        const el = document.getElementById('chat-typing-indicator');
        if (el) el.remove();
      }

      function respondToUser(promptText) {
        showTypingIndicator();

        // Simulate network/thinking delay
        setTimeout(() => {
          removeTypingIndicator();

          const lowerText = promptText.toLowerCase();
          let matched = null;

          // Find matches in patterns
          for (const pattern of TT.chatPatterns) {
            const matches = pattern.keywords.some(keyword => lowerText.includes(keyword));
            if (matches) {
              matched = pattern;
              break;
            }
          }

          // Let's add extra smart check for exact destination names
          let matchedDest = null;
          for (const dest of TT.destinations) {
            if (lowerText.includes(dest.id) || lowerText.includes(dest.name.toLowerCase())) {
              matchedDest = dest;
              break;
            }
          }

          let responseText = "";
          if (matchedDest) {
            responseText = `🏞️ **${matchedDest.name}** (${matchedDest.state}) is a fantastic choice!\n\n*"${matchedDest.tagline}"*\n\n${matchedDest.description}\n\n💡 **Local Insight:** ${matchedDest.localInsight}\n\n🚗 **How to reach:** It is ${matchedDest.nearestCity.distance} km from ${matchedDest.nearestCity.name} (takes about ${matchedDest.nearestCity.travelTime}).\n\n🍽️ **Local Foods:** ${matchedDest.foods.join(', ')}.\n\n🎒 **Activities:** ${matchedDest.activities.join(', ')}.\n\nType **"${matchedDest.id}"** to see more, or check it out in the Explorer! [View Detail](#/destination/${matchedDest.id})`;
            addBotMessage(responseText);
          } else if (matched) {
            responseText = matched.response;
            addBotMessage(responseText);
          } else {
            responseText = "That sounds like a beautiful plan! 🌏 Tell me a bit more about your interest: do you want high-altitude mountain scenery, ancient forts, pristine beaches, or local food crawls? Or give me a starting city and let's craft a trip!";
            addBotMessage(responseText);
          }

          // Save the conversation to the SQLite backend!
          saveConversationToSQLite(promptText, responseText);

        }, 1000);
      }

      // Save to SQLite
      function saveConversationToSQLite(promptText, responseText) {
        fetch('/api/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: promptText, response: responseText })
        })
        .then(res => res.json())
        .then(data => {
          console.log('Saved conversation turn in SQLite DB:', data);
        })
        .catch(err => {
          console.warn('Failed to save to SQLite database (running static only):', err);
        });
      }

      // Toggle SQLite History View
      function toggleHistoryMode() {
        if (activeView === 'chat') {
          activeView = 'history';
          chatMessagesHtmlBackup = msgArea.innerHTML; // backup active chat logs
          
          document.getElementById('chat-header-title').textContent = "Conversation History";
          document.getElementById('chat-header-status').innerHTML = "📜 SQLite Database Logging";
          document.getElementById('chat-suggestion-chips').style.display = 'none';
          document.getElementById('chat-input-form').style.display = 'none';
          historyBtn.innerHTML = `<i data-lucide="message-square" style="width:16px; height:16px;"></i>`;
          lucide.createIcons({ attrs: { class: 'lucide-icon' } });

          renderHistoryList();
        } else {
          activeView = 'chat';
          msgArea.innerHTML = chatMessagesHtmlBackup; // restore chat logs
          
          document.getElementById('chat-header-title').textContent = "Trippy AI";
          document.getElementById('chat-header-status').innerHTML = `<span class="status-dot"></span> Online Companion`;
          document.getElementById('chat-suggestion-chips').style.display = 'flex';
          document.getElementById('chat-input-form').style.display = 'flex';
          historyBtn.innerHTML = `<i data-lucide="history" style="width:16px; height:16px;"></i>`;
          lucide.createIcons({ attrs: { class: 'lucide-icon' } });
          
          msgArea.scrollTop = msgArea.scrollHeight;
        }
      }

      // Load and Render SQLite Database History
      function renderHistoryList() {
        msgArea.innerHTML = `
          <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding: 20px 0; color:var(--text-tertiary);" id="history-loading-indicator">
            <span class="spinner" style="width:24px; height:24px; border-width:3px; display:block; margin-bottom:8px;"></span>
            <span style="font-size:var(--fs-xs);">Accessing SQLite database...</span>
          </div>
        `;

        fetch('/api/conversations')
          .then(res => res.json())
          .then(data => {
            if (activeView !== 'history') return; // User switched back

            if (data.status === 'success' && data.history && data.history.length > 0) {
              const itemsHtml = data.history.map(item => {
                // Parse timestamp
                let displayTime = item.timestamp;
                try {
                  const date = new Date(item.timestamp);
                  displayTime = date.toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                } catch(e) {}

                return `
                  <div class="history-item" data-history-id="${item.id}">
                    <div class="history-item__q">
                      <span>💬 ${escapeHtml(item.prompt.substring(0, 30))}${item.prompt.length > 30 ? '...' : ''}</span>
                      <span class="history-item__time">${displayTime}</span>
                    </div>
                    <div class="history-item__a">🤖 ${escapeHtml(item.response.substring(0, 45))}${item.response.length > 45 ? '...' : ''}</div>
                  </div>
                `;
              }).join('');

              msgArea.innerHTML = `
                <div class="history-header flex flex--between">
                  <span style="font-weight:700; font-size:var(--fs-xs); color:var(--text-secondary);">Past Scans (${data.history.length})</span>
                  <button class="suggestion-chip" id="history-back-chip" style="margin:0; padding:2px 8px; font-size:0.65rem;">Back to Chat ↩️</button>
                </div>
                <div class="flex flex--col" style="gap:var(--space-3); width:100%;">
                  ${itemsHtml}
                </div>
              `;

              document.getElementById('history-back-chip').addEventListener('click', toggleHistoryMode);

              // Click handler on history cards to load and display details inside the body!
              msgArea.querySelectorAll('.history-item').forEach(card => {
                card.addEventListener('click', () => {
                  const histId = parseInt(card.getAttribute('data-history-id'));
                  const match = data.history.find(h => h.id === histId);
                  if (match) {
                    displayHistoryDetail(match);
                  }
                });
              });

            } else {
              msgArea.innerHTML = `
                <div class="history-header flex flex--between">
                  <span style="font-weight:700; font-size:var(--fs-xs); color:var(--text-secondary);">Past Scans (0)</span>
                  <button class="suggestion-chip" id="history-back-chip" style="margin:0; padding:2px 8px; font-size:0.65rem;">Back to Chat ↩️</button>
                </div>
                <div style="text-align:center; padding: 40px var(--space-4); color:var(--text-tertiary);">
                  <div style="font-size:2rem; margin-bottom:8px;">📜</div>
                  <h4 style="font-size:var(--fs-sm); font-weight:700;">No past records logged</h4>
                  <p style="font-size:var(--fs-xs); max-width:200px; margin: 4px auto 0 auto;">Active conversations will be safely committed to the SQLite file.</p>
                </div>
              `;
              document.getElementById('history-back-chip').addEventListener('click', toggleHistoryMode);
            }
          })
          .catch(err => {
            console.error('Failed to load history:', err);
            if (activeView !== 'history') return;
            msgArea.innerHTML = `
              <div class="history-header flex flex--between">
                <span style="font-weight:700; font-size:var(--fs-xs); color:var(--text-secondary);">Error accessing database</span>
                <button class="suggestion-chip" id="history-back-chip" style="margin:0; padding:2px 8px; font-size:0.65rem;">Back to Chat ↩️</button>
              </div>
              <div style="text-align:center; padding:40px var(--space-4); color:var(--text-danger);">
                <div style="font-size:2rem; margin-bottom:8px;">❌</div>
                <h4 style="font-size:var(--fs-sm); font-weight:700;">SQLite Disconnected</h4>
                <p style="font-size:var(--fs-xs); color:var(--text-tertiary); max-width:220px; margin:4px auto 0 auto;">Make sure you are running with the Python server (server.py) instead of static http.server.</p>
              </div>
            `;
            document.getElementById('history-back-chip').addEventListener('click', toggleHistoryMode);
          });
      }

      // Display the single history details turn inside the chatbot body
      function displayHistoryDetail(item) {
        msgArea.innerHTML = `
          <div class="history-header flex flex--between">
            <button class="suggestion-chip" id="history-detail-back" style="margin:0; padding:2px 8px; font-size:0.65rem;">← Back to History</button>
          </div>
          
          <div class="flex flex--col" style="gap:var(--space-4); margin-top:var(--space-3);">
            <!-- Prompt -->
            <div class="chat-msg chat-msg--user" style="align-self:flex-end; max-width:90%;">
              <div class="chat-msg-text">${escapeHtml(item.prompt)}</div>
            </div>
            
            <!-- Response -->
            <div class="chat-msg chat-msg--bot" style="align-self:flex-start; max-width:90%; border:1px solid var(--border-color);">
              <div class="chat-msg-text">${item.response}</div>
            </div>
          </div>
        `;

        document.getElementById('history-detail-back').addEventListener('click', renderHistoryList);
      }

      function escapeHtml(text) {
        return text
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#039;");
      }
    }
  };
})();

