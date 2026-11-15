# SmartStock high-fidelity Figma package

Six UI screens are prepared as native editable rectangles, text and SVG icons, with named colour styles. The PNG previews are references; code.js imports editable layers rather than flattening screenshots. No network access, credentials or account data are included.

1. Open the Figma desktop application and create a new Design file.
2. Choose Plugins > Development > Import plugin from manifest. Select this folder's manifest.json.
3. Run SmartStock — High-fidelity UI Import. It creates a new page with Login, Dashboard, Inventory, Stock Movements, Settings and Mobile frames.
4. Review text wrapping and spacing (Inter is the portable fallback), save the file and copy its actual URL.
5. Add the URL to docs/submission.json and regenerate the reports.

This prepared import package has been checked locally against the Figma API shape, but cannot be claimed as a saved Figma file until run in your signed-in account. Actual import may require font/spacing review.

Sources: https://developers.figma.com/docs/plugins/manifest/ and https://developers.figma.com/docs/plugins/working-with-text/
