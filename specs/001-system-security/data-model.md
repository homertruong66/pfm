# Data Model: SS-US-01 Login

No schema change is required for this US — it reads the existing `User` entity only.

## User (existing — `backend/users/models.py`)

| Field | Type | Relevant to Login |
|---|---|---|
| `email` | `EmailField`, unique | `USERNAME_FIELD` — the login identifier submitted by the caller |
| `password` | hashed `CharField` (from `AbstractUser`) | Verified against the submitted password by Django's `authenticate()` |
| `is_active` | `BooleanField`, default `True` (from `AbstractUser`) | When `False`, `ModelBackend.user_can_authenticate()` refuses authentication regardless of correct credentials (AC-03, BR-16) |

No `Role` entity exists yet (constitution's documented open drift) — login does not read or branch on Role; AC-04 (dual-role single login) holds by the absence of any role-gated check at login time, not by explicit design in this US.

## State Transitions

None triggered by login itself. `is_active` transitions (`ACTIVE` → `INACTIVE`) belong to UM-US-05 (Deactivate User), not this US — login only *reads* the current state.
