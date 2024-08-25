# Supabase

To generate types dynamically from Supabase, run the following from command line (in location `/website/supabase/`):

```bash
npx supabase gen types --lang=typescript --project-id <project-id> --schema public > database.types.ts
```

where `<project-id>` is the alphanumeric projects string (***not*** `omshub-dev`, `omshub-prod`, etc.) from the corresponding Supabase project settings. See [here](https://supabase.com/docs/guides/api/rest/generating-types) for further reference.

In general, database interactions are implemented as functions. See subdirectory `/seed` for corresponding function definitions (as deployed in Supabase).
