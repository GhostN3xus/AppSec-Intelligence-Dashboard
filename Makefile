install:
	cd backend && npm install
	cd frontend && npm install

import-semgrep:
	npm --prefix backend run import-semgrep -- --file=$${file}

dev-backend:
	cd backend && npm run start:dev

dev-frontend:
	cd frontend && npm run dev

seed:
	npm --prefix backend run seed

prisma-generate:
	npm --prefix backend run prisma:generate
