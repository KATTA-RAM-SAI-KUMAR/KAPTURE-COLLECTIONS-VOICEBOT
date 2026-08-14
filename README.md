# Kapture Finance – AI Collections Voicebot

## AI Delivery Intern – Take-Home Assignment

An AI-powered outbound collections voicebot designed for Kapture Finance to handle routine overdue EMI conversations safely, politely and compliantly.

## Project Overview

The voicebot, named Maya, handles an outbound collections conversation with a customer.

The core flow is:

Customer Call
→ Greeting
→ Company & Purpose Disclosure
→ Customer Authentication
→ Account Information
→ Intent Detection
→ Resolution
→ Disposition
→ Call End

Authentication is enforced before sensitive debt information is disclosed.

## Architecture

The system uses the following pipeline:

Customer
→ Telephony / Vapi
→ Speech-to-Text
→ LLM / Conversation Orchestrator
→ Authentication & Business Tools
→ Backend / Mock APIs
→ Text-to-Speech
→ Customer

The detailed architecture is documented in:

`docs/Kapture_Finance_HLD.pdf`

Architecture diagram:

`docs/architecture-diagram.png`

## Vapi Assistant

Platform: Vapi

Assistant: Kapture Finance Outreach

The assistant uses:

- Speech-to-Text for customer speech recognition
- LLM-based conversation orchestration
- Text-to-Speech for natural voice responses
- Function calling for controlled business actions

## Authentication

The assistant verifies the customer's identity before discussing sensitive loan or overdue EMI information.

The authentication flow is:

1. Ask for customer/account identifier.
2. Ask for verification information.
3. Call `verify_customer`.
4. Continue only after successful verification.
5. Do not disclose debt information to an unverified person.

## Supported Customer Intents

The voicebot is designed to handle:

- Will Pay / Promise to Pay
- Cannot Pay / Financial Hardship
- Already Paid
- Payment Dispute
- Do Not Call
- Wrong Person
- Callback Request
- Hostile / Abusive Customer
- Human Escalation

## Business Tools

The project contains schemas for controlled business actions:

- `verify_customer`
- `log_promise_to_pay`
- `send_payment_link`
- `mark_disposition`

The tool schemas are located in:

`tools/`

## Successful Promise-to-Pay Demo

The successful PTP flow demonstrates:

Authentication
→ Customer agrees to pay
→ Payment date captured
→ Payment amount captured
→ Customer confirms
→ Promise-to-Pay logged
→ Final disposition
→ Call ended

Vapi call:

https://dashboard.vapi.ai/calls/01a00146-5c43-7883-9761-85073f247b97

## Already-Paid Edge Case Demo

The already-paid flow demonstrates:

Customer authentication
→ Customer states EMI was already paid
→ Assistant does not request another payment
→ Appropriate disposition recorded
→ Call ended

Vapi call:

https://dashboard.vapi.ai/calls/01a0011d-06ff-7ff3-aebd-a32c3fa6d811

## Compliance & Guardrails

The assistant must:

- Identify the company and purpose appropriately.
- Authenticate before revealing sensitive debt information.
- Never disclose debt information to a third party.
- Avoid threats, harassment or misleading statements.
- Respect do-not-call requests.
- Handle disputes without making unsupported claims.
- Escalate situations requiring human intervention.
- Record a final disposition for completed interactions.

## Backend

The backend contains the mock webhook implementation used for tool calls.

Location:

`backend/server.js`

The backend is intended to provide mock business endpoints for the Vapi assistant.

## Testing

The prototype was tested against:

- Successful customer authentication
- Promise-to-pay
- Payment date extraction
- Payment amount extraction
- Promise-to-pay logging
- Already-paid customer
- Final disposition
- Call termination
- Tool execution

## Debugging

During testing, issues were encountered with:

- Webhook timeout
- Currency interpretation
- Company-name pronunciation
- Repeated closing responses
- Call termination

These were addressed through prompt constraints, explicit tool usage, state-based conversation rules and controlled closing behaviour.

## Repository Structure

```text
KAPTURE-COLLECTIONS-VOICEBOT/
│
├── backend/
│   ├── package.json
│   ├── package-lock.json
│   └── server.js
│
├── docs/
│   ├── Kapture_Finance_HLD.pdf
│   └── architecture-diagram.png
│
├── tools/
│   ├── verify_customer.json
│   ├── log_promise_to_pay.json
│   ├── send_payment_link.json
│   └── mark_disposition.json
│
├── System_Prompt.txt
└── README.md
Limitations

This is a take-home prototype using mocked business endpoints and test customer information.

A production implementation would require secure backend services, real customer-data integrations, payment systems, CRM integration, authentication infrastructure, monitoring and compliance review.

Future Improvements
Production payment-link integration
CRM integration
Human-agent transfer
English/Hindi bilingual support
Automated conversation evaluation
Production observability dashboard
Automated test suite
Secure payment and notification integrations