# 🎨 Visual Design Guide - Listening Interface

## Color Palette

### Part 1: Blue → Cyan
```
Gradient: from-blue-600 to-cyan-600
Dark: dark:from-blue-700 dark:to-cyan-700
Accent: blue-500, cyan-500
Background: bg-blue-50 (light), dark:bg-blue-900/20
```
**Used for**: Multiple choice questions

### Part 2: Purple → Pink
```
Gradient: from-purple-600 to-pink-600
Dark: dark:from-purple-700 dark:to-pink-700
Accent: purple-500, pink-500
Background: bg-purple-50 (light), dark:bg-purple-900/20
```
**Used for**: Fill-in-the-blank (talks)

### Part 3: Green → Emerald
```
Gradient: from-green-600 to-emerald-600
Dark: dark:from-green-700 dark:to-emerald-700
Accent: green-500, emerald-500
Background: bg-green-50 (light), dark:bg-green-900/20
```
**Used for**: Matching speakers to topics

### Part 4: Orange → Red
```
Gradient: from-orange-600 to-red-600
Dark: dark:from-orange-700 dark:to-red-700
Accent: orange-500, red-500
Background: bg-orange-50 (light), dark:bg-orange-900/20
```
**Used for**: Map labeling

### Part 5: Indigo → Purple
```
Gradient: from-indigo-600 to-purple-600
Dark: dark:from-indigo-700 dark:to-purple-700
Accent: indigo-500, purple-500
Background: bg-indigo-50 (light), dark:bg-indigo-900/20
```
**Used for**: Multiple choice (extracts)

### Part 6: Teal → Cyan
```
Gradient: from-teal-600 to-cyan-600
Dark: dark:from-teal-700 dark:to-cyan-700
Accent: teal-500, cyan-500
Background: bg-teal-50 (light), dark:bg-teal-900/20
```
**Used for**: Fill-in-the-blank (lecture)

---

## Layout Components

### Header (Fixed Top)
```
Height: py-3 sm:py-4
Position: fixed top-0 left-0 right-0 z-30
Background: bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600
Text: text-white font-bold
Responsive: Flex column (mobile) → flex-row (tablet+)
```

### Content Area
```
Max Width: max-w-5xl mx-auto
Padding: px-6 sm:px-8 py-8 sm:py-12
Margin Top: pt-24 (for fixed header)
Background: bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100
```

### Section Header
```
Background: bg-gradient-to-r from-[color]-600 to-[color]-600
Padding: px-6 sm:px-8 py-6 sm:py-8
Text Color: text-white
Border Radius: No radius (extends full width)
```

### Question Card
```
Border: border-2 rounded-xl
Padding: p-5 sm:p-6
Gap: gap-4 sm:gap-5
State Answered: bg-green-50 dark:bg-green-900/20 border-green-300
State Unanswered: bg-gray-50 dark:bg-gray-700 border-gray-200
Hover: transition-all duration-300
```

### Option/Answer Box
```
Border: border-2 rounded-lg
Padding: p-3 sm:p-4
Gap: gap-3 sm:gap-4
State Selected: bg-white dark:bg-gray-600 border-[color]-500 shadow-md
State Unselected: bg-white/50 dark:bg-gray-600/50 border-transparent
Hover: bg-white/80 dark:hover:bg-gray-600
```

### Progress Bar
```
Background: bg-gray-200 dark:bg-gray-700
Height: h-3
Border Radius: rounded-full
Fill: bg-gradient-to-r from-[color]-500 to-[color]-500
Animation: transition-all duration-500
```

### Badge (Status/Counter)
```
Background: bg-[color]-100 dark:bg-[color]-900/30
Padding: px-3 py-1 sm:px-4 sm:py-2
Border Radius: rounded-full
Text: text-[color]-700 dark:text-[color]-300 font-bold
```

### Button
```
Padding: px-4 sm:px-6 py-2 sm:py-2.5
Border Radius: rounded-lg
Background: bg-white dark:bg-gray-600
Hover: hover:bg-slate-100 dark:hover:bg-gray-700
Transform: transform hover:scale-105
Shadow: shadow-md
```

---

## Typography Scale

### Headings
```
Part Header:    text-2xl sm:text-4xl font-bold
Subheader:      text-lg font-semibold
Label:          text-base sm:text-lg font-semibold
```

### Body Text
```
Question:       text-sm sm:text-base leading-relaxed
Option:         text-sm sm:text-base
Badge:          text-xs sm:text-sm font-semibold
Helper:         text-xs opacity-90
```

---

## Spacing Scale

### Vertical
```
Header Padding:     py-3 sm:py-4 (header)
Section Padding:    py-6 sm:py-8 (section header)
Content Padding:    py-8 sm:py-12 (content area)
Section Gap:        mb-8 sm:mb-10 sm:mb-12
```

### Horizontal
```
Container:          px-4 sm:px-6 (narrow)
Header:             px-6 sm:px-8 (normal)
Content:            px-6 sm:px-8 py-8 sm:py-12 (spacious)
Max Width:          max-w-5xl
```

### Component Gaps
```
Question Cards:     gap-5 sm:gap-6
Options:            gap-3 sm:gap-4
Elements:           gap-2 sm:gap-3 sm:gap-4
```

---

## Shadow System

```
Drop Shadows:
- Card Shadow:      shadow-xl
- Large Shadow:     shadow-2xl
- Button Shadow:    shadow-md

Hover States:
- Transform:        transform hover:scale-105
- Duration:         transition-all duration-300
```

---

## Animation Library

```
Entrance:
- Modal:            animate-in fade-in scale-95 duration-300
- Cards:            No animation (appears instantly)

States:
- Loading:          animate-spin (spinner)
- Emphasis:         animate-bounce (timer emoji)
- Pulse:            animate-pulse (progress update)

Transitions:
- Duration:         duration-300 (default)
- Duration:         duration-500 (progress bar)
```

---

## Dark Mode Implementation

All components include dark mode variants:

```css
/* Pattern */
bg-white dark:bg-gray-800
text-slate-800 dark:text-slate-200
border-gray-200 dark:border-gray-600
hover:bg-white/80 dark:hover:bg-gray-600
```

### Specific Dark Colors
```
Backgrounds:
- White:            dark:bg-gray-800
- Gray:             dark:bg-gray-700
- Input:            dark:bg-gray-600

Text:
- Primary:          dark:text-slate-200
- Secondary:        dark:text-slate-300
- Muted:            dark:text-slate-400

Borders:
- Primary:          dark:border-gray-600
- Accent:           dark:border-[color]-600
```

---

## Responsive Breakpoints

### Tailwind Breakpoints
```
Base (mobile):      < 640px
sm: (tablet):       640px - 1023px
lg: (desktop):      1024px+
xl: (large desktop):1280px+
```

### Implementation
```css
/* Mobile first */
base-class

/* Tablet and up */
sm:tablet-class

/* Desktop and up */
lg:desktop-class

/* Example */
text-sm sm:text-base lg:text-lg
p-4 sm:p-5 lg:p-6
```

---

## Component States

### Question States
```
Unanswered:
├─ bg-gray-50 dark:bg-gray-700
├─ border-gray-200 dark:border-gray-600
└─ border-2

Answered:
├─ bg-green-50 dark:bg-green-900/20
├─ border-green-300 dark:border-green-600
└─ border-2
```

### Option States
```
Unselected:
├─ bg-white/50 dark:bg-gray-600/50
├─ border-transparent
└─ hover: bg-white/80

Selected:
├─ bg-white dark:bg-gray-600
├─ border-[color]-500 (2px)
└─ shadow-md
```

### Input States
```
Empty:
├─ border-b-2 border-[color]-500
├─ focus:border-[color]-700
└─ bg-transparent

Filled:
├─ border-b-2 border-[color]-700
├─ text-slate-800 dark:text-slate-200
└─ font-semibold
```

---

## Responsive Examples

### Mobile View (< 640px)
```
Header:     Vertical layout, single line items
Content:    Single column, full width
Cards:      p-4, gap-3, text-sm
Buttons:    Full width, py-3
```

### Tablet View (640px - 1023px)
```
Header:     Flex row with wrap, better spacing
Content:    Optimized width with spacing
Cards:      p-5, gap-4, text-base
Buttons:    Auto width, py-2.5
```

### Desktop View (1024px+)
```
Header:     Full horizontal layout
Content:    max-w-5xl with padding
Cards:      p-6, gap-5-6, text-base
Buttons:    Auto width, py-2.5
Part 3:     Visual lines visible
```

---

## Accessibility Features

### Color Contrast
```
Text:           WCAG AA (4.5:1)
Large Text:     WCAG AA (3:1)
Borders:        Clear 2-4px borders
Interactive:    Clear focus states
```

### Touch Targets
```
Minimum Size:   44px x 44px
Buttons:        py-2.5 (40px+), px-4 (56px+)
Radio/Check:    w-5 h-5 (20px)
Spacing:        gap-2 minimum (8px)
```

### Visual Hierarchy
```
Part 1-6:       Clear numbered badges
Status:         Visual badges + text
Progress:       Percentage + bar
Feedback:       Color + text + icon
```

---

## Component Composition

```
Complete Part:
├─ Header (Gradient Background)
│  ├─ Part Number Badge
│  ├─ Title
│  └─ Instructions
├─ Content (Padding Area)
│  ├─ Progress Badge
│  ├─ Questions Grid
│  │  ├─ Question Card
│  │  │  ├─ Number Badge
│  │  │  ├─ Status Badge
│  │  │  └─ Options
│  │  └─ [More Cards]
│  └─ Progress Bar
└─ [Dark Mode Variants]
```

---

This visual guide provides the complete design system for the new listening interface. All components follow this system consistently across all parts!

