# Jhaden Goy — personal website

A dependency-free portfolio with the compact layout and hover-reveal interactions of [Vincent Wong's portfolio](https://github.com/VinceKLW/personal-portfolio), implemented independently. Content is drawn from Jhaden's November 2026 résumé.

Run `npm run dev` and open http://127.0.0.1:5173. Run `npm run check` for JavaScript syntax checks. Deploy the repository as a static site; no build is required.

The page uses a black background with a sculpted Gothic cross rendered as ASCII. Curved arms, beveled front and back faces, a raised center, and solid side walls are projected through a depth buffer with directional lighting. Rendering runs only when the orientation changes. Drag to rotate, double-click to reset, or focus it and use the arrow keys and Home. The geometry, renderer, and interaction live in `cross.js`; the original text artwork remains as a fallback without JavaScript.

Work icons are local copies of the actual company favicons: RBC from `https://www.rbc.com/favicon.ico`, WACC from `https://waccglobal.org/wp-content/uploads/2019/08/cropped-wacc-site-icon.png`, and Riipen from Google's favicon cache for `riipen.com`. The degree line uses Ontario Tech's official favicon. These brand assets belong to their respective organizations.

Work and project descriptions reveal on hover and keyboard focus. Links use the résumé's verified destinations. The contribution calendar requests public activity from github-contributions-api.jogruber.de and displays a GitHub link if that service fails. No contribution counts are fabricated. The reference's OTU webring controls are omitted because this domain's membership is not established.

Edit content in `index.html`, styles in `style.css`, and calendar behavior in `app.js`.
