# stashspot-api-types

Internal package that generates and exports TypeScript typings from the OpenAPI schema served at `http://localhost:3001/openapi`.

## Workflows

- Run the schema generator (requires the API running locally):

  ```sh
  pnpm --filter stashspot-api-types generate
  ```

  The command fetches the OpenAPI document and overwrites `src/generated.ts` with the latest typed client definitions.

- Clean the generated output:

  ```sh
  pnpm --filter stashspot-api-types clean
  ```

## Consumption

Import the generated types from anywhere in the monorepo once you have executed the generator:

```ts
import { paths } from 'stashspot-api-types';
```

> **Note**
> The generated file is not checked into source control. Remember to regenerate typings whenever the backend schema changes.
