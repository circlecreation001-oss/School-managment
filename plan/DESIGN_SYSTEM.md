# DESIGN_SYSTEM
## Modern Education ERP + Website Design System

Document Type: Enterprise UI/UX Design System
Version: 1.0
Date: 2026-07-06
Prepared For: Product, Design, Frontend, and Engineering Teams

> This document defines the visual language, interaction patterns, and reusable UI standards for a modern, accessible, enterprise-grade Education ERP + Website experience built with Next.js, React, Tailwind CSS, ShadCN UI, and TypeScript.

---

# 1. Design Philosophy

## 1.1 Core Principles
The system is designed to feel:
- Modern
- Clean
- Professional
- Minimal
- Accessible
- Enterprise

## 1.2 Experience Goals
- Improve clarity for administrators, teachers, students, and parents
- Reduce cognitive load in dense operational workflows
- Ensure consistency across ERP modules and marketing website pages
- Provide a strong white-label foundation for multiple education brands
- Support both desktop and mobile productivity use cases

## 1.3 Visual Direction
- Prefer calm, trustworthy, and premium aesthetics
- Use clear hierarchy and strong spacing
- Maintain consistency over decoration
- Balance dense data views with whitespace and visual grouping
- Use subtle motion and feedback for productivity and confidence

---

# 2. Color System

## 2.1 Core Palette

### Primary
- Primary 50: #eff6ff
- Primary 100: #dbeafe
- Primary 500: #2563eb
- Primary 600: #1d4ed8
- Primary 700: #1e40af
- Primary 900: #172554

### Secondary
- Secondary 50: #f8fafc
- Secondary 100: #e2e8f0
- Secondary 500: #64748b
- Secondary 600: #475569
- Secondary 700: #334155

### Accent
- Accent 50: #f5f3ff
- Accent 500: #7c3aed
- Accent 600: #6d28d9

### Success
- Success 50: #ecfdf3
- Success 500: #16a34a
- Success 600: #15803d

### Warning
- Warning 50: #fffbeb
- Warning 500: #f59e0b
- Warning 600: #d97706

### Danger
- Danger 50: #fef2f2
- Danger 500: #ef4444
- Danger 600: #dc2626

### Info
- Info 50: #ecfeff
- Info 500: #06b6d4
- Info 600: #0891b2

### Gray Scale
- Gray 50: #f8fafc
- Gray 100: #f1f5f9
- Gray 200: #e2e8f0
- Gray 300: #cbd5e1
- Gray 400: #94a3b8
- Gray 500: #64748b
- Gray 600: #475569
- Gray 700: #334155
- Gray 800: #1e293b
- Gray 900: #0f172a

## 2.2 Semantic Usage
- Background: `bg-slate-50` for app surfaces, `bg-white` for cards and panels
- Surface: white or light gray panels for containers
- Border: slate-200 / slate-300 for separation and form fields
- Text: slate-900 for primary, slate-600 for secondary

## 2.3 Dark Theme
- Background: `#020617`
- Surface: `#0f172a`
- Border: `#334155`
- Primary text: `#f8fafc`
- Secondary text: `#cbd5e1`
- Accent: use brighter variants for visibility

## 2.4 Light Theme
- Background: `#f8fafc`
- Surface: `#ffffff`
- Border: `#e2e8f0`
- Primary text: `#0f172a`
- Secondary text: `#475569`

---

# 3. Typography

## 3.1 Font Family
- Primary font: Inter, system-ui, sans-serif
- Monospace font: JetBrains Mono, monospace

## 3.2 Heading Scale
- H1: 32px / 40px line-height / 700 weight
- H2: 24px / 32px line-height / 600 weight
- H3: 20px / 28px line-height / 600 weight
- H4: 18px / 24px line-height / 600 weight
- H5: 16px / 22px line-height / 600 weight
- H6: 14px / 20px line-height / 600 weight

## 3.3 Paragraph Sizes
- Body Large: 16px / 24px
- Body Regular: 14px / 20px
- Body Small: 12px / 16px
- Caption: 11px / 14px

## 3.4 Font Weights
- Regular: 400
- Medium: 500
- Semibold: 600
- Bold: 700

## 3.5 Line Heights
- Tight: 1.2
- Normal: 1.4 to 1.5
- Relaxed: 1.6 to 1.8

## 3.6 Letter Spacing
- Headings: -0.01em to -0.02em
- Body: normal
- Uppercase labels: 0.04em

---

# 4. Spacing System

## 4.1 4px Grid
Use a consistent 4px spacing scale:
- 4px
- 8px
- 12px
- 16px
- 20px
- 24px
- 32px
- 40px
- 48px
- 64px
- 80px

## 4.2 Margin and Padding Rules
- Use 8px spacing for compact components
- Use 16px for standard content spacing
- Use 24px for section separation
- Use 32px for major layout blocks

## 4.3 Container Width
- Mobile: 100%
- Tablet: 768px max
- Laptop: 1024px max
- Desktop: 1280px max
- Ultra Wide: 1440px max

## 4.4 Gap Rules
- Form gaps: 12px to 16px
- Card internal spacing: 16px to 24px
- Section spacing: 24px to 32px
- Dashboard grid gaps: 16px to 24px

---

# 5. Button System

## 5.1 Button Variants
- Primary: Strong CTA for main actions
- Secondary: Supporting action with neutral tone
- Outline: Low-emphasis but visible action
- Ghost: Minimal action in dense layouts
- Danger: Destructive actions
- Loading: Show spinner and disabled state
- Disabled: Reduced contrast and no interaction

## 5.2 Button Sizing
- Small: 32px height
- Default: 40px height
- Large: 48px height

## 5.3 Button States
- Default
- Hover
- Active
- Focused
- Disabled
- Loading

## 5.4 Icon Buttons
- Minimum 36px target size
- Use only when icon is clear and supported by tooltip or label

---

# 6. Forms

## 6.1 Inputs
- Use rounded corners with clear border states
- Support labels, helper text, and error text
- Keep field height consistent at 40px or 44px
- Use focus rings with primary color

## 6.2 Select
- Use for predefined options
- Include a clear label and placeholder where needed
- Ensure keyboard accessibility

## 6.3 Textarea
- Use for long content input such as remarks, notes, or descriptions
- Minimum 96px height and resizable if appropriate

## 6.4 Checkbox and Radio
- Use clear labels and spacing
- Do not rely on color alone to indicate state

## 6.5 Switch
- Use for toggling preferences or feature enablement
- Keep motion subtle and state obvious

## 6.6 Validation States
- Default
- Focus
- Error
- Success
- Warning

## 6.7 Error Messages
- Show concise, actionable messages
- Place below the field
- Use danger color and icon

---

# 7. Tables

## 7.1 Table Principles
- Tables are used for dense operational records
- Keep headers clearly visible and aligned
- Use zebra striping sparingly
- Important actions should be placed in the last column or as row actions

## 7.2 Responsive Table
- On smaller screens, convert to stacked cards or horizontally scrollable table
- Preserve key information in a compact layout

## 7.3 Sorting
- Support column sorting with clear icon states
- Default sort by most relevant column

## 7.4 Filtering
- Use search, dropdown filters, and date filters
- Keep filter panel compact and accessible

## 7.5 Pagination
- Use simple page navigation and page size control
- Show total counts clearly

## 7.6 Bulk Actions
- Provide action bar when multiple rows are selected
- Keep actions limited and contextual

---

# 8. Cards

## 8.1 Statistics Card
- Show KPI values, trend, and optional comparison
- Use strong hierarchy and concise labels

## 8.2 Information Card
- Present contextual details, summaries, or lists
- Keep title, body, and footer clearly separated

## 8.3 Profile Card
- Show user or institution summary
- Include avatar, name, role, and status

## 8.3 Chart Card
- Use charts within a clear bordered panel
- Include title, legend, and action menu when needed

---

# 9. Navigation

## 9.1 Sidebar
- Use a persistent vertical navigation for ERP modules
- Group by domain such as Students, Finance, Attendance, Exams, Reports
- Highlight active route clearly
- Support collapsible states for dense workspaces

## 9.2 Navbar
- Show global search, notifications, user profile, and quick actions
- Keep top bar minimal and predictable

## 9.3 Breadcrumb
- Use breadcrumb navigation for multi-level admin pages
- Keep trails short and consistent

## 9.4 Tabs
- Use tabs for alternate views of the same content area
- Maintain active states with strong contrast

## 9.5 Dropdown
- Keep dropdowns compact and keyboard-friendly
- Use clear labels and grouped actions

---

# 10. Dashboard Components

## 10.1 Charts
- Use line, bar, area, and donut charts where appropriate
- Maintain consistent color mapping
- Provide optional legend and data labels

## 10.2 Widgets
- Widgets should be modular and reusable
- Support drag-and-drop or reorder where beneficial

## 10.3 Statistics
- Use trend deltas, sparklines, and simple summaries
- Focus on business clarity rather than decoration

## 10.4 Notifications
- Use toast, popover, and inbox patterns consistently
- Keep messages concise and action-oriented

## 10.5 Quick Actions
- Provide shortcuts for common operations like add student, create fee invoice, mark attendance
- Place them in a visible but not distracting region

---

# 11. Icons

## 11.1 Usage Rules
- Use icons to reinforce meaning, not replace labels
- Keep icon style consistent across the product
- Use outline icons for standard actions and filled icons for emphasis when needed

## 11.2 Sizes
- Small: 14px
- Default: 16px
- Large: 20px
- XL: 24px

## 11.3 Spacing
- Leave 8px to 12px spacing around icons in button and list contexts
- Keep icon alignment consistent with text

---

# 12. Modal System

## 12.1 Dialogs
- Use for short interactions requiring focus
- Keep content concise and action-oriented
- Support clear primary and secondary actions

## 12.2 Confirmation Modal
- Clearly state the action and consequences
- Use danger styling for destructive actions

## 12.3 Alert Modal
- Use for important system warnings or message delivery
- Keep copy short and direct

## 12.4 Drawer
- Use for side panels such as filters, forms, or details
- Ensure mobile support and keyboard accessibility

---

# 13. Responsive Breakpoints

## 13.1 Mobile
- 0px to 639px
- Single-column layouts
- Collapsed navigation and stacked components

## 13.2 Tablet
- 640px to 1023px
- Two-column layout where appropriate
- Compact card grid

## 13.3 Laptop
- 1024px to 1279px
- Standard dashboard and admin layout

## 13.4 Desktop
- 1280px to 1439px
- Full ERP workspace with multi-panel views

## 13.5 Ultra Wide
- 1440px and above
- Expanded content density and side-by-side panels

---

# 14. Dark Mode

## 14.1 Color Strategy
- Use dark surfaces with sufficient contrast
- Keep primary action colors vivid and accessible
- Avoid low-contrast gray-on-gray combinations

## 14.2 Component Behavior
- Cards, forms, tables, and dialogs should adapt to dark surfaces
- Ensure focus states remain visible in dark mode

## 14.3 Contrast Guidance
- Body text should maintain at least WCAG AA contrast levels
- Avoid subtle borders that disappear in dark mode

---

# 15. Accessibility

## 15.1 WCAG Compliance
- Target WCAG 2.1 AA minimum
- Ensure text contrast, keyboard access, and semantic structure

## 15.2 Keyboard Navigation
- All interactive elements must be reachable via keyboard
- Visible focus states must be present
- Modal and dropdown focus management must be handled properly

## 15.3 ARIA
- Use ARIA roles and labels where native semantics are insufficient
- Ensure dynamic content updates are announced properly

## 15.4 Contrast Requirements
- Text contrast should meet AA standards
- Icons and state indicators should not rely on color alone

---

# 16. Animation Guidelines

## 16.1 Hover States
- Use subtle transitions of 150ms to 200ms
- Keep hover feedback calm and purposeful

## 16.2 Loading States
- Use skeletons for content placeholders
- Use spinners sparingly for small tasks

## 16.3 Transitions
- Use consistent easing such as `ease-out`
- Avoid large or distracting motion in core workflow components

## 16.4 Skeleton Guidelines
- Match component shape and dimensions closely
- Avoid overly bright skeletons that look like content

---

# 17. UI Component Library

## Reusable Components
- AppShell
- SidebarNav
- TopNav
- Breadcrumbs
- PageHeader
- SectionHeader
- Button
- IconButton
- Input
- Select
- Textarea
- Checkbox
- RadioGroup
- Switch
- FormField
- FormSection
- Card
- StatCard
- InfoCard
- ProfileCard
- ChartCard
- Table
- DataTable
- FilterBar
- Pagination
- Modal
- Dialog
- Drawer
- ConfirmationDialog
- AlertDialog
- Toast
- Tooltip
- DropdownMenu
- Tabs
- Badge
- Avatar
- Skeleton
- EmptyState
- Loader
- ProgressBar
- Tag
- Timeline
- Accordion
- Stepper
- Wizard
- SearchBox
- NotificationCenter
- WidgetGrid
- KPIGrid
- FileUpload
- DatePicker
- Calendar
- StatusPill
- EmptyState
- Divider

---

# 18. Design Tokens

## 18.1 Layout Tokens
- `spacing-1`: 4px
- `spacing-2`: 8px
- `spacing-3`: 12px
- `spacing-4`: 16px
- `spacing-5`: 20px
- `spacing-6`: 24px
- `spacing-8`: 32px
- `spacing-10`: 40px
- `spacing-12`: 48px

## 18.2 Radius Tokens
- `radius-sm`: 6px
- `radius-md`: 8px
- `radius-lg`: 12px
- `radius-xl`: 16px

## 18.3 Shadow Tokens
- `shadow-sm`: subtle elevation
- `shadow-md`: standard cards
- `shadow-lg`: overlays and dialogs

## 18.4 Typography Tokens
- `text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`, `text-3xl`

## 18.5 Color Tokens
- `color-primary`, `color-secondary`, `color-success`, `color-warning`, `color-danger`, `color-info`, `color-background`, `color-surface`, `color-border`

---

# 19. Future Design Enhancements

## 19.1 Planned Enhancements
- Advanced dashboard personalization
- Mobile-first admin experience
- More compact power-user workflows
- AI-assisted insights and summaries
- White-label theming engine for client branding
- Richer onboarding and guided workflows
- More immersive analytics and chart storytelling

## 19.2 Design Evolution Goals
- Create richer data visualization for academic and financial reporting
- Improve usability for low-bandwidth and mobile device scenarios
- Introduce adaptive UI patterns for multi-role experiences
- Expand component variants for future modules such as hostel, transport, and payroll

---

# Summary

This design system provides a scalable, modern, and enterprise-ready UI foundation for the Education ERP and website platform. It balances clarity, productivity, accessibility, and white-label flexibility across admin dashboards, academic workflows, and public-facing web experiences.
