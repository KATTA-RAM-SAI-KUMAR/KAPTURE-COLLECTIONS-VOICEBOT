# Kapture Finance Collections Voicebot

## AI Delivery Intern – Take-Home Assignment

Maya is an AI-powered collections voicebot designed for Kapture Finance. The agent is designed to handle routine overdue-loan conversations while following a structured authentication, disclosure, intent-handling, payment-commitment, escalation, and call-closure workflow.

---

## 1. Project Overview

### Business Scenario

Kapture Finance wants an outbound AI voice agent that can contact customers with overdue loan EMIs and handle routine collections conversations without requiring a human agent for every call.

The agent should:

- Introduce itself and the company
- Disclose the purpose of the call
- Verify the customer's identity
- Avoid revealing debt information before verification
- Understand the customer's intent
- Capture a Promise To Pay (PTP)
- Generate a payment link
- Handle disputes and hardship cases
- Handle already-paid and wrong-person scenarios
- Respect do-not-call requests
- Escalate appropriate cases to a human agent
- Record the final call disposition

### Example Customer

- **Customer:** Rahul Sharma
- **Account ID:** ACC-88392
- **Loan Type:** Personal Loan
- **Overdue EMI:** ₹8,499
- **Days Past Due:** 12

---

# 2. Architecture

```text
                    CUSTOMER
                        |
                        v
                +---------------+
                |    TELEPHONY   |
                +-------+-------+
                        |
                        v
                +---------------+
                |      STT      |
                | Speech-to-Text|
                +-------+-------+
                        |
                        v
        +--------------------------------+
        |        VAPI VOICE AGENT        |
        |                                |
        |  System Prompt + LLM           |
        |  Conversation Flow             |
        |  Guardrails                    |
        |  Intent Detection              |
        +---------------+----------------+
                        |
                        | Tool Calls
                        v
        +--------------------------------+
        |       MAYA BACKEND API         |
        |       Node.js + Express        |
        +--------------------------------+
             |       |       |       |
             v       v       v       v
          Verify    PTP    Payment  Disposition
          Customer  Log     Link     / Escalation
                        |
                        v
                +---------------+
                |  Mock Backend |
                |  Customer Data|
                +---------------+
                        |
                        v
                +---------------+
                |      TTS      |
                | Text-to-Speech|
                +-------+-------+
                        |
                        v
                    CUSTOMER
3. Technology Stack
Component	Technology
Voice Platform	Vapi
Backend	Node.js + Express
API	REST
Hosting	Render
Source Control	GitHub
Speech-to-Text	Vapi configured transcriber
Text-to-Speech	Vapi configured voice
LLM	Vapi configured model
Customer Data	Mock in-memory dataset
Payment Integration	Mock payment-link API

The project uses mocked business APIs because the assignment explicitly permits mocked endpoints.

4. Conversation Flow

The core conversation is controlled through explicit states.

CALL_INITIATED
       |
       v
DISCLOSURE
       |
       v
VERIFICATION
       |
       v
AUTHENTICATION
       |
       +-------------------+
       |                   |
     FAILED              SUCCESS
       |                   |
       v                   v
SAFE_HANDLING          DISCUSSION
                           |
                           v
                         INTENT
                           |
             +-------------+-------------+
             |             |             |
             v             v             v
            PTP         PAYMENT       DISPUTE/
                         REQUEST       HARDSHIP
             |             |             |
             +-------------+-------------+
                           |
                           v
                    BUSINESS_ACTION
                           |
                           v
                      RESPONSE_TTS
                           |
                           v
                  CUSTOMER_RESPONSE
                       /         \
                      /           \
                CONTINUE        COMPLETED
                   |               |
                   v               v
              DISCUSSION      CALL_CLOSURE

The state machine is implemented in:

backend/stateMachine.js

Authentication is explicitly represented in the state machine instead of being left entirely to prompt instructions.

5. Authentication and Data Safety

Authentication is a mandatory gate before sensitive account information is disclosed.

Maya must not reveal:

Overdue amount
Loan information
Days past due
Other sensitive account information

before successful verification.

The backend verification endpoint is:

POST /tools/verify_customer

Example request:

{
  "account_id": "ACC-88392",
  "customer_name": "Rahul Sharma"
}

Example successful response:

{
  "success": true,
  "verified": true,
  "account_id": "ACC-88392",
  "message": "Customer successfully verified"
}

If verification fails, the conversation enters safe handling and sensitive debt information is not disclosed.

6. Supported Customer Intents

The agent is designed to handle the following scenarios.

6.1 Promise To Pay

The customer agrees to make a payment.

The agent captures:

Payment amount
Promise date

and calls:

POST /tools/log_promise_to_pay
6.2 Payment Request

The customer requests a payment link.

The agent can call:

POST /tools/send_payment_link

The current implementation generates a mock payment link.

6.3 Financial Hardship

The customer explains that they cannot make the payment because of financial difficulty.

The agent should remain empathetic, avoid threatening language, and escalate the case when appropriate.

6.4 Dispute

The customer disputes the amount or account.

The agent should not argue with the customer.

The case can be escalated using:

POST /tools/escalate_to_agent
6.5 Already Paid

If the customer says that the EMI has already been paid, the agent should acknowledge the claim and avoid requesting another payment without verification.

6.6 Wrong Person

If another person answers the call, Maya must not disclose the customer's debt or overdue information.

6.7 Do Not Call

If the customer requests no further calls, Maya should respect the request and record the appropriate disposition.

6.8 Callback Request

If the customer requests a callback, the intent can be recorded for follow-up.

6.9 Hostile Customer

Maya remains professional and should escalate or end the interaction if the conversation cannot continue safely.

7. Backend Tools

The backend implements multiple REST APIs.

7.1 Verify Customer
POST /tools/verify_customer
Input
{
  "account_id": "ACC-88392",
  "customer_name": "Rahul Sharma"
}
Purpose

Verifies the customer before sensitive account information is disclosed.

7.2 Log Promise To Pay
POST /tools/log_promise_to_pay
Input
{
  "account_id": "ACC-88392",
  "promise_date": "2026-08-20",
  "amount": 4500
}
Example Response
{
  "success": true,
  "account_id": "ACC-88392",
  "promise_date": "2026-08-20",
  "amount": 4500,
  "message": "Promise to pay recorded successfully"
}
7.3 Send Payment Link
POST /tools/send_payment_link
Input
{
  "account_id": "ACC-88392",
  "phone": "9999999999"
}
Example Response
{
  "success": true,
  "account_id": "ACC-88392",
  "payment_link": "https://pay.kapturefinance.example/pay/ACC-88392",
  "message": "Payment link generated successfully"
}

The payment URL is mocked for this assignment. It does not process a real payment.

7.4 Mark Disposition
POST /tools/mark_disposition
Input
{
  "account_id": "ACC-88392",
  "disposition": "PTP_COMMITTED",
  "notes": "Customer committed to pay 4500 on 2026-08-20"
}
Purpose

Records the business outcome of the call.

7.5 Escalate To Agent
POST /tools/escalate_to_agent
Purpose

Routes cases requiring human intervention.

Examples:

Dispute
Financial hardship
Hostile customer
Authentication problems
Complex account issues
7.6 End Call
POST /tools/end_call
Input
{
  "account_id": "ACC-88392",
  "disposition": "PTP_COMMITTED"
}
Example Response
{
  "success": true,
  "account_id": "ACC-88392",
  "disposition": "PTP_COMMITTED",
  "call_status": "completed"
}
8. State Machine Implementation

The state machine is implemented in:

backend/stateMachine.js

Example transition:

CALL_INITIATED
      |
      | call_connected
      v
DISCLOSURE

The transition API is:

POST /state/transition

Example:

{
  "state": "CALL_INITIATED",
  "event": "call_connected"
}

Response:

{
  "success": true,
  "previous_state": "CALL_INITIATED",
  "event": "call_connected",
  "new_state": "DISCLOSURE"
}

The state machine rejects invalid transitions.

9. Vapi Voice Agent

Maya was configured on Vapi as the voice agent for the collections workflow.

The configuration includes:

Collections-focused system prompt
Voice configuration
Speech-to-text configuration
Tool/function definitions
Verification-before-disclosure logic
Intent handling
Promise-to-pay flow
Escalation handling
Call closure and disposition

The final system prompt is included in:

System_Prompt.txt

Tool schemas are included in:

tools/
10. Demo Calls
Demo 1 – Successful Promise To Pay

Vapi call:

https://dashboard.vapi.ai/calls/01a00146-5c43-7883-9761-85073f247b97

This demonstrates the successful payment-commitment flow.

The tested scenario records:

Customer verification
Promise amount: ₹4,500
Promise date: 2026-08-20
Payment-link generation
PTP disposition
Call completion

Final disposition:

PTP_COMMITTED
Demo 2 – Edge Case

Vapi call:

https://dashboard.vapi.ai/calls/01a0011d-06ff-7ff3-aebd-a32c3fa6d811

This demonstrates the second conversation path and can be reviewed through the Vapi call transcript/recording.

11. Live Backend

The backend is deployed on Render.

Live URL:

https://kapture-collections-voicebot-jkdf.onrender.com/

Health-check endpoint:

GET /

Expected response:

{
  "status": "ok",
  "service": "Maya Collections Voicebot Backend"
}

The deployed endpoint was successfully tested.

12. Backend Testing

The following APIs were tested against the live Render deployment.

Health Check
GET /

Result:

status: ok
State Transition
CALL_INITIATED
+
call_connected
=
DISCLOSURE
Customer Verification
Account: ACC-88392
Customer: Rahul Sharma
Result: verified = true
Promise To Pay
Account: ACC-88392
Amount: ₹4,500
Date: 2026-08-20
Result: successfully recorded
Payment Link
Result: mock payment link generated successfully
Disposition
Disposition: PTP_COMMITTED
Result: successfully recorded
End Call
Call status: completed
13. Compliance and Guardrails

The agent is designed with the following guardrails:

Identity/company disclosure is performed before the collections conversation.
Customer verification occurs before sensitive debt information is disclosed.
The agent does not threaten or harass customers.
Disputes are handled without arguing.
Already-paid claims are handled without demanding duplicate payment.
Wrong-person scenarios do not reveal debt information.
Do-not-call requests are respected.
Financial hardship cases can be escalated.
Sensitive actions are performed through backend tools.
Every completed call receives a disposition.
The agent should remain within the collections use case and avoid unrelated responses.
14. Observability

A production deployment should track:

Business Metrics
Promise-to-Pay rate
Payment conversion rate
Successful payment rate
Escalation rate
Dispute rate
Already-paid rate
Do-not-call rate
Voice Metrics
Average call duration
Average response latency
Speech recognition errors
Call drop rate
Silence/no-input rate
AI Metrics
Authentication compliance
Debt-disclosure violations
Intent classification accuracy
Tool-call success rate
Tool-call failure rate
Escalation accuracy

The current backend logs business tool activity to the server console.

15. Security Considerations

This project uses mock customer data for the take-home assignment.

A production implementation should use:

Secure customer APIs
Persistent encrypted storage
Authentication and authorization
Secret management
Audit logging
HTTPS
PII minimization
Data retention controls
Secure payment-provider integration

No real payment transaction is performed by the current mock payment endpoint.

16. Project Structure
KAPTURE-COLLECTIONS-VOICEBOT/
│
├── README.md
├── System_Prompt.txt
├── .gitignore
│
├── backend/
│   ├── server.js
│   ├── stateMachine.js
│   ├── package.json
│   └── package-lock.json
│
├── docs/
│   ├── Kapture_Finance_Collections_Voicebot_HLD.pdf
│   ├── architecture-diagram .png
│   └── conversation-state-machine.png
│
└── tools/
    ├── verify_customer.json
    ├── log_promise_to_pay.json
    ├── send_payment_link.json
    ├── mark_disposition.json
    ├── end_call.json
    └── ...
17. Local Setup
Requirements
Node.js
npm
Git
Install Dependencies
cd backend
npm install
Start Backend
node server.js

The backend runs on:

http://localhost:3000
Health Check
GET /
18. Deployment

The backend is deployed on Render.

The repository uses the main branch.

The backend is located inside:

backend/

The deployment runs the Node.js Express server.

The live service is:

https://kapture-collections-voicebot-jkdf.onrender.com/

19. Debugging Experience

During development, the backend was first tested locally.

The state machine was independently tested using Node.js to verify transitions such as:

CALL_INITIATED
→ DISCLOSURE
→ VERIFICATION
→ AUTHENTICATION
→ DISCUSSION
→ INTENT
→ BUSINESS_ACTION
→ RESPONSE_TTS
→ CUSTOMER_RESPONSE
→ CALL_CLOSURE

The backend APIs were then tested individually using PowerShell.

A local public-tunneling approach was considered, but the backend was ultimately deployed to Render so that the APIs could be accessed through a stable HTTPS URL.

This separated backend/API debugging from the voice-agent layer and made the final system easier to demonstrate.

20. Current Limitations

This is a take-home prototype and not a production collections platform.

Current limitations include:

Mock customer database
In-memory customer data
Mock payment-link generation
No real payment gateway
No production CRM integration
Mock human-agent escalation
No persistent analytics database
No real SMS/WhatsApp provider

These components can be replaced with production services without changing the overall architecture.

21. Future Improvements

With additional development time, the system could be extended with:

Production Database

Persist customer, call, PTP, escalation, and disposition records.

Real Payment Integration

Connect the payment-link tool to an approved payment gateway.

CRM Integration

Synchronize customer information and call outcomes with the lender's CRM.

Human Handoff

Transfer complex calls directly to human collection agents with conversation context.

Bilingual Support

Improve English/Hindi switching and language detection.

Automated Evaluation

Build automated tests for:

Authentication bypass
Wrong-person handling
Dispute handling
Already-paid handling
Do-not-call handling
PTP extraction
Tool failures
Hallucination attempts
Sensitive-information disclosure
Analytics Dashboard

Provide real-time monitoring of:

PTP rate
Containment
Escalation
Call latency
Compliance violations
Tool failures
22. Repository and Submission Links
GitHub

https://github.com/KATTA-RAM-SAI-KUMAR/KAPTURE-COLLECTIONS-VOICEBOT

Live Backend

https://kapture-collections-voicebot-jkdf.onrender.com/

Vapi Demo 1 – Promise To Pay

https://dashboard.vapi.ai/calls/01a00146-5c43-7883-9761-85073f247b97

Vapi Demo 2 – Edge Case

https://dashboard.vapi.ai/calls/01a0011d-06ff-7ff3-aebd-a32c3fa6d811

23. Project Artifacts

The repository contains:

High-Level Design PDF
Architecture diagram
Conversation state-machine diagram
System prompt
Backend implementation
State-machine implementation
Tool schemas
README
Deployment configuration
24. Conclusion

Maya demonstrates an end-to-end AI collections voicebot architecture covering:

Voice interaction
Customer authentication
Sensitive-information protection
Conversation state management
Intent detection
Promise-to-pay handling
Payment-link generation
Escalation
Call disposition
Compliance guardrails
Backend tool execution
Cloud deployment
Voice-agent demonstration

The prototype focuses on practical implementation, explicit state control, safe customer handling, controlled tool execution, and clear separation between the AI conversation layer and business APIs.

