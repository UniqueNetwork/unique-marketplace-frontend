# About
Unique marketplace layout with auction. Easy and reliable entry point to create your own marketplace in Unique ecosystem.
# Development
```
npm install
npm run start
```
All the configuration goes in ```env.development```. Make sure to update all the values related to your back-end.

Back-end repository can be found here: [https://github.com/UniqueNetwork/unique-marketplace-api](https://github.com/UniqueNetwork/unique-marketplace-api)

# Production/Deployment
We provide easy-start solution here: [https://github.com/UniqueNetwork/marketplace-docker/tree/all-new-easy-start](https://github.com/UniqueNetwork/marketplace-docker/tree/all-new-easy-start)

If you want to build it manually:
- Make sure to start back-end marketplace-api service
- Provide correct url to the BE and other variables in **/public/env.js**
- Provide all the customization in **/public** folder
- **npm run build**
- Use some server to serve static from **/build** folder (ex. Nginx)

# Environment variables
We provide two files for configuration: ```env.development``` and ```public/env.js```.
- ```public/env.js``` is mainly provided for production environment for easier configuration updates without rebuilding whole application`
- ```env.development``` is used for local developemnt and applied only for values not presented in ```public/env.js``` as long as NODE_ENV is development.

Keep in mind that env.development variables should beging with "REACT_APP_".

## Variables explained

- ```DOCUMENT_TITLE``` - application title
- ```UNIQUE_API_URL``` - back-end url
# Customization
## **If you want to continue to receive updates on marketplace and only change some visuals - make sure to follow this guideline instead of changing the code.**

We support simple customization that can be achieved without touching the actual code. It is advised to use this functionality instead of manually updating the code in order to continue receiving updates without any issues or merge conflicts.

## General
- All the customization examples can be found in "dafc" folder.
- All customization is applied via editing (or providing) necessary files to еру  **"/public"** folder.
## Colors and CSS
Edit ```public/variables.css``` in order to change global visuals (ex. colors, fonts)
## Footer
Edit ```public/footer.html``` file in order to change web-site footer. You are free to use any css/html/js inside it. Provided html file will be aplied as is, with no restrictions or interferences.

## Misc
- You can provide your own ```public/logo.png``` for header logo
= You can change favicon ```public/favicon.ico```
- You can provide your own ```public/Terms.pdf ```(link for it's download could be found on FAQ page`)