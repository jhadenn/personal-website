# Jhaden Goy — personal website

A dependency-free portfolio with the compact layout and hover-reveal interactions of [Vincent Wong's portfolio](https://github.com/VinceKLW/personal-portfolio), implemented independently. Content is drawn from Jhaden's November 2026 résumé.

Run `npm run dev` and open http://127.0.0.1:5173. Run `npm run check` for JavaScript syntax checks. Deploy the repository as a static site; no build is required.

Cloud detail is baked once into five small offscreen puff canvases. Six rounded clouds animate those puffs with independent drift, gentle billowing, pointer repulsion, and click/tap gusts. Cream and teal halftone shading fades at the edges and near the text; no center mask is applied. Rendering is capped at 20 fps and 1x backing resolution, with 30 sprite draws plus one clear per frame. Hidden tabs and reduced-motion preferences pause animation. The original image remains a palette/style reference.

Run node scripts/check-cloud-budget.cjs to check the real renderer against a 200-call per-frame budget at a simulated 1920x1080 viewport. This deterministic drawing-workload regression check does not measure GPU time or system-wide responsiveness.

Work icons are local copies of the actual company favicons: RBC from `https://www.rbc.com/favicon.ico`, WACC from `https://waccglobal.org/wp-content/uploads/2019/08/cropped-wacc-site-icon.png`, and Riipen from Google's favicon cache for `riipen.com`. These brand assets belong to their respective organizations.

Work and project descriptions reveal on hover and keyboard focus. Links use the résumé's verified destinations. The contribution calendar requests public activity from github-contributions-api.jogruber.de and displays a GitHub link if that service fails. No contribution counts are fabricated. The reference's OTU webring controls are omitted because this domain's membership is not established.

Edit content in `index.html`, styles in `style.css`, cloud behavior in `clouds.js`, and calendar behavior in `app.js`.
