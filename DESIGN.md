# Design System: Premium Habit Dashboard
**Project ID:** 3621356255186906683

## 1. Visual Theme & Atmosphere

The Premium Habit Dashboard embodies a **futuristic, high-end wellness interface** that combines the sleekness of glassmorphism with vivid neon accents against a deep, immersive dark background. The aesthetic is **dynamic yet focused**, designed to make habit tracking feel like a premium, engaging experience.

The overall mood is **energetic and precise**. It evokes the feeling of a state-of-the-art control center for personal optimization.

**Key Characteristics:**
-   **Glassmorphism**: Extensive use of translucent layers, background blurs, and subtle white borders to create depth.
-   **Neon Accents**: Vivid glows and gradients (Primary Blue, Purple) to highlight active states and progress.
-   **Dark Mode First**: Optimized for low-light environments with a deep navy/black base.
-   **Rounded Geometry**: Soft, organic curves (`rounded-2xl`, `rounded-full`) to contrast with the technical precision of the data.

## 2. Color Palette & Roles

### Primary Foundation
-   **Deep Midnight Blue** (`#101622`) – Primary background color. A rich, dark navy that serves as the canvas.
-   **Glass Surface** (`rgba(25, 34, 51, 0.7)`) – Used for cards and containers. Provides context without blocking the background entirely.

### Accent & Interactive
-   **Electric Blue** (`#2b6cee`) – Primary accent key. Used for primary buttons, active states, and progress bars.
-   **Neon Glow**: `box-shadow: 0 0 15px rgba(43, 108, 238, 0.3)` – Adds a "live" feel to interactive elements.
-   **Cosmic Purple** (Tailwind `purple-500`) – Secondary accent for specific features like Sleep Tracking.

### Typography & Text Hierarchy
-   **White** (`#FFFFFF`) – Primary text for headings and key data.
-   **Slate Grey** (`#94a3b8` / `text-slate-400`) – Secondary text for labels, dates, and metadata.
-   **Muted Blue/Grey** – For inactive or subtle UI elements.

## 3. Typography Rules

**Primary Font Family:** Manrope
**Character:** Modern, geometric sans-serif that is highly legible at small sizes (UI text) and distinct at large display sizes.

### Hierarchy & Weights
-   **Headings:** Bold (700) or ExtraBold (800). Used for "Good Morning", section titles ("Hydration").
-   **Data/Numbers:** ExtraBold (800) or SemiBold (600). Large font sizes to emphasize metrics (e.g., "new Stitch design").
-   **Body/Labels:** Medium (500). Clean and readable.
-   **Caps/Meta:** Bold (700), Uppercase, Tracking-Wider. Used for small labels like "CUPS" or "OPTIMAL".

## 4. Component Stylings

### Buttons
-   **Shape:** `rounded-lg` for standard actions, `rounded-full` for icon-only buttons or primary floating actions.
-   **Primary CTA:** Electric Blue background, white text, neon glow shadow. Hover effect: brightness increase or subtle scale (`active:scale-95`).
-   **Secondary/Icon:** Glass background (`bg-slate-800` or transparent), white icon.

### Cards (The "Glass Card")
-   **Background:** `bg-[rgba(25,34,51,0.7)]`
-   **Backdrop Filter:** `backdrop-blur-md` (12px)
-   **Border:** `border border-white/10` (1px solid subtle white)
-   **Corners:** `rounded-2xl` or `rounded-xl`
-   **Shadow:** Subtle drop shadow + Neon glow for active cards.

### Navigation (Premium Floating Dock)
-   **Style:** Floating pill (`bottom-6` with `rounded-full`) above the bottom edge.
-   **Layout:** Dashboard (Left) — Stats (Right).
-   **Settings:** Moved to Header for cleaner daily view.
-   **Active State:** Primary color icon + text.
-   **Inactive State:** Slate grey.
-   **FAB (Floating Action Button):** Central, large, `rounded-full`, Primary Blue with heavy glow.

## 5. Layout Principles

### Grid & Structure
-   **Container:** `max-w-md` (Mobile-focused) centered on screen.
-   **Spacing:** `p-6` (24px) standard padding for main container. `gap-4` (16px) between vertical cards.

### Visual Balance
-   **Hierarchy:** The dashboard header requires significant whitespace. Metrics (Hydration/Sleep) take precedence over lists.
-   **Gradients:** Use subtle radiant gradients (`bg-[radial-gradient...]`) in the main background to break up the solid color and interact with the glass cards.

## 6. Design System Notes for Stitch Generation

When creating new screens for this project using Stitch, reference these prompts:

### Language to Use
-   **Style:** "Premium Glassmorphism", "Dark Mode", "Neon Glows".
-   **Components:** "Glass card with white border", "Neon action button".

### specific Instructions
-   "Use `manrope` font family."
-   "Ensure all cards have `backdrop-blur-md` and `border-white/10`."
-   "Primary action buttons must have a glow effect."

## 7. Dashboard Foundation & Patterns

The **Dashboard** serves as the visual anchor. All future pages must align with these specific foundational patterns:

### Layout Hard Rules
-   **Centering**: Main content cards (Hydration, Sleep, Stats) must be vertically stacked, full-width (`w-full`), and rigorously centered (`flex justify-center`). 
-   **Scroll Clearance**: The bottom-most content section must have substantial bottom padding (`pb-32`) to ensure it scrolls clear of the floating navigation dock.

### Card Accents & Categorization
-   **Hydration**: 
    -   **Accent**: Blue (`border-l-blue-500`).
    -   **Glow**: Blue shadow (`shadow-[0_0_20px_rgba(59,130,246,0.1)]`).
-   **Sleep**: 
    -   **Accent**: Purple (`border-l-purple-500`).
    -   **Glow**: Purple shadow/accents.
-   **Consistency (Heatmap)**:
    -   **Style**: 7-Day Grid (M T W T F S S).
    -   **States**:
        -   🌑 **Empty/Miss**: `bg-white/5`
        -   🔵 **Partial**: `bg-blue-500/30`
        -   🟢 **Perfect**: `bg-green-500` + `shadow-[0_0_15px_rgba(34,197,94,0.6)]` (Neon Green).

### Header Elements
-   **Date**: ALWAYS display the **Live Date** (e.g., "Friday, Feb 7"). No static placeholders.
-   **Profile**: Minimalist Icon (Initials only, e.g., "JP"), circular, with glass border. No photos.
