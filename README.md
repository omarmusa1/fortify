# Fortify - Password Generator

A small, dependency-free password generator built with HTML, CSS and vanilla JavaScript.

## Features
- Length slider (8-64)
- Toggles for lowercase, uppercase, numbers and symbols
- Option to exclude look-alike characters (`O 0 I l 1`)
- Strength meter based on entropy (bits)
- One-click copy to clipboard

## Security notes
- Uses `crypto.getRandomValues()` instead of `Math.random()`, so passwords are cryptographically secure.
- Rejection sampling avoids modulo bias.
- Guarantees at least one character from every selected set, then shuffles (Fisher-Yates).
- Everything runs locally in the browser. Nothing is sent or stored.

## Run
Open `index.html` in a browser.

## Files
- `index.html` - structure
- `style.css` - styling
- `script.js` - generation and strength logic
