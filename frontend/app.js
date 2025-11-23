class InterviewPracticeApp {
    constructor() {
        this.apiBaseUrl = 'http://localhost:8000';
        this.isConnected = false;
        this.messages = [];
        this.isInIntroFlow = false;
        this.introData = {};
        this.introStep = 0;
        this.introResponses = []; // Store user's introduction responses
        
        // Speech recognition setup
        this.recognition = null;
        this.isListening = false;
        this.setupSpeechRecognition();
        
        // Speech synthesis setup
        this.speechSynthesis = window.speechSynthesis;
        this.isSpeaking = false;
        this.currentUtterance = null;
        this.speechEnabled = true;
        this.setupSpeechSynthesis();
        
        this.initializeElements();
        this.bindEvents();
        this.checkConnection();
    }

    initializeElements() {
        // Screens
        this.welcomeScreen = document.getElementById('welcomeScreen');
        this.chatInterface = document.getElementById('chatInterface');
        
        // Welcome screen elements
        this.nameInput = document.getElementById('nameInput');
        this.experienceInput = document.getElementById('experienceInput');
        this.roleInput = document.getElementById('roleInput');
        this.companyInput = document.getElementById('companyInput');
        this.interviewTypeInput = document.getElementById('interviewTypeInput');
        this.difficultyInput = document.getElementById('difficultyInput');
        this.additionalInfoInput = document.getElementById('additionalInfoInput');
        this.startBtn = document.getElementById('startBtn');
        
        // Chat interface elements
        this.chatMessages = document.getElementById('chatMessages');
        this.messageInput = document.getElementById('messageInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.voiceBtn = document.getElementById('voiceBtn');
        this.speakerBtn = document.getElementById('speakerBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.endInterviewBtn = document.getElementById('endInterviewBtn');
        
        // Status and utility elements
        this.connectionStatus = document.getElementById('connectionStatus');
        this.loadingOverlay = document.getElementById('loadingOverlay');
        this.errorModal = document.getElementById('errorModal');
        this.errorMessage = document.getElementById('errorMessage');
        this.modalClose = document.getElementById('modalClose');
        this.retryBtn = document.getElementById('retryBtn');
        this.charCount = document.getElementById('charCount');
        this.voiceStatus = document.getElementById('voiceStatus');
        
        // Feedback modal elements
        this.feedbackModal = document.getElementById('feedbackModal');
        this.feedbackModalClose = document.getElementById('feedbackModalClose');
        this.downloadFeedbackBtn = document.getElementById('downloadFeedbackBtn');
        this.startNewInterviewBtn = document.getElementById('startNewInterviewBtn');
    }

    bindEvents() {
        // Welcome screen events
        this.startBtn.addEventListener('click', () => this.startInterview());
        
        // Form validation on input change
        [this.nameInput, this.experienceInput, this.roleInput, this.interviewTypeInput, this.difficultyInput].forEach(input => {
            input.addEventListener('change', () => this.validateForm());
            input.addEventListener('input', () => this.validateForm());
        });
        
        // Enter key handling for text inputs
        [this.nameInput, this.roleInput, this.companyInput].forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.startInterview();
                }
            });
        });

        // Chat interface events
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.voiceBtn.addEventListener('click', () => this.toggleVoiceInput());
        this.speakerBtn.addEventListener('click', () => this.toggleSpeechOutput());
        this.endInterviewBtn.addEventListener('click', () => this.endInterview());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        this.messageInput.addEventListener('input', () => this.updateCharCount());
        this.resetBtn.addEventListener('click', () => this.resetSession());

        // Modal events
        this.modalClose.addEventListener('click', () => this.hideModal());
        this.retryBtn.addEventListener('click', () => {
            this.hideModal();
            this.checkConnection();
        });
        
        // Feedback modal events
        this.feedbackModalClose.addEventListener('click', () => this.hideFeedbackModal());
        this.downloadFeedbackBtn.addEventListener('click', () => this.downloadFeedbackPDF());
        this.startNewInterviewBtn.addEventListener('click', () => {
            this.hideFeedbackModal();
            this.resetSession();
        });

        // Auto-resize textarea
        this.messageInput.addEventListener('input', () => this.autoResizeTextarea());
        this.additionalInfoInput.addEventListener('input', () => this.autoResizeTextarea());
    }

    async checkConnection() {
        this.updateConnectionStatus('connecting', 'Connecting...');
        
        try {
            const response = await fetch(`${this.apiBaseUrl}/health`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.status === 'healthy') {
                    this.isConnected = true;
                    this.updateConnectionStatus('connected', 'Connected');
                } else {
                    throw new Error('Backend is unhealthy');
                }
            } else {
                throw new Error(`HTTP ${response.status}`);
            }
        } catch (error) {
            console.error('Connection check failed:', error);
            this.isConnected = false;
            this.updateConnectionStatus('disconnected', 'Disconnected');
            this.showError('Unable to connect to the interview practice server. Please make sure the backend is running on localhost:8000.');
        }
    }

    updateConnectionStatus(status, text) {
        this.connectionStatus.className = `connection-status ${status}`;
        this.connectionStatus.querySelector('span').textContent = text;
    }

    async startInterview() {
        if (!this.validateForm()) {
            this.showError('Please fill in all required fields before starting the interview.');
            return;
        }

        if (!this.isConnected) {
            this.showError('Not connected to server. Please check your connection and try again.');
            return;
        }

        this.showLoading();
        this.startBtn.disabled = true;

        try {
            // Collect and store form data
            this.introData = this.collectFormData();
            
            // Start interactive introduction flow
            this.isInIntroFlow = true;
            this.introStep = 0;
            
            // Switch to chat interface
            this.showChatInterface();
            
            // Start with first introduction question
            await this.startIntroFlow();
            
        } catch (error) {
            console.error('Failed to start interview:', error);
            this.showError('Failed to start the interview. Please try again.');
        } finally {
            this.hideLoading();
            this.startBtn.disabled = false;
        }
    }

    async sendMessage() {
        const message = this.messageInput.value.trim();
        
        if (!message) return;
        if (!this.isConnected) {
            this.showError('Not connected to server. Please check your connection.');
            return;
        }

        // Disable input while processing
        this.messageInput.disabled = true;
        this.sendBtn.disabled = true;

        try {
            // Add user message
            this.messages.push({
                role: 'user',
                content: message,
                timestamp: new Date()
            });
            
            // Clear input and update UI
            this.messageInput.value = '';
            this.updateCharCount();
            this.renderMessages();

            // NOW show thinking indicator after user message is displayed
            this.showTypingIndicator();

            if (this.isInIntroFlow) {
                // Handle introduction flow
                await this.handleIntroResponse(message);
            } else {
                // Regular interview conversation
                const response = await this.sendChatToBackend();
                
                if (response && response.message && response.message.content) {
                    // Hide thinking indicator before adding real response
                    this.hideTypingIndicator();
                    
                    this.messages.push({
                        role: 'assistant',
                        content: response.message.content,
                        timestamp: new Date()
                    });
                    
                    this.renderMessages();
                } else {
                    throw new Error('Invalid response from server');
                }
            }
        } catch (error) {
            console.error('Failed to send message:', error);
            this.hideTypingIndicator(); // Hide thinking indicator on error
            this.showError('Failed to send message. Please try again.');
        } finally {
            this.messageInput.disabled = false;
            this.sendBtn.disabled = false;
            this.messageInput.focus();
        }
    }

    async sendToBackend(message, isRetry = false) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/simple-chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    model: 'mistral'
                })
            });

            if (!response.ok) {
                // Check if it's a 5XX server error and not already a retry
                if (this.isServerError(response.status) && !isRetry) {
                    const retryResult = await this.showRetryPopup(this.sendToBackend.bind(this), [message, true]);
                    if (retryResult.success) {
                        return retryResult.data;
                    } else {
                        throw retryResult.error;
                    }
                } else {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
            }

            return await response.json();
        } catch (error) {
            // If it's a network error and not already a retry, also try to recover
            if (!isRetry && (error.name === 'TypeError' || error.message.includes('fetch'))) {
                const retryResult = await this.showRetryPopup(this.sendToBackend.bind(this), [message, true]);
                if (retryResult.success) {
                    return retryResult.data;
                } else {
                    throw retryResult.error;
                }
            }
            throw error;
        }
    }

    async sendChatToBackend(isRetry = false) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'mistral',
                    messages: this.messages.map(msg => ({
                        role: msg.role,
                        content: msg.content
                    })),
                    stream: false
                })
            });

            if (!response.ok) {
                // Check if it's a 5XX server error and not already a retry
                if (this.isServerError(response.status) && !isRetry) {
                    const retryResult = await this.showRetryPopup(this.sendChatToBackend.bind(this), [true]);
                    if (retryResult.success) {
                        return retryResult.data;
                    } else {
                        throw retryResult.error;
                    }
                } else {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
            }

            return await response.json();
        } catch (error) {
            // If it's a network error and not already a retry, also try to recover
            if (!isRetry && (error.name === 'TypeError' || error.message.includes('fetch'))) {
                const retryResult = await this.showRetryPopup(this.sendChatToBackend.bind(this), [true]);
                if (retryResult.success) {
                    return retryResult.data;
                } else {
                    throw retryResult.error;
                }
            }
            throw error;
        }
    }

    showChatInterface() {
        this.welcomeScreen.style.display = 'none';
        this.chatInterface.style.display = 'flex';
    }

    renderMessages() {
        const wasAtBottom = this.isScrolledToBottom();
        
        this.chatMessages.innerHTML = '';
        
        this.messages.forEach(message => {
            const messageElement = this.createMessageElement(message);
            this.chatMessages.appendChild(messageElement);
        });

        // Scroll behavior: if user was at bottom or if it's a new message, scroll to show the new message
        if (wasAtBottom || this.messages.length <= 2) {
            this.scrollToBottom();
        } else {
            // If user has scrolled up, just ensure the latest message is visible without forcing scroll
            this.scrollToShowLatest();
        }
    }

    isScrolledToBottom() {
        const threshold = 100; // pixels from bottom
        return this.chatMessages.scrollTop + this.chatMessages.clientHeight >= 
               this.chatMessages.scrollHeight - threshold;
    }

    scrollToBottom() {
        setTimeout(() => {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }, 100);
    }

    scrollToShowLatest() {
        const messages = this.chatMessages.children;
        if (messages.length > 0) {
            const latestMessage = messages[messages.length - 1];
            latestMessage.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'end',
                inline: 'nearest' 
            });
        }
    }

    createMessageElement(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${message.role === 'user' ? 'user' : 'ai'}`;

        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = message.role === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        // Handle thinking indicator
        if (message.isThinking) {
            contentDiv.className += ' thinking';
            contentDiv.innerHTML = `
                <div class="thinking-animation">
                    <span class="thinking-dot"></span>
                    <span class="thinking-dot"></span>
                    <span class="thinking-dot"></span>
                </div>
                <span class="thinking-text">AI is thinking...</span>
            `;
        }
        // Format the message content based on role
        else if (message.role === 'assistant') {
            contentDiv.innerHTML = this.formatAIResponse(message.content);
            
            // Speak the AI response if speech is enabled
            if (this.speechEnabled && !message.isSpoken) {
                this.speakText(message.content);
                message.isSpoken = true; // Mark as spoken to avoid repetition
            }
        } else {
            contentDiv.textContent = message.content;
        }

        const timeDiv = document.createElement('div');
        timeDiv.className = 'message-time';
        
        // Don't show time for thinking indicator
        if (!message.isThinking) {
            timeDiv.textContent = this.formatTime(message.timestamp);
        }

        const messageContent = document.createElement('div');
        messageContent.appendChild(contentDiv);
        if (!message.isThinking) {
            messageContent.appendChild(timeDiv);
        }

        messageDiv.appendChild(avatar);
        messageDiv.appendChild(messageContent);

        return messageDiv;
    }

    resetSession() {
        if (confirm('Are you sure you want to start a new session? All conversation history will be lost.')) {
            this.messages = [];
            this.isInIntroFlow = false;
            this.introData = {};
            this.introStep = 0;
            this.introResponses = [];
            
            // Stop any ongoing speech
            this.stopSpeaking();
            
            this.clearForm();
            this.messageInput.value = '';
            this.updateCharCount();
            this.welcomeScreen.style.display = 'flex';
            this.chatInterface.style.display = 'none';
            this.nameInput.focus();
        }
    }

    showLoading() {
        this.loadingOverlay.style.display = 'flex';
    }

    hideLoading() {
        this.loadingOverlay.style.display = 'none';
    }

    showTypingIndicator() {
        // Create and add AI thinking message to chat
        const thinkingMessage = {
            role: 'assistant',
            content: '',
            timestamp: new Date(),
            isThinking: true
        };
        
        this.messages.push(thinkingMessage);
        this.renderMessages();
    }

    hideTypingIndicator() {
        // Remove the thinking message from the end of messages array
        if (this.messages.length > 0 && this.messages[this.messages.length - 1].isThinking) {
            this.messages.pop();
        }
    }

    showError(message) {
        this.errorMessage.textContent = message;
        this.errorModal.style.display = 'flex';
    }

    hideModal() {
        this.errorModal.style.display = 'none';
    }

    isServerError(status) {
        return status >= 500 && status <= 599;
    }

    async showRetryPopup(originalRequest, originalParams) {
        return new Promise((resolve) => {
            const retryMessage = `We encountered a server issue. The system will automatically retry after checking server health.`;
            this.errorMessage.textContent = retryMessage;
            this.errorModal.style.display = 'flex';
            
            // Hide retry button and show automatic retry message
            this.retryBtn.style.display = 'none';
            const autoRetryText = document.createElement('div');
            autoRetryText.style.cssText = 'margin-top: 15px; color: #64748b; font-size: 14px; text-align: center;';
            autoRetryText.textContent = 'Checking server health and retrying...';
            this.errorMessage.parentNode.appendChild(autoRetryText);
            
            // Auto-retry after 2 seconds
            setTimeout(async () => {
                // Check server health first
                await this.checkConnection();
                
                // Hide modal
                this.hideModal();
                this.retryBtn.style.display = 'block';
                if (autoRetryText.parentNode) {
                    autoRetryText.parentNode.removeChild(autoRetryText);
                }
                
                // If connected, retry the original request
                if (this.isConnected) {
                    try {
                        const result = await originalRequest(...originalParams);
                        resolve({ success: true, data: result });
                    } catch (retryError) {
                        resolve({ success: false, error: retryError });
                    }
                } else {
                    resolve({ success: false, error: new Error('Server is still unavailable') });
                }
            }, 2000);
        });
    }

    updateCharCount() {
        const length = this.messageInput.value.length;
        this.charCount.textContent = `${length}/1000`;
        
        if (length > 900) {
            this.charCount.style.color = '#ef4444';
        } else if (length > 800) {
            this.charCount.style.color = '#f59e0b';
        } else {
            this.charCount.style.color = '#64748b';
        }
    }

    autoResizeTextarea() {
        const textarea = event.target;
        textarea.style.height = 'auto';
        const newHeight = Math.min(textarea.scrollHeight, 120);
        textarea.style.height = newHeight + 'px';
    }

    formatTime(timestamp) {
        return timestamp.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    }

    validateForm() {
        const name = this.nameInput.value.trim();
        const experience = this.experienceInput.value;
        const role = this.roleInput.value.trim();
        const interviewType = this.interviewTypeInput.value;
        const difficulty = this.difficultyInput.value;
        
        const isValid = name && experience && role && interviewType && difficulty;
        
        // Update button state
        this.startBtn.disabled = !isValid || !this.isConnected;
        
        return isValid;
    }

    collectFormData() {
        return {
            name: this.nameInput.value.trim(),
            experience: this.experienceInput.value,
            role: this.roleInput.value.trim(),
            company: this.companyInput.value.trim(),
            interviewType: this.interviewTypeInput.value,
            difficulty: this.difficultyInput.value,
            additionalInfo: this.additionalInfoInput.value.trim()
        };
    }

    formatIntroduction(data) {
        let introduction = `Hello, my name is ${data.name}. I have ${data.experience} of professional experience`;
        
        if (data.company) {
            introduction += ` and I'm preparing for a ${data.role} position at ${data.company}.`;
        } else {
            introduction += ` and I'm preparing for a ${data.role} position.`;
        }
        
        introduction += ` I would like to practice a ${data.interviewType.toLowerCase()} interview at ${data.difficulty.toLowerCase()} difficulty level.`;
        
        if (data.additionalInfo) {
            introduction += ` Additionally, ${data.additionalInfo}`;
        }
        
        introduction += ` Please act as my interviewer and start with an appropriate opening question based on my background and the type of interview I've requested.`;
        
        return introduction;
    }

    clearForm() {
        this.nameInput.value = '';
        this.experienceInput.value = '';
        this.roleInput.value = '';
        this.companyInput.value = '';
        this.interviewTypeInput.value = '';
        this.difficultyInput.value = '';
        this.additionalInfoInput.value = '';
        this.validateForm();
    }

    formatAIResponse(content) {
        if (!content) return '';
        
        // Escape HTML to prevent XSS attacks
        let formatted = content
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');

        // Handle different formatting patterns
        formatted = this.formatBulletPoints(formatted);
        formatted = this.formatNumberedLists(formatted);
        formatted = this.formatLineBreaks(formatted);
        formatted = this.formatBoldText(formatted);
        formatted = this.formatTabs(formatted);
        formatted = this.formatCodeBlocks(formatted);
        
        return formatted;
    }

    formatBulletPoints(text) {
        // Handle various bullet point patterns
        return text
            // Handle "• " or "- " at start of line
            .replace(/^[\s]*[•\-\*]\s+(.+)$/gm, '<div class="bullet-point">• $1</div>')
            // Handle multiple spaces before bullet points
            .replace(/^[\s]{2,}[•\-\*]\s+(.+)$/gm, '<div class="bullet-point indent">• $1</div>');
    }

    formatNumberedLists(text) {
        // Handle numbered lists like "1. ", "2. ", etc.
        return text.replace(/^[\s]*(\d+)[\.\)]\s+(.+)$/gm, '<div class="numbered-point">$1. $2</div>');
    }

    formatLineBreaks(text) {
        // Convert newlines to <br> tags, but preserve existing HTML
        return text
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .join('<br><br>');
    }

    formatBoldText(text) {
        // Handle **bold** or __bold__ patterns
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/__(.*?)__/g, '<strong>$1</strong>');
    }

    formatTabs(text) {
        // Convert tab characters to proper spacing
        return text.replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;');
    }

    formatCodeBlocks(text) {
        // Handle simple code blocks with backticks
        return text
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            .replace(/```([^```]+)```/g, '<pre><code>$1</code></pre>');
    }

    async startIntroFlow() {
        // Start with a welcoming message and first question
        const welcomeMessage = `Hello ${this.introData.name}! Welcome to your interview practice session. I'll be your interviewer today. Let me get to know you better before we begin.

First, could you tell me a bit about yourself and your background?`;
        
        this.messages = [{
            role: 'assistant',
            content: welcomeMessage,
            timestamp: new Date()
        }];
        
        this.renderMessages();
    }

    async handleIntroResponse(userResponse) {
        // Store the user's response with context
        const responseData = {
            step: this.introStep,
            question: this.getQuestionForStep(this.introStep),
            response: userResponse,
            timestamp: new Date()
        };
        
        this.introResponses.push(responseData);
        this.introStep++;
        
        let nextQuestion = '';
        
        if (this.introStep <= 3) {
            // Continue with introduction questions - use AI to generate contextual follow-ups
            nextQuestion = await this.generateContextualIntroQuestion();
        } else {
            // Transition to actual interview
            const transitionMessage = `Perfect! I have a good understanding of your background now. Let's begin the actual interview. I'll ask you questions similar to what you might encounter in a real ${this.introData.interviewType.toLowerCase()} interview for a ${this.introData.role} position.

Let's start with our first question:`;
            
            // End intro flow
            this.isInIntroFlow = false;
            
            // Hide thinking indicator before adding transition message
            this.hideTypingIndicator();
            
            // Add transition message
            this.messages.push({
                role: 'assistant',
                content: transitionMessage,
                timestamp: new Date()
            });
            
            this.renderMessages();
            
            // Show thinking indicator again for actual interview question
            this.showTypingIndicator();
            
            // Start actual interview with context
            await this.startActualInterview();
            return;
        }
        
        if (nextQuestion) {
            // Hide thinking indicator before adding real response
            this.hideTypingIndicator();
            
            // Add AI's next question
            this.messages.push({
                role: 'assistant',
                content: nextQuestion,
                timestamp: new Date()
            });
            
            this.renderMessages();
        }
    }

    async startActualInterview() {
        // Use only 2nd and 3rd responses to keep context manageable for local LLM
        const relevantResponses = this.introResponses.slice(1, 3); // Get responses 2 and 3 (index 1 and 2)
        
        let contextualInfo = '';
        if (relevantResponses.length > 0) {
            contextualInfo = relevantResponses.map((resp, index) => 
                `Q: ${resp.question}\nA: ${resp.response}`
            ).join('\n\n');
        }
        
        const context = `You are conducting a ${this.introData.interviewType.toLowerCase()} interview at ${this.introData.difficulty.toLowerCase()} difficulty for a ${this.introData.role} position.

Candidate: ${this.introData.name}
Experience: ${this.introData.experience}
${this.introData.company ? `Target Company: ${this.introData.company}` : ''}

Key Background:
${contextualInfo}

Ask your first formal interview question. Keep it relevant to their background and the role they're targeting.`;
        
        try {
            // Send simplified context to get the first interview question
            const response = await this.sendToBackend(context);
            
            if (response && response.response) {
                // Hide thinking indicator before adding real response
                this.hideTypingIndicator();
                
                this.messages.push({
                    role: 'assistant',
                    content: response.response,
                    timestamp: new Date()
                });
                
                this.renderMessages();
            }
        } catch (error) {
            console.error('Failed to start actual interview:', error);
            this.hideTypingIndicator(); // Hide thinking indicator on error
            this.showError('Failed to start the interview questions. Please try again.');
        }
    }

    getQuestionForStep(step) {
        const questions = [
            "Could you tell me a bit about yourself and your background?",
            "Could you tell me about a recent project or accomplishment you're particularly proud of?",
            "What interests you most about this role?",
            "What areas would you like to focus on or feel you need the most practice with?"
        ];
        return questions[step] || "Tell me more about your background.";
    }

    async generateContextualIntroQuestion() {
        try {
            // Create context from previous responses
            const conversationContext = this.buildIntroContext();
            
            const prompt = `You are an experienced interviewer conducting a pre-interview conversation. Based on the conversation so far, generate the next logical follow-up question. Be conversational, show you've been listening, and naturally transition to learning more about the candidate.

Candidate Profile:
- Name: ${this.introData.name}
- Experience: ${this.introData.experience}
- Target Role: ${this.introData.role}
- Company: ${this.introData.company || 'Not specified'}
- Interview Type: ${this.introData.interviewType}
- Difficulty: ${this.introData.difficulty}

Conversation so far:
${conversationContext}

Generate the next question (step ${this.introStep + 1} of 4) that builds on their previous responses and helps you understand them better before the formal interview begins. Be warm, professional, and show you've been listening to their answers.`;

            const response = await this.sendToBackend(prompt);
            
            if (response && response.response) {
                return response.response;
            } else {
                // Fallback questions
                return this.getFallbackQuestion();
            }
        } catch (error) {
            console.error('Failed to generate contextual question:', error);
            return this.getFallbackQuestion();
        }
    }

    buildIntroContext() {
        return this.introResponses.map((resp, index) => 
            `Q${index + 1}: ${resp.question}\nA${index + 1}: ${resp.response}`
        ).join('\n\n');
    }

    getFallbackQuestion() {
        const fallbacks = [
            `Thank you for sharing! Could you tell me about a recent project or accomplishment you're particularly proud of?`,
            `That sounds impressive! What interests you most about the ${this.introData.role} role${this.introData.company ? ` at ${this.introData.company}` : ''}?`,
            `Great insight! What areas would you like to focus on or feel you need the most practice with in this interview?`
        ];
        return fallbacks[this.introStep - 1] || fallbacks[0];
    }

    summarizeIntroResponses() {
        return this.introResponses.map((resp, index) => 
            `${index + 1}. ${resp.question}\n   Your answer: "${resp.response.substring(0, 100)}${resp.response.length > 100 ? '...' : ''}"\n`
        ).join('\n');
    }

    setupSpeechRecognition() {
        // Check if browser supports speech recognition
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            console.warn('Speech recognition not supported in this browser');
            return;
        }

        // Initialize speech recognition
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        
        // Configure speech recognition
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
        this.recognition.maxAlternatives = 1;

        // Event handlers
        this.recognition.onstart = () => {
            this.isListening = true;
            this.updateVoiceUI(true);
        };

        this.recognition.onresult = (event) => {
            let finalTranscript = '';
            let interimTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }

            // Append the transcript to existing text instead of replacing it
            if (finalTranscript) {
                const currentText = this.messageInput.value;
                const newText = currentText + (currentText ? ' ' : '') + finalTranscript.trim();
                this.messageInput.value = newText;
                this.updateCharCount();
                this.autoResizeTextarea();
                
                // Focus back to textarea for continued typing
                this.messageInput.focus();
                
                // Position cursor at the end
                this.messageInput.setSelectionRange(newText.length, newText.length);
            }
        };

        this.recognition.onend = () => {
            this.isListening = false;
            this.updateVoiceUI(false);
        };

        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            this.isListening = false;
            this.updateVoiceUI(false);
            
            let errorMessage = 'Voice recognition failed. ';
            switch (event.error) {
                case 'network':
                    errorMessage += 'Please check your internet connection.';
                    break;
                case 'not-allowed':
                    errorMessage += 'Please allow microphone access.';
                    break;
                case 'no-speech':
                    errorMessage += 'No speech detected. Please try again.';
                    break;
                default:
                    errorMessage += 'Please try again.';
            }
            
            this.showError(errorMessage);
        };
    }

    toggleVoiceInput() {
        if (!this.recognition) {
            this.showError('Voice input is not supported in your browser. Please try Chrome, Edge, or Safari.');
            return;
        }

        if (this.isListening) {
            this.recognition.stop();
        } else {
            // Don't clear the input field - allow voice to add to existing text
            try {
                this.recognition.start();
            } catch (error) {
                console.error('Failed to start speech recognition:', error);
                this.showError('Failed to start voice input. Please try again.');
            }
        }
    }

    updateVoiceUI(isListening) {
        if (isListening) {
            this.voiceBtn.classList.add('listening');
            this.voiceBtn.innerHTML = '<i class="fas fa-stop"></i>';
            this.voiceBtn.title = 'Stop Voice Input';
            this.voiceStatus.style.display = 'flex';
            // Don't change placeholder - keep it as "Type your response here..."
        } else {
            this.voiceBtn.classList.remove('listening');
            this.voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
            this.voiceBtn.title = 'Voice Input';
            this.voiceStatus.style.display = 'none';
            // Keep original placeholder
        }
    }

    setupSpeechSynthesis() {
        // Check if browser supports speech synthesis
        if (!('speechSynthesis' in window)) {
            console.warn('Speech synthesis not supported in this browser');
            this.speechEnabled = false;
            return;
        }

        // Wait for voices to be loaded
        if (speechSynthesis.getVoices().length === 0) {
            speechSynthesis.addEventListener('voiceschanged', () => {
                this.updateSpeakerUI();
            });
        } else {
            this.updateSpeakerUI();
        }
    }

    toggleSpeechOutput() {
        if (this.isSpeaking) {
            this.stopSpeaking();
        } else {
            this.speechEnabled = !this.speechEnabled;
            this.updateSpeakerUI();
        }
    }

    speakText(text) {
        if (!this.speechEnabled || !this.speechSynthesis) {
            return;
        }

        // Stop any current speech
        this.stopSpeaking();

        // Clean text for speech (remove HTML tags and formatting)
        const cleanText = this.cleanTextForSpeech(text);
        
        if (!cleanText.trim()) {
            return;
        }

        // Create utterance
        this.currentUtterance = new SpeechSynthesisUtterance(cleanText);
        
        // Configure speech settings
        this.currentUtterance.rate = 0.9; // Slightly slower for clarity
        this.currentUtterance.pitch = 1.0;
        this.currentUtterance.volume = 0.8;
        
        // Try to use a natural voice
        const voices = this.speechSynthesis.getVoices();
        const preferredVoice = voices.find(voice => 
            voice.lang.startsWith('en') && 
            (voice.name.includes('Natural') || voice.name.includes('Enhanced') || voice.name.includes('Premium'))
        ) || voices.find(voice => voice.lang.startsWith('en') && voice.default);
        
        if (preferredVoice) {
            this.currentUtterance.voice = preferredVoice;
        }

        // Event handlers
        this.currentUtterance.onstart = () => {
            this.isSpeaking = true;
            this.updateSpeakerUI();
        };

        this.currentUtterance.onend = () => {
            this.isSpeaking = false;
            this.currentUtterance = null;
            this.updateSpeakerUI();
        };

        this.currentUtterance.onerror = (event) => {
            console.error('Speech synthesis error:', event.error);
            this.isSpeaking = false;
            this.currentUtterance = null;
            this.updateSpeakerUI();
        };

        // Speak the text
        this.speechSynthesis.speak(this.currentUtterance);
    }

    stopSpeaking() {
        if (this.speechSynthesis) {
            this.speechSynthesis.cancel();
        }
        this.isSpeaking = false;
        this.currentUtterance = null;
        this.updateSpeakerUI();
    }

    cleanTextForSpeech(text) {
        // Remove HTML tags
        let cleaned = text.replace(/<[^>]*>/g, '');
        
        // Replace HTML entities
        cleaned = cleaned
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&nbsp;/g, ' ');
        
        // Replace multiple whitespaces with single space
        cleaned = cleaned.replace(/\s+/g, ' ');
        
        // Remove special formatting characters
        cleaned = cleaned.replace(/[•\-\*]/g, '');
        
        return cleaned.trim();
    }

    updateSpeakerUI() {
        if (!this.speakerBtn) return;
        
        if (this.isSpeaking) {
            this.speakerBtn.classList.add('speaking');
            this.speakerBtn.innerHTML = '<i class="fas fa-volume-xmark"></i>';
            this.speakerBtn.title = 'Stop Speech';
        } else if (this.speechEnabled) {
            this.speakerBtn.classList.remove('speaking');
            this.speakerBtn.classList.add('enabled');
            this.speakerBtn.innerHTML = '<i class="fas fa-volume-high"></i>';
            this.speakerBtn.title = 'Speech Enabled - Click to Disable';
        } else {
            this.speakerBtn.classList.remove('speaking', 'enabled');
            this.speakerBtn.innerHTML = '<i class="fas fa-volume-xmark"></i>';
            this.speakerBtn.title = 'Speech Disabled - Click to Enable';
        }
    }

    async endInterview() {
        if (this.messages.length < 3) {
            this.showError('Please have a conversation with the interviewer before ending the interview.');
            return;
        }

        if (!confirm('Are you sure you want to end the interview? You will receive detailed feedback on your performance.')) {
            return;
        }

        this.showLoading();
        this.endInterviewBtn.disabled = true;

        try {
            // Generate feedback based on conversation
            const feedback = await this.generateFeedback();
            this.showFeedbackModal(feedback);
        } catch (error) {
            console.error('Failed to generate feedback:', error);
            this.showError('Failed to generate feedback. Please try again or contact support.');
        } finally {
            this.hideLoading();
            this.endInterviewBtn.disabled = false;
        }
    }

    async generateFeedback() {
        const response = await fetch(`${this.apiBaseUrl}/generate-feedback`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'mistral',
                messages: this.messages.filter(msg => !msg.isThinking).map(msg => ({
                    role: msg.role,
                    content: msg.content
                })),
                interview_data: this.introData
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        if (!result.success) {
            throw new Error('Failed to generate feedback');
        }

        return result.feedback;
    }

    showFeedbackModal(feedback) {
        // Update scores with animation
        this.updateScoreDisplay('overallScore', feedback.overall_score);
        this.updateScoreDisplay('communicationValue', feedback.communication_score, 'communicationScore');
        this.updateScoreDisplay('technicalValue', feedback.technical_score, 'technicalScore');
        this.updateScoreDisplay('problemSolvingValue', feedback.problem_solving_score, 'problemSolvingScore');
        this.updateScoreDisplay('confidenceValue', feedback.confidence_score, 'confidenceScore');

        // Update feedback content
        document.getElementById('feedbackStrengths').innerHTML = this.formatFeedbackList(feedback.strengths);
        document.getElementById('feedbackImprovements').innerHTML = this.formatFeedbackList(feedback.improvements);
        document.getElementById('feedbackOverall').textContent = feedback.assessment;
        document.getElementById('feedbackNextSteps').innerHTML = this.formatFeedbackList(feedback.next_steps);

        // Store feedback for download
        this.currentFeedback = feedback;

        // Show modal
        this.feedbackModal.style.display = 'flex';

        // Add entrance animation
        setTimeout(() => {
            this.feedbackModal.querySelector('.modal-content').style.animation = 'slideIn 0.5s ease-out';
        }, 10);
    }

    hideFeedbackModal() {
        this.feedbackModal.style.display = 'none';
        // Redirect to start page when modal is closed
        this.redirectToStartPage();
    }

    redirectToStartPage() {
        // Reset all interview state
        this.messages = [];
        this.isInIntroFlow = false;
        this.introData = {};
        this.introStep = 0;
        this.introResponses = [];
        this.currentFeedback = null;
        
        // Stop any ongoing speech
        this.stopSpeaking();
        
        // Show welcome screen and hide chat interface
        this.chatInterface.style.display = 'none';
        this.welcomeScreen.style.display = 'flex';
        
        // Clear and focus on name input
        this.clearForm();
        setTimeout(() => {
            this.nameInput.focus();
        }, 100);
    }

    updateScoreDisplay(elementId, score, barId = null) {
        const scoreElement = document.getElementById(elementId);
        if (scoreElement) {
            // Animate the number counting up
            this.animateNumber(scoreElement, 0, score, 1000);
            
            if (barId) {
                const barElement = document.getElementById(barId);
                if (barElement) {
                    // Update progress bar
                    setTimeout(() => {
                        barElement.style.width = `${score}%`;
                        barElement.className = `score-fill ${this.getScoreClass(score)}`;
                    }, 200);
                    
                    // Update text value
                    scoreElement.textContent = `${score}%`;
                }
            }
        }
    }

    animateNumber(element, start, end, duration) {
        const startTime = performance.now();
        const range = end - start;
        
        const updateNumber = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = this.easeOutQuart(progress);
            const current = Math.round(start + (range * easeProgress));
            
            element.textContent = element.id === 'overallScore' ? current : `${current}%`;
            
            if (progress < 1) {
                requestAnimationFrame(updateNumber);
            }
        };
        
        requestAnimationFrame(updateNumber);
    }

    easeOutQuart(t) {
        return 1 - (--t) * t * t * t;
    }

    getScoreClass(score) {
        if (score >= 85) return 'excellent';
        if (score >= 70) return 'good';
        if (score >= 60) return 'average';
        return 'poor';
    }

    formatFeedbackList(items) {
        if (!Array.isArray(items) || items.length === 0) {
            return '<p>No specific items identified.</p>';
        }
        
        return '<ul>' + items.map(item => `<li>${this.escapeHtml(item)}</li>`).join('') + '</ul>';
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    downloadFeedbackPDF() {
        if (!this.currentFeedback) {
            this.showError('No feedback available to download.');
            return;
        }

        try {
            // Initialize jsPDF
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            // Set up document styling
            const pageWidth = doc.internal.pageSize.width;
            const pageHeight = doc.internal.pageSize.height;
            const margin = 20;
            const contentWidth = pageWidth - (margin * 2);
            let yPosition = margin;
            
            // Helper function to add text with automatic line wrapping
            const addWrappedText = (text, x, y, maxWidth, fontSize = 12, fontStyle = 'normal') => {
                doc.setFontSize(fontSize);
                doc.setFont('helvetica', fontStyle);
                const lines = doc.splitTextToSize(text, maxWidth);
                doc.text(lines, x, y);
                return y + (lines.length * fontSize * 0.5);
            };
            
            // Helper function to check if we need a new page
            const checkNewPage = (requiredHeight) => {
                if (yPosition + requiredHeight > pageHeight - margin) {
                    doc.addPage();
                    yPosition = margin;
                }
            };
            
            // Header Section
            doc.setFillColor(59, 130, 246); // Blue background
            doc.rect(0, 0, pageWidth, 40, 'F');
            
            doc.setTextColor(255, 255, 255); // White text
            doc.setFontSize(24);
            doc.setFont('helvetica', 'bold');
            doc.text('Interview Practice Report', pageWidth/2, 25, { align: 'center' });
            
            yPosition = 50;
            doc.setTextColor(0, 0, 0); // Black text
            
            // Candidate Information Section
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text('Candidate Information', margin, yPosition);
            yPosition += 10;
            
            doc.setFontSize(11);
            doc.setFont('helvetica', 'normal');
            const candidateInfo = [
                `Name: ${this.introData.name || 'N/A'}`,
                `Target Role: ${this.introData.role || 'N/A'}`,
                `Company: ${this.introData.company || 'N/A'}`,
                `Experience Level: ${this.introData.experience || 'N/A'}`,
                `Interview Type: ${this.introData.interviewType || 'N/A'}`,
                `Difficulty Level: ${this.introData.difficulty || 'N/A'}`,
                `Date: ${new Date().toLocaleDateString()}`,
                `Time: ${new Date().toLocaleTimeString()}`
            ];
            
            candidateInfo.forEach(info => {
                doc.text(info, margin, yPosition);
                yPosition += 6;
            });
            
            yPosition += 10;
            checkNewPage(60);
            
            // Scores Section
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text('Performance Scores', margin, yPosition);
            yPosition += 15;
            
            // Overall Score (Large)
            doc.setFillColor(240, 248, 255);
            doc.rect(margin, yPosition - 5, contentWidth, 25, 'F');
            doc.setFontSize(20);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(59, 130, 246);
            doc.text(`Overall Score: ${this.currentFeedback.overall_score}/100`, pageWidth/2, yPosition + 10, { align: 'center' });
            yPosition += 30;
            
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');
            
            // Category Scores
            const scores = [
                { name: 'Communication', score: this.currentFeedback.communication_score },
                { name: 'Technical Skills', score: this.currentFeedback.technical_score },
                { name: 'Problem Solving', score: this.currentFeedback.problem_solving_score },
                { name: 'Confidence', score: this.currentFeedback.confidence_score }
            ];
            
            scores.forEach(scoreItem => {
                const barWidth = (scoreItem.score / 100) * (contentWidth - 100);
                
                // Score label
                doc.text(`${scoreItem.name}:`, margin, yPosition);
                doc.text(`${scoreItem.score}/100`, pageWidth - margin - 30, yPosition, { align: 'right' });
                
                // Score bar background
                doc.setFillColor(229, 231, 235);
                doc.rect(margin, yPosition + 2, contentWidth - 100, 8, 'F');
                
                // Score bar fill with color based on score
                if (scoreItem.score >= 85) doc.setFillColor(16, 185, 129); // Green
                else if (scoreItem.score >= 70) doc.setFillColor(59, 130, 246); // Blue
                else if (scoreItem.score >= 60) doc.setFillColor(245, 158, 11); // Orange
                else doc.setFillColor(239, 68, 68); // Red
                
                doc.rect(margin, yPosition + 2, barWidth, 8, 'F');
                yPosition += 18;
            });
            
            yPosition += 10;
            checkNewPage(40);
            
            // Strengths Section
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('Strengths', margin, yPosition);
            yPosition += 10;
            
            if (this.currentFeedback.strengths && this.currentFeedback.strengths.length > 0) {
                this.currentFeedback.strengths.forEach((strength, index) => {
                    checkNewPage(15);
                    yPosition = addWrappedText(`• ${strength}`, margin, yPosition, contentWidth, 11);
                    yPosition += 3;
                });
            } else {
                yPosition = addWrappedText('No specific strengths identified.', margin, yPosition, contentWidth, 11);
            }
            
            yPosition += 10;
            checkNewPage(40);
            
            // Areas for Improvement Section
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('Areas for Improvement', margin, yPosition);
            yPosition += 10;
            
            if (this.currentFeedback.improvements && this.currentFeedback.improvements.length > 0) {
                this.currentFeedback.improvements.forEach((improvement, index) => {
                    checkNewPage(15);
                    yPosition = addWrappedText(`• ${improvement}`, margin, yPosition, contentWidth, 11);
                    yPosition += 3;
                });
            } else {
                yPosition = addWrappedText('No specific areas for improvement identified.', margin, yPosition, contentWidth, 11);
            }
            
            yPosition += 10;
            checkNewPage(40);
            
            // Overall Assessment Section
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('Overall Assessment', margin, yPosition);
            yPosition += 10;
            
            yPosition = addWrappedText(this.currentFeedback.assessment || 'No assessment provided.', margin, yPosition, contentWidth, 11);
            yPosition += 10;
            checkNewPage(40);
            
            // Next Steps Section
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('Recommended Next Steps', margin, yPosition);
            yPosition += 10;
            
            if (this.currentFeedback.next_steps && this.currentFeedback.next_steps.length > 0) {
                this.currentFeedback.next_steps.forEach((step, index) => {
                    checkNewPage(15);
                    yPosition = addWrappedText(`${index + 1}. ${step}`, margin, yPosition, contentWidth, 11);
                    yPosition += 3;
                });
            } else {
                yPosition = addWrappedText('No specific next steps recommended.', margin, yPosition, contentWidth, 11);
            }
            
            // Footer
            const footerY = pageHeight - 20;
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(128, 128, 128);
            doc.text('Generated by Interview Practice Partner', margin, footerY);
            doc.text(new Date().toISOString(), pageWidth - margin, footerY, { align: 'right' });
            
            // Save the PDF
            const filename = `Interview_Feedback_${this.introData.name?.replace(/\s+/g, '_') || 'Report'}_${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(filename);
            
        } catch (error) {
            console.error('Error generating PDF:', error);
            this.showError('Failed to generate PDF report. Please try again.');
        }
    }

    generateFeedbackReport(feedback) {
        const date = new Date().toLocaleDateString();
        const time = new Date().toLocaleTimeString();
        
        return `INTERVIEW PRACTICE FEEDBACK REPORT
${'='.repeat(50)}

Candidate: ${this.introData.name || 'N/A'}
Date: ${date}
Time: ${time}
Role: ${this.introData.role || 'N/A'}
Company: ${this.introData.company || 'N/A'}
Interview Type: ${this.introData.interviewType || 'N/A'}
Difficulty: ${this.introData.difficulty || 'N/A'}
Experience Level: ${this.introData.experience || 'N/A'}

SCORES
${'-'.repeat(20)}
Overall Score: ${feedback.overall_score}/100
Communication: ${feedback.communication_score}/100
Technical Skills: ${feedback.technical_score}/100
Problem Solving: ${feedback.problem_solving_score}/100
Confidence: ${feedback.confidence_score}/100

STRENGTHS
${'-'.repeat(20)}
${feedback.strengths.map((item, i) => `${i + 1}. ${item}`).join('\n')}

AREAS FOR IMPROVEMENT
${'-'.repeat(20)}
${feedback.improvements.map((item, i) => `${i + 1}. ${item}`).join('\n')}

OVERALL ASSESSMENT
${'-'.repeat(20)}
${feedback.assessment}

NEXT STEPS
${'-'.repeat(20)}
${feedback.next_steps.map((item, i) => `${i + 1}. ${item}`).join('\n')}

${'='.repeat(50)}
Generated by Interview Practice Partner
${new Date().toISOString()}`;
    }
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new InterviewPracticeApp();
    
    // Add some helpful keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Escape key to close modals
        if (e.key === 'Escape') {
            const modal = document.getElementById('errorModal');
            if (modal.style.display === 'flex') {
                modal.style.display = 'none';
            }
        }
        
        // Ctrl/Cmd + Enter to send message
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            const activeElement = document.activeElement;
            if (activeElement === app.messageInput) {
                app.sendMessage();
            } else if ([app.nameInput, app.roleInput, app.companyInput].includes(activeElement)) {
                app.startInterview();
            }
        }
    });

    // Add periodic connection check
    setInterval(() => {
        if (!app.isConnected) {
            app.checkConnection();
        }
    }, 30000); // Check every 30 seconds if disconnected
});

// Add some nice loading animations and transitions
document.addEventListener('DOMContentLoaded', () => {
    // Add smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Add focus management for accessibility
    const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            const modal = document.getElementById('errorModal');
            if (modal.style.display === 'flex') {
                // Trap focus within modal
                const focusable = modal.querySelectorAll(focusableElements);
                const firstFocusable = focusable[0];
                const lastFocusable = focusable[focusable.length - 1];
                
                if (e.shiftKey) {
                    if (document.activeElement === firstFocusable) {
                        lastFocusable.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === lastFocusable) {
                        firstFocusable.focus();
                        e.preventDefault();
                    }
                }
            }
        }
    });
});