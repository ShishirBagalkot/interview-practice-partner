from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
import asyncio
from typing import List, Dict, Any

app = FastAPI(title="Ollama Chat Backend", description="Backend API to interact with Ollama")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods including OPTIONS
    allow_headers=["*"],  # Allows all headers
)

# Request models
class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    model: str = "mistral"  # Default to mistral
    messages: List[Message]
    stream: bool = False

class SimpleRequest(BaseModel):
    message: str
    model: str = "mistral"

# Ollama API configuration
OLLAMA_BASE_URL = "http://localhost:11434"
OLLAMA_CHAT_ENDPOINT = f"{OLLAMA_BASE_URL}/api/chat"

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "Ollama Chat Backend is running!"}

@app.get("/health")
async def health_check():
    """Check if Ollama is accessible"""
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(f"{OLLAMA_BASE_URL}/api/tags")
            if response.status_code == 200:
                return {"status": "healthy", "ollama": "accessible"}
            else:
                return {"status": "unhealthy", "ollama": "not accessible", "error": f"Status code: {response.status_code}"}
    except Exception as e:
        return {"status": "unhealthy", "ollama": "not accessible", "error": str(e)}

@app.post("/chat")
async def chat_with_ollama(request: ChatRequest):
    """
    Send a chat request to Ollama with full message history
    """
    try:
        # Prepare the request payload for Ollama
        ollama_payload = {
            "model": request.model,
            "messages": [{"role": msg.role, "content": msg.content} for msg in request.messages],
            "stream": request.stream
        }
        
        # Make request to Ollama
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                OLLAMA_CHAT_ENDPOINT,
                json=ollama_payload,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Ollama API error: {response.text}"
                )
            
            return response.json()
            
    except httpx.TimeoutException:
        raise HTTPException(
            status_code=504,
            detail="Timeout while waiting for Ollama response"
        )
    except httpx.ConnectError:
        raise HTTPException(
            status_code=503,
            detail="Unable to connect to Ollama. Make sure it's running on localhost:11434"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@app.post("/simple-chat")
async def simple_chat(request: SimpleRequest):
    """
    Simplified endpoint that accepts a single message and returns the response
    """
    try:
        # Create the message structure
        messages = [{"role": "user", "content": request.message}]
        
        # Prepare the request payload for Ollama
        ollama_payload = {
            "model": request.model,
            "messages": messages,
            "stream": False
        }
        
        # Make request to Ollama
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                OLLAMA_CHAT_ENDPOINT,
                json=ollama_payload,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Ollama API error: {response.text}"
                )
            
            ollama_response = response.json()
            
            # Return a simplified response
            return {
                "message": request.message,
                "model": request.model,
                "response": ollama_response.get("message", {}).get("content", ""),
                "full_response": ollama_response
            }
            
    except httpx.TimeoutException:
        raise HTTPException(
            status_code=504,
            detail="Timeout while waiting for Ollama response"
        )
    except httpx.ConnectError:
        raise HTTPException(
            status_code=503,
            detail="Unable to connect to Ollama. Make sure it's running on localhost:11434"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)