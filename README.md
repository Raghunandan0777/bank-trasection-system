# Bank Transaction System

Backend API for a banking app — handles user auth, account management, and money transfers with a double-entry ledger system.

Built with Node.js, Express v5, MongoDB (Mongoose), and JWT for auth.

## Setup

```bash
npm install
```

Create a `.env` file in the root:

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/bank-transaction-system
JWT_SECRET=your_secret_here

# Gmail OAuth2 (for sending emails)
EMAIL_USER=your-email@gmail.com
CLIENT_ID=your_google_client_id
CLIENT_SECRET=your_google_client_secret
REFRESH_TOKEN=your_google_refresh_token
```

Run the server:

```bash
npm run node    # dev mode (nodemon)
npm start       # production
```

## Project Structure

```
server.js                              # entry point
src/
  config/db.js                         # MongoDB connection
  models/
    user.model.js                      # user schema (name, email, hashed password)
    account.model.js                   # bank account (user ref, status, currency)
    transaction.model.js               # transaction record (from, to, amount, status)
    ledger.model.js                    # immutable debit/credit entries
  controller/
    auth.controller.js                 # register, login
    account.controller.js              # create account, list accounts, get balance
    transaction.controller.js          # transfer funds, initial deposit
  middleware/
    auth.middleware.js                 # JWT verification, system user check
  routes/
    auth.route.js
    account.route.js
    transaction.route.js
  services/
    email.services.js                  # sends emails via Gmail OAuth2
```

## API Routes

### Auth — `/api/auth`

**POST `/register`** — Create a new user. Body: `{ name, email, password }`. Returns user info + JWT token (also set as cookie).

**POST `/login`** — Login. Body: `{ email, password }`. Returns user info + JWT token.

### Accounts — `/api/account` (auth required)

**POST `/`** — Create a new account for the logged-in user. Defaults to INR currency, ACTIVE status.

**GET `/`** — List all accounts of the logged-in user.

**GET `/:id`** — Get balance of a specific account.

### Transactions — `/api/transaction` (auth required)

**POST `/`** — Transfer money between accounts.
Body: `{ fromAccount, toAccount, amount, idompotencyKey }`

Checks:
- Both accounts must exist and be ACTIVE
- Sender must have enough balance
- Idempotency key prevents duplicate transactions
- Creates DEBIT + CREDIT ledger entries atomically (MongoDB session)
- Sends email alerts to both parties

**POST `/system/initial-fund`** — Deposit initial funds into an account (system user only).
Body: `{ toAccount, amount, idompotencyKey }`

## How It Works

- **Passwords** are hashed with bcrypt before saving. The password field is hidden from queries by default.
- **Auth** uses JWT tokens (30-day expiry), sent via cookies and also returned in the response.
- **Balance** is not stored directly on the account — it's calculated from ledger entries using MongoDB aggregation (sum of credits minus debits).
- **Ledger entries are immutable** — the schema blocks any update or delete operations on ledger documents.
- **Transactions are atomic** — uses MongoDB sessions so if anything fails mid-transfer, everything rolls back.
- **System users** have a special `systemUser` flag and can perform initial fund deposits.

## Dependencies

- `express` — web framework
- `mongoose` — MongoDB ODM
- `bcryptjs` — password hashing
- `jsonwebtoken` — JWT auth
- `cookie-parser` — parse cookies
- `nodemailer` — email notifications
- `dotenv` — env variable loading

## License

ISC
