# Jhaden Goy — personal website

A dependency-free portfolio with the compact layout and hover-reveal interactions of [Vincent Wong's portfolio](https://github.com/VinceKLW/personal-portfolio), implemented independently. Content is drawn from Jhaden's November 2026 résumé.

Run `npm run dev` and open http://127.0.0.1:5173. Run `npm run check` for JavaScript syntax checks. Deploy the repository as a static site; no build is required.

The canvas renders seven independent ASCII cloud formations from evolving density fields in `clouds.js`. Overlapping cloud lobes and layered noise create billowing shapes in the reference image's cream/navy palette. Each formation drifts left to right at its own speed. Move the pointer to part the clouds, or click/tap to send an expanding gust through them. The original image remains in `assets/cloud-reference.png` as a design reference; it is not rendered as a moving texture. Animation pauses in hidden tabs, respects reduced-motion preferences, and has a manual pause control. Pointer interactions do not intercept links or touch scrolling.

Work icons are local copies of the actual company favicons: RBC from `https://www.rbc.com/favicon.ico`, WACC from `https://waccglobal.org/wp-content/uploads/2019/08/cropped-wacc-site-icon.png`, and Riipen from Google's favicon cache for `riipen.com`. These brand assets belong to their respective organizations.

Work and project descriptions reveal on hover and keyboard focus. Links use the résumé's verified destinations. The contribution calendar requests public activity from github-contributions-api.jogruber.de and displays a GitHub link if that service fails. No contribution counts are fabricated. The reference's OTU webring controls are omitted because this domain's membership is not established.

Edit content in `index.html`, styles in `style.css`, cloud behavior in `clouds.js`, and calendar behavior in `app.js`.
