## Quick Start

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build → dist/
npm run preview    # preview production build
```

---

## Project Structure

```
frontend/
├── index.html                        # Entry HTML 
├── vite.config.js                    # Vite + React plugin
├── tailwind.config.js                # Capgemini design tokens
├── postcss.config.js
├── package.json
└── src/
    ├── main.jsx                      # ReactDOM.createRoot entry
    ├── App.jsx                       # Root: splash state + modal state
    ├── index.css                     # Tailwind layers + splash animation
    │
    ├── assets/
    │   └── images.js                 # Images
    │
    ├── hooks/
    │   └── useChat.js                # API calls + message state
    │
    └── components/
        ├── SplashScreen.jsx          # Loading animation
        ├── Navbar.jsx                # Sticky nav with real Capgemini logo
        ├── HeroBanner.jsx            # Full-width mangrove hero image
        ├── ContentSection.jsx        # Title + lead text + bullet list
        ├── ActionCard.jsx            # Single grid tile (blue/white/disabled)
        ├── ActionGrid.jsx            # 3×2 action tiles grid
        ├── Footer.jsx                # Copyright footer
        ├── ChatModal.jsx             # AI support agent modal
        └── ChatMessage.jsx           # Individual chat bubble with markdown
```

---

## Architecture Decisions

### Component decomposition
Each visual region is its own component.

### Design tokens in `tailwind.config.js`
All brand colours live in one place:

| Token                     | Hex       | Usage                    |
|---------------------------|-----------|--------------------------|
| `capgemini-blue`          | `#0070AD` | Logo, nav active         |
| `capgemini-darkblue`      | `#1565C0` | Action tiles (blue row)  |
| `capgemini-navy`          | `#1155a8` | Lead text, links         |
| `capgemini-teal`          | `#00C8C8` | Hero accent              |
| `capgemini-pagebg`        | `#e8e8e8` | Page background          |
| `capgemini-disabled`      | `#d4d4d4` | Disabled tile            |
| `capgemini-border`        | `#e0e0e0` | All card/grid borders    |

### Splashscreen (`SplashScreen.jsx`)

```html
<div class="app-loading" id="app-loader">
  <div class="splashscreen">
    <div class="wrapper">
      <span class="circle circle-1"></span>
      …
      <span class="circle circle-6"></span>
    </div>
  </div>
</div>
```
Six bouncing dots with staggered `animation-delay` (0.1 s increments).
The component fades out after 950 ms.

---


## Responsive Behaviour

| Breakpoint  | Behaviour                                       |
|-------------|-------------------------------------------------|
| `< 500px`   | Nav links collapse; chat modal goes full-screen |
| `500–960px` | Chat modal: `420 × 640 px` floating panel       |
| `> 960px`   | Content column caps at `960 px`, centred        |
