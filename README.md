# About
Unique marketplace + uaction layour. Easy and reliable entry point to create your own marketplace in unique ecosystem.
# Development
```
npm install
npm run start
```
All the configuration goes in ```env.development```, make sure to update all the values to your back-end
Back-end repository can be found here: [https://github.com/UniqueNetwork/unique-marketplace-api](https://github.com/UniqueNetwork/unique-marketplace-api)

# Production/Deployment
We provide easy-start solution here: [https://github.com/UniqueNetwork/marketplace-docker/tree/all-new-easy-start](https://github.com/UniqueNetwork/marketplace-docker/tree/all-new-easy-start)

If you want to build it manually:
- Make sure to start back-end marketplace-api service
- Provide correct url to the BE and other variables in **/public/env.js**
- Provide all the customization in **/public** folder
- **npm run build**
- Use some server to serve static from **/build** folder (ex. Nginx)

# Customization
We support simple customization without touching the code. It is advised to use this functionality instead of manually updating the code in order to continue receive updates without any issues oor merge conflicts.

```
If you want to continue receive updates on marketplace and only change some visuals - make sure to follow this guideline instead of changing the code.
```

## General
- All the customization examples can be found in "dafc" folder.
- All customization is applied via editing (or providing) necessary files to еру  **"/public"** folder.
## Colors and CSS
```
Edit "variables.css" in order to change global visuals (ex. colors, fonts)
```
## Footer
```
Edit "footer.html" file in order to change web-site footer. You are free to use any css/html/js inside it, it will be aplied as provided with no restrictions or interferences.
```

## Misc
- You can provide your own logo.png
- You can provide your own Terms.pdf (link for it's download could be found on FAQ page`)
- You can also edit "index.html" file for some cases (ex. SEO). But make sure to keep the neccessary parts (ex. bundle.js)