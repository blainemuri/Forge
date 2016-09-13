Autodesk Forge Resources
========================
A list of resources gathered to build out Forge Viewers
____
####To generate a new Bucket that stores resources
These are what the viewer needs to pull from in order to display content
[viewer-curl-sample](https://github.com/Autodesk-Forge/viewer-curl-sample)

#### Steps for creating a new viewer
1. Run the first 6 commands in the viewer-curl-sample command line tools. This allows you to create a bucket with an object.
2. Within the object html file, copy the object urn.
3. Paste the urn into the index.html file in the outermost directory
4. Copy the access token from the data/access_token file and replace the one within index.html
5. load index.html within the browser

To Run
------
> This requires having an installation of node.js on your machine and a unix environment

`git clone git@github.com:blaine1726/Forge.git`

`cd Forge`

`npm install`

`npm run start`


* The document does not auto-reload the javascript
* Javascript files must be added/edited in the `src/` folder
* ES6 is enabled for compile using babel, and is compiled from the `src/` folder to the `dist/` folder
