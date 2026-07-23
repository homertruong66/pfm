# Contract: POST /api/v1/auth/login/

Maps to spec.md AC-01, AC-02, AC-03, EC-01. Already implemented (stock `TokenObtainPairView`) — this documents the existing contract for traceability into SDS §6.4.

## Request

```json
{
  "email": "string, required",
  "password": "string, required"
}
```

## Success Response — 200

```json
{
  "access": "string (JWT, 1 hour lifetime)",
  "refresh": "string (JWT, 7 day lifetime)"
}
```
Covers AC-01, AC-04 (no role-specific field — same shape regardless of which role(s) the account holds).

## Error Responses

| Status | Condition | Body | AC / EC |
|---|---|---|---|
| `400` | `email` or `password` missing | DRF default `{field: [messages]}` | EC-01 |
| `401` | Email/password do not match an active account, **or** account is deactivated | `{"detail": "No active account found with the given credentials"}` — one generic message, does not distinguish which case or which field | AC-02, AC-03 |

## Refresh — POST /api/v1/auth/refresh/

Out of scope for SS-US-01's acceptance criteria (no AC references token refresh) — documented here only because it is the paired endpoint the login response's `refresh` token is used against. Already implemented via stock `TokenRefreshView`.
