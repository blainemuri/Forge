var viewerApp;
var options = {
    env: 'AutodeskProduction',
    accessToken: 'B39PbkK9nwRrv4ny4cTXYBey6PDG'
    // getAccessToken: function(onGetAccessToken) {
    //   var accessToken = 'B39PbkK9nwRrv4ny4cTXYBey6PDG';
    //   var expireTimeSeconds = 60*30;
    // }
};
var document1 = 'urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6b3JpZ2luYXRlLXRlc3QvQXUub2Jq';
var document2 = 'urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6b3JpZ2luYXRlLWZvcmdlL3JzdF9hZHZhbmNlZF9zYW1wbGVfcHJvamVjdC5ydnQ=';

/////////////////////////////////////////////////////////////////
// Returns viewable path from URN (needs matching token)
//
/////////////////////////////////////////////////////////////////
getViewablePath = function(token, urn) {

 return new Promise((resolve, reject)=> {

   try {

      Autodesk.Viewing.Initializer({
        accessToken: token
        }, ()=> {

      Autodesk.Viewing.Document.load(
        'urn:' + urn,
        (document)=> {

          var rootItem = document.getRootItem();

          var geometryItems3d = Autodesk.Viewing.Document.
            getSubItemsWithProperties(
            rootItem, {
              'type': 'geometry',
              'role': '3d' },
            true);

          var geometryItems2d = Autodesk.Viewing.Document.
            getSubItemsWithProperties(
            rootItem, {
              'type': 'geometry',
              'role': '2d' },
            true);

          var got2d = (geometryItems2d && geometryItems2d.length > 0);
          var got3d = (geometryItems3d && geometryItems3d.length > 0);

          if(got2d || got3d) {

            var pathCollection = [];

            geometryItems2d.forEach((item)=>{

              pathCollection.push(document.getViewablePath(item));
            });

            geometryItems3d.forEach((item)=>{

              pathCollection.push(document.getViewablePath(item));
            });

            return resolve(pathCollection);
          }
          else {

            return reject('no viewable content')
          }
        },
        (err)=> {

          console.log('Error loading document... ');

          //Autodesk.Viewing.ErrorCode

          switch(err){

            // removed for clarity, see full sample
          }
        });
      });
    }
    catch(ex){

      return reject(ex);
    }
  });
},

/////////////////////////////////////////////////////////////////
// Loads model into current scene
//
/////////////////////////////////////////////////////////////////
loadModel = function(path, opts) {

  return new Promise(async(resolve, reject)=> {

    function _onGeometryLoaded(event) {

      viewer.removeEventListener(
        Autodesk.Viewing.GEOMETRY_LOADED_EVENT,
        _onGeometryLoaded);

      return resolve(event.model);
    }

    viewer.addEventListener(
      Autodesk.Viewing.GEOMETRY_LOADED_EVENT,
      _onGeometryLoaded);

    viewer.loadModel(path, opts, ()=> {

      },
      (errorCode, errorMessage, statusCode, statusText)=> {

        viewer.removeEventListener(
          Autodesk.Viewing.GEOMETRY_LOADED_EVENT,
          _onGeometryLoaded);

        return reject({
          errorCode: errorCode,
          errorMessage: errorMessage,
          statusCode: statusCode,
          statusText: statusText
        });
      });
    });
},

var m = new THREE.Matrix4();



// Autodesk.Viewing.Initializer(options, onInitialized);
//
// function onInitialized() {
//   console.log(Autodesk);
//   viewerApp = new Autodesk.A360ViewingApplication('viewer');
//   viewerApp.registerViewer(viewerApp.k3D, Autodesk.Viewing.Private.GuiViewer3D);
//   viewerApp.loadDocumentWithItemAndObject(document1);
//   // globalOffset = viewerApp.model.getData().globalOffset;
//   viewerApp.loadDocumentWithItemAndObject(document1);
// }
//
// function onDocumentLoaded() {
//   console.log("Document Loaded");
// }
// Autodesk.Viewing.Initializer(options, function onInitialized(){
//     viewerApp = new Autodesk.A360ViewingApplication('viewer');
//     viewerApp.registerViewer(viewerApp.k3D, Autodesk.Viewing.Private.GuiViewer3D);
//     viewerApp.loadDocumentWithItemAndObject(document1);
// });
