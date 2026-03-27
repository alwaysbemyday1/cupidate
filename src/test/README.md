# Test Notes

## Supabase mocking strategy

- Never call real Supabase in unit tests.
- Mock only the interface your test needs (`from`, `auth.getUser`, etc.).
- Use `createSupabaseMock()` from `src/test/mocks/supabaseMock.ts` as the default baseline.

Example:

```ts
import { createSupabaseMock } from "src/test/mocks/supabaseMock";
```

## Query cache in tests

- Use `createTestQueryClient()` from `src/test/utils/createTestQueryClient.ts`.
- Retries are disabled to keep tests deterministic and fast.
