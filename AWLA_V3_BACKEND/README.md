# AWLA V3 Backend

Secure Cloudflare Worker backend for the V3 Tool Hub.

## Included
- Workers AI native generation.
- D1 provider connection registry.
- AES-GCM encrypted API-key vault.
- Provider run/cost log table.
- Extensible provider registry.
- Higgsfield modeled as OAuth/MCP (no client-side key).
- Magnific/fal modeled as server-side API-key connections.
- CORS restriction.

## Required before deployment
1. Create Cloudflare D1 database `awla-v3`.
2. Replace `REPLACE_WITH_D1_DATABASE_ID` in `wrangler.jsonc`.
3. Run migration `migrations/0001_init.sql`.
4. Add Worker secret `MASTER_KEY` with a long random value.
5. Deploy.

Do NOT put provider API keys in frontend/localStorage.
