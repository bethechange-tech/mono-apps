# App module structure

This app has been modularized with a feature-first layout:

- `src/app/` — App-level composition (navigation, providers, root shells)
  - `navigation/AppNavigator.tsx` — Bottom tabs + root navigation
  - `providers/AppProviders.tsx` — Global providers (SafeArea, Timeline)
- `src/features/` — Feature modules (home, timeline, chat, profile)
  - Each module re-exports its screens/stacks; they can be moved inside later
- `src/ui/` — Shared UI primitives and components
  - `ui/components/index.ts` — Barrel re-export for existing components
- `src/theme/` — Theming and tokens
- `src/context/` — React Contexts (e.g., TimelineContext)

Current step: we re-export existing screens/stacks into features to keep behavior intact. In follow-ups, we can move implementation files physically under each feature and update imports incrementally.

## Import examples

- Features: `import { TimelineStackNavigator } from '@/features/timeline'`
- UI components: `import { RecordButton } from '@/ui/components'`
- App-level: `import { AppNavigator } from '@/app/navigation/AppNavigator'`

## Migration checklist

- Move `src/screens/TimelineScreen.tsx` into `src/features/timeline/TimelineScreen.tsx`
- Move `src/navigation/TimelineStack.tsx` into `src/features/timeline/TimelineStack.tsx`
- Update any deep imports to use feature barrels
- Add tests / storybook (optional)
