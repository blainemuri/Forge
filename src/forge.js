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
  Autodesk.Viewing.Document.load(
    document1,
    (model)=> {
      var rootItem = model.getRootItem();

      var geometryItems3d = Autodesk.Viewing.Document.getSubItemsWithProperties(
        rootItem, {
          'type': 'geometry',
          'role': '3d'},
      true);

      var domContainer = document.getElementById('viewer');

      var viewer = new Autodesk.Viewing.Private.GuiViewer3D(domContainer);
      viewer.initialize();
      viewer.setLightPreset(8);

      var options = {
        globalOffset: {
          x: 0, y: 0, z: 0
        }
      }

      var options2 = {
        globalOffset: {
          x: 1, y: 0, z: 0
        }
      }

      var path = geometryItems3d[0];

      var block1 = model.getViewablePath(path);
      console.log(block1);

      viewer.loadModel(model.getViewablePath(path), options);
      viewer.loadModel(model.getViewablePath(path), options2);
    }
  )
  // viewerApp.loadDocumentWithItemAndObject(document1);
  // globalOffset = viewerApp.model.getData().globalOffset;
}



// OLD WAY OF DOING THINGS (SIMPLER)
// Autodesk.Viewing.Initializer(options, function onInitialized(){
//     viewerApp = new Autodesk.A360ViewingApplication('viewer');
//     viewerApp.registerViewer(viewerApp.k3D, Autodesk.Viewing.Private.GuiViewer3D);
//     viewerApp.loadDocumentWithItemAndObject(document1);
// });
