const express = require("express");
const cors = require("cors");
const { STATES, nextState } = require("./stateMachine");

const app = express();

app.use(cors());
app.use(express.json());

// Mock customer data
const customers = {
  "ACC-88392": {
    account_id: "ACC-88392",
    name: "Rahul Sharma",
    phone: "9999999999",
    loan_type: "Personal Loan",
    overdue_amount: 8499,
    days_past_due: 12,
    verified: false
  }
};

// -----------------------------
// Health check
// -----------------------------
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    service: "Maya Collections Voicebot Backend"
  });
});

// -----------------------------
// Verify customer
// -----------------------------
app.post("/tools/verify_customer", (req, res) => {
  const { account_id, customer_name } = req.body;

  const customer = customers[account_id];

  if (!customer) {
    return res.json({
      success: false,
      verified: false,
      message: "Account not found"
    });
  }

  const verified =
    customer.name.toLowerCase() ===
    String(customer_name).toLowerCase();

  customer.verified = verified;

  res.json({
    success: true,
    verified,
    account_id,
    message: verified
      ? "Customer successfully verified"
      : "Customer verification failed"
  });
});

// -----------------------------
// Log Promise To Pay
// -----------------------------
app.post("/tools/log_promise_to_pay", (req, res) => {
  const {
    account_id,
    promise_date,
    amount
  } = req.body;

  console.log("Promise to Pay:", {
    account_id,
    promise_date,
    amount
  });

  res.json({
    success: true,
    account_id,
    promise_date,
    amount,
    message: "Promise to pay recorded successfully"
  });
});

// -----------------------------
// Send Payment Link
// -----------------------------
app.post("/tools/send_payment_link", (req, res) => {
  const { account_id, phone } = req.body;

  const paymentLink =
    `https://pay.kapturefinance.example/pay/${account_id}`;

  console.log("Payment link requested:", {
    account_id,
    phone
  });

  res.json({
    success: true,
    account_id,
    payment_link: paymentLink,
    message: "Payment link generated successfully"
  });
});

// -----------------------------
// Mark Disposition
// -----------------------------
app.post("/tools/mark_disposition", (req, res) => {
  const {
    account_id,
    disposition,
    notes
  } = req.body;

  console.log("Disposition:", {
    account_id,
    disposition,
    notes
  });

  res.json({
    success: true,
    account_id,
    disposition,
    message: "Call disposition recorded"
  });
});

// -----------------------------
// End Call
// -----------------------------
app.post("/tools/end_call", (req, res) => {
  const {
    account_id,
    disposition
  } = req.body;

  console.log("Call ended:", {
    account_id,
    disposition
  });

  res.json({
    success: true,
    account_id,
    disposition,
    call_status: "completed"
  });
});

// -----------------------------
// Escalation
// -----------------------------
app.post("/tools/escalate_to_agent", (req, res) => {
  const {
    account_id,
    reason,
    notes
  } = req.body;

  console.log("Escalation request:", {
    account_id,
    reason,
    notes
  });

  res.json({
    success: true,
    account_id,
    escalated: true,
    reason,
    message: "Call escalated to human agent"
  });
});

// -----------------------------
// State machine test endpoint
// -----------------------------
app.post("/state/transition", (req, res) => {
  const { state, event } = req.body;

  const newState = nextState(state, event);

  if (!newState) {
    return res.status(400).json({
      success: false,
      message: "Invalid state transition",
      state,
      event
    });
  }

  res.json({
    success: true,
    previous_state: state,
    event,
    new_state: newState
  });
});

// -----------------------------
// Start server
// -----------------------------
const PORT = 3000;

app.listen(PORT, () => {
  console.log(
    `Maya backend running on http://localhost:${PORT}`
  );
});