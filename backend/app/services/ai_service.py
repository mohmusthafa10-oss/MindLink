import os
import google.generativeai as genai
import re
from dotenv import load_dotenv
import PIL.Image
import io
import base64

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def generate_ai_response(message, mode="companion", history=[], image_data=None):
    try:
        # Check for valid key
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key or "AIza" not in api_key: # Basic check for Google key format
             raise ValueError("Invalid or missing API Key")

        # Persona Definitions
        personas = {
            "partner": "You are a mature, stable, and supportive partner. You express love through action and understanding rather than constant sweet-talk. Your tone is grounded and sincere. Avoid being 'over-sweet' or repetitive with terms of endearment. Use affection sparingly and meaningfully.",
            "companion": "You are an engaging, proactive friend and mental health companion. Do NOT just listen and validate. You must actively engage the user.",
            "stranger": "You are a wise stranger on a park bench. You are polite but offer a fresh, objective perspective.",
            "therapist": "You are a supportive 'Calm Guide' and coach. You are not just a passive listener. Use CBT (Cognitive Behavioral Therapy) techniques to challenge negative thoughts."
        }
        
        selected_persona = personas.get(mode.lower(), personas["companion"])
        
        system_instruction = f"""
        ROLE: {selected_persona}
        
        CRITICAL REQUIREMENTS (YOU MUST FOLLOW THESE EXACTLY):
        1. ALWAYS start your response with [MOOD: <word>] - this is MANDATORY.
        2. Choose ONE mood word from: Happy, Anxious, Calm, Sad, Angry, Neutral, Excited, Tired, Frustrated.
        3. KEEP RESPONSE SHORT (max 3 sentences).
        4. LANGUAGE & SCRIPT MATCHING: 
           - Detect the language and SCRIPT used by the user.
           - If the user uses mixed language (e.g., Tanglish, Manglish, Hinglish), RESPOND IN THE SAME MIX.
           - If the user uses Roman script (English alphabet) to write a non-English language (like Malayalam or Hindi), you MUST respond using Roman script as well. 
           - DO NOT use native scripts (like Malayalam or Devanagari) UNLESS the user uses them first.
        5. SAFETY: If the user expresses self-harm or deep distress, respond with empathy and ONLY suggest local Indian helplines: NIMHANS (080-46110007) or AASRA (+91-9820466726). NEVER mention US numbers like 911 or 988.
        
        RESPONSE FORMAT (STRICTLY FOLLOW):
        [MOOD: <choose one word from list above>] <Your response here>
        """

        # Initialize model with system instructions
        model = genai.GenerativeModel(
            model_name="gemini-2.5-flash",
            system_instruction=system_instruction
        )

        # Prepare content to send
        content_to_send = [message]
        
        # Handle Image
        if image_data:
             try:
                # Assuming image_data is base64 string
                if "," in image_data:
                    image_data = image_data.split(",")[1]
                
                image_bytes = base64.b64decode(image_data)
                image = PIL.Image.open(io.BytesIO(image_bytes))
                content_to_send.append(image)
             except Exception as img_err:
                 print(f"Image processing error: {img_err}")
                 content_to_send[0] += "\n[System: Failed to process attached image]"

        chat = model.start_chat(history=history)
        response = chat.send_message(content_to_send)
        text = response.text
        
        mood_score = "Neutral"
        reply_text = text
        
        # Extract Mood
        match = re.search(r"\[MOOD:\s*([a-zA-Z\s]+)\]", text)
        if match:
            mood_score = match.group(1).strip()
            reply_text = re.sub(r"\[MOOD:.*?\]", "", text).strip()
            
        return reply_text, mood_score

    except Exception as e:
        print(f"AI Service Error (using fallback): {e}")
        try:
            with open("ai_debug.log", "w") as f:
                f.write(f"Error: {str(e)}\n\nHistory: {str(history)}")
        except:
            pass
        # Fallback Logic
        fallback_responses = {
            "companion": "I hear you. I may not be fully connected to my brain right now, but I'm here to listen. How does that make you feel?",
            "partner": "I'm right here with you, love. Even if I can't think clearly, I care about you.",
            "therapist": "I acknowledge what you're saying. Let's explore that feeling further.",
            "stranger": "That's an interesting perspective. Tell me more."
        }

        return fallback_responses.get(mode, fallback_responses["companion"]), 5
