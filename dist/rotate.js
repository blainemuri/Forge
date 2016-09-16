'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _EventsEmitter3 = require('EventsEmitter');

var _EventsEmitter4 = _interopRequireDefault(_EventsEmitter3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var RotateTool = function (_EventsEmitter) {
  _inherits(RotateTool, _EventsEmitter);

  /////////////////////////////////////////////////////////////////
  // Class constructor
  //
  /////////////////////////////////////////////////////////////////
  function RotateTool(viewer) {
    _classCallCheck(this, RotateTool);

    var _this = _possibleConstructorReturn(this, (RotateTool.__proto__ || Object.getPrototypeOf(RotateTool)).call(this));

    _this.keys = {};

    _this.active = false;

    _this.viewer = viewer;

    _this.fullTransform = false;

    _this.viewer.toolController.registerTool(_this);

    _this.onAggregateSelectionChangedHandler = function (e) {

      _this.onAggregateSelectionChanged(e);
    };
    return _this;
  }

  /////////////////////////////////////////////////////////////////
  // Enable tool
  //
  /////////////////////////////////////////////////////////////////


  _createClass(RotateTool, [{
    key: 'enable',
    value: function enable(_enable) {

      var name = this.getName();

      if (_enable) {

        this.viewer.toolController.activateTool(name);
      } else {

        this.viewer.toolController.deactivateTool(name);
      }
    }

    /////////////////////////////////////////////////////////////////
    //
    //
    /////////////////////////////////////////////////////////////////

  }, {
    key: 'getNames',
    value: function getNames() {

      return ['Viewing.Rotate.Tool'];
    }

    /////////////////////////////////////////////////////////////////
    //
    //
    /////////////////////////////////////////////////////////////////

  }, {
    key: 'getName',
    value: function getName() {

      return 'Viewing.Rotate.Tool';
    }

    ///////////////////////////////////////////////////////////////////
    // activate tool
    //
    ///////////////////////////////////////////////////////////////////

  }, {
    key: 'activate',
    value: function activate() {

      if (!this.active) {

        this.active = true;

        this.viewer.addEventListener(Autodesk.Viewing.AGGREGATE_SELECTION_CHANGED_EVENT, this.onAggregateSelectionChangedHandler);
      }
    }

    ///////////////////////////////////////////////////////////////////////////
    // deactivate tool
    //
    ///////////////////////////////////////////////////////////////////////////

  }, {
    key: 'deactivate',
    value: function deactivate() {

      if (this.active) {

        this.active = false;

        if (this.rotateControl) {

          this.rotateControl.remove();
          this.rotateControl = null;
        }

        this.viewer.removeEventListener(Autodesk.Viewing.AGGREGATE_SELECTION_CHANGED_EVENT, this.onAggregateSelectionChangedHandler);
      }
    }

    ///////////////////////////////////////////////////////////////////////////
    // Component Selection Handler
    // (use Autodesk.Viewing.AGGREGATE_SELECTION_CHANGED_EVENT instead of
    //  Autodesk.Viewing.SELECTION_CHANGED_EVENT - deprecated )
    //
    ///////////////////////////////////////////////////////////////////////////

  }, {
    key: 'onAggregateSelectionChanged',
    value: function onAggregateSelectionChanged(event) {

      if (this.rotateControl && this.rotateControl.engaged) {

        this.rotateControl.engaged = false;

        this.viewer.select(this.selection.dbIdArray);

        return;
      }

      if (event.selections && event.selections.length) {

        var selection = event.selections[0];

        this.selection = selection;

        this.emit('transform.modelSelected', this.selection);

        if (this.fullTransform) {

          this.selection.fragIdsArray = [];

          var fragCount = selection.model.getFragmentList().fragments.fragId2dbId.length;

          for (var fragId = 0; fragId < fragCount; ++fragId) {

            this.selection.fragIdsArray.push(fragId);
          }

          this.selection.dbIdArray = [];

          var instanceTree = selection.model.getData().instanceTree;

          var rootId = instanceTree.getRootId();

          this.selection.dbIdArray.push(rootId);
        }

        this.drawControl();

        this.viewer.fitToView(this.selection.dbIdArray);
      } else {

        this.clearSelection();
      }
    }

    ///////////////////////////////////////////////////////////////////////////
    // Selection cleared
    //
    ///////////////////////////////////////////////////////////////////////////

  }, {
    key: 'clearSelection',
    value: function clearSelection() {

      this.selection = null;

      if (this.rotateControl) {

        this.rotateControl.remove();

        this.rotateControl = null;

        this.viewer.impl.sceneUpdated(true);
      }
    }

    ///////////////////////////////////////////////////////////////////////////
    // Draw rotate control
    //
    ///////////////////////////////////////////////////////////////////////////

  }, {
    key: 'drawControl',
    value: function drawControl() {
      var _this2 = this;

      var bBox = this.geWorldBoundingBox(this.selection.fragIdsArray, this.selection.model.getFragmentList());

      this.center = new THREE.Vector3((bBox.min.x + bBox.max.x) / 2, (bBox.min.y + bBox.max.y) / 2, (bBox.min.z + bBox.max.z) / 2);

      var size = Math.max(bBox.max.x - bBox.min.x, bBox.max.y - bBox.min.y, bBox.max.z - bBox.min.z) * 0.8;

      if (this.rotateControl) {

        this.rotateControl.remove();
      }

      this.rotateControl = new RotateControl(this.viewer, this.center, size);

      this.rotateControl.on('transform.rotate', function (data) {

        _this2.rotateFragments(_this2.selection.model, _this2.selection.fragIdsArray, data.axis, data.angle, _this2.center);

        _this2.viewer.impl.sceneUpdated(true);
      });
    }

    ///////////////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////////////

  }, {
    key: 'handleButtonDown',
    value: function handleButtonDown(event, button) {

      if (this.rotateControl) {

        if (this.rotateControl.onPointerDown(event)) {

          return true;
        }
      }

      if (button === 0 && this.keys.Control) {

        this.isDragging = true;

        this.mousePos = {
          x: event.clientX,
          y: event.clientY
        };

        return true;
      }

      return false;
    }

    ///////////////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////////////

  }, {
    key: 'handleButtonUp',
    value: function handleButtonUp(event, button) {

      if (this.rotateControl) {

        this.rotateControl.onPointerUp(event);
      }

      if (button === 0) {

        this.isDragging = false;
      }

      return false;
    }

    ///////////////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////////////

  }, {
    key: 'handleMouseMove',
    value: function handleMouseMove(event) {

      if (this.rotateControl) {

        this.rotateControl.onPointerHover(event);
      }

      if (this.isDragging) {

        if (this.selection) {

          var offset = {
            x: this.mousePos.x - event.clientX,
            y: event.clientY - this.mousePos.y
          };

          this.mousePos = {
            x: event.clientX,
            y: event.clientY
          };

          var angle = Math.sqrt(offset.x * offset.x + offset.y * offset.y);

          var sidewaysDirection = new THREE.Vector3();
          var moveDirection = new THREE.Vector3();
          var eyeDirection = new THREE.Vector3();
          var upDirection = new THREE.Vector3();
          var camera = this.viewer.getCamera();
          var axis = new THREE.Vector3();
          var eye = new THREE.Vector3();

          eye.copy(camera.position).sub(camera.target);

          eyeDirection.copy(eye).normalize();

          upDirection.copy(camera.up).normalize();

          sidewaysDirection.crossVectors(upDirection, eyeDirection).normalize();

          upDirection.setLength(offset.y);

          sidewaysDirection.setLength(offset.x);

          moveDirection.copy(upDirection.add(sidewaysDirection));

          axis.crossVectors(moveDirection, eye).normalize();

          this.rotateFragments(this.selection.model, this.selection.fragIdsArray, axis, angle * Math.PI / 180, this.center);

          this.viewer.impl.sceneUpdated(true);
        }

        return true;
      }

      return false;
    }

    ///////////////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////////////

  }, {
    key: 'handleKeyDown',
    value: function handleKeyDown(event, keyCode) {

      this.keys[event.key] = true;

      return false;
    }

    ///////////////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////////////

  }, {
    key: 'handleKeyUp',
    value: function handleKeyUp(event, keyCode) {

      this.keys[event.key] = false;

      return false;
    }

    ///////////////////////////////////////////////////////////////////////////
    // Rotate selected fragments
    //
    ///////////////////////////////////////////////////////////////////////////

  }, {
    key: 'rotateFragments',
    value: function rotateFragments(model, fragIdsArray, axis, angle, center) {
      var _this3 = this;

      var quaternion = new THREE.Quaternion();

      quaternion.setFromAxisAngle(axis, angle);

      fragIdsArray.forEach(function (fragId, idx) {

        var fragProxy = _this3.viewer.impl.getFragmentProxy(model, fragId);

        fragProxy.getAnimTransform();

        var position = new THREE.Vector3(fragProxy.position.x - center.x, fragProxy.position.y - center.y, fragProxy.position.z - center.z);

        position.applyQuaternion(quaternion);

        position.add(center);

        fragProxy.position = position;

        fragProxy.quaternion.multiplyQuaternions(quaternion, fragProxy.quaternion);

        if (idx === 0) {

          var euler = new THREE.Euler();

          euler.setFromQuaternion(fragProxy.quaternion, 0);

          _this3.emit('transform.rotate', {
            rotation: euler,
            model: model
          });
        }

        fragProxy.updateAnimTransform();
      });
    }

    ///////////////////////////////////////////////////////////////////////////
    // returns bounding box as it appears in the viewer
    // (transformations could be applied)
    //
    ///////////////////////////////////////////////////////////////////////////

  }, {
    key: 'geWorldBoundingBox',
    value: function geWorldBoundingBox(fragIds, fragList) {

      var fragbBox = new THREE.Box3();
      var nodebBox = new THREE.Box3();

      fragIds.forEach(function (fragId) {

        fragList.getWorldBounds(fragId, fragbBox);
        nodebBox.union(fragbBox);
      });

      return nodebBox;
    }
  }]);

  return RotateTool;
}(_EventsEmitter4.default);

///////////////////////////////////////////////////////////////////////////////
// RotateControl Class
//
///////////////////////////////////////////////////////////////////////////////


exports.default = RotateTool;

var RotateControl = function (_EventsEmitter2) {
  _inherits(RotateControl, _EventsEmitter2);

  function RotateControl(viewer, center, size) {
    _classCallCheck(this, RotateControl);

    var _this4 = _possibleConstructorReturn(this, (RotateControl.__proto__ || Object.getPrototypeOf(RotateControl)).call(this));

    _this4.engaged = false;

    _this4.overlayScene = 'rotateControlScene';
    _this4.domElement = viewer.impl.canvas;
    _this4.camera = viewer.impl.camera;
    _this4.viewer = viewer;
    _this4.center = center;
    _this4.size = size;
    _this4.gizmos = [];

    _this4.viewer.impl.createOverlayScene(_this4.overlayScene);

    _this4.createAxis(center, new THREE.Vector3(1, 0, 0), size * 0.85, 0xFF0000);

    _this4.createAxis(center, new THREE.Vector3(0, 1, 0), size * 0.85, 0x00FF00);

    _this4.createAxis(center, new THREE.Vector3(0, 0, 1), size * 0.85, 0x0000FF);

    // World UP = Y

    if (_this4.camera.worldup.y) {

      _this4.gizmos.push(_this4.createGizmo(center, new THREE.Euler(0, Math.PI / 2, 0), size * 0.0045, size * 0.8, 0xFF0000, Math.PI, new THREE.Vector3(1, 0, 0)));

      _this4.gizmos.push(_this4.createGizmo(center, new THREE.Euler(Math.PI / 2, 0, 0), size * 0.0045, size * 0.8, 0x00FF00, 2 * Math.PI, new THREE.Vector3(0, 1, 0)));

      _this4.gizmos.push(_this4.createGizmo(center, new THREE.Euler(0, 0, 0), size * 0.0045, size * 0.8, 0x0000FF, Math.PI, new THREE.Vector3(0, 0, 1)));
    } else {

      // World UP = Z

      _this4.gizmos.push(_this4.createGizmo(center, new THREE.Euler(Math.PI / 2, Math.PI / 2, 0), size * 0.0045, size * 0.8, 0xFF0000, Math.PI, new THREE.Vector3(1, 0, 0)));

      _this4.gizmos.push(_this4.createGizmo(center, new THREE.Euler(Math.PI / 2, 0, 0), size * 0.0045, size * 0.8, 0x00FF00, Math.PI, new THREE.Vector3(0, 1, 0)));

      _this4.gizmos.push(_this4.createGizmo(center, new THREE.Euler(0, 0, 0), size * 0.0045, size * 0.8, 0x0000FF, 2 * Math.PI, new THREE.Vector3(0, 0, 1)));
    }

    _this4.picker = _this4.createSphere(size * 0.02);

    var material = new THREE.LineBasicMaterial({
      color: 0xFFFF00,
      linewidth: 1,
      depthTest: false,
      depthWrite: false,
      transparent: true
    });

    _this4.angleLine = _this4.createLine(_this4.center, _this4.center, material);

    viewer.impl.sceneUpdated(true);
    return _this4;
  }

  ///////////////////////////////////////////////////////////////////////////
  // Draw a line
  //
  ///////////////////////////////////////////////////////////////////////////


  _createClass(RotateControl, [{
    key: 'createLine',
    value: function createLine(start, end, material) {

      var geometry = new THREE.Geometry();

      geometry.vertices.push(new THREE.Vector3(start.x, start.y, start.z));

      geometry.vertices.push(new THREE.Vector3(end.x, end.y, end.z));

      var line = new THREE.Line(geometry, material);

      this.viewer.impl.addOverlay(this.overlayScene, line);

      return line;
    }

    ///////////////////////////////////////////////////////////////////////////
    // Draw a cone
    //
    ///////////////////////////////////////////////////////////////////////////

  }, {
    key: 'createCone',
    value: function createCone(start, dir, length, material) {

      dir.normalize();

      var end = {
        x: start.x + dir.x * length,
        y: start.y + dir.y * length,
        z: start.z + dir.z * length
      };

      var orientation = new THREE.Matrix4();

      orientation.lookAt(start, end, new THREE.Object3D().up);

      var matrix = new THREE.Matrix4();

      matrix.set(1, 0, 0, 0, 0, 0, 1, 0, 0, -1, 0, 0, 0, 0, 0, 1);

      orientation.multiply(matrix);

      var geometry = new THREE.CylinderGeometry(0, length * 0.2, length, 128, 1);

      var cone = new THREE.Mesh(geometry, material);

      cone.applyMatrix(orientation);

      cone.position.x = start.x + dir.x * length / 2;
      cone.position.y = start.y + dir.y * length / 2;
      cone.position.z = start.z + dir.z * length / 2;

      this.viewer.impl.addOverlay(this.overlayScene, cone);

      return cone;
    }

    ///////////////////////////////////////////////////////////////////////////
    // Draw one axis
    //
    ///////////////////////////////////////////////////////////////////////////

  }, {
    key: 'createAxis',
    value: function createAxis(start, dir, size, color) {

      var end = {
        x: start.x + dir.x * size,
        y: start.y + dir.y * size,
        z: start.z + dir.z * size
      };

      var material = new THREE.LineBasicMaterial({
        color: color,
        linewidth: 3,
        depthTest: false,
        depthWrite: false,
        transparent: true
      });

      this.createLine(start, end, material);

      this.createCone(end, dir, size * 0.1, material);
    }

    ///////////////////////////////////////////////////////////////////////////
    // Draw a rotate gizmo
    //
    ///////////////////////////////////////////////////////////////////////////

  }, {
    key: 'createGizmo',
    value: function createGizmo(center, euler, size, radius, color, range, axis) {

      var material = new GizmoMaterial({
        color: color
      });

      var subMaterial = new GizmoMaterial({
        color: color
      });

      var torusGizmo = new THREE.Mesh(new THREE.TorusGeometry(radius, size, 64, 64, range), material);

      var subTorus = new THREE.Mesh(new THREE.TorusGeometry(radius, size, 64, 64, 2 * Math.PI), subMaterial);

      subTorus.material.highlight(true);

      var transform = new THREE.Matrix4();

      var q = new THREE.Quaternion();

      q.setFromEuler(euler);

      var s = new THREE.Vector3(1, 1, 1);

      transform.compose(center, q, s);

      torusGizmo.applyMatrix(transform);

      subTorus.applyMatrix(transform);

      var plane = this.createBox(this.size * 100, this.size * 100, 0.01);

      plane.applyMatrix(transform);

      subTorus.visible = false;

      this.viewer.impl.addOverlay(this.overlayScene, torusGizmo);

      this.viewer.impl.addOverlay(this.overlayScene, subTorus);

      torusGizmo.subGizmo = subTorus;
      torusGizmo.plane = plane;
      torusGizmo.axis = axis;

      return torusGizmo;
    }

    ///////////////////////////////////////////////////////////////////////////
    // Draw a box
    //
    ///////////////////////////////////////////////////////////////////////////

  }, {
    key: 'createBox',
    value: function createBox(w, h, d) {

      var material = new GizmoMaterial({
        color: 0x000000
      });

      var geometry = new THREE.BoxGeometry(w, h, d);

      var box = new THREE.Mesh(geometry, material);

      box.visible = false;

      this.viewer.impl.addOverlay(this.overlayScene, box);

      return box;
    }

    ///////////////////////////////////////////////////////////////////////////
    // Draw a sphere
    //
    ///////////////////////////////////////////////////////////////////////////

  }, {
    key: 'createSphere',
    value: function createSphere(radius) {

      var material = new GizmoMaterial({
        color: 0xFFFF00
      });

      var geometry = new THREE.SphereGeometry(radius, 32, 32);

      var sphere = new THREE.Mesh(geometry, material);

      sphere.visible = false;

      this.viewer.impl.addOverlay(this.overlayScene, sphere);

      return sphere;
    }

    ///////////////////////////////////////////////////////////////////////////
    // Creates Raycatser object from the pointer
    //
    ///////////////////////////////////////////////////////////////////////////

  }, {
    key: 'pointerToRaycaster',
    value: function pointerToRaycaster(pointer) {

      var pointerVector = new THREE.Vector3();
      var pointerDir = new THREE.Vector3();
      var ray = new THREE.Raycaster();

      var rect = this.domElement.getBoundingClientRect();

      var x = (pointer.clientX - rect.left) / rect.width * 2 - 1;
      var y = -((pointer.clientY - rect.top) / rect.height) * 2 + 1;

      if (this.camera.isPerspective) {

        pointerVector.set(x, y, 0.5);

        pointerVector.unproject(this.camera);

        ray.set(this.camera.position, pointerVector.sub(this.camera.position).normalize());
      } else {

        pointerVector.set(x, y, -1);

        pointerVector.unproject(this.camera);

        pointerDir.set(0, 0, -1);

        ray.set(pointerVector, pointerDir.transformDirection(this.camera.matrixWorld));
      }

      return ray;
    }

    ///////////////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////////////

  }, {
    key: 'onPointerDown',
    value: function onPointerDown(event) {

      var pointer = event.pointers ? event.pointers[0] : event;

      if (pointer.button === 0) {

        var ray = this.pointerToRaycaster(pointer);

        var intersectResults = ray.intersectObjects(this.gizmos, true);

        if (intersectResults.length) {

          this.gizmos.forEach(function (gizmo) {

            gizmo.visible = false;
          });

          this.selectedGizmo = intersectResults[0].object;

          this.selectedGizmo.subGizmo.visible = true;

          this.picker.position.copy(intersectResults[0].point);

          this.angleLine.geometry.vertices[1].copy(intersectResults[0].point);

          this.lastDir = intersectResults[0].point.sub(this.center).normalize();

          this.angleLine.geometry.verticesNeedUpdate = true;

          this.angleLine.visible = true;

          this.picker.visible = true;
        } else {

          this.picker.visible = false;
        }

        this.engaged = this.picker.visible;

        this.viewer.impl.sceneUpdated(true);
      }

      return this.picker.visible;
    }

    ///////////////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////////////

  }, {
    key: 'onPointerHover',
    value: function onPointerHover(event) {

      var pointer = event.pointers ? event.pointers[0] : event;

      if (this.engaged) {

        var ray = this.pointerToRaycaster(pointer);

        var intersectResults = ray.intersectObjects([this.selectedGizmo.plane], true);

        if (intersectResults.length) {

          var intersectPoint = intersectResults[0].point;

          var dir = intersectPoint.sub(this.center).normalize();

          var cross = new THREE.Vector3();

          cross.crossVectors(this.lastDir, dir);

          var sign = Math.sign(cross.dot(this.selectedGizmo.axis));

          this.emit('transform.rotate', {
            angle: sign * dir.angleTo(this.lastDir),
            axis: this.selectedGizmo.axis
          });

          this.lastDir = dir;

          var pickerPoint = new THREE.Vector3(this.center.x + dir.x * this.size * 0.8, this.center.y + dir.y * this.size * 0.8, this.center.z + dir.z * this.size * 0.8);

          this.picker.position.copy(pickerPoint);

          this.angleLine.geometry.vertices[1].copy(pickerPoint);
        }

        this.angleLine.visible = true;

        this.angleLine.geometry.verticesNeedUpdate = true;
      } else {

        this.angleLine.visible = false;

        var ray = this.pointerToRaycaster(pointer);

        var intersectResults = ray.intersectObjects(this.gizmos, true);

        if (intersectResults.length) {

          this.picker.position.set(intersectResults[0].point.x, intersectResults[0].point.y, intersectResults[0].point.z);

          this.picker.visible = true;
        } else {

          this.picker.visible = false;
        }
      }

      this.viewer.impl.sceneUpdated(true);
    }

    ///////////////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////////////

  }, {
    key: 'onPointerUp',
    value: function onPointerUp(event) {
      var _this5 = this;

      this.angleLine.visible = false;

      this.picker.visible = false;

      this.gizmos.forEach(function (gizmo) {

        gizmo.visible = true;
        gizmo.subGizmo.visible = false;
      });

      this.viewer.impl.sceneUpdated(true);

      setTimeout(function () {
        _this5.engaged = false;
      }, 100);
    }

    ///////////////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////////////

  }, {
    key: 'normalize',
    value: function normalize(screenPoint) {

      var viewport = this.viewer.navigation.getScreenViewport();

      var n = {
        x: (screenPoint.x - viewport.left) / viewport.width,
        y: (screenPoint.y - viewport.top) / viewport.height
      };

      return n;
    }

    ///////////////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////////////

  }, {
    key: 'projectOntoPlane',
    value: function projectOntoPlane(worldPoint, normal) {

      var dist = normal.dot(worldPoint);

      return new THREE.Vector3(worldPoint.x - dist * normal.x, worldPoint.y - dist * normal.y, worldPoint.z - dist * normal.z);
    }

    ///////////////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////////////

  }, {
    key: 'remove',
    value: function remove() {

      this.viewer.impl.removeOverlayScene(this.overlayScene);
    }
  }]);

  return RotateControl;
}(_EventsEmitter4.default);

///////////////////////////////////////////////////////////////////////////////
// Highlightable Gizmo Material
//
///////////////////////////////////////////////////////////////////////////////


var GizmoMaterial = function (_THREE$MeshBasicMater) {
  _inherits(GizmoMaterial, _THREE$MeshBasicMater);

  function GizmoMaterial(parameters) {
    _classCallCheck(this, GizmoMaterial);

    var _this6 = _possibleConstructorReturn(this, (GizmoMaterial.__proto__ || Object.getPrototypeOf(GizmoMaterial)).call(this));

    _this6.setValues(parameters);

    _this6.colorInit = _this6.color.clone();
    _this6.opacityInit = _this6.opacity;
    _this6.side = THREE.FrontSide;
    _this6.depthWrite = false;
    _this6.transparent = true;
    _this6.depthTest = false;
    return _this6;
  }

  ///////////////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////////////


  _createClass(GizmoMaterial, [{
    key: 'highlight',
    value: function highlight(highlighted) {

      if (highlighted) {

        this.color.setRGB(1, 230 / 255, 3 / 255);
        this.opacity = 1;
      } else {

        this.color.copy(this.colorInit);
        this.opacity = this.opacityInit;
      }
    }
  }]);

  return GizmoMaterial;
}(THREE.MeshBasicMaterial);