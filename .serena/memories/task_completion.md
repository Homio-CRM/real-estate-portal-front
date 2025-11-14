# Task Completion Checklist
- Ensure TypeScript builds without errors and affected API routes/components compile.
- Run `npm run lint` to confirm ESLint passes.
- For data changes against Supabase, verify relevant API routes return expected payloads (e.g., via fetch helper or browser).
- Update Supabase types with `npm run generate-types` when backend schema changes.
- Summarize modifications and recommend any manual verification (e.g., loading affected pages) before handing off.