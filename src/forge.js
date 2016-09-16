var viewerApp;
var options = {
  env: 'AutodeskProduction',
  accessToken: 'WlXDCDtqtUmMub4q879mdA2Kau7f'
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
var viewer = new Autodesk.Viewing.Private.GuiViewer3D(
  domContainer,
  { extenstions: ['Autodesk.ADN.Viewing.Extension.TransformTool']});

var modelPath;

viewer.addEventListener(
  Autodesk.Viewing.AGGREGATE_SELECTION_CHANGED_EVENT,
  onAggregateSelectionChanged);

function onInitialized() {
  // viewerApp = new Autodesk.A360ViewingApplication('viewer');
  // viewerApp.registerViewer(viewerApp.k3D, Autodesk.Viewing.Private.GuiViewer3D);

  Autodesk.Viewing.Document.load(
    document2,
    (model)=> {
      var rootItem = model.getRootItem();

      var geometryItems3d = Autodesk.Viewing.Document.getSubItemsWithProperties(
        rootItem, {
          'type': 'geometry',
          'role': '3d'},
      true);

      viewer.initialize();
      viewer.setLightPreset(8);

      var options = {
        globalOffset: {
          x: 0, y: 0, z: 0
        }
      }

      var path = geometryItems3d[0];

      modelPath = model.getViewablePath(path);

      viewer.loadModel(model.getViewablePath(path), options);
      setViewTop();
      // var camera = new THREE.Camera
      // viewer.getCamera().pivot.x = 0;
      // viewer.getCamera().pivot.y = 0;
      // viewer.getCamera().pivot.z = 0;
    }
  )
  // viewerApp.loadDocumentWithItemAndObject(document1);
  // globalOffset = viewerApp.model.getData().globalOffset;
}

function setViewTop() {
  viewer.setViewCube("top");
}

function onAggregateSelectionChanged(event) {
  var selection = event.selections[0];
  viewer.model = selection.model;
  console.log(viewer.model.getData().placementTransform);
  setViewTop();
}

function getGlobalOffset() {
  return viewer.model.getData().globalOffset;
}

function getWidth() {
  var max = viewer.model.getData().bbox.max.x;
  var min = viewer.model.getData().bbox.min.x;
  return (max - min);
}

function getLength() {
  var max = viewer.model.getData().bbox.max.y;
  var min = viewer.model.getData().bbox.min.y;
  return (max - min);
}
//
// function handleButtonClick(e) {
//   e.preventDefault
//   console.log("blah");
// }

window.addBlockRight = function (e) {
  var width = getWidth();
  var offset = getGlobalOffset();

  var options = {
    globalOffset: {
      x: (offset.x - width), y: offset.y, z: offset.z
    }
  }

  viewer.loadModel(modelPath, options);
}

window.addBlockLeft = function (e) {
  var width = getWidth();
  var offset = getGlobalOffset();

  var options = {
    globalOffset: {
      x: (offset.x + width), y: offset.y, z: offset.z
    }
  }

  viewer.loadModel(modelPath, options);
}

window.addBlockTop = function (e) {
  var length = getLength();
  var offset = getGlobalOffset();

  var options = {
    globalOffset: {
      x: offset.x, y: (offset.y - length), z: offset.z
    }
  }

  viewer.loadModel(modelPath, options);
}

window.addBlockBottom = function (e) {
  var length = getLength();
  var offset = getGlobalOffset();

  var options = {
    globalOffset: {
      x: offset.x, y: (offset.y + length), z: offset.z
    }
  }

  viewer.loadModel(modelPath, options);
}

function getTransformMatrix(z) {
  var x = 0;
  var y = 0;
  var z = z;

  var euler = new THREE.Euler(
    x * Math.PI/180,
    y * Math.PI/180,
    z * Math.PI/180,
    'XYZ'
  );

  var rotation = new THREE.Quaternion();
  rotation.setFromEuler(euler);
  var translation = new THREE.Vector3(0, 0, 0);
  var scale = new THREE.Vector3(1, 1, 1);

  var matrix = new THREE.Matrix4();
  matrix.compose(translation, rotation, scale);

  return matrix;
}

window.rotateClockwise = function (e) {
  //Set the transform on the model
  var loadOptions = {
    placementTransform: getTransformMatrix(-180),
    globalOffset: getGlobalOffset()
  }

  viewer.impl.unloadModel(viewer.model);
  viewer.loadModel(modelPath, loadOptions);
  setViewTop();
}

window.rotateCounterclockwise = function (e) {
  //Set the transform on the model
  var loadOptions = {
    placementTransform: getTransformMatrix(90),
    globalOffset: getGlobalOffset()
  }

  viewer.impl.unloadModel(viewer.model);
  viewer.loadModel(modelPath, loadOptions);
  setViewTop();
}

window.deleteModel = function (e) {
  viewer.impl.unloadModel(viewer.model);
  viewer.impl.sceneUpdated(true);
}

///////////////////////////////////////////////////////////////////////////
// Transform tool in order to move around the object withint he viewer.
// Snap functionality not implemented yet.
///////////////////////////////////////////////////////////////////////////








// window.handleButtonClick = function (e) {
//   e.preventDefault();
//   var instanceTree = viewer.model.getData().instanceTree;
//   // console.log(viewer.model.getData().instanceTree.getRootId());
//   // console.log(viewer.model.getData().globalOffset);
//   // console.log(viewer.model.getData());
// }



// OLD WAY OF DOING THINGS (SIMPLER)
// Autodesk.Viewing.Initializer(options, function onInitialized(){
//     viewerApp = new Autodesk.A360ViewingApplication('viewer');
//     viewerApp.registerViewer(viewerApp.k3D, Autodesk.Viewing.Private.GuiViewer3D);
//     viewerApp.loadDocumentWithItemAndObject(document1);
// });
