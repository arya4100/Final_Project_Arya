# SmartStock high-fidelity Figma package

Six UI screens are prepared as native editable rectangles, text and SVG icons, with named colour styles. The PNG previews are references; code.js imports editable layers rather than flattening screenshots. No network access, credentials or account data are included.

## Using Figma in your browser — easiest option

1. Create a new **Figma Design** file at figma.com. Open its blank canvas.
2. Open [browser-import](browser-import) in Windows File Explorer.
3. Select the **six `.svg` files** and drag them onto that blank canvas. Use the SVG files rather than the PNG previews.
4. Press **Shift+1** to see all screens, then arrange them side by side.
5. Rename the file **SmartStock — High-fidelity UI**, choose **Share → Copy link**, and provide that link for the report.

The SVGs contain vector shapes and icons. Figma may convert their text to vector outlines. For native editable text and named colour styles, use the desktop plugin below. The browser-import files have been rendered and checked locally; importing and saving them in Figma still requires your signed-in session.

Official import guide: https://help.figma.com/hc/en-us/articles/360040028034-Add-images-and-videos-to-designs

## Using the desktop plugin

1. Open the Figma desktop application and create a new Design file.
2. Choose Plugins > Development > Import plugin from manifest. Select this folder's manifest.json.
3. Run SmartStock — High-fidelity UI Import. It creates a new page with Login, Dashboard, Inventory, Stock Movements, Settings and Mobile frames.
4. Review text wrapping and spacing (Inter is the portable fallback), save the file and copy its actual URL.
5. Add the URL to docs/submission.json and regenerate the reports.

This prepared import package has been checked locally against the Figma API shape, but cannot be claimed as a saved Figma file until run in your signed-in account. Actual import may require font/spacing review.

Sources: https://developers.figma.com/docs/plugins/manifest/ and https://developers.figma.com/docs/plugins/working-with-text/
