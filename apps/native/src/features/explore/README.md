# Explore Feature Architecture

This feature follows a lean vertical slice pattern:

```text
features/explore/
  domain/        # Pure types and repository interfaces (no React)
  state/         # Zustand stores and selectors
  components/    # Presentational / small reusable UI pieces
  screens/       # Screen-level compositions wired to navigation
```

## Layers

1. Domain
   - `types.ts` defines core entities (`Listing`, `Category`).
   - `listingRepository.ts` abstracts data access (currently static mock, future: REST/GraphQL).
2. State
   - `exploreStore.ts` manages ephemeral UI state (filters, mode, loading flags).
3. Components
   - `ListingCard.tsx` re-export placeholder (to be refactored into feature-specific styling soon).
4. Screens
   - `ExploreSearch` will be moved here next; currently resides at feature root until split into `ExploreScreen` + `MapScreen` or unified.

## Conventions

- No direct network calls inside components; use repositories.
- Stores expose minimal setters; computed selectors handled locally when trivial.
- Avoid deep relative imports: use alias `@/features/explore/...` for clarity.
- Keep UI pure; side-effects (fetch) triggered in screen components or dedicated hooks.

## Next Steps

- Extract `ExploreSearch` into `screens/ExploreScreen.tsx` and `screens/ExploreMapScreen.tsx`.
- Implement a `useListings` hook that sources from repository and sets `listingsLoading`.
- Convert `ListingCard` into feature-specific version inside components, remove global one.
- Add skeleton shimmer while `listingsLoading` is true.
- Introduce favorites sub-store or slice in `state/`.
