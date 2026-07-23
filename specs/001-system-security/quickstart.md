# Quickstart: SS-US-01 Login

## Prerequisites

- Backend running: `cd backend && .venv\Scripts\activate && python manage.py runserver`
- At least one active User account exists (create via `python manage.py createsuperuser` or `POST /api/v1/users/`)

## Validate AC-01 — successful login issues credentials

```bash
curl -X POST http://localhost:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email": "<existing-active-user-email>", "password": "<correct-password>"}'
```
Expected: `200`, body contains `access` and `refresh` tokens.

## Validate AC-02 — invalid credentials rejected generically

```bash
curl -X POST http://localhost:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email": "<existing-user-email>", "password": "wrong-password"}'
```
Expected: `401`, single generic `detail` message — does not say "wrong password" specifically.

## Validate AC-03 — deactivated account rejected

```bash
python manage.py shell -c "from users.models import User; u = User.objects.get(email='<email>'); u.is_active = False; u.save()"
curl -X POST http://localhost:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email": "<email>", "password": "<correct-password>"}'
```
Expected: `401`, same generic message as AC-02 — does not reveal the account is deactivated.

## Validate AC-04 — dual-role account, single login

No separate flow to test today: create a User, log in once, confirm the returned token authorizes requests against any endpoint the account's queryset-scoped views allow (no role-specific gating exists yet in the backend — see plan.md's Constitution Check).

## Validate EC-01 — missing field

```bash
curl -X POST http://localhost:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email": "<email>"}'
```
Expected: `400`, field-level validation error for `password`.

## Frontend (once `frontend/src/app/login/page.tsx` exists)

1. `cd frontend && npm run dev`
2. Open `http://localhost:3000/login`
3. Submit valid credentials → redirected to Dashboard, tokens stored
4. Submit invalid credentials → inline `message-error` shown, form remains
