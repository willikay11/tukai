# Export Conversion: Before & After Examples

Quick reference for converting default exports to named exports.

---

## Pattern 1: Simple Function Component

### BEFORE

```tsx
// app/components/nav.tsx
export default function Nav() {
  const pathname = usePathname();

  return <nav>{/* content */}</nav>;
}
```

### AFTER

```tsx
// app/components/nav.tsx
export const Nav = () => {
  const pathname = usePathname();

  return <nav>{/* content */}</nav>;
};
```

### Import Changes

```tsx
// BEFORE
import Nav from '@/app/components/nav'

// AFTER
import { Nav } from '@/app/components/nav'
```

---

## Pattern 2: Page Component with Props

### BEFORE

```tsx
// app/page.tsx
export default function ExperiencesPage({ searchParams }: { searchParams: { category?: string } }) {
  return <main>...</main>;
}
```

### AFTER

```tsx
// app/page.tsx
export const ExperiencesPage = ({ searchParams }: { searchParams: { category?: string } }) => {
  return <main>...</main>;
};
```

### Import Changes

```tsx
// BEFORE
import ExperiencesPage from '@/app/page'

// AFTER
import { ExperiencesPage } from '@/app/page'
```

---

## Pattern 3: Arrow Function Component

### BEFORE

```tsx
// app/components/rating.tsx
const Rating = ({ value, size }: RatingProps) => {
  return <div className="rating">{value}</div>;
};

export default Rating;
```

### AFTER

```tsx
// app/components/rating.tsx
export const Rating = ({ value, size }: RatingProps) => {
  return <div className="rating">{value}</div>;
};
```

### Import Changes

```tsx
// BEFORE
import Rating from '@/app/components/rating'

// AFTER
import { Rating } from '@/app/components/rating'
```

---

## Pattern 4: Async Server Component

### BEFORE

```tsx
// app/communities/[communityId]/page.tsx
export default async function ViewCommunityPage({ params }: { params: { communityId: string } }) {
  const session = await getAuthSession();
  return <main>...</main>;
}
```

### AFTER

```tsx
// app/communities/[communityId]/page.tsx
export const ViewCommunityPage = async ({ params }: { params: { communityId: string } }) => {
  const session = await getAuthSession();
  return <main>...</main>;
};
```

### Import Changes

```tsx
// BEFORE
import ViewCommunityPage from '@/app/communities/[communityId]/page'

// AFTER
import { ViewCommunityPage } from '@/app/communities/[communityId]/page'
```

---

## Pattern 5: Component with Generic Type

### BEFORE

```tsx
// app/components/ListContainer.tsx
export default function ListContainer<T>({
  items,
  renderItem,
}: {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
}) {
  return <div>{items.map(renderItem)}</div>;
}
```

### AFTER

```tsx
// app/components/ListContainer.tsx
export const ListContainer = <T,>({
  items,
  renderItem,
}: {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
}) => {
  return <div>{items.map(renderItem)}</div>;
};
```

### Import Changes

```tsx
// BEFORE
import ListContainer from '@/app/components/ListContainer'

// AFTER
import { ListContainer } from '@/app/components/ListContainer'
```

**Note:** Generic type syntax changes slightly with arrow functions: `<T>` becomes `<T,>` in the parameter list.

---

## Pattern 6: Layout Component

### BEFORE

```tsx
// app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
```

### AFTER

```tsx
// app/layout.tsx
export const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
};
```

---

## Pattern 7: Component with 'use client'

### BEFORE

```tsx
// app/components/search.tsx
'use client';

import { useState } from 'react';

export default function Search() {
  const [query, setQuery] = useState('');
  return <input value={query} onChange={(e) => setQuery(e.target.value)} />;
}
```

### AFTER

```tsx
// app/components/search.tsx
'use client';

import { useState } from 'react';

export const Search = () => {
  const [query, setQuery] = useState('');
  return <input value={query} onChange={(e) => setQuery(e.target.value)} />;
};
```

**Note:** The `'use client'` directive stays at the top unchanged.

---

## Pattern 8: Component Re-exported from Index

### BEFORE

```tsx
// app/components/form/button.tsx
export default function Button({ label }: ButtonProps) {
  return <button>{label}</button>;
}

// app/components/form/index.ts
export { default as Button } from './button';
```

### AFTER

```tsx
// app/components/form/button.tsx
export const Button = ({ label }: ButtonProps) => {
  return <button>{label}</button>;
};

// app/components/form/index.ts
export { Button } from './button';
```

### Import Changes

```tsx
// BEFORE
import { Button } from '@/app/components/form'

// AFTER (same! - the index.ts re-export handles this)
import { Button } from '@/app/components/form'
```

---

## Pattern 9: Multiple Exports in One File

### BEFORE

```tsx
// app/components/utils.tsx
export const helperFunction = () => { ... };
export const CONSTANT_VALUE = 42;

export default function MainComponent() {
  return <div>{CONSTANT_VALUE}</div>;
}
```

### AFTER

```tsx
// app/components/utils.tsx
export const helperFunction = () => { ... };
export const CONSTANT_VALUE = 42;

export const MainComponent = () => {
  return <div>{CONSTANT_VALUE}</div>;
};
```

### Import Changes

```tsx
// BEFORE
import MainComponent, { helperFunction } from '@/app/components/utils'

// AFTER
import { MainComponent, helperFunction } from '@/app/components/utils'
```

---

## Pattern 10: Wrapper Component

### BEFORE

```tsx
// app/components/wrapper.tsx
export default function PageWrapper({ children }: { children: React.ReactNode }) {
  return <div className="page-wrapper">{children}</div>;
}
```

### AFTER

```tsx
// app/components/wrapper.tsx
export const PageWrapper = ({ children }: { children: React.ReactNode }) => {
  return <div className="page-wrapper">{children}</div>;
};
```

---

## Common Mistakes to Avoid

### ❌ WRONG: Forgetting the semicolon

```tsx
// DON'T DO THIS
export const Nav = () => {
  return <nav></nav>;
}; // ← Missing semicolon (though optional, be consistent)
```

### ❌ WRONG: Mixing named and default exports

```tsx
// DON'T DO THIS
export const Component = () => { ... };
export default Component;  // ← Creates both
```

### ❌ WRONG: Incorrect arrow function syntax with generics

```tsx
// DON'T DO THIS
export const List<T> = ({ items }: { items: T[] }) => { ... };
// This will cause syntax error

// DO THIS
export const List = <T,>({ items }: { items: T[] }) => { ... };
// Generic parameters go AFTER the arrow but BEFORE parentheses
```

### ❌ WRONG: Forgetting to update imports

```tsx
// Component file - CORRECT
export const Nav = () => { ... };

// Consumer file - WRONG
import Nav from '@/app/components/nav'  // ← Still trying to import default

// Consumer file - CORRECT
import { Nav } from '@/app/components/nav'
```

---

## Find & Replace Commands

### Using VSCode

#### Step 1: Find default exports

**Find regex:**

```
^export default (function|const) (\w+)
```

#### Step 2: Replace with named export

**Replace pattern:**

```
export const $2
```

**Steps:**

1. Open Find & Replace (`Cmd+H`)
2. Enable regex mode (click `.*` button)
3. Enter find pattern
4. Enter replace pattern
5. Replace all
6. Verify changes with `npm run build`

### Updating Imports

#### Find all default imports

**Find regex:**

```
import (\w+) from '(@/[^']+)'
```

#### Replace with named imports

**Replace pattern:**

```
import { $1 } from '$2'
```

---

## File-by-File Checklist Template

Use this for each file you convert:

```
File: ./app/components/nav.tsx

[ ] 1. Identify component name: Nav
[ ] 2. Change export line:
      - export default function Nav() {
      + export const Nav = () => {
      + };
[ ] 3. Find all imports of this file:
      grep -r "import.*Nav.*from.*nav" app/
[ ] 4. Update imports:
      - import Nav from '@/app/components/nav'
      + import { Nav } from '@/app/components/nav'
[ ] 5. Run build verification:
      npm run build
[ ] 6. Commit message:
      refactor: convert Nav to named export
```

---

## Batch Processing with Scripts

### Script to list all components needing conversion

```bash
#!/bin/bash
# Find all default exports
grep -r "^export default" app/ | grep -E "\.(tsx?|jsx?):"
```

### Script to verify all imports updated

```bash
#!/bin/bash
# Check for remaining default imports
grep -r "import.*from" app/ | grep -v "{ " | grep -v "import.*from 'react" | head -20
```

---

## Testing Your Conversions

### After each file conversion:

```bash
# 1. Quick check for syntax errors
npx tsc --noEmit app/components/nav.tsx

# 2. Check imports resolve
npm run build

# 3. Run linter on that file
npm run lint app/components/nav.tsx

# 4. If you have tests
npm test -- app/components/nav.test.tsx
```

### Whole-project verification:

```bash
# After converting a batch of files
npm run lint              # Should show fewer import/no-default-export errors
npm run build             # Should complete without errors
npm test                  # All tests should pass
```

---

## Quick Reference Card (Keep Handy)

```
DEFAULT EXPORTS → NAMED EXPORTS

Pattern:
  export default THING
  ↓
  export const THING

Imports:
  import THING from '...'
  ↓
  import { THING } from '...'

Generics:
  function Comp<T>(props: Prop<T>)
  ↓
  const Comp = <T,>(props: Prop<T>)

Test:
  npm run build && npm run lint
```
