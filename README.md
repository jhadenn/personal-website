# Jhaden Goy — personal website

A dependency-free portfolio with the compact layout and hover-reveal interactions of [Vincent Wong's portfolio](https://github.com/VinceKLW/personal-portfolio), implemented independently. Content is drawn from Jhaden's November 2026 résumé.

Run `npm run dev` and open http://127.0.0.1:5173. Run `npm run check` for JavaScript syntax checks. Deploy the repository as a static site; no build is required.

The canvas reconstructs the supplied image's cloud contours as a live density field in clouds.js. Fine dot and crosshatch cells use cream highlights, teal shadows, and deep navy gaps. Evolving flow warps and different horizontal speeds animate the formations; pointer movement parts the clouds and clicks/taps send expanding gusts. No pre-rendered image tiles move across the screen. The central text column is shaded for legibility. Animation respects reduced motion, pauses in hidden tabs, and includes a manual pause control.

Work icons are local copies of the actual company favicons: RBC from `https://www.rbc.com/favicon.ico`, WACC from `https://waccglobal.org/wp-content/uploads/2019/08/cropped-wacc-site-icon.png`, and Riipen from Google's favicon cache for `riipen.com`. These brand assets belong to their respective organizations.

Work and project descriptions reveal on hover and keyboard focus. Links use the résumé's verified destinations. The contribution calendar requests public activity from github-contributions-api.jogruber.de and displays a GitHub link if that service fails. No contribution counts are fabricated. The reference's OTU webring controls are omitted because this domain's membership is not established.

Edit content in `index.html`, styles in `style.css`, cloud behavior in `clouds.js`, and calendar behavior in `app.js`.
