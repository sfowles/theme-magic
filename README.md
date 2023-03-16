# theme-magic
A figma plugin for automagically theming Sagent compositions using the component library and design tokens.

### Features
* Auto generates a dark mode composition from any selected light mode composition, and vice versa
* Automatically updates composition names to reflect the accurate theme

### Usage
* Select one or more page-level Frames within Figma, and run the plugin
* Make sure to strictly adhere to semantic color design token best practices
* Components without the "Theme" property are ignored

### How to run in dev
* Pull this repo
* Run `npm i` and `npm watch`
* Open Figma, and select Plugins > Development > Import plugin from manifest...
* Navigate to the repo folder and select `manifest.json`
* Success!
