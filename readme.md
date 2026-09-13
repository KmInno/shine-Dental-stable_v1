# Shine Receipt App

Lightweight Node.js / Express app for managing receipts and invoices for Shine Dental Surgery.

Features
- User authentication (JWT cookie). Roles: `admin` and normal user.
- Create, view, edit (admin) and delete (admin) invoices and receipts.
- Simple dashboard for normal users (view/create receipts & invoices).
- Detailed printable invoice and receipt views with "amount in words" and served-by info.

Quick start
1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the project root with the required environment variables (example):

```
ACCESS_TOKEN_SECRET=your_jwt_secret
REFRESH_TOKEN_SECRET=your_refresh_secret
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=receipt_app
DB_PORT=3306
NODE_ENV=development
```

3. Initialize the database using the SQL files in `src/config/` (for example `receipt-db.sql` and `alter_receipts.sql`).

4. Start the app:

```bash
npm start
# or
node server.js
```

Notes about the code
- Main server: `server.js`.
- Routes live in `src/routes/` (e.g. `receiptRoutes.js`, `invoiceRoutes.js`, `baseroute.js`).
- Controllers: `src/controllers/` hold logic for rendering views and handling form submissions.
- Models use `src/config/db.js` which reads DB connection settings from environment variables.
- Views are EJS templates in the `views/` folder. Layouts and partials are under `views/layouts` and `views/partials`.

Customizations & Tips
- The simplified user dashboard view is `views/simpleDashboard.ejs` (served to non-admin users from `src/controllers/baseController.js`).
- The invoice/receipt views show a left-side "Payment details" box. The displayed "Served by" name is fetched from the DB using the logged-in user's id (via `req.user.id`).
- To supply a real merchant code instead of the placeholder in `views/invoiceDetails.ejs`, either:
  - set an environment variable and update the template to read it, or
  - fetch it from the database and pass it as `merchantCode` in the controller before rendering.

Database
- DB connection: `src/config/db.js`. Uses `mysql2/promise` and the env vars `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`, `DB_PORT`.
- Example SQL files are in `src/config/` for creating tables.

Security
- JWTs are set into an HTTP-only cookie (`jwt`). Keep `ACCESS_TOKEN_SECRET` and `REFRESH_TOKEN_SECRET` secure.
- Passwords are hashed with `bcryptjs` before saving.

Development notes
- The app uses EJS layouts — modify `views/layouts/layout.ejs` and `views/partials/*` for global UI changes.
- Styles are in `public/css/styles.css` and images under `public/images/`.

If you want, I can:
- Add the merchant code as an env var and wire it into the invoice view.
- Normalize `getAccountById` to always return a single user object.
- Add a small admin/normal user toggle in the sidebar to hide admin links for normal users.

License
This repository has no license file.
1. Initialize the Project
mkdir receipt-app-backend && cd receipt-app-backend
npm init -y

2. Install Required Packages
npm install express mysql2 cors dotenv body-parser

4️⃣ Frontend Setup (React)
npm install axios
npm install express-ejs-layouts

