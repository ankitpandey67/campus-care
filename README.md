# Smart Complaint and Service Request Management System

A full-stack web application for colleges, hostels, campuses, and institutions to manage service requests and complaints efficiently.

## Architecture

- Frontend: React + Vite + Bootstrap + Recharts + Axios + React Router
- Backend: Node.js + Express + Mongoose + JWT
- Database: MongoDB
- File uploads: Multer with local storage
- Authentication: JWT and role-based guard middleware

## Complaint workflows

- Search requests by ticket number, title, or location, and filter by status or priority.
- Browse results with pagination while keeping staff results within their assigned department or queue.
- Open a request to review its details, activity history, and conversation, and post replies from the request page.

## Project structure

- `client/` – React application
- `server/` – Express API and MongoDB models
- `docs/` – API and Postman guidance

## Quick start

1. Install dependencies:
   ```powershell
   npm install --prefix server
   npm install --prefix client
   ```
2. Create environment files from examples:
   ```powershell
   copy server/.env.example server/.env
   ```
3. Start MongoDB locally or update `MONGO_URI`.
4. Run backend:
   ```powershell
   npm run dev --prefix server
   ```
5. Run frontend in a separate terminal:
   ```powershell
   npm run dev --prefix client
   ```

## Default admin setup

Create the first administrator using the seed route or a script after starting the backend. In development, an admin user can be created via the registration endpoint and then promoted by the database or with a console script. See the server route documentation for the exact API flow.

## Demo data

Use the seed endpoint or run a script in the server to add departments, categories, and sample complaints.

## Testing

```powershell
npm test --prefix server
```

## Production build

```powershell
npm run build --prefix client
```

## Notes

The system supports role-based access, complaint lifecycle transitions, upload validation, notifications, and analytics. It is structured for future extension to email alerts and cloud storage.
