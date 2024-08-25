# Services

A collection of services for the OMSHub application.

## Backend (Supabase)

CRUD operations for performing database interactions with Supabase (postgres-based).

Example usage:

```ts
import services from '@services/index';

const { getAllReviews } = services.backend;

const reviews = await getAllReviews();
```
