import os
import json
from groq import Groq
from dotenv import load_dotenv

# Load environment variables from .env file (if it exists)
load_dotenv()

# Initialize the Groq client
# The Groq client automatically looks for the GROQ_API_KEY environment variable.
try:
    client = Groq()
except Exception as e:
    print(f"Warning: Failed to initialize Groq client (is GROQ_API_KEY set?): {e}")
    client = None

def classify_ticket(subject: str, message: str) -> dict:
    """
    Calls the Groq API to classify a ticket based on its subject and message.
    Returns a dictionary with 'category', 'urgency', and 'sentiment'.
    """
    if not client:
        return {
            "category": "General Inquiry",
            "urgency": "Medium",
            "sentiment": "Neutral"
        }

    # Prompt Engineering Strategy:
    # 1. System Role: Set a clear persona for the AI (expert customer support AI).
    # 2. Strict Constraints: Explicitly list the allowed categories, urgencies, and sentiments.
    # 3. Few-Shot Prompting: Providing concrete examples vastly improves the model's reliability in categorizing edge cases (like mapping "money back" to Refund Request instead of Billing) and strictly reinforces the expected JSON output format.
    # 4. Output Format: Demand a strict JSON response. Groq supports JSON mode for structured data.
    prompt = f"""
You are an expert customer support AI. Your task is to classify a support ticket.
Please analyze the following ticket subject and message, and categorize it based strictly on the criteria below.

Categories:
- Billing
- Bug Report
- Feature Request
- Technical Support
- Refund Request
- Account Access
- General Inquiry

Urgency:
- Low
- Medium
- High
- Critical

Sentiment:
- Positive
- Neutral
- Negative

EXAMPLES:
Subject: "I want my money back for the last charge"
Message: "You charged me twice and I demand a return of the funds immediately!"
Output: {{"category": "Refund Request", "urgency": "High", "sentiment": "Negative"}}

Subject: "Invoice for last month"
Message: "Where can I find the invoice for my subscription last month?"
Output: {{"category": "Billing", "urgency": "Low", "sentiment": "Neutral"}}

Subject: "App crashes on login"
Message: "Every time I tap the login button, the app completely freezes and then crashes."
Output: {{"category": "Bug Report", "urgency": "Critical", "sentiment": "Negative"}}

Subject: "Dark mode"
Message: "It would be really great if you could add a dark mode to the dashboard."
Output: {{"category": "Feature Request", "urgency": "Low", "sentiment": "Positive"}}

Now, please classify the following ticket. Ensure any language requesting money back or a return of funds is mapped to "Refund Request". Return ONLY a valid JSON object with the exact same structure as the examples.

Ticket Subject: "{subject}"
Ticket Message: "{message}"
"""
    
    try:
        # API Flow:
        # 1. We construct a chat completion request to the Groq API.
        # 2. We use 'llama3-8b-8192' model because it's extremely fast and good at simple reasoning/classification.
        # 3. We set response_format to "json_object" to ensure valid JSON is returned.
        # 4. We set temperature to 0.0 to ensure deterministic, consistent results.
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful AI assistant that outputs structured JSON for ticket classification."
                },
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            model="llama-3.3-70b-versatile", 
            response_format={"type": "json_object"},
            temperature=0.0,
        )
        
        # Parse the JSON string returned by the LLM into a Python dictionary
        response_content = chat_completion.choices[0].message.content
        result = json.loads(response_content)
        
        # Ensure we return the expected keys, fallback to defaults if the LLM hallucinated keys
        return {
            "category": result.get("category", "General Inquiry"),
            "urgency": result.get("urgency", "Medium"),
            "sentiment": result.get("sentiment", "Neutral")
        }
    except Exception as e:
        print(f"Error classifying ticket with Groq: {e}")
        # Robust Error Handling: Return default values if the API fails for any reason
        return {
            "category": "General Inquiry",
            "urgency": "Medium",
            "sentiment": "Neutral"
        }

def generate_draft_response(
    customer_name: str,
    subject: str,
    message: str,
    category: str,
    urgency: str,
    sentiment: str
) -> str:
    """
    Calls the Groq API to generate a professional support reply draft.
    Takes into account the customer's name, issue, and ticket metadata.
    """
    
    # Robust Fallback Handling: Return a generic acknowledgment if client isn't available
    fallback_response = f"Hi {customer_name},\n\nWe have received your request and our support team will get back to you shortly.\n\nBest,\nSupport Team"
    
    if not client:
        return fallback_response

    # Prompt Engineering Strategy:
    # 1. System Role: We define a clear persona (modern SaaS customer support agent) to set a professional yet approachable tone.
    # 2. Context Provision: We supply the subject, message, and metadata (category, urgency, sentiment) to ground the response.
    # 3. Tone constraints: Instruct the model to avoid excessive apologies, keep it concise (under 120 words), and maintain a modern Intercom/Zendesk style.
    # 4. Hallucination constraints: We explicitly forbid hallucinating solutions or making promises about resolution times to avoid setting wrong expectations.
    # 5. Output: Return ONLY the raw draft text.
    
    prompt = f"""
You are an expert customer support agent for a modern SaaS company writing a draft response for a customer's support ticket.

Guidelines:
- Address the customer by name: {customer_name}.
- Keep the response strictly under 120 words.
- Use a modern SaaS support tone (e.g., Intercom, Zendesk): professional, concise, empathetic, but NOT overly formal or robotic.
- Avoid excessive emotional language or repetitive apologies. One brief apology for the inconvenience is sufficient.
- Acknowledge their specific issue based on the context (Category: {category}, Urgency: {urgency}, Sentiment: {sentiment}).
- DO NOT hallucinate any solutions or troubleshooting steps.
- DO NOT make any promises about resolution times or outcomes.
- Sign off with "Best,\nSupport Team".

Ticket Context:
- Subject: {subject}
- Message: {message}

Write the draft response now. Return ONLY the exact text of the draft response, with no conversational filler or markdown code blocks.
"""
    
    try:
        # API Flow:
        # 1. We construct a chat completion request to the Groq API.
        # 2. We use 'llama-3.3-70b-versatile' (or another capable model) for excellent instruction following.
        # 3. We set a low temperature (0.3) because we want a professional, predictable, and conservative response, avoiding overly creative or risky wording.
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are a professional customer support agent."
                },
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.3,
        )
        
        draft = chat_completion.choices[0].message.content.strip()
        return draft
    except Exception as e:
        print(f"Error generating draft response with Groq: {e}")
        # Robust Error Handling: Return a generic response if the LLM call fails
        return fallback_response
