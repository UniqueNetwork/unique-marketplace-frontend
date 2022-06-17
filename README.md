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
- Start back-end marketplace-api service;
- Provide a correct URL to the back-end and other variables in **/public/env.js**;
- Provide all the customization in the **/public** folder;
- Run the **npm run build** command; 
- Use some server (ex. Nginx) to serve the **/build** folder from the installation. 
**Warning** 
You need to ensure you have **+x** on all of the directories in the path leading to the site's root

# Environment variables
We provide two files for configuration: ```env.development``` and ```public/env.js```.
- ```public/env.js``` is mainly provided for a production environment for easier configuration updates without rebuilding the entire application.
- ```env.development``` is used for a local development and applied only for values not presented in ```public/env.js``` as long as NODE_ENV is development.

Keep in mind that the env.development variables should begin with "REACT_APP_".

## Variables explained

- ```DOCUMENT_TITLE``` - The application title.
- ```UNIQUE_API_URL``` - The back-end URL.
- ```SCAN_URL``` - The Scan URL for some redirects. It is recommended using "https://uniquescan.io/QUARTZ/" for production.
- ```IPFS_GATEWAY``` - Used for some legacy collections. If a collection uses variableOnChainSchema, then we will use this variable as the URL prefix: _{IPFSGateway}/${image}_ .
# Customization
## **If you want to continue to receive updates on marketplace and only change some visuals - make sure to follow this guideline instead of changing the code.**

We support simple customization that can be achieved without modifying the actual code. It is advised using this functionality instead of manually updating the code in order to continue receiving updates without any issues or merge conflicts.

## General
- All the customization examples can be found in the "dafc" folder.
- All customization is applied via editing (or providing) needed files to the  **"/public"** folder.
## Colors and CSS
Edit ```public/variables.css``` in order to change global visuals (ex. colors, fonts).
## Footer
Edit ```public/footer.html``` file in order to change the website footer. You are free to use any css/html/js inside it. Provided html file will be aplied as is, with no restrictions or interferences.

## Misc
- You can provide your own ```public/logo.png``` for header logo.
- You can change favicon ```public/favicon.ico```.
- You can provide your own ```public/Terms.pdf ```(link to download it can be found on the FAQ page).