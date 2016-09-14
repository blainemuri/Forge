'use strict';

var viewerApp;
var options = {
  env: 'AutodeskProduction',
  accessToken: 'RmI1vDH7PW1GBry3jbuA8WLeXKGN'
  // getAccessToken: function(onGetAccessToken) {
  //   var accessToken = 'B39PbkK9nwRrv4ny4cTXYBey6PDG';
  //   var expireTimeSeconds = 60*30;
  // }
};
var document1 = 'urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6b3JpZ2luYXRlLWZvcmdlL0F1Lm9iag==';
var document2 = 'urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6b3JpZ2luYXRlLWZvcmdlL3JzdF9hZHZhbmNlZF9zYW1wbGVfcHJvamVjdC5ydnQ=';

Autodesk.Viewing.Initializer(options, onInitialized);

// The viewer that is being used
var domContainer = document.getElementById('viewer');
var viewer = new Autodesk.Viewing.Private.GuiViewer3D(domContainer);

function onInitialized() {
  // console.log(Autodesk);
  // viewerApp = new Autodesk.A360ViewingApplication('viewer');
  // viewerApp.registerViewer(viewerApp.k3D, Autodesk.Viewing.Private.GuiViewer3D);
  Autodesk.Viewing.Document.load(document1, function (model) {
    var rootItem = model.getRootItem();

    var geometryItems3d = Autodesk.Viewing.Document.getSubItemsWithProperties(rootItem, {
      'type': 'geometry',
      'role': '3d' }, true);

    viewer.initialize();
    viewer.setLightPreset(8);

    var options = {
      globalOffset: {
        x: 0, y: 0, z: 0
      }
    };

    var options2 = {
      globalOffset: {
        x: 1, y: 0, z: 0
      }
    };

    var path = geometryItems3d[0];

    var block1 = model.getViewablePath(path);

    viewer.loadModel(model.getViewablePath(path), options);
    viewer.loadModel(model.getViewablePath(path), options2);
    console.log(model.getRootItem());
  });
  // viewerApp.loadDocumentWithItemAndObject(document1);
  // globalOffset = viewerApp.model.getData().globalOffset;
}
//
// function handleButtonClick(e) {
//   e.preventDefault
//   console.log("blah");
// }

window.handleButtonClick = function (e) {
  e.preventDefault();
  console.log(viewer.model.getData().instanceTree.getRootItem());
};

// OLD WAY OF DOING THINGS (SIMPLER)
// Autodesk.Viewing.Initializer(options, function onInitialized(){
//     viewerApp = new Autodesk.A360ViewingApplication('viewer');
//     viewerApp.registerViewer(viewerApp.k3D, Autodesk.Viewing.Private.GuiViewer3D);
//     viewerApp.loadDocumentWithItemAndObject(document1);
// });