# SMS + Node.js

A learning project exploring **SMS integration with Node.js**, including SMS providers, OTP authentication, Redis storage, provider failures, delivery status, and webhooks.

The project uses a **mock SMS provider** so the complete system can be developed and tested without depending on a real SMS provider.

---

## What I Learned

### SMS Fundamentals

- How SMS delivery works
- SMS gateways and SMS providers
- Node.js → SMS Provider → Mobile Network → Phone
- HTTP/REST-based SMS APIs
- E.164 phone number format
- SMS message IDs
- SMS delivery lifecycle

### OTP

- Generating secure OTPs using `crypto.randomInt()`
- Hashing OTPs before storing them
- OTP expiration
- Maximum verification attempts
- OTP resend cooldown
- OTP verification
- Avoiding plaintext OTP storage

### Redis

- Storing OTP data in Redis
- Redis TTL / expiration
- Resend cooldown using Redis keys
- Storing SMS delivery status
- Why Redis is preferable to an in-memory `Map` for a multi-process application

### SMS Providers

- Provider abstraction
- Mock SMS provider
- Real provider integration
- Provider-specific failures
- Provider message IDs
- Separating business logic from provider implementation

### Webhooks

- Provider → Node.js communication
- Asynchronous delivery notifications
- Delivery status callbacks
- `queued`
- `sent`
- `delivered`
- `failed`
- `undelivered`

### Production Concepts

- Rate limiting
- Retries
- Duplicate SMS
- Idempotency
- Provider fallback
- Distributed-system consistency problems

---

# Architecture

```text
Client
  ↓
Routes
  ↓
Controllers
  ↓
OTP Service
  ├── Redis
  │
  └── SMS Service
          ↓
      SMS Provider
          ↓
         Phone
          │
          │ delivery status
          ↓
        Webhook
          ↓
        Redis
```

---

# Project Structure

```text
sms-node/
├── app.js
├── server.js
│
├── routes/
│   ├── authRoutes.js
│   └── smsRoutes.js
│
├── controllers/
│   └── authController.js
│
├── services/
│   ├── otpService.js
│   └── smsService.js
│
├── providers/
│   ├── mockSmsProvider.js
│   └── twilioSmsProvider.js
│
├── stores/
│   ├── otpStore.js
│   └── smsStore.js
│
├── utils/
│   ├── otp.js
│   └── phone.js
│
├── errors/
│   └── smsProviderError.js
│
├── config/
│   └── redis.js
│
├── .env
└── .gitignore
```

---

# Technologies

- Node.js
- Express
- Redis
- JavaScript / ES Modules
- Mock SMS Provider
- Twilio integration concepts

---

# Installation

Clone the project and install dependencies:

```bash
npm install
```

Start Redis locally.

Then configure `.env`:

```env
REDIS_URL=redis://localhost:6379
```

Start the server:

```bash
node server.js
```

For development:

```bash
node --watch server.js
```

The server runs on:

```text
http://localhost:3000
```

---

# OTP Flow

The OTP generation flow is:

```text
POST /auth/send-otp
        ↓
Validate phone number
        ↓
Check resend cooldown
        ↓
Generate OTP
        ↓
Hash OTP
        ↓
Send SMS
        ↓
Provider accepts SMS
        ↓
Store hashed OTP in Redis
        ↓
Set cooldown
```

An important design decision is that the OTP is **not stored before the SMS provider succeeds**.

This prevents a situation where:

```text
OTP saved in Redis
       ↓
SMS provider fails
       ↓
User never receives OTP
```

---

# OTP Storage

OTP data is stored in Redis using a key similar to:

```text
otp:+919876543210
```

The stored data contains:

```json
{
  "otpHash": "...",
  "attempts": 0,
  "messageId": "...",
  "smsStatus": "queued"
}
```

The OTP automatically expires after 5 minutes.

---

# OTP Security

The project implements several basic OTP protections.

### Secure generation

OTP generation uses:

```js
crypto.randomInt()
```

instead of `Math.random()`.

### Hashing

The actual OTP is never stored in Redis.

Instead:

```text
OTP
 ↓
SHA-256
 ↓
Redis
```

### Expiration

OTP expires after:

```text
5 minutes
```

### Verification attempts

A maximum of:

```text
5 attempts
```

is allowed.

After that, the OTP is deleted.

### Resend cooldown

A user must wait:

```text
60 seconds
```

before requesting another OTP.

---

# Phone Number Validation

Phone numbers are validated using E.164-style formatting.

Example:

```text
+919876543210
```

The project uses a basic validation function:

```js
/^\+[1-9]\d{7,14}$/
```

This is intentionally a basic application-level validation rather than a complete telecom-number validation system.

---

# SMS Provider Abstraction

The application separates SMS business logic from the actual provider.

```text
OTP Service
     ↓
SMS Service
     ↓
Provider
```

The application can therefore use:

```text
Mock Provider
```

or:

```text
Twilio Provider
```

without changing the OTP logic.

This is useful because different SMS providers have different:

- APIs
- authentication methods
- sender requirements
- pricing
- regional restrictions
- error formats

---

# Mock SMS Provider

The mock provider simulates sending an SMS:

```js
return {
    messageId: `mock_${Date.now()}`,
    status: "queued"
};
```

This allows the entire project to be developed without actually sending an SMS.

It also allows provider failures to be simulated.

---

# Provider Failure Handling

The project defines a custom:

```text
SMSProviderError
```

This allows the application to distinguish provider failures from normal application errors.

Example flow:

```text
Node.js
   ↓
SMS Provider
   ↓
Failure
   ↓
SMSProviderError
   ↓
Controller
   ↓
502 response
```

The detailed provider error should remain in server logs rather than being blindly exposed to the client.

---

# SMS Delivery Status

A successful provider API request does **not necessarily mean the phone received the SMS**.

The lifecycle can look like:

```text
queued
   ↓
sent
   ↓
delivered
```

Or:

```text
queued
   ↓
failed
```

Or:

```text
queued
   ↓
sent
   ↓
undelivered
```

### Important distinction

```text
queued
```

means the provider accepted/queued the SMS.

```text
delivered
```

means delivery was confirmed.

These are different events.

---

# SMS Message ID

Every SMS operation receives a provider-specific message ID.

Example:

```text
mock_1758123456789
```

The message ID allows the application to correlate a delivery-status event with the original SMS.

For example:

```text
messageId: mock_12345
status: queued
```

Later:

```text
messageId: mock_12345
status: delivered
```

The application knows that both events belong to the same SMS.

---

# Webhooks

SMS delivery is asynchronous.

The original request:

```text
Client
  ↓
Node.js
  ↓
SMS Provider
  ↓
queued
```

doesn't wait for the recipient's phone to receive the message.

Later, the provider sends a webhook:

```text
SMS Provider
     ↓
POST /sms/status
     ↓
Node.js
     ↓
Redis
```

The webhook contains information such as:

```text
MessageSid
MessageStatus
```

The application stores the latest status in Redis.

Example:

```json
{
  "messageId": "mock_12345",
  "status": "delivered"
}
```

---

# Testing the Webhook

The webhook endpoint is:

```text
POST /sms/status
```

It accepts URL-encoded data.

Example:

```text
MessageSid=mock_12345
MessageStatus=delivered
```

This simulates a provider telling our server:

> The SMS with this message ID has been delivered.

---

# Retry and Idempotency

Retries can be dangerous when sending SMS.

Consider:

```text
Node.js
   ↓
SMS Provider
   ↓
SMS successfully sent
   ↓
Response lost
   ↓
Node.js thinks request failed
   ↓
Retry
```

The user could receive two SMS messages.

This is why production systems need concepts such as:

- idempotency keys
- duplicate detection
- retry policies
- provider-specific message IDs

---

# Production Considerations

This project intentionally keeps the implementation simple.

A production SMS system would additionally need to consider:

- Strong rate limiting
- Abuse prevention
- Idempotency
- Retry strategies
- Message queues
- Delivery tracking
- Provider fallback
- Monitoring and alerting
- Audit logging
- Secure secret management
- Provider-specific regulatory requirements
- Distributed-system consistency

These are outside the scope of this learning project.

---

# Important Architecture Lesson

One of the main lessons from this project is that an external API call is not the end of the operation.

There are actually multiple stages:

```text
Application
    ↓
Provider accepts request
    ↓
Provider processes SMS
    ↓
Carrier processes SMS
    ↓
Recipient receives SMS
    ↓
Delivery status
    ↓
Webhook
    ↓
Application updates status
```

Therefore:

> **API success and final delivery are not the same thing.**

---

# Project Status

**Completed ✅**

This project covered SMS fundamentals through a complete OTP + Redis + provider + webhook learning implementation.