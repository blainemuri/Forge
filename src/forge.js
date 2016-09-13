var viewerApp;
var options = {
  env: 'AutodeskProduction',
  accessToken: 'FcyfRv0RcGAocVL5z4tKsYwgOwOp'
  // getAccessToken: function(onGetAccessToken) {
  //   var accessToken = 'B39PbkK9nwRrv4ny4cTXYBey6PDG';
  //   var expireTimeSeconds = 60*30;
  // }
};
var document1 = 'urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6b3JpZ2luYXRlLWZvcmdlL0F1Lm9iag==';
var document2 = 'urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6b3JpZ2luYXRlLWZvcmdlL3JzdF9hZHZhbmNlZF9zYW1wbGVfcHJvamVjdC5ydnQ=';

Autodesk.Viewing.Initializer(options, onInitialized);

function onInitialized() {
  console.log(Autodesk);
  viewerApp = new Autodesk.A360ViewingApplication('viewer');
  viewerApp.registerViewer(viewerApp.k3D, Autodesk.Viewing.Private.GuiViewer3D);
  viewerApp.loadDocumentWithItemAndObject(document1);
  // globalOffset = viewerApp.model.getData().globalOffset;
}

function onDocumentLoaded() {
  console.log("Document Loaded");
}
// Autodesk.Viewing.Initializer(options, function onInitialized(){
//     viewerApp = new Autodesk.A360ViewingApplication('viewer');
//     viewerApp.registerViewer(viewerApp.k3D, Autodesk.Viewing.Private.GuiViewer3D);
//     viewerApp.loadDocumentWithItemAndObject(document1);
// });
