# 🎤 Interview Practice Partner 🚀  
An interactive AI-powered interview coach that helps you **practice, improve, and ace** your job interviews — complete with realistic conversations, probing follow-ups, and actionable feedback.

---

## 🌟 Overview  
- **🎯 Purpose:** Help job-seekers prepare confidently with **role-specific mock interviews**, natural follow-ups, and structured evaluations.  
- **🎙️ Interaction style:** Voice-first (STT/TTS) with chat as a convenient fallback.  
- **👥 Ideal for:** Software engineers, sales reps, retail staff, customer support candidates, and anyone preparing for interviews.

---

## ✨ Features

- **🧑‍💼 Role-specific mock interviews**  
  Tailored sessions based on your target job (Software Engineer, Sales Rep, Retail Associate, etc.).

- **🤔 Realistic follow-ups**  
  Smart, context-aware probes — just like real interviewers asking *“Can you clarify?”* or *“Walk me through your reasoning.”*

- **📝 Post-interview evaluation**  
  Get structured feedback on communication, technical depth, clarity, problem-solving, and more.

- **📊 Scoring & Practical Tips**  
  Receive a concise score, rubric, and targeted tips to improve your next attempt.

- **🎤 Voice + 💬 Chat**  
  Primary interaction via voice, with text chat available for quiet environments.

- **🪶 Lightweight frontend + backend**  
  Simple browser UI (`frontend/`) and a FastAPI backend (`backend/`) for orchestration and evaluation logic.

---

## 🧠 Why Choose Mistral with Ollama?

- **📘 Excellent instruction-following**  
  Mistral 7B models are reliable for generating interview questions, probing answers, and performing evaluations.

- **⚖️ Balanced size vs power**  
  Strong capability without the heavy compute requirements of huge models.

- **💻 Easy self-hosting via Ollama**  
  Fast local inference, privacy-friendly, and smooth model management — especially with quantized GGUF builds.

---

## 🆓 Open-Source Models You Can Use

A few solid LLMs for self-hosted interview agents:

- **🌀 Mistral 7B** — Highly capable & efficient.  
- **🐑 LLaMA 2 / 3** — Large ecosystem, varied model sizes.  
- **💎 Gemma** — Lightweight, fast, and inference-friendly.  
- **🦅 Falcon (7B / 40B / 180B)** — Great reasoning in larger versions.  
- **🌍 BLOOM** — Multilingual & versatile.

> 💡 *Tip:* For local setups, prefer smaller or quantized variants (4-bit/8-bit/GGUF) unless you have a powerful GPU.

---

## ⚙️ Quick Ollama Commands (PowerShell)

Pull a model:  
```pwsh
ollama pull mistral
```

List installed models:  
```pwsh
ollama list
```

Run a model:  
```pwsh
ollama run mistral
```

---

## 🏗️ System Architecture

### 🖥️ Frontend (`frontend/`)  
Handles UI, microphone access, audio playback, and sending inputs to the backend.

### 🧩 Backend (`backend/`)  
FastAPI server containing:  
- Session management  
- Templates & prompt logic  
- LLM communication  
- Evaluation / scoring pipeline

### 🤖 LLM API  
Self-hosted (Ollama) or cloud-based large language models generate:  
- Questions  
- Follow-ups  
- Evaluations & feedback

### 🔊 STT / TTS (optional)  
- Browser Web Speech API for demos  
- Cloud STT/TTS (Google, Azure, AWS) or open-source Coqui for production use

---

## 🔁 Flow Diagram (Simplified)

**User voice/chat → Frontend → Backend → LLM → Backend scoring → Frontend output/TTS**

🎧 Speak → 🧠 Think → 🗣️ Respond → 📊 Evaluate → 🔁 Improve
