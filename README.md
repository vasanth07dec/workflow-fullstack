# 🚀 Workflow Application

A role-based workflow management system where users can create, execute, approve, and manage workflows with conditional step logic and email notifications.

---

# 📌 Initial Setup

## 1️⃣ Install Dependencies

Run the following command in both **frontend** and **backend** folders:

```bash
npm install
```

---

## 2️⃣ Configure Email (Nodemailer Setup)

This project uses `nodemailer` for sending email notifications.

### 🔹 Create Google App Password

1. Go to your **Google Account**
2. Search for **"App Passwords"**
3. Enable **2-Step Verification** (if not already enabled)
4. Generate a new App Password
5. Copy the generated password (remove spaces)

### 🔹 Add to `.env`

```env
GENERATED_MAIL_APP_PASSWORD=your_generated_password
MAIL=manager_email_address
```

---

## 3️⃣ Configure Manager User

In:

```
backend/config/initDB.js
```

Add new user with actual mail for mailing support with manager:

```js
{
  name: "Manager mail",
  email: process.env.MAIL,
  role: "manager"
}
```

---

## 4️⃣ Default Users

All predefined users and passwords are located in:

```
backend/config/initDB.js
```

---

## 5️⃣ Configure Database

Update your `.env` file:

```env
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password
```

---

## 6️⃣ Run the Application

Start both frontend and backend:

```bash
npm run dev
```

---

# 📖 Overview

The system supports four roles:

- **Admin**
- **User**
- **Manager**
- **CEO**

Each role has different permissions and access levels.

### 🔹 Role Permissions

- **Admin**
  - Create workflow
  - Execute workflow

- **User**
  - Execute workflow

- **Manager**
  - Execute workflow
  - Approve / Reject workflow

- **CEO**
  - Execute workflow
  - Approve / Reject workflow

---

# ⚙️ How Workflow Works

### Example Flow:

1. **Admin** creates a workflow with:
   - Input schema
   - Steps
   - Rules / Conditions

2. **User**(or anyone) executes the workflow.

3. Based on step configuration:
   - Manager / CEO approves or rejects.

4. Once approved:
   - Workflow status → `completed`

---

# 🔁 Step Rules

All workflow steps pass through defined conditions.

---

## Case 1️⃣: Single Notification Step

If workflow has only one step:

- Type: `notification`
- Email is sent
- Workflow auto-completes  
  (because no approver exists)

---

## Case 2️⃣: Notification + Approve

If workflow has:

- Step 1 → `notification`
- Step 2 → `approve`

Then:

- Email notification is sent
- Workflow status remains `pending`
- After approval → status becomes `completed`

---

## Case 3️⃣: Multiple Approve Steps

If workflow contains multiple `approve` steps:

- If **any one approver approves**
- Workflow status → `completed`

## DEMO VIDEO COVER 3 cases

---

# 🏗️ Design & Technical Decisions

---

# 🎨 Frontend

- ✅ Lazy loading for optimized performance
- ✅ Protected routes
- ✅ 404 Not Found page
- ✅ Debounced server-side search (custom `useDebounce` hook) (only in workflow page)
- ✅ Server-side pagination (only in workflow page)
- ✅ `useMemo` for expensive calculations
- ✅ Redux RTK Query for:
  - API integration
  - Caching
  - Auto request cancellation
- ✅ Ant Design for UI components
- ✅ Tailwind CSS for layout styling
- ✅ Clean code with proper comments

---

# 🛠️ Backend

- ✅ MVC architecture pattern
- ✅ JWT authentication with cookies
- ✅ Protected route middleware
- ✅ Condition parsing using:

```js
expr-eval
```

> ⚠️ `eval()` was avoided due to security risks.  
> `expr-eval` only supports mathematical expressions — not JavaScript execution.

- ✅ Nodemailer for email support
- ✅ Clean file structure with comments

---

# 🧠 Key Highlights

- Role-based authorization
- Dynamic workflow step execution
- Conditional rule evaluation
- Email notification system
- Secure expression parsing
- Optimized frontend performance

---

# 📌 Tech Stack

### Frontend
- React
- TypeScript
- Redux Toolkit (RTK Query)
- Ant Design
- Tailwind CSS

### Backend
- Node.js
- Express.js
- PostgreSQL
- JWT
- Nodemailer
- expr-eval

---
