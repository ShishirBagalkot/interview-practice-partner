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

class FeedbackRequest(BaseModel):
    messages: List[Message]
    interview_data: Dict[str, Any]
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

@app.post("/generate-feedback")
async def generate_feedback(request: FeedbackRequest):
    """
    Generate detailed feedback and scoring based on the interview conversation
    """
    try:
        # Build comprehensive feedback prompt
        conversation_text = ""
        user_responses = []
        
        for msg in request.messages:
            if msg.role == "user":
                user_responses.append(msg.content)
                conversation_text += f"User: {msg.content}\n"
            else:
                conversation_text += f"AI Interviewer: {msg.content}\n"
        
        feedback_prompt = f"""
You are an expert interview coach analyzing an interview practice session. Based on the conversation below, provide detailed feedback and scoring.

INTERVIEW DETAILS:
- Candidate: {request.interview_data.get('name', 'Unknown')}
- Experience Level: {request.interview_data.get('experience', 'Unknown')}
- Target Role: {request.interview_data.get('role', 'Unknown')}
- Interview Type: {request.interview_data.get('interviewType', 'Unknown')}
- Difficulty Level: {request.interview_data.get('difficulty', 'Unknown')}
- Company: {request.interview_data.get('company', 'Not specified')}

FULL CONVERSATION:
{conversation_text}

Please analyze this interview and provide:

1. OVERALL SCORE: Rate the candidate's overall performance from 0-100.

2. CATEGORY SCORES (0-100 each):
   - Communication: Clarity, articulation, and professional communication
   - Technical Skills: Knowledge demonstration and problem-solving approach
   - Problem Solving: Analytical thinking and solution methodology
   - Confidence: Self-assurance and composure during responses

3. STRENGTHS: List 3-4 specific strengths demonstrated during the interview.

4. AREAS FOR IMPROVEMENT: List 3-4 specific areas where the candidate can improve.

5. OVERALL ASSESSMENT: A comprehensive paragraph summarizing the candidate's performance.

6. NEXT STEPS: Specific recommendations for improvement and preparation.

Format your response EXACTLY as follows:
OVERALL_SCORE: [number]
COMMUNICATION_SCORE: [number]
TECHNICAL_SCORE: [number]
PROBLEM_SOLVING_SCORE: [number]
CONFIDENCE_SCORE: [number]

STRENGTHS:
• [Strength 1]
• [Strength 2]
• [Strength 3]

IMPROVEMENTS:
• [Improvement 1]
• [Improvement 2]
• [Improvement 3]

ASSESSMENT:
[Overall assessment paragraph]

NEXT_STEPS:
• [Next step 1]
• [Next step 2]
• [Next step 3]
"""

        # Make request to Ollama for feedback generation
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(
                OLLAMA_CHAT_ENDPOINT,
                json={
                    "model": request.model,
                    "messages": [{"role": "user", "content": feedback_prompt}],
                    "stream": False
                },
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Ollama API error: {response.text}"
                )
            
            ollama_response = response.json()
            feedback_text = ollama_response.get("message", {}).get("content", "")
            
            # Parse the structured feedback
            parsed_feedback = parse_feedback_response(feedback_text)
            
            return {
                "success": True,
                "feedback": parsed_feedback,
                "raw_feedback": feedback_text,
                "interview_data": request.interview_data,
                "total_messages": len(request.messages),
                "user_responses": len(user_responses)
            }
            
    except httpx.TimeoutException:
        raise HTTPException(
            status_code=504,
            detail="Timeout while generating feedback"
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

def parse_feedback_response(feedback_text):
    """
    Parse the structured feedback response from the AI
    """
    try:
        lines = feedback_text.strip().split('\n')
        feedback = {
            "overall_score": 75,
            "communication_score": 75,
            "technical_score": 75,
            "problem_solving_score": 75,
            "confidence_score": 75,
            "strengths": [],
            "improvements": [],
            "assessment": "Assessment pending analysis.",
            "next_steps": []
        }
        
        current_section = None
        
        for line in lines:
            line = line.strip()
            
            if line.startswith("OVERALL_SCORE:"):
                try:
                    feedback["overall_score"] = int(line.split(":")[1].strip())
                except:
                    pass
            elif line.startswith("COMMUNICATION_SCORE:"):
                try:
                    feedback["communication_score"] = int(line.split(":")[1].strip())
                except:
                    pass
            elif line.startswith("TECHNICAL_SCORE:"):
                try:
                    feedback["technical_score"] = int(line.split(":")[1].strip())
                except:
                    pass
            elif line.startswith("PROBLEM_SOLVING_SCORE:"):
                try:
                    feedback["problem_solving_score"] = int(line.split(":")[1].strip())
                except:
                    pass
            elif line.startswith("CONFIDENCE_SCORE:"):
                try:
                    feedback["confidence_score"] = int(line.split(":")[1].strip())
                except:
                    pass
            elif line.startswith("STRENGTHS:"):
                current_section = "strengths"
            elif line.startswith("IMPROVEMENTS:"):
                current_section = "improvements"
            elif line.startswith("ASSESSMENT:"):
                current_section = "assessment"
                feedback["assessment"] = ""
            elif line.startswith("NEXT_STEPS:"):
                current_section = "next_steps"
            elif line.startswith("•") and current_section:
                item = line[1:].strip()
                if current_section in ["strengths", "improvements", "next_steps"]:
                    feedback[current_section].append(item)
            elif current_section == "assessment" and line:
                if feedback["assessment"]:
                    feedback["assessment"] += " " + line
                else:
                    feedback["assessment"] = line
        
        return feedback
        
    except Exception as e:
        # Return default feedback structure on parsing error
        return {
            "overall_score": 75,
            "communication_score": 75,
            "technical_score": 75,
            "problem_solving_score": 75,
            "confidence_score": 75,
            "strengths": ["Participated actively in the interview", "Provided thoughtful responses", "Demonstrated engagement"],
            "improvements": ["Continue practicing interview skills", "Work on specific technical areas", "Build confidence through more practice"],
            "assessment": "The candidate showed good potential and engagement during the interview practice session.",
            "next_steps": ["Schedule more practice sessions", "Focus on specific improvement areas", "Continue building interview confidence"]
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)