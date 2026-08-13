# Expense Tracker — UI/UX Redesign Spec

Single source of truth for the redesign. No backend, context, service, validation
or calculation changes anywhere. Only tokens, JSX structure and classes.

---

## 1. Design tokens (`tailwind.config.js` + `src/styles/index.css`) — DONE

Surfaces (dark first, never pure black), light theme mirrored under `.light`:

| Token                | Dark                  | Use                       |
| -------------------- | --------------------- | ------------------------- |
| `--surface-base`     | `#0A0B0D`             | page background           |
| `--surface-sidebar`  | `#0E1014`             | sidebar / secondary bands |
| `--surface-card`     | `#14161B`             | cards, table shells       |
| `--surface-elevated` | `#1A1D23`             | dropdowns, popovers       |
| `--surface-modal`    | `#1B1E24`             | dialogs                   |
| `--surface-input`    | `#101317`             | inputs, selects           |
| border / hover       | `#23262D` / `#2E323A` | 1px hairlines             |

Text: primary `#F5F6F7`, secondary `#A8ADB7`, muted `#6E747E`.

Semantics: green `#22C55E` income & positive, red `#EF4444` expense & destructive,
blue `#3B82F6` primary action / selected / informational, amber `#F59E0B` warning only.

Also fixed: type scale (`2xs`–`4xl`), radii 4/8/12, spacing scale, control heights
(button/input 32/36/40), icon sizes 16/18/20, shadows `card` / `elevated` / `float`,
tabular numerals on every money figure, shared states (hover, active, focus-visible
ring, disabled, skeleton, empty, error).

Shell tokens: `--sidebar-width 15.5rem`, `--sidebar-collapsed-width 4.25rem`,
`--topbar-height 3.5rem`, z-index ladder.

Charts: `src/constants/chartTheme.js` — `CHART_COLORS`, `CHART_GRID`,
`CHART_AXIS`, `CHART_TOOLTIP`, reused by every recharts chart.

---

## 2. Primitives — `src/components/ui/*` — DONE

Same props and APIs, restyled in place so the change propagates app-wide.

| Component                     | Redesign                                                                                                                        |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `Button`                      | variants primary(blue) / secondary / ghost / danger / success / outline, sizes sm/md/lg, icon slot, loading spinner, focus ring |
| `Card`                        | `card` + `card-glass` classes, 1px border, 16/20px padding, no gradients                                                        |
| `Modal`                       | compact size map (`sm`→`max-w-md`), scroll-safe body, backdrop blur, scale-in animation, `shadow-float`                         |
| `FormField`                   | real `<label>`, sentence case, helper text, inline error under field                                                            |
| `Select` / `CategorySelect`   | themed custom dropdown, elevated panel, selected + action row states                                                            |
| `CurrencyInput`               | prefix symbol, tabular numerals, right alignment                                                                                |
| `DateSelect`                  | themed input, error state, react-datepicker skin                                                                                |
| `StatCard`                    | label / value / delta layout, optional mini progress, semantic delta colour                                                     |
| `EmptyState`                  | muted icon disc, title, one-line body, single CTA                                                                               |
| `Skeleton` / `LoadingSpinner` | `surface-700` shimmer, 3 sizes                                                                                                  |
| `PageHeader`                  | title + subtitle left, action slot right, responsive stack                                                                      |
| `DeleteConfirmBody`           | red-tinted warning block, entity name emphasised                                                                                |
| `PageLoader`                  | centred spinner on base surface                                                                                                 |

---

## 3. App shell — DONE

- `layouts/DashboardLayout.jsx` — sidebar + slim top bar, content offset by
  CSS var, drawer state, Escape/resize handling, collapse persisted.
- `components/layout/Sidebar.jsx` — persistent left nav, grouped
  **Overview** (Dashboard, Analytics, Reports) / **Money** (Expenses, Income,
  Budget, Goals) / **Manage** (Reminders, Categories, AI Assistant).
  Icon-rail collapse, mobile slide-over drawer, subtle active marker.
- `components/layout/TopNavbar.jsx` — hamburger (mobile), search,
  notifications, theme toggle, account menu (profile / settings / log out).
- `components/layout/Logo.jsx` — square brand mark, collapsible label.
- `components/layout/PageContainer.jsx` — max 1400px, consistent padding.
- `layouts/AuthLayout.jsx` — quiet centred card, no ambient glows.

---

## 4. Pages and their components — TO DO, in this order

### 4.1 Dashboard — `pages/Dashboard.jsx`

Tighter hierarchy: greeting + primary action → one summary row → cash flow +
category breakdown → recent transactions → budget/goal progress → reminders.
Components: `WelcomeCard`, `SummaryCards` (4 metrics: balance, income, expenses,
savings), `QuickActions` (compact icon row, not a large grid),
`BudgetOverviewWidget`, `BudgetProgressWidget`, `BudgetAlertWidget`,
`GoalsOverviewWidget`, `GoalProgressWidget`, `GoalInsightsWidget`,
`UpcomingGoalsWidget`, `UpcomingRemindersWidget`, `RecurringSummaryWidget`,
`RecentNotificationsWidget`. Widgets share one card header pattern
(title + optional "View all" link) and collapse to single column on mobile.

### 4.2 Expenses — `pages/Expenses.jsx`

Red accent. `ExpenseSummary` strip → single toolbar row combining
`ExpenseSearch` + `ExpenseFilters` → `ExpenseTable` / `ExpenseRow` on desktop,
`ExpenseItem` cards on mobile. `ExpenseModal` + `ExpenseForm` +
`CategorySelector` restyled with grouped fields and sticky footer actions.

### 4.3 Income — `pages/Income.jsx`

Same language, green accent: `IncomeSummary`, `IncomeTable`, `IncomeRow`,
`IncomeModal`, `IncomeForm`.

### 4.4 Budget — `pages/Budget.jsx`

`BudgetSummary`, `BudgetCard`, `BudgetTable`/`BudgetRow`, `BudgetProgressBar`
(single restrained bar, limit / spent / left + status text),
`BudgetModal` + `BudgetForm`. Card and table views both kept.

### 4.5 Goals — `pages/Goals.jsx`

`GoalSummary`, `GoalCard` with progress ring, `GoalTable`, `GoalProgressBar`,
`GoalDetailsModal`, `AddSavingModal`, `GoalEmptyState`, and `GoalModal` +
`GoalForm` resized (compact dialog, prominent name field).

### 4.6 Categories — `pages/Categories.jsx`

Compact grid: icon chip, name, colour accent, income/expense pill.
`CategoryModal` preserved including the icon picker, retinted.

### 4.7 Reminders — `pages/Reminders.jsx`

`ReminderCalendar` with subtle day activity dots, `ReminderCard` status accents,
`ReminderFormModal`, `SnoozeModal`, `ReminderHistoryDrawer` as a proper
right-hand drawer with timeline rows. Logic untouched.

### 4.8 Recurring — `RecurringList`, `RecurringCard`, `RecurringModal`, `RecurringForm`

Cadence badge, next-run date, amount, pause/resume affordances.

### 4.9 Analytics — `pages/Analytics.jsx`

`FinancialSummary`, `MonthlyCashFlowChart`, `MonthlyTrend`,
`ExpenseCategoryPieChart`, `IncomeCategoryPieChart`, `CategoryBreakdown`,
`GoalAnalytics`, `RecentTransactions`, `AnalyticsEmptyState` — all on the
shared chart theme, uniform card headers and legends.

### 4.10 Reports — `pages/Reports.jsx`

`ReportKpiCards`, `ReportCharts`, `ReportTable`; monthly/yearly segmented
control, export buttons kept working.

### 4.11 AI Assistant — `pages/AIAssistant.jsx`

Two-column: `AIInsightsCard` + `AIRecommendationsList` left,
`AIChatBox` right with message bubbles, sticky composer.
`AIFloatingWidget` reduced to a small round launcher.

### 4.12 Auth & Landing

`Login`, `Register` on the new `AuthLayout`; `Landing` restyled to the same
palette and type scale — hero, product preview, feature rows, quiet footer.

---

## 5. Polish pass

Responsive audit at 360 / 768 / 1024 / 1440 with no horizontal overflow,
skeletons and empty states wherever they already exist, focus-visible rings,
`aria-label` + tooltip on every icon-only button, final spacing and typography
sweep.

## 6. Guarantees

No API/schema/auth/CRUD/validation/calculation changes. No mock data. No new
dependencies. No duplicate components — everything restyled in place.
