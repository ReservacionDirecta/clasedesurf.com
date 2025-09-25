# Backend (Express + Prisma)

This is a minimal backend scaffold for the SurfSchool project.

Environment variables needed:
- DATABASE_URL (Postgres connection string)
- PORT (optional, defaults to 4000)

Install & run:

```powershell
cd backend; npm install; npm run dev
```

Notes:
- Authentication is not implemented in this scaffold. For now some endpoints expect `userId` to be provided (query param or body) as a temporary measure.
- Prisma client expects the schema defined at `backend/prisma/schema.prisma` in this workspace. After installing dependencies run the commands below to generate the client and create the initial migration.

Prisma setup (after installing dependencies):

```powershell
cd backend
npx prisma generate
# To create a migration and apply it locally (interactive)
npx prisma migrate dev --name init
```

If you already have an existing database and want to introspect it, use:

```powershell
npx prisma db pull
npx prisma generate
```

Development helper script

There is a small PowerShell helper at `scripts/setup-db.ps1` which runs Prisma generate and migrate for you:

```powershell
.\scripts\setup-db.ps1
```

Make sure your `backend/.env` has a correct `DATABASE_URL` before running migrations.
