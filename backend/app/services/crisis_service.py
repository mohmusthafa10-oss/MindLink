import random
from datetime import datetime, timedelta

# Track crisis interactions per user to avoid repetition
_crisis_context = {}

def detect_crisis(message):
    """Detect crisis keywords in user message with multilingual support and spacing robustness"""
    message_lower = message.lower()
    message_clean = message_lower.replace(" ", "")
    
    # English keywords and variants
    keywords_en = [
        "suicide", "killmyself", "endmylife", "wanttodie",
        "betteroffdead", "harmmyself", "selfharm", "cutmyself",
        "overdose", "jumpoff", "hangmyself", "deathwish",
        "wanttokill", "donewithlife"
    ]
    
    # Spacing variants
    keywords_en_phrase = [
        "kill my self", "end my life", "want to die", "harm my self", "cut my self"
    ]
    
    # Malayalam keywords (ml)
    keywords_ml = [
        "മരിക്കണം", "ജീവനംഅവസാനിപ്പിക്കണം", "ചാവണം", "കൊല്ലണം", "മരിക്കാൻ", 
        "കൊല്ലാൻ", "ആത്മഹത്യ", "ചാവാൻ", "മരിച്ചു"
    ]
    
    # Hindi keywords (hi)
    keywords_hi = [
        "आत्महत्या", "मरनाचाहता", "जानदेदूं", "खत्मकरदूं", "मरजाऊं", "ज़हर"
    ]

    # Tamil (ta) / Kannada (kn) basics
    keywords_others = [
        "தற்கொலை", "சாகணும்", "ಆತ್ಮಹತ್ಯೆ", "ಸಾಯಬೇಕು"
    ]
    
    # Combine all
    all_clean_keywords = keywords_en + keywords_ml + keywords_hi + keywords_others
    
    is_crisis = any(word in message_clean for word in all_clean_keywords) or \
                any(phrase in message_lower for phrase in keywords_en_phrase)
                
    return is_crisis

def log_crisis_alert(user_id, message):
    """Add a crisis event to the current DB session for admin monitoring.
    NOTE: Does NOT commit — the caller (chat_service) handles the commit."""
    try:
        from app.models.crisis_alert import CrisisAlert
        from app.extensions import db
        alert = CrisisAlert(
            user_id=user_id,
            message_snippet=message[:200]
        )
        db.session.add(alert)
    except Exception as e:
        print(f"[crisis_service] Failed to log crisis alert: {e}")

def get_crisis_response(user_id, message):
    """
    Generate varied, empathetic crisis responses based on local Indian helplines.
    """
    if user_id not in _crisis_context:
        _crisis_context[user_id] = {
            'count': 0,
            'last_response_time': None,
            'previous_responses': []
        }
    
    context = _crisis_context[user_id]
    context['count'] += 1
    current_time = datetime.utcnow()
    
    # Indian Helplines (Resource Helpline)
    # NIMHANS: 080-46110007 (24/7)
    # National Mental Health Helpline: 1800-599-0019
    # AASRA: +91-9820466726

    if context['count'] == 1:
        responses = [
            "I can hear how much pain you're in, and I want you to know you're not alone. Your life matters. Please reach out to someone who can support you right now. You can call the National Mental Health Helpline at 1800-599-0019 or AASRA at +91-9820466726. They are there for you 24/7.",
            "I'm really concerned about what you're sharing. Please, talk to a professional who can help you through this moment. You can contact NIMHANS (24/7 Support) at 080-46110007 or text Vandrevala Foundation at 9999666555.",
        ]
    elif context['count'] == 2:
        responses = [
            "I'm still here, and I'm very worried about you. These thoughts are heavy, but you don't have to carry them by yourself. Please call the 24/7 Toll-Free helpline: 1800-599-0019 or NIMHANS at 080-46110007. Help is just a phone call away.",
            "It takes immense courage to speak about this. Please take the next step and connect with a dedicated crisis counselor. Call AASRA at +91-9820466726 or NIMHANS at 080-46110007. They want to listen and help you stay safe.",
        ]
    else:
        responses = [
            "Your safety is my absolute priority. I am an AI and cannot provide the specialized care you need right now, but there are people who can and want to support you. Please call the National Mental Health Helpline at 1800-599-0019 or AASRA at +91-9820466726.",
            "I strongly urge you to reach out for immediate help. Please call 080-46110007 or 1800-599-0019. If you are in immediate danger, please go to the nearest hospital or contact your local emergency services (112). You are important.",
        ]
    
    # Select a response we haven't used recently
    available_responses = [r for r in responses if r not in context['previous_responses']]
    if not available_responses:
        available_responses = responses
        context['previous_responses'] = []
    
    response = random.choice(available_responses)
    context['previous_responses'].append(response)
    context['last_response_time'] = current_time
    
    if len(context['previous_responses']) > 3:
        context['previous_responses'] = context['previous_responses'][-3:]
    
    return response
    
    # Select a response we haven't used recently
    available_responses = [r for r in responses if r not in context['previous_responses']]
    if not available_responses:
        available_responses = responses
        context['previous_responses'] = []
    
    response = random.choice(available_responses)
    context['previous_responses'].append(response)
    context['last_response_time'] = current_time
    
    # Keep only last 3 responses in memory
    if len(context['previous_responses']) > 3:
        context['previous_responses'] = context['previous_responses'][-3:]
    
    return response
