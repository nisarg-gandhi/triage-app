import os
import json
from groq import Groq
from dotenv import load_dotenv

# Load environment variables from .env file (if it exists)
load_dotenv()

# Initialize the Groq client
# The Groq client automatically looks for the GROQ_API_KEY environment variable.
if not os.environ.get("GROQ_API_KEY"):
    raise RuntimeError("GROQ_API_KEY environment variable is missing. Required for AI features.")
client = Groq()

def classify_ticket(subject: str, message: str) -> dict:
    """
    Calls the Groq API to classify a ticket based on its subject and message.
    Returns a dictionary with 'category', 'urgency', and 'sentiment'.
    """
    if not client:
        return {
            "category": "General Inquiry",
            "urgency": "Medium",
            "sentiment": "Neutral",
            "confidence": 0.0,
            "reasoning": "Groq client not initialized."
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

IMPORTANT: Be honest about uncertainty. If the ticket is vague, ambiguous, or could belong to multiple categories, confidence MUST reflect that uncertainty and should be below 0.70. Do not default to high confidence scores. Reserve scores above 0.85 only for tickets with very clear, specific, unambiguous issues.

EXAMPLES:
Subject: "I want my money back for the last charge"
Message: "You charged me twice and I demand a return of the funds immediately!"
Output: {{"category": "Refund Request", "urgency": "High", "sentiment": "Negative", "confidence": 0.95, "reasoning": "The user explicitly demands a return of funds for a double charge."}}

Subject: "Invoice for last month"
Message: "Where can I find the invoice for my subscription last month?"
Output: {{"category": "Billing", "urgency": "Low", "sentiment": "Neutral", "confidence": 0.90, "reasoning": "The user is simply asking where to find a past invoice."}}

Subject: "App crashes on login"
Message: "Every time I tap the login button, the app completely freezes and then crashes."
Output: {{"category": "Bug Report", "urgency": "Critical", "sentiment": "Negative", "confidence": 0.98, "reasoning": "The user reports a consistent app crash that prevents login."}}

Subject: "Dark mode"
Message: "It would be really great if you could add a dark mode to the dashboard."
Output: {{"category": "Feature Request", "urgency": "Low", "sentiment": "Positive", "confidence": 0.92, "reasoning": "The user suggests adding a dark mode feature."}}

Subject: "I'm not happy with the service"
Message: "Things haven't been great lately and I wanted to reach out."
Output: {{"category": "General Inquiry", "urgency": "Low", "sentiment": "Negative", "confidence": 0.52, "reasoning": "Message is too vague to determine a specific category with certainty."}}

Subject: "Question about my account"
Message: "Hi, I have a question."
Output: {{"category": "Account Access", "urgency": "Low", "sentiment": "Neutral", "confidence": 0.45, "reasoning": "No specific issue described; category is a best guess based on limited context."}}

Subject: "It's not working"
Message: "The thing I use every day stopped working. Please help."
Output: {{"category": "Technical Support", "urgency": "Medium", "sentiment": "Negative", "confidence": 0.61, "reasoning": "Vague description with no specifics about which feature or error is occurring."}}

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
            temperature=0.2,
        )
        
        # Parse the JSON string returned by the LLM into a Python dictionary
        response_content = chat_completion.choices[0].message.content
        result = json.loads(response_content)
        
        # Ensure we return the expected keys, fallback to defaults if the LLM hallucinated keys
        return {
            "category": result.get("category", "General Inquiry"),
            "urgency": result.get("urgency", "Medium"),
            "sentiment": result.get("sentiment", "Neutral"),
            "confidence": result.get("confidence", 0.0),
            "reasoning": result.get("reasoning", "No reasoning provided.")
        }
    except Exception as e:
        print(f"Error classifying ticket with Groq: {e}")
        # Robust Error Handling: Return default values if the API fails for any reason
        return {
            "category": "General Inquiry",
            "urgency": "Medium",
            "sentiment": "Neutral",
            "confidence": 0.0,
            "reasoning": f"Error: {e}"
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
