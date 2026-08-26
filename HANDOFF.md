# AWLA V3 Alpha — Handoff Gate

## Completed
- Modular Jewelry-only V3 architecture
- Brand Brain + SKU Library
- Strategy / Campaign Visual DNA
- Content Units
- Capability-based Creative Router
- Execution Graphs + node retry plan
- Product Lock browser implementation
- Per-unit Visual QC gate
- Approval memory
- Model/provider intelligence
- Cost guard
- AWLA Native adapter
- Secure BYOT backend architecture (D1 + encrypted secrets)
- Higgsfield capability mapping + adapter stub
- Magnific secure adapter slot
- Deployable static Alpha UI
- Automated tests

## External actions now required

### Frontend
Upload the contents of `AWLA_V3_ALPHA_DEPLOY.zip` to the root of GitHub repo `awla`.

### Backend
Create a Cloudflare D1 database named `awla-v3`, then:
1. Put its database ID in the backend `wrangler.jsonc`.
2. Apply `migrations/0001_init.sql`.
3. Set Worker secret `MASTER_KEY`.
4. Deploy `AWLA_V3_BACKEND`.

### Paid tools
- Higgsfield: connect the paid production workspace/account.
- Magnific: add an official API credential if you want it active in Alpha.
- fal.ai: optional later, not required for the first pilot.

## Release discipline
Do not expand into video, publishing or analytics before the 3-SKU jewelry benchmark is run and measured.
