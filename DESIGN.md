# WEDXUI Fit — Design System & Architecture

## Brand Identity
- **Name**: WEDXUI Fit
- **Tagline**: Become the strongest version of yourself.
- **Alt Taglines**: Build Discipline. | Forge Your Future. | Every Workout Levels You Up. | Every Rep Writes Your Story.

## Visual System
- **Background**: Deep black (#0a0a0f) with subtle noise texture
- **Primary Accent**: Neon Purple (#b026ff)
- **Secondary Accent**: Electric Blue (#00d4ff)
- **Tertiary Accent**: Lime (#ccff00)
- **Surface**: Glassmorphism cards (rgba(255,255,255,0.03) + backdrop-blur(12px) + border rgba(255,255,255,0.08))
- **Text**: White (#ffffff) for headings, #a0a0b0 for body
- **Glow**: Box-shadows with purple/blue/lime at low opacity (0.15-0.4)
- **Border Radius**: 16px for cards, 50px for buttons, 8px for inputs
- **Font**: System font stack with 'Inter' as primary, fallback to system-ui

## Animation Language
- **Hero**: Canvas-based particle system with connected nodes, mouse-reactive
- **Transitions**: All sections fade in on scroll (IntersectionObserver)
- **Hover**: Cards tilt 3D on hover (transform: perspective + rotateX/Y), glow intensifies
- **Buttons**: Ripple effect on click, glow pulse on idle
- **Counters**: Animated number counting up
- **Progress**: Animated circular and linear progress bars
- **Level Up**: CSS keyframe burst + confetti particles on workout completion
- **Micro**: Floating icons, subtle parallax on scroll, magnetic cursor effects

## Single Page Architecture
All sections live in one `index.html` with smooth anchor scroll navigation.

### Sections (in order)
1. **Navigation** — Fixed top, glassmorphism, hamburger on mobile
2. **Hero** — Full viewport, animated particles canvas, massive headline with text reveal, CTA button
3. **AI Coach** — Holographic assistant avatar, speech bubble tips, animated greeting
4. **Daily Motivation** — Rotating quote with typewriter effect, day-based
5. **Onboarding Modal** — Multi-step form (age, height, weight, goals, etc.), generates personalized plan
6. **Workouts** — Category tabs (PPL, Upper/Lower, Full Body, etc.), expandable workout cards
7. **Exercises** — Grid of exercise cards with images, difficulty, muscles, instructions
8. **Challenges** — 30-day, 100 push-ups, etc., progress bars, completion badges
9. **Tools** — BMI, Calorie, Protein, Water, Body Fat, 1RM, Macro calculators + Timers
10. **Progress Dashboard** — Charts (weight, body fat, streak, PRs), animated stats, achievement grid
11. **Gamification Panel** — XP bar, level badge, streak counter, title unlock, recent achievements
12. **Footer** — Links, social, copyright

## Tech Stack
- HTML5 semantic markup
- CSS3 with custom properties, grid, flexbox, animations
- Vanilla JavaScript (ES6+ modules via `<script type="module">` or single file)
- localStorage for persistence (no backend in v1)
- Canvas API for particles and charts
- IntersectionObserver for scroll animations

## File Structure
```
index.html          # Main page with all sections
├── css/
│   └── style.css   # All styles in one file (modular with comments)
├── js/
│   ├── app.js      # Core: nav, particles, scroll, modal, storage
│   ├── workouts.js # Workout data, plan generation, exercise library
│   ├── tools.js    # All calculators and timers
│   ├── dashboard.js# Progress tracking, charts, gamification
│   └── utils.js    # Helpers, animations, confetti, counters
```

## Responsive Breakpoints
- Desktop: >1024px
- Tablet: 768px–1024px
- Mobile: <768px
- Small Mobile: <480px

## Key Interactions
- **Workout Complete**: Confetti burst + XP gain + level check + achievement unlock animation
- **Timer**: Circular SVG countdown with neon stroke
- **Card Hover**: 3D tilt effect + border glow + scale(1.02)
- **Nav Scroll**: Active section highlight in nav
- **Onboarding**: Smooth multi-step form with progress dots, save to localStorage
- **Daily Quote**: Changes based on day of month, typewriter reveal on load
