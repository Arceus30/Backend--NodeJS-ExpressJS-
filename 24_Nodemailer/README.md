# Nodemailer — Theory + Implementation

A practical Node.js learning project covering **Nodemailer**, SMTP, HTML emails, attachments, reusable mail services, verification/password-reset/OTP emails, and production-style email processing with **BullMQ + Redis**.

---

## What I Learned

### Nodemailer

- What Nodemailer is
- Creating an SMTP transporter
- Sending emails with `sendMail()`
- SMTP configuration
- SMTP ports and security
- `secure: true` vs `secure: false`
- `transporter.verify()`
- Using Ethereal Email for testing

### Email Messages

- `from`
- `to`
- `cc`
- `bcc`
- `replyTo`
- `subject`
- `text`
- `html`
- `attachments`

### HTML Emails

- Sending HTML email content
- Providing both `text` and `html` versions
- Creating reusable email templates
- Passing dynamic data into templates

### Attachments

- File attachments using `path`
- In-memory attachments using `content`
- Multiple attachments
- MIME concepts

### Environment Variables

- Storing SMTP credentials in `.env`
- Using `dotenv`
- Keeping credentials out of source control
- Configuring SMTP dynamically

### Common Application Emails

Implemented the concepts required for:

- Welcome emails
- Account verification emails
- Password reset emails
- OTP emails

### Security Concepts

- Generating secure tokens with Node's `crypto`
- Generating cryptographically secure OTPs
- Token expiration
- Single-use tokens
- Hashing tokens before database storage
- Never emailing plaintext passwords
- Rate limiting OTP requests and attempts
- Avoiding sensitive information in logs

---

# Queue-Based Email Processing

A major part of this project was understanding why email sending should not always happen directly inside an HTTP request.

Instead of:

```text
HTTP Request
    ↓
Nodemailer
    ↓
SMTP
    ↓
HTTP Response
```

we implemented:

```text
HTTP Request
    ↓
BullMQ
    ↓
Redis
    ↓
Worker
    ↓
Nodemailer
    ↓
SMTP
```

This allows the HTTP request to finish without waiting for the email server.

---

# Technologies

- Node.js
- Express
- Nodemailer
- SMTP
- Ethereal Email
- Redis
- BullMQ
- ioredis
- dotenv

---

# Project Architecture

```text
nodemailer-lab/
│
├── app.js
│
├── config/
│   ├── mail.js
│   └── redis.js
│
├── queues/
│   └── emailQueue.js
│
├── workers/
│   └── emailWorker.js
│
├── services/
│   └── mailService.js
│
├── templates/
│   ├── welcome.js
│   ├── verification.js
│   ├── passwordReset.js
│   └── otp.js
│
├── .env
├── .gitignore
├── package.json
└── README.md
```

---

# Responsibilities

## `app.js`

Application layer.

Responsible for:

- Receiving HTTP requests
- Performing application-level logic
- Generating required tokens
- Creating email jobs
- Returning the HTTP response

It should not contain the actual SMTP implementation.

---

## `config/mail.js`

Creates and exports the Nodemailer transporter.

```text
SMTP Configuration
        ↓
Nodemailer Transporter
```

---

## `services/mailService.js`

Provides a reusable interface for sending emails.

Instead of calling Nodemailer throughout the application:

```js
transporter.sendMail(...)
```

we use:

```js
sendMail(...)
```

This keeps the application decoupled from the underlying email implementation.

---

## `templates/`

Contains reusable email templates.

For example:

```js
verificationTemplate(username, verificationUrl)
```

returns:

```js
{
    subject,
    text,
    html
}
```

This separates **email content** from **email delivery**.

---

## `queues/emailQueue.js`

Creates the BullMQ queue.

```text
Application
     ↓
emailQueue.add(...)
     ↓
Redis
```

The queue stores work that needs to be performed.

---

## `workers/emailWorker.js`

Consumes email jobs.

```text
Redis
  ↓
Worker
  ↓
mailService
  ↓
Nodemailer
  ↓
SMTP
```

The worker is responsible for actually processing the email job.

---

# SMTP

SMTP stands for:

**Simple Mail Transfer Protocol**

It is the protocol used for sending email between mail systems.

Basic flow:

```text
Node.js
   ↓
Nodemailer
   ↓
SMTP Server
   ↓
Recipient Mail Server
   ↓
Recipient Inbox
```

Nodemailer does not deliver email directly to the recipient.

It communicates with an SMTP server.

---

# SMTP Ports

Common configurations:

### Port 587

Usually used with STARTTLS.

```js
{
    port: 587,
    secure: false
}
```

### Port 465

Usually used with implicit TLS.

```js
{
    port: 465,
    secure: true
}
```

The exact configuration depends on the SMTP provider.

---

# Basic Nodemailer Flow

```js
const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
        user,
        pass
    }
});
```

Then:

```js
await transporter.sendMail({
    from,
    to,
    subject,
    text,
    html
});
```

---

# Message Object

A typical email can contain:

```js
{
    from: "sender@example.com",
    to: "receiver@example.com",
    cc: "copy@example.com",
    bcc: "hidden@example.com",
    replyTo: "support@example.com",

    subject: "Welcome",

    text: "Welcome to the application.",

    html: "<h1>Welcome!</h1>"
}
```

---

# Attachments

Using a file:

```js
attachments: [
    {
        filename: "report.pdf",
        path: "./files/report.pdf"
    }
]
```

Using in-memory content:

```js
attachments: [
    {
        filename: "hello.txt",
        content: "Hello from Node.js"
    }
]
```

---

# Verification Email Flow

```text
User Registration
       ↓
Generate random token
       ↓
Create verification URL
       ↓
Create email template
       ↓
Add job to BullMQ
       ↓
Redis
       ↓
Worker
       ↓
Nodemailer
       ↓
SMTP
       ↓
User receives email
```

Example token generation:

```js
const token = crypto
    .randomBytes(32)
    .toString("hex");
```

Example URL:

```text
http://localhost:3000/verify?token=<token>
```

In a real application, the token should be stored securely in the database, preferably hashed, together with an expiration time.

---

# Password Reset Flow

```text
Forgot Password
       ↓
Generate secure reset token
       ↓
Store hashed token + expiry
       ↓
Queue email
       ↓
Worker
       ↓
Nodemailer
       ↓
SMTP
```

The reset email contains a reset URL rather than the user's password.

Passwords should never be emailed to users.

---

# OTP Email

A six-digit OTP can be generated using:

```js
crypto.randomInt(100000, 1000000).toString();
```

Example:

```text
583214
```

A production OTP should:

- Expire quickly
- Be single-use
- Be stored securely
- Have limited verification attempts
- Have rate-limited generation
- Not be logged

---

# BullMQ

BullMQ provides queue and worker functionality using Redis.

Basic flow:

```text
Queue
  ↓
Redis
  ↓
Worker
```

Adding a job:

```js
await emailQueue.add("send-email", {
    to: "receiver@example.com",
    subject: "Hello",
    text: "Hello from the worker"
});
```

The application does not send the email itself.

It creates a job.

---

# Worker

The worker listens for jobs:

```js
const worker = new Worker(
    "email",
    async (job) => {
        await sendMail(job.data);
    },
    {
        connection: redisConnection
    }
);
```

When a job arrives:

```text
Waiting Job
    ↓
Worker picks it up
    ↓
sendMail()
    ↓
Nodemailer
    ↓
SMTP
```

---

# Retries

Email delivery can fail because of:

- SMTP outages
- Network problems
- Temporary provider errors
- Connection failures

BullMQ can retry failed jobs.

Example:

```js
await emailQueue.add(
    "send-email",
    emailData,
    {
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: 5000
        }
    }
);
```

Conceptually:

```text
Attempt 1
   ↓
FAIL
   ↓
Wait
   ↓
Attempt 2
   ↓
FAIL
   ↓
Wait longer
   ↓
Attempt 3
   ↓
FAIL
   ↓
Job failed
```

The worker must allow the error to propagate.

If the worker catches and swallows the error, BullMQ may think the job succeeded.

---

# Exponential Backoff

Instead of retrying immediately:

```text
Failure
 ↓
5 sec
 ↓
Failure
 ↓
10 sec
 ↓
Failure
 ↓
20 sec
```

The delay increases between attempts.

This reduces pressure on a failing service.

---

# Worker Concurrency

A worker can process multiple jobs concurrently.

Example:

```js
{
    connection: redisConnection,
    concurrency: 5
}
```

Conceptually:

```text
             Redis
               │
       ┌───────┼───────┐
       ↓       ↓       ↓
     Job 1   Job 2   Job 3
       ↓       ↓       ↓
     Worker processing
```

Multiple worker processes can also be run:

```text
                 Redis
              /    |    \
             /     |     \
        Worker 1 Worker 2 Worker 3
```

This allows email processing to scale independently from the main application.

---

# Queue vs Database

The queue is not the application's permanent database.

### Database

Stores application state:

```text
Users
Verification Tokens
Reset Tokens
OTP State
```

### Queue

Stores work:

```text
Send Verification Email
Send Password Reset Email
Send OTP
Send Welcome Email
```

Think:

```text
Database = State

Queue = Work
```

---

# Idempotency

Retries can potentially result in duplicate operations.

For example:

```text
Worker sends email
       ↓
SMTP accepts email
       ↓
Worker crashes
       ↓
Job appears unfinished
       ↓
BullMQ retries
       ↓
Email sent again
```

Production systems should consider idempotency when duplicate processing matters.

A unique operation ID can help identify the same logical operation.

---

# Why Use a Queue?

Without a queue:

```text
POST /register
      ↓
SMTP
      ↓
Wait...
      ↓
Email sent
      ↓
Response
```

With a queue:

```text
POST /register
      ↓
Queue job
      ↓
Response immediately


Worker
  ↓
SMTP
  ↓
Email sent
```

Advantages:

- Faster HTTP responses
- Retry support
- Failure isolation
- Background processing
- Worker scaling
- Concurrency control
- Better handling of temporary SMTP failures

---

# Complete Architecture

```text
                         ┌───────────────┐
                         │    Express    │
                         │  Application  │
                         └───────┬───────┘
                                 │
                                 │ add job
                                 ▼
                         ┌───────────────┐
                         │    BullMQ     │
                         │     Queue     │
                         └───────┬───────┘
                                 │
                                 ▼
                         ┌───────────────┐
                         │     Redis     │
                         └───────┬───────┘
                                 │
                                 │ consume
                                 ▼
                         ┌───────────────┐
                         │     Worker    │
                         └───────┬───────┘
                                 │
                                 ▼
                         ┌───────────────┐
                         │  Mail Service │
                         └───────┬───────┘
                                 │
                                 ▼
                         ┌───────────────┐
                         │   Nodemailer  │
                         └───────┬───────┘
                                 │
                                 ▼
                         ┌───────────────┐
                         │  SMTP Server  │
                         └───────────────┘
```

---

# Important Separation of Responsibilities

```text
Application
    → Decides WHEN an email should be sent

Template
    → Defines WHAT the email contains

Queue
    → Stores the email work

Worker
    → Processes the email work

Mail Service
    → Provides the reusable sending interface

Nodemailer
    → Communicates with SMTP

SMTP
    → Handles email transport
```

---

# Running the Project

Install dependencies:

```bash
npm install
```

If `ioredis` is not already installed:

```bash
npm install ioredis
```

Start Redis:

```bash
redis-server
```

Start the email worker:

```bash
npm run worker
```

Start the application:

```bash
npm start
```

For development, a watch script can also be added to `package.json`.

---

# Environment Variables

Example:

```env
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=
MAIL_FROM=
```

Never commit `.env` to Git.

---

# Learning Outcome

This project progressed from a simple:

```text
Node.js → SMTP
```

implementation into a more realistic:

```text
Application
    ↓
Queue
    ↓
Redis
    ↓
Worker
    ↓
Mail Service
    ↓
Nodemailer
    ↓
SMTP
```

The main goal was not simply learning how to call `sendMail()`, but understanding **where email delivery belongs in a larger Node.js backend architecture**.