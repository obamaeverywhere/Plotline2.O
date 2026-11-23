# Backend: hosted functions rather than an application server

Plotline has a backend, but no Express/Fastify server, controller directory, custom Node server initialization, or request-middleware chain. The backend is hosted PostgreSQL on Supabase, with functions exposed by Supabase's PostgREST HTTP API. SQL is executable server-side application code here. Vite's local process serves frontend development modules; starting it does not start PostgreSQL or apply migrations.

## Find the layers

| Layer | Actual file/service | Responsibility |
|---|---|---|
| UI action | [StudioApp.tsx](../../src/studio/StudioApp.tsx), [ViewerApp.tsx](../../src/viewer/ViewerApp.tsx), [ChangeList.tsx](../../src/viewer/ChangeList.tsx) | Collect user intent, manage pending/error UI. |
| Browser API helpers | [supabase.ts](../../src/lib/supabase.ts), [events.ts](../../src/lib/events.ts) | Build HTTP requests; classify errors; queue buyer events; group reports. |
| HTTP layer | Supabase `/rest/v1/rpc/<function>` | Decode arguments, select allowed SQL function, serialize result/error. |
| Business rules | [share migration](../../supabase/migrations/20261003120000_share_links.sql), [events migration](../../supabase/migrations/20261004120000_events.sql) | Staff-key checks, snapshot creation, link lookup, event insertion/history. |
| Persistence | PostgreSQL `units`, `share_links`, `events`, `private.config` | Rows, constraints, indexes, privileges, and trigger enforcement. |

Supabase manages the HTTP/database service lifecycle. Migrations establish functions and privileges separately from frontend deployment. The repository provides SQL files and a combined SQL-editor script; it does not contain a complete local Supabase CLI configuration.

## The actual request helper

Excerpt from `src/lib/supabase.ts`:

```ts
export async function rpc<T>(fn: string, args: object): Promise<T> {
  if (!URL || !KEY) throw new RpcError(0, 'Supabase is not configured')
  const r = await fetch(`${URL}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
  })
  if (!r.ok) throw new RpcError(r.status, `${fn}: ${r.status} ${await r.text()}`)
  return r.json() as Promise<T>
}
```

`JSON.stringify` serializes the object into request text. `await fetch` waits for a response; an HTTP error status does not automatically make fetch reject, so the helper checks `r.ok`. `r.json()` parses the body. The generic `T` describes what the caller expects; the cast performs no schema validation.

This is the code's current header behavior, not a template to generalize. Modern Supabase publishable keys are not JWT user tokens. Official guidance puts them in `apikey`; bearer authorization ordinarily carries an appropriate JWT. The helper duplicates the configured key into both headers. Check key type and live API behavior when diagnosing authentication failures rather than assuming all legacy and modern key combinations behave identically. No real backend request was performed for this guide. See [Supabase API-key guidance](https://supabase.com/docs/guides/getting-started/api-keys).

## Existing endpoints

All four helpers use HTTP POST to RPC endpoints, including operations that only read. HTTP method alone does not identify whether the SQL function writes data.

| Endpoint suffix | Arguments | Result | Rule implemented on the server |
|---|---|---|---|
| `unit_by_token` | `p_token: uuid` | Unit JSON or null | Possession of an existing share token selects that snapshot. |
| `publish_unit` | `p_unit: jsonb`, `p_key: text` | New token UUID | Compare key with `private.config`; insert unit snapshot and link. |
| `add_event` | `p_id`, `p_token`, `p_kind`, `p_ref`, `p_buyer`, `p_name`, `p_payload` | Event ID UUID | Foreign key/check constraints; duplicate IDs do not create duplicate rows. |
| `events_for_staff` | `p_key: text` | `{links, events}` JSON | Compare staff key; return all links/events with superseded flags. |

These are not a general REST CRUD interface. Direct anonymous table access is revoked. There are no implemented user-registration, session-refresh, logout, organization-management, link-expiry, or link-revocation endpoints.

## One complete workflow: publish and open a Studio plan

1. **User action.** The staff member clicks Share in `StudioApp.tsx`. The `share` callback checks for a remembered staff key, otherwise prompts. Cancel returns without publishing.
2. **Prepare data.** It sets `sharing`, reads `stateRef.current`, gives an empty name a fallback, and calls `withLayout` to include arranged furniture in the unit snapshot.
3. **Call helper.** `publishUnit(unit, key)` invokes `rpc<string>('publish_unit', { p_unit: unit, p_key: staffKey })` in `src/lib/supabase.ts`.
4. **HTTP transport.** The browser sends JSON to `https://<project>.supabase.co/rest/v1/rpc/publish_unit` with the configured public application key and current header behavior above. The staff key is a request-body argument, not the Supabase API key.
5. **Server function.** `public.publish_unit` runs in PostgreSQL. It checks `p_key` against the private configuration value. On failure it raises SQLSTATE `28000`.
6. **Transaction.** SQL inserts a row in `units`, then inserts a row in `share_links` referring to that row, then returns the new token. These statements execute within the function's request transaction; failure must not leave a successful partial publish committed.
7. **Response.** PostgREST serializes the UUID as JSON. The helper parses it; the UI constructs `${location.origin}/s/${token}`.
8. **UI update.** The callback attempts clipboard copy, displays a link toast, handles errors, and resets `sharing` in `finally`. Clipboard rejection is currently swallowed, so a “copied” toast is not proof the operating-system clipboard succeeded.
9. **Buyer navigation.** A buyer opens `/s/<token>`. `main.tsx` selects Viewer. Viewer calls `fetchSharedUnit(token)`, which requests `unit_by_token` with `p_token`.
10. **Lookup and render.** SQL joins `share_links` to `units` and returns `u.json`. Viewer accepts the unit, derives rooms/layout, and passes it to `PlotlineScene`. The share represents a snapshot, not a live connection to the editor draft.

To debug this workflow, put breakpoints at `share`, `publishUnit`, and the Viewer fetch effect. Inspect the request status/argument names, then inspect SQL errors on the configured development project. Do not log or share the staff-key argument.

## Authentication versus authorization

Authentication establishes who someone is; authorization determines what an actor may do. Current Plotline does not establish a signed-in person's identity through Supabase Auth. Instead:

- The Supabase public application key identifies requests using the project's public access path.
- A share token is a bearer capability: anyone holding it can request the linked snapshot and submit permitted events.
- A single staff key gates publishing and reading the complete report. It is compared in SQL and currently remembered in browser storage.
- A buyer ID is a random browser-local identifier with an optional typed name. It is not a verified person/account.
- Staff visibility flags/query parameters hide or reveal UI. They are not backend authorization.

The functions are `SECURITY DEFINER`: they execute with their owner's privileges rather than simply inheriting the caller's table restrictions. That makes function bodies, checks, ownership, explicit search paths, and execute grants the critical boundary. RLS/table revokes alone do not make an overly powerful definer function safe.

Current scope is global staff access and link possession, not per-organization isolation. Event payload size/kind checks exist, but detailed comment/selection schema checks and authoritative server-side pricing do not. Rate limiting per link is not implemented in these functions. Learn these limits before adding users, monetization, or production access assumptions; the existing [security audit](../../audit-reports/SECURITY_AUDIT.md) records related concerns.

## Buyer-event workflow and failure handling

`sendEvent` in `events.ts` creates a UUID before sending, attaches the browser buyer identifier, writes the event to `plotline.outbox`, then calls `flushOutbox`. A module-level promise serializes flushing. `drain` sends the oldest queued row through `add_event`, removing successful rows. Network/5xx errors keep the row for a later attempt. Server `ON CONFLICT (id) DO NOTHING` makes a retry with the same UUID idempotent: one logical submission should not become multiple stored rows.

That is the intended durability model. Current implementation has important gaps: blocked/full storage can prevent the queue write and therefore prevent the send, despite comments suggesting otherwise; 4xx responses, including 429, drop queued rows; “pending” UI is not proof of durable remote delivery. These are useful debugging/test targets, not patterns to copy without review. Never test failure recovery by deleting your only outbox copy.

`eventsForStaff` retrieves report data. `byLink` groups current selections and counts active notes, while historical rows remain available. CSV export quotes delimiters/newlines but does not provide comprehensive spreadsheet-formula neutralization. Treat buyer text and custom option data as untrusted.

## Error model

| Observation | Likely layer | Next inspection |
|---|---|---|
| `RpcError` status `0`, “not configured” | Browser helper, before request | Public variables and Vite restart/build. |
| Fetch network rejection/CORS message | Connectivity/browser policy/service | Network panel, origin, DNS, server reachability. |
| 400 malformed UUID | PostgREST argument conversion | Token and parameter types; shared helper deliberately maps 400 to null. |
| 401/403 | Key/header/grant/staff check | Response body and SQLSTATE; do not assume one status uniquely identifies the cause. |
| Function-not-found response | Schema/exposure/configuration | Correct project, function name/signature, migrations/API schema state. |
| Constraint violation | PostgreSQL | Foreign key, allowed kind, string length, payload size. |
| 5xx | Service/function failure | Supabase database/API logs and matching request details. |

Some source comments mention different expected unauthorized statuses. The SQL raises an error; the HTTP layer determines the status. The UI handles both 401 and 403 for a wrong staff key. Mocked statuses in tests do not verify the deployed mapping.

## Configuration and external services

`VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` are frontend configuration. Vite also explicitly maps `SUPABASE_URL`/`SUPABASE_KEY` build-process variables into those browser constants. Neither naming scheme hides a secret. Never place a secret/service-role key or the staff key in these variables. The alias guard checks certain secret formats only for `SUPABASE_KEY`, not every possible public-variable input path.

Maps, weather, Gemini OCR fallback, and local Ollama calls originate in browser/worker adapters, not a custom Plotline server proxy. A production proxy or private AI credential store would require an additional design and deployment; it does not currently exist. See [setup](07-UBUNTU-SETUP.md) and [deployment](10-DEPLOYMENT-GUIDE.md).

For API exploration, prefer inspecting a read-only `unit_by_token` request in an isolated development project. If using curl/Postman later, use placeholders, a development public key, and an intentionally shared test token. Do not paste real staff credentials into shell arguments/history. The existing verification script's optional staff-key argument performs persistent writes and can expose the key in the process list; it is not a beginner production smoke test.

Next: [06 — Database and storage](06-DATABASE-GUIDE.md).
