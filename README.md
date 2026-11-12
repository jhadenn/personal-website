# Jhaden Goy — personal website

A dependency-free portfolio with the compact layout and hover-reveal interactions of [Vincent Wong's portfolio](https://github.com/VinceKLW/personal-portfolio), implemented independently. Content is drawn from Jhaden's November 2026 résumé.

Run `npm run dev` and open http://127.0.0.1:5173. Run `npm run check` for JavaScript syntax checks. Deploy the repository as a static site; no build is required.

The canvas samples `assets/cloud-reference.png` into colored ASCII characters and scrolls mirrored tiles from left to right. Colors are sampled from the supplied reference. Animation pauses in hidden tabs, respects reduced-motion preferences, and has a manual pause control.

Work and project descriptions reveal on hover and keyboard focus. Links use the résumé's verified destinations. The contribution calendar requests public activity from github-contributions-api.jogruber.de and displays a GitHub link if that service fails. No contribution counts are fabricated. The reference's OTU webring controls are omitted because this domain's membership is not established.

Edit content in `index.html`, styles in `style.css`, and cloud/calendar behavior in `app.js`.
