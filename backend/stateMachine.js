const STATES = {
  CALL_INITIATED: "CALL_INITIATED",
  DISCLOSURE: "DISCLOSURE",
  VERIFICATION: "VERIFICATION",
  AUTHENTICATION: "AUTHENTICATION",
  SAFE_HANDLING: "SAFE_HANDLING",
  DISCUSSION: "DISCUSSION",
  INTENT: "INTENT",
  BUSINESS_ACTION: "BUSINESS_ACTION",
  RESPONSE_TTS: "RESPONSE_TTS",
  CUSTOMER_RESPONSE: "CUSTOMER_RESPONSE",
  CALL_CLOSURE: "CALL_CLOSURE"
};

function nextState(state, event) {
  const transitions = {
    CALL_INITIATED: {
      call_connected: STATES.DISCLOSURE
    },

    DISCLOSURE: {
      disclosed: STATES.VERIFICATION
    },

    VERIFICATION: {
      verified: STATES.AUTHENTICATION
    },

    AUTHENTICATION: {
      success: STATES.DISCUSSION,
      failed: STATES.SAFE_HANDLING
    },

    SAFE_HANDLING: {
      escalated: STATES.CALL_CLOSURE
    },

    DISCUSSION: {
      intent_detected: STATES.INTENT
    },

    INTENT: {
      promise_to_pay: STATES.BUSINESS_ACTION,
      payment_request: STATES.BUSINESS_ACTION,
      dispute_or_hardship: STATES.BUSINESS_ACTION
    },

    BUSINESS_ACTION: {
      action_completed: STATES.RESPONSE_TTS
    },

    RESPONSE_TTS: {
      response_delivered: STATES.CUSTOMER_RESPONSE
    },

    CUSTOMER_RESPONSE: {
      continue: STATES.DISCUSSION,
      completed: STATES.CALL_CLOSURE
    }
  };

  return transitions[state]?.[event] || null;
}

module.exports = { STATES, nextState };