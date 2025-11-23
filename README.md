Some Free / Open-Source LLMs You Can Use
Here are a few LLMs that are open-source and free to use (subject to their respective licenses), and which are quite suitable for a chatbot / interview-agent:
Model	Why It’s Good for Your Use-Case	Trade-offs / Requirements
Mistral 7B	Very capable, good instruction-following, not too big.	Needs decent compute; but quantized versions (e.g. GGUF) make local inference more feasible. 
LLaMA (e.g. LLaMA 3)	Well-supported, good balance of performance and size. 
	Model size matters — smaller versions are easier to run locally. Also, license restrictions for some LLaMA versions.
Gemma (DeepMind)	Lightweight, newer, well optimized. 
	May not be as “chat-optimized” as instruction-fine-tuned chat models; quantization might help.
Falcon (7B / 40B / 180B)	Powerful, especially for reasoning tasks. 
	Very large models (40B / 180B) need lots of memory / GPU. Use smaller or quantized versions for local.
BLOOM	Multilingual + large. 
	Huge model size (depending on variant), may be overkill and hard to run locally unless you have strong hardware.


This is using Mistral 7B

Steps
1) Install Ollama (according to your OS); Link: 
2) Using CLI
```
ollama pull mistral
```
