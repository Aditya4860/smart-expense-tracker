# Smart Expense Tracker – Design System and UI/UX Specification

This document serves as the permanent Design System and UI/UX specification for the entire Smart Expense Tracker project. It provides strict guidelines and principles to ensure that any developer or AI working on the project can continue building new features while maintaining a highly consistent, premium design language.

---

## 1. Project Design Philosophy

### Visual Identity
The Smart Expense Tracker is designed to feel like a high-end, developer-first tool rather than a consumer banking app. It adopts a dark-first, highly technical aesthetic.

The application must always feel:
- **Premium**: High attention to detail, flawless alignment, and refined micro-interactions.
- **Minimal**: No unnecessary lines, dividers, or background noises. Everything has a purpose.
- **Technical & Futuristic**: Monospace typography for data, deep saturated backgrounds, and vibrant, glowing accents.
- **Developer-first**: Inspired by developer tools (high information density without feeling cluttered).
- **Financial SaaS**: Trustworthy, fast, and secure.
- **Spacious**: Generous padding (`24px` to `32px`) separating major blocks of information.
- **High Contrast & Elegant**: Crisp, legible typography on deep black backgrounds.
- **Professional**: Avoiding cartoonish gradients, oversized illustrations, or overly bouncy animations.

### Design Inspiration
While the design is original, it draws heavy inspiration from the following modern SaaS products. *Do not copy these products directly; use their layout density, shadow usage, and typography hierarchy as inspiration:*
- Basedash
- Linear
- Vercel Dashboard
- Supabase
- Railway
- Raycast
- Arc Browser
- Stripe Dashboard

---

## 2. Color System

The color system relies on Design Tokens to ensure absolute consistency. There are no hardcoded hex codes permitted in component files.

### Dark Theme (Default)
| Element | Token/Class | Hex Code | Usage |
| :--- | :--- | :--- | :--- |
| **Background** | `bg-surface-950` | `#07090D` | Main app background, highest layer. |
| **Secondary Background** | `bg-surface-900` | `#0E1118` | Top navigation, modals, side panels. |
| **Card Background** | `bg-surface-800` | `#11151D` | Standard data cards and widgets. |
| **Elevated Cards** | `bg-surface-700` | `#161C29` | Hover states on cards, dropdown menus. |
| **Borders** | `border-surface-700` | `#242B36` | All standard UI borders (cards, inputs). |
| **Primary Text** | `text-white` | `#FFFFFF` | Headings, primary values, active states. |
| **Secondary Text** | `text-surface-400` | `#A1A1AA` | Subtitles, labels, standard body text. |
| **Muted Text** | `text-surface-500` | `#6B7280` | Placeholders, disabled text, captions. |
| **Hover Colors** | `bg-surface-800/50`| Variable | Interactive backgrounds on hover. |
| **Focus Colors** | `ring-success-500` | `#22C55E` | Outer glow ring when inputs are focused. |

### Accent Colors & Statuses
These colors are strictly reserved for badges, icons, progress bars, buttons, and status indicators. **Never use accent colors for entire card backgrounds.**

| Status | Color | Tailwind Token | Hex Code |
| :--- | :--- | :--- | :--- |
| **Success / Positive** | Green | `success-500` | `#22C55E` |
| **Warning / Alert** | Yellow | `warning-500` | `#FACC15` |
| **Danger / Negative** | Red | `danger-500` | `#EF4444` |
| **Info / Neutral** | Blue | `info-500` | `#3B82F6` |

*Note: The Italian flag accent colors (Green `#009246`, White `#FFFFFF`, Red `#CE2B37`) have been historically tied to this project. They may be used sparingly in brand illustrations or specific status badges, but the primary UI should rely on the standard `success`/`danger` tokens above for optimal contrast.*

### Light Theme
To maintain visual consistency, the Light Mode essentially inverses the contrast while keeping the same structural boundaries and spacing.
- **Background**: `#F3F4F6` (Gray 100)
- **Cards**: `#FFFFFF` (White)
- **Borders**: `#1F2937` (Gray 800)
- **Primary Text**: `#111111` (Near Black)
- **Muted Text**: `#555555` (Gray 600)

*All accent colors remain identical in Light Mode to preserve brand identity.*

---

## 3. Typography

The application uses a strict dual-font system.

- **Heading & Body Font**: `Inter` (sans-serif)
- **Monospace Font**: `IBM Plex Mono` (monospace)

### Hierarchy and Sizing

| Element | Font Family | Font Size | Weight | Line Height | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Hero Greeting** | Inter | `30px` (text-3xl) | Bold (700) | Tight | Welcome banner greeting. |
| **Page Title** | Inter | `24px` (text-2xl) | Bold (700) | Tight | Main headers on sub-pages. |
| **Section Title** | Inter | `16px` (text-base) | Semibold (600) | Normal | Widget headers (e.g., "Recent Transactions"). |
| **Card Title (Label)**| IBM Plex Mono | `11px` / `12px` | Semibold (600) | Normal | Uppercase, wide tracking. Card headers. |
| **Metric Value** | IBM Plex Mono | `28px` (text-3xl) | Medium (500) | Tight | Large numbers inside Summary Cards. |
| **Body Text** | Inter | `14px` (text-sm) | Regular (400) | Relaxed | General descriptions and paragraphs. |
| **Caption** | Inter | `12px` (text-xs) | Regular (400) | Normal | Hints, subtext, timestamps. |
| **Button Text** | Inter | `14px` (text-sm) | Medium (500) | Normal | Primary and secondary buttons. |
| **Table Data** | IBM Plex Mono | `13px` / `14px` | Regular (400) | Normal | Currency values, dates, and IDs in tables. |

---

## 4. Layout System

### Dimensions
- **Maximum Width**: `1600px` to prevent the UI from stretching uncomfortably on ultra-wide displays.
- **Container**: `mx-auto w-full max-w-[1600px]`.
- **Grid System**: Standard CSS Grid using Tailwind's `grid-cols-12` base, dynamically adjusting via breakpoints (e.g., `lg:grid-cols-4`).

### Spacing Scale (Tailwind Defaults)
- **Micro**: `4px` (`gap-1`) - Between an icon and text.
- **Small**: `8px` (`gap-2`) - Between stacked inputs or list items.
- **Medium**: `16px` (`gap-4`) - Padding inside small cards or between related elements.
- **Large**: `24px` (`gap-6` / `p-6`) - Standard padding inside main dashboard cards.
- **Section**: `32px` (`gap-8`) - Spacing between entirely different dashboard sections.

### Border Radius Scale
- **Cards, Modals, Inputs, Buttons**: `10px` (`rounded-[10px]`). This precise radius provides a modern, sharp, yet approachable feel.
- **Badges/Pills**: `9999px` (`rounded-full`).
- **Inner elements (Icons)**: `8px` (`rounded-lg`).

### Shadow Scale
- **`shadow-sm`**: Used for standard buttons.
- **`shadow-card`**: `0 4px 24px rgba(0, 0, 0, 0.08)` (Light mode hover).
- **`shadow-card-dark`**: `0 4px 24px rgba(0, 0, 0, 0.4)` (Dark mode default).
- **`shadow-glow`**: `0 0 20px rgba({accent}, 0.35)` - Used for focused inputs and active states.

### Responsive Breakpoints
- **Mobile (`< 768px`)**: 1 column grids. Navigation collapses into a hamburger menu/drawer.
- **Tablet (`md: 768px`)**: 2 column grids.
- **Laptop (`lg: 1024px`)**: 3 to 4 column grids.
- **Desktop (`xl: 1280px+`)**: 4 to 5 column grids.
- **Ultra-Wide (`2xl: 1536px+`)**: Max width locks at 1600px; margins automatically center the content.

---

## 5. Navigation System

The application relies entirely on a **Top Navigation** system. There is no permanent vertical sidebar.

### Top Navigation (`TopNavbar`)
- **Layout**: Sticky at the top of the viewport (`sticky top-0 z-50`).
- **Background**: Translucent surface (`bg-surface-950/80 backdrop-blur-xl`) with a thin bottom border (`border-b border-surface-700`).
- **Left**: Application Logo and Brand Name (Hidden on very small mobile).
- **Middle**: Navigation Capsules.
- **Right**: Utility cluster (Search input, Notifications bell, Theme Toggle, Profile Avatar).

### Navigation Capsules
- **Shape**: Fully rounded pills (`rounded-full`).
- **Hover State**: `bg-surface-800/50 text-white`.
- **Active State**: Elevated capsule with a border and glow (`border-surface-600 bg-surface-800 text-white shadow-sm glow-active`).

### Mobile Navigation
- On screens `< 1024px`, the navigation links collapse into a hamburger menu.
- Clicking the hamburger opens a sleek, left-anchored drawer (`fixed inset-y-0 left-0 w-64`) with a backdrop blur overlay.

---

## 6. Dashboard Layout

The Dashboard is the central hub. It must follow a strict vertical hierarchy.

### Recommended Layout Structure (Top to Bottom)
1. **Hero Banner**: Full width, welcoming the user, displaying total balance and financial health.
2. **Metrics (Summary Cards)**: 1 row, 5 columns (Desktop). Showing Net Balance, Income, Expenses, Savings Rate, Budget Utilization.
3. **Quick Actions**: 1 row, 4 columns (Desktop). Providing immediate entry points (Add Expense, Add Income, Add Budget, View Analytics).
4. **Main Content Split (2/3 and 1/3)**:
   - **Left Column (2/3 width)**: Charts (Income vs Expense), Recent Transactions table.
   - **Right Column (1/3 width)**: Budget Progress widgets, Upcoming Goals widgets.

### Responsive Behavior
- **Desktop (1280px+)**: 5 metrics per row, 4 actions per row, 2/3 + 1/3 main split.
- **Tablet (768px - 1023px)**: 2 metrics per row, 2 actions per row, main split stacks vertically (Charts on top of Budgets).
- **Mobile (< 768px)**: Everything stacks in a single 1-column layout.

---

## 7. Card Design

All interactive and informational blocks live inside Cards.

- **Padding**: Large (`p-6` or `24px`).
- **Radius**: Strictly `10px`.
- **Borders**: Thin, `1px solid border-surface-700`.
- **Background**: `bg-surface-800` (Dark) / `bg-white` (Light).
- **Hover Animations**: For interactive cards (Quick Actions), apply `-translate-y-1` and `shadow-card` on hover with a `250ms` ease.
- **Typography**: Card Titles must use `IBM Plex Mono`, `11px`, `uppercase`, `tracking-widest`, and `text-surface-400`.
- **Icons**: Placed inside a small `40px x 40px` (`h-10 w-10`) rounded box (`rounded-xl`) with a highly transparent background of the accent color (e.g., `bg-success-500/15 text-success-500`).
- **Progress Bars**: Thin (`h-1` or `h-1.5`), rounded-full, with an empty track background of `bg-surface-700` and a filled track of the respective status color.

---

## 8. Buttons

Buttons follow a strict hierarchy and precise geometry.
All buttons share: `rounded-[10px] px-4 py-2.5 text-sm font-medium transition-all duration-250`.

- **Primary Button**: 
  - *Dark Mode*: `bg-white text-surface-950`. Hover: `bg-gray-100 -translate-y-[1px]`.
  - *Light Mode*: `bg-surface-950 text-white`. Hover: `bg-surface-800`.
- **Secondary Button**: 
  - `bg-surface-900 border border-surface-700 text-surface-200`. Hover: `bg-surface-800 border-surface-600 text-white`.
- **Ghost Button**: 
  - Transparent background, `text-surface-400`. Hover: `bg-surface-800 text-white`.
- **Danger Button**: 
  - `bg-danger-500 text-white`. Hover: `bg-danger-600`.
- **Icon Buttons**: 
  - Perfect squares (`h-8 w-8` or `h-10 w-10`), flex-centered.
- **Disabled State**: 
  - `opacity-50 cursor-not-allowed`, stripping hover transform animations.
- **Loading State**: 
  - Displays a spinning SVG ring; text opacity is lowered or replaced.

---

## 9. Forms

Forms must look clean, embedded, and highly legible.

- **Inputs, Selects, Textareas**:
  - `bg-surface-900` background.
  - `border border-surface-700`.
  - `rounded-[10px]`.
  - `px-4 py-2.5` padding.
  - **Focus State**: `border-success-500` with a subtle `box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.15)`. No native black/blue browser outlines.
- **Placeholders**: `text-surface-500`.
- **Labels**: `text-sm font-medium text-white`, placed above the input with `mb-1.5` spacing.
- **Required Indicators**: A subtle red asterisk `*` (`text-danger-500`).
- **Validation/Error States**: 
  - Input border turns `border-danger-500`.
  - Error message rendered below in `text-xs text-danger-500 mt-1`.
- **Date Pickers / Calendars**: Must be completely customized. Native white browser popups are strictly forbidden in Dark Mode. Use `react-datepicker` overridden with our CSS tokens.

---

## 10. Tables

Data tables are essential for a financial app. They must be easily scannable.

- **Wrapper**: Overflow-x-auto to prevent mobile breaking, wrapped inside a standard Card.
- **Headers**: Sticky top (`sticky top-0`), `bg-surface-800/90 backdrop-blur-sm`, `text-xs uppercase font-mono tracking-wider text-surface-400`, with a bottom border.
- **Rows**: 
  - Height: `h-12` or padded `py-3`.
  - Hover: `hover:bg-surface-700/30 transition-colors`.
  - Border: `border-b border-surface-700/50` (except the last row).
- **Alignment**:
  - Text/Dates: Left aligned.
  - Currency/Numbers: Right aligned, using `IBM Plex Mono` for tabular alignment.
- **Status Badges**: Small pills (`px-2 py-0.5 text-[10px] rounded-full uppercase tracking-wider`). E.g., `bg-success-500/15 text-success-500`.
- **Pagination**: Minimalist previous/next buttons at the bottom right.

---

## 11. Charts

Data visualization must integrate seamlessly with the minimal dark aesthetic.

- **Preferred Library**: Recharts (with completely customized SVG props) or Chart.js (with custom theme definitions).
- **Grid Lines**: Very faint (`stroke="#242B36"` or `rgba(255,255,255,0.05)`). Only horizontal lines; remove vertical grid lines to reduce clutter.
- **Axes Text**: `IBM Plex Mono`, `10px` or `11px`, `fill="#A1A1AA"`.
- **Tooltips**: Custom HTML tooltips matching the Card design (`bg-surface-800 border-surface-700 rounded-lg p-3 shadow-card-dark`).
- **Colors**: Use the accent tokens (`#22C55E` for Income, `#EF4444` for Expenses, `#3B82F6` for Savings).
- **Animations**: Slow, smooth ease-out on load (`1500ms`).

---

## 12. Icons

- **Preferred Library**: Heroicons (Solid and Outline) or custom inline SVGs.
- **Sizing**: 
  - Navigation: `h-5 w-5`.
  - Buttons: `h-4 w-4`.
  - Hero/Large: `h-8 w-8`.
- **Colors**: Icons inherently inherit the parent text color (`currentColor`). When placed inside action boxes, they should use the accent color mapping (e.g., `text-primary-500`).

---

## 13. Animations

Animations must feel extremely fast, snappy, and hardware-accelerated. No sluggish or overly bouncy transitions.

- **Hover (Cards/Buttons)**: `duration-250 ease-out`. `-translate-y-1`.
- **Page Transitions**: `fade-in` (`300ms`) or `fade-up` (`400ms`, starting from `translateY(16px)`).
- **Modals**: Backdrop fades in (`opacity-0` to `opacity-100`). Modal panel scales up slightly (`scale-95` to `scale-100`).
- **Easing Function**: Standard Tailwind `ease-out` or custom `cubic-bezier(0.16, 1, 0.3, 1)`.

---

## 14. Modals

Modals handle complex creation flows (Add Expense, Create Goal).

- **Maximum Width**: `900px` (`max-w-[900px]`).
- **Structure**:
  - **Header**: Sticky top, `py-4 px-6`, bottom border. Contains the Title and a subtle `X` close button.
  - **Body**: Scrollable (`overflow-y-auto`, `flex-1`), `p-6`.
  - **Footer**: Sticky bottom, `py-4 px-6`, top border, `bg-surface-900`. Contains Cancel (Ghost/Secondary) and Save (Primary) buttons.
- **Backdrop**: `bg-black/70 backdrop-blur-sm`.
- **Closing Behavior**: Must close on `Escape` key press and on clicking the outside backdrop.
- **Accessibility**: Lock body scroll (`overflow: hidden`) when open, trap focus, and set `aria-modal="true"`.

---

## 15. Notifications

Feedback must be immediate and non-intrusive.

- **Placement**: Bottom-Right corner.
- **Design**: Floating toast card, `rounded-lg border border-surface-700 shadow-float`, with a left-colored border or icon indicating status.
- **Types**:
  - Success (Green icon)
  - Error (Red icon)
  - Info (Blue icon)
- **Duration**: Auto-dismiss after `3000ms` to `5000ms`.
- **Animation**: Slide in from the right (`translate-x-full` to `translate-x-0`).

---

## 16. Theme System

The application must support instantaneous Dark/Light mode switching.

- **Implementation**: Uses Tailwind's `darkMode: 'class'` strategy.
- **Context**: A `ThemeContext` persists the user's choice to `localStorage` and applies the `.dark` or `.light` class to the `<html>` element.
- **Tokens**: The `tailwind.config.js` and `index.css` files map variables (e.g., `bg-surface-800`).
- **Strict Rule**: NEVER hardcode hex colors in React components (e.g., `style={{ backgroundColor: '#123' }}`). ALWAYS use Tailwind tokens (`className="bg-surface-800"`).

---

## 17. Accessibility (A11y)

- **Keyboard Support**: All interactive elements (buttons, inputs, selects, table headers) must be reachable via `Tab`.
- **Focus Rings**: Standardized globally. When focused via keyboard, elements receive a visible ring (`focus-visible:ring-2 focus-visible:ring-success-500`). Outline is completely removed on mouse click to maintain sleekness.
- **Contrast**: Text colors against `bg-surface-800` must meet WCAG AA standards. (White and `#A1A1AA` meet this).
- **ARIA**: Use `aria-label` for icon-only buttons. Use `aria-invalid` on inputs with errors.

---

## 18. Responsiveness

- **Mobile First Philosophy**: Default Tailwind classes apply to Mobile. Prefix classes for larger screens (`md:`, `lg:`, `xl:`).
- **Mobile (< 768px)**: 100% width grids, hidden navigation (moved to drawer), smaller padding (`p-4`).
- **Tablet (768px+)**: 2-column grids, horizontal padding `px-6`.
- **Laptop (1024px+)**: 3-4 column grids, TopNavbar links visible.
- **Desktop (1280px+)**: Full 4-5 column expansions.
- **Ultra-Wide (1600px+)**: Content stops expanding, centering inside the `1600px` container.

---

## 19. Component Standards

When creating a new React component, adhere to these standards:

1. **Memoization**: Wrap pure components in `memo()` to prevent unnecessary re-renders in the dashboard.
2. **Prop Validation**: Ensure props have logical fallbacks (default parameters).
3. **States**: Always account for:
   - **Loading State**: Skeleton loaders matching the component shape.
   - **Empty State**: Friendly message ("No transactions yet. Add your first expense!") centered with a subdued icon.
   - **Error State**: Graceful degradation, showing a retry button.

---

## 20. Folder Organization

The UI architecture must remain predictably structured:

```text
src/
├── components/
│   ├── dashboard/    # Widgets specific to the dashboard (SummaryCards, QuickActions)
│   ├── ui/           # Reusable generic primitives (Button, Card, Modal, Input, Select)
│   ├── layout/       # Structural wrappers (TopNavbar, PageContainer)
│   ├── expenses/     # Feature-specific components (ExpenseForm, ExpenseTable)
│   └── ...
├── context/          # React Context providers (Auth, Theme, Budget)
├── hooks/            # Custom reusable hooks (useAuth, useFormState)
├── layouts/          # High-level layout shells (DashboardLayout, AuthLayout)
├── pages/            # Routable top-level page views (Dashboard.jsx, Budget.jsx)
├── styles/           # Global CSS and token definitions (index.css)
└── utils/            # Pure helper functions (formatters.js, validation.js)
```

---

## 21. Naming Conventions

- **Files & Components**: PascalCase (`WelcomeCard.jsx`, `ExpenseTable.jsx`).
- **Hooks**: camelCase, prefixed with `use` (`useBudget.js`, `useAnalytics.js`).
- **Contexts**: PascalCase, ending in Context (`ThemeContext.jsx`).
- **Utility functions**: camelCase (`formatCurrency`, `calculateProgress`).
- **Constants**: UPPER_SNAKE_CASE (`MONTHS`, `ACTIONS`, `DEFAULT_VALUES`).

---

## 22. Design Rules (Strict Constraints)

1. **No Duplicated UI**: If you need a dropdown, use `Select.jsx`. If you need a popup, use `Modal.jsx`. Do not build one-off UI elements.
2. **One Accent Per Card**: Never mix multiple accent colors (e.g., Red, Green, Blue) in the background or borders of a single card.
3. **No Pure Black Text in Dark Mode**: Even in Light mode, use `#111111` instead of `#000000`. In Dark mode, avoid pure black backgrounds unless it is the absolute base layer.
4. **Spacing Consistency**: Always use `gap-4` (16px) or `gap-6` (24px) between grid items. Do not use arbitrary values like `margin-top: 13px`.
5. **No Native Elements**: Never render native `<select>` dropdowns or native browser `<input type="date">` calendars on Desktop. They break the dark theme illusion. Use the custom wrapper components.

---

## 23. Future UI Guidelines

When building future modules (e.g., **Admin Panel, AI Integrations, Advanced Reports, Settings**):

- Automatically inherit `PageContainer` and `DashboardLayout`.
- Use the 5-column or 4-column metric card grid at the top of the new page.
- Wrap data entry forms in `Modal.jsx`.
- If displaying vast amounts of data, use the standard Table design with sticky headers.
- **Settings Page**: Should follow a split layout. A left-hand vertical menu (Account, Preferences, Notifications, Security) and a right-hand form area wrapped in a `Card`.

---

## 24. Visual Examples (Wireframes)

### Dashboard Layout (Desktop)
```text
+-----------------------------------------------------------------------------+
| (Logo) Smart Tracker      [Dashboard] [Expenses] [Budget]     (Search) (👤) |
+-----------------------------------------------------------------------------+
|                                                                             |
|  +-----------------------------------------------------------------------+  |
|  |  Good evening, Alex 👋                                                |  |
|  |  Track today, thrive tomorrow.           [Financial Health: Healthy]  |  |
|  +-----------------------------------------------------------------------+  |
|                                                                             |
|  +-------------+  +-------------+  +-------------+  +-------------+         |
|  | NET BALANCE |  | TOTAL INC.  |  | TOTAL EXP.  |  | SAVINGS RT  |   ...   |
|  | $4,200.00   |  | $6,500.00   |  | $2,300.00   |  | 35%         |         |
|  | [===      ] |  | [======== ] |  | [====     ] |  | [====     ] |         |
|  +-------------+  +-------------+  +-------------+  +-------------+         |
|                                                                             |
|  +----------------------------------+ +----------------------------------+  |
|  | [+] Add Expense   (Log a spend)  | | [+] Add Income  (Record money)   |  |
|  +----------------------------------+ +----------------------------------+  |
|                                                                             |
|  +-----------------------------------------+  +--------------------------+  |
|  | CHARTS & TRANSACTIONS                   |  | BUDGET PROGRESS          |  |
|  |                                         |  |                          |  |
|  |  ( Line Chart visualization )           |  |  Housing: 80% [====  ]   |  |
|  |                                         |  |  Food:    40% [==    ]   |  |
|  |  Tx1 - Groceries     -$120.00           |  |                          |  |
|  |  Tx2 - Salary      +$4,000.00           |  +--------------------------+  |
|  +-----------------------------------------+                                |
+-----------------------------------------------------------------------------+
```

---

## 25. Final Principles

The core mandate of this design system is **Discipline**. 

Every padding, every radius, every font size, and every color has been carefully selected to harmonize. When contributing to this project, resist the urge to introduce new colors, arbitrary margins, or custom border radii. Rely entirely on the established Tailwind tokens and the shared UI components. By respecting these boundaries, the Smart Expense Tracker will remain a cohesive, blazing-fast, and deeply beautiful application as it scales.
