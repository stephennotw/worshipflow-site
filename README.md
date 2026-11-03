# worshipflow-site

The website for WorshipFlow: https://getworshipflow.app/ (custom domain set by the `CNAME` file).

Plain HTML, CSS and JavaScript with no build step; GitHub Pages serves `main` from the root.

- `index.html`, `styles.css`, `main.js`: the home page
- `privacy/`, `support/`: the pages the App Store and Play Store link to
- `assets/`: app screenshots, icon, store badges, the link-preview image (`og.png`)

Colours and type follow the app (`WfTheme`: Stage Dark and Clean Light). The chord demo uses the app's transposing rules (`ChordTransposer.kt`).
