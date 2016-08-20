(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

// import {
//   textureLoader,
// }
// from './loaders/textureLoader';
// *****************************************************************************
// OBJECTS SUPERCLASS
// Objects are used by drawings and each return a THREE.Object3D
// (Mesh, Sprite etc.)
// This can then be added within a drawing with this.scene.add(object)
// *****************************************************************************
//TODO: rename this class
var Object$1 = function () {
  function Object(spec) {
    classCallCheck(this, Object);

    this.spec = spec || {};

    this.spec.color = this.spec.color || 0xffffff;

    this.init();
    if (this.spec.layer) {
      this.mesh.layers.set(this.spec.layer);
    }

    return this.mesh;
  }

  Object.prototype.createMesh = function createMesh(geometry, material) {
    var mesh = new THREE.Mesh(geometry, material);
    return mesh;
  };

  // loadTexture(url) {
  //   return textureLoader(url);
  // }


  return Object;
}();

// import {
//   Postprocessing,
// }
// from './postprocessing';
// *****************************************************************************
// RENDERER CLASS
//
// Create a THREE.js renderer and add postprocessing if required
// Each scene currently needs a unique renderer and associated HTML Canvas
// elem for the cancelRender function to work
// The container elem can be omitted if using only one scene as the default
// will be automatically added
// NOTE: Currently using TweenMax ticker for animation so the gsap files must
// be included
//
// The spec object can be omitted for the following defaults
// const spec = {
//   containerElem: canvasElem, // omit for THREE js default
//   antialias: true, ,
//   alpha: false, //true required for multiple scenes
//   autoClear: true, //false required for multiple scenes
//   clearColor: 0x000000,
//   clearAlpha: 0,
//   width: window.innerWidth,
//   height: window.innerHeight,
//   pixelRatio: window.devicePixelRatio,
// };
// *****************************************************************************
var Renderer = function () {
  function Renderer(spec) {
    classCallCheck(this, Renderer);

    this.spec = spec || {};
    this.init();
  }

  Renderer.prototype.init = function init() {
    this.initParams();
    var rendererOptions = {
      antialias: this.spec.antialias,
      //required for multiple scenes and various other effects
      alpha: this.spec.alpha
    };
    if (this.spec.containerElem) {
      rendererOptions.canvas = this.spec.containerElem;
      this.renderer = new THREE.WebGLRenderer(rendererOptions);
    } else {
      this.renderer = new THREE.WebGLRenderer(rendererOptions);
      document.body.appendChild(this.renderer.domElement);
    }

    this.setRenderer();
  };

  Renderer.prototype.initParams = function initParams() {
    if (!this.spec.postprocessing) this.spec.postprocessing = false;
    if (!this.spec.antialias) this.spec.antialias = true;
    if (!this.spec.alpha) this.spec.alpha = true;
    if (!this.spec.autoClear) this.spec.autoClear = false;
    this.spec.clearColor = this.spec.clearColor || 0x000000;
    this.spec.clearAlpha = this.spec.clearAlpha || 1.0;
    var w = function () {
      return window.innerWidth;
    };
    this.spec.width = this.spec.width || w;
    var h = function () {
      return window.innerHeight;
    };
    this.spec.height = this.spec.height || h;
    this.spec.pixelRatio = this.spec.pixelRatio || window.devicePixelRatio;
  };

  Renderer.prototype.setSize = function setSize() {
    var w = arguments.length <= 0 || arguments[0] === undefined ? this.spec.width() : arguments[0];
    var h = arguments.length <= 1 || arguments[1] === undefined ? this.spec.height() : arguments[1];

    this.renderer.setSize(w, h);
  };

  Renderer.prototype.setRenderer = function setRenderer() {
    this.renderer.autoClear = this.spec.autoClear;
    this.renderer.setClearColor(this.spec.clearColor, this.spec.clearAlpha);
    this.renderer.setSize(this.spec.width, this.spec.height);
    this.renderer.setPixelRatio(this.spec.pixelRatio);
    this.setSize(this.spec.width(), this.spec.height());
  };

  Renderer.prototype.showStats = function showStats() {
    if (typeof Stats === 'function') {
      if (this.stats) return; //don't create stats more than once
      this.stats = new Stats();
      document.body.appendChild(this.stats.dom);
    } else {
      console.warn('https://github.com/mrdoob/stats.js must be included for stats to work');
    }
  };

  Renderer.prototype.render = function render(scene, camera) {
    var showStats = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

    if (showStats) this.showStats();
    this.renderer.setClearColor(this.spec.clearColor, this.spec.clearAlpha);
    //if (this.spec.postprocessing) this.postRenderer = new Postprocessing(this.renderer, scene, camera);
    this.animate(scene, camera);
  };

  Renderer.prototype.cancelRender = function cancelRender() {
    TweenLite.ticker.removeEventListener('tick', this.renderHandler);
    this.renderer.clear();
  };

  Renderer.prototype.animate = function animate(scene, camera) {
    var _this = this;

    this.renderHandler = function () {
      if (_this.stats) _this.stats.update();
      //if (this.spec.postprocessing) this.postRenderer.composer.render();
      else _this.renderer.render(scene, camera);
    };

    TweenLite.ticker.addEventListener('tick', this.renderHandler);
  };

  return Renderer;
}();

// *****************************************************************************
//  CAMERA CLASS
//
//  Used by Scene class - each scene will have an associated camera class
//
//  The following spec is optional and can be omitted for the defaults shown
//  const cameraSpec = {
//    type: 'PerspectiveCamera', //Or 'OrthographicCamera'
//    near: 10,
//    far: -10,
//    position: new THREE.Vector3(0, 0, 0),
//    //PerspectiveCamera only
//    fov: 45, //PerspectiveCamera only
//    aspect: window.innerWidth / window.innerHeight,
//    // OrthographicCamera only
//    width: window.innerWidth,
//    height: window.innerHeight,
//  };
var Camera = function () {
  function Camera(spec) {
    classCallCheck(this, Camera);

    this.spec = spec;
    this.init();
  }

  Camera.prototype.init = function init() {
    this.initParams();

    if (this.spec.type === 'PerspectiveCamera') {
      this.cam = new THREE.PerspectiveCamera();
    } else {
      this.cam = new THREE.OrthographicCamera();
    }
    this.set();
  };

  Camera.prototype.initParams = function initParams() {
    var position = function () {
      return new THREE.Vector3();
    };
    this.spec.position = this.spec.position || position;
    this.spec.near = this.spec.near || 10;
    this.spec.far = this.spec.far || -10;
    this.spec.type = this.spec.type || 'PerspectiveCamera';
    if (this.spec.type === 'PerspectiveCamera') {
      this.spec.fov = this.spec.fov || 45;
      var aspect = function () {
        return window.innerWidth / window.innerHeight;
      };
      this.spec.aspect = this.spec.aspect || aspect;
    } else {
      var w = function () {
        return window.innerWidth;
      };
      this.spec.width = this.spec.width || w;
      var h = function () {
        return window.innerHeight;
      };
      this.spec.height = this.spec.height || h;
    }
  };

  Camera.prototype.set = function set() {
    if (this.spec.type === 'PerspectiveCamera') {
      this.cam.fov = this.spec.fov;
      this.cam.aspect = this.spec.aspect();
    } else {
      this.cam.left = -this.spec.width / 2;
      this.cam.right = this.spec.width / 2;
      this.cam.top = this.spec.height / 2;
      this.cam.bottom = -this.spec.height / 2;
    }
    this.cam.position.copy(this.spec.position());
    this.cam.near = this.spec.near;
    this.cam.far = this.spec.far;
    this.cam.updateProjectionMatrix();
  };

  Camera.prototype.enableLayer = function enableLayer(n) {
    this.cam.layers.enable(n);
  };

  Camera.prototype.disableLayer = function disableLayer(n) {
    this.cam.layers.disable(n);
  };

  Camera.prototype.toggleLayer = function toggleLayer(n) {
    this.cam.layers.toggle(n);
  };

  return Camera;
}();

// *****************************************************************************
//  SCENE CLASS
//
//  THREE.js scene is used by DRAWING classes
//  The scene will automatically clear all meshes and reset camera on
//  window resize - the drawing is responsible for repopulating the scene
//  with it's own reset() function
//
// *****************************************************************************
var Scene = function () {
  function Scene(cameraSpec, rendererSpec) {
    classCallCheck(this, Scene);

    this.cameraSpec = cameraSpec;
    this.rendererSpec = rendererSpec;
    this.init();
  }

  Scene.prototype.init = function init() {
    this.scene = new THREE.Scene();
    this.camera = new Camera(this.cameraSpec);
    this.scene.add(this.camera.cam);

    //used to add Orbit Controls to the camera
    this.camera.cam.userData.domElement = this.rendererSpec.containerElem;

    this.renderer = new Renderer(this.rendererSpec);
  };

  Scene.prototype.add = function add() {
    for (var _len = arguments.length, objects = Array(_len), _key = 0; _key < _len; _key++) {
      objects[_key] = arguments[_key];
    }

    for (var _iterator = objects, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
      var _ref;

      if (_isArray) {
        if (_i >= _iterator.length) break;
        _ref = _iterator[_i++];
      } else {
        _i = _iterator.next();
        if (_i.done) break;
        _ref = _i.value;
      }

      var object = _ref;

      this.scene.add(object);
    }
  };

  Scene.prototype.reset = function reset() {
    this.clearScene();
    this.camera.set();
    this.renderer.setSize();
  };

  Scene.prototype.clearScene = function clearScene() {
    for (var i = this.scene.children.length - 1; i >= 0; i--) {
      this.scene.remove(this.scene.children[i]);
    }
  };

  Scene.prototype.cancelRender = function cancelRender() {
    this.renderer.cancelRender();
  };

  Scene.prototype.render = function render(showStats) {
    this.renderer.render(this.scene, this.camera.cam, showStats);
  };

  return Scene;
}();

// *****************************************************************************
//
//  DRAWING CLASS
//
// *****************************************************************************
var Drawing = function () {
  function Drawing(cameraSpec, rendererSpec) {
    classCallCheck(this, Drawing);

    this.scene = new Scene(cameraSpec, rendererSpec);
    this.camera = this.scene.camera;
    this.uuid = THREE.Math.generateUUID();
    this.init();
  }

  //gets called on window resize or other events that require recalculation of
  //object dimensions


  Drawing.prototype.reset = function reset() {
    this.scene.reset();
    this.init();
  };

  Drawing.prototype.render = function render(showStats) {
    this.scene.render(showStats);
  };

  Drawing.prototype.cancelRender = function cancelRender() {
    this.scene.renderer.cancelRender();
  };

  return Drawing;
}();

var config = {
  useGSAP: true,
  useHeartcodeLoader: true,
  showStats: true
};

// *****************************************************************************
// Performs various initialisation checks and setup
// *****************************************************************************
var moduleName = 'unnamedTHREESetupModule';
//TODO: turn check functions into proper checks
var checkTHREELoaded = function () {
  if (typeof THREE === 'undefined') {
    var msg = moduleName + ' Error: THREE not loaded. THREE.js must be loaded before this module\n';
    msg += 'Try adding <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r79/three.min.js">';
    msg += '</script> to your <head>';
    console.error(msg);
  }
};

checkTHREELoaded();

var checkGSAPLoaded = function () {
  if (typeof TweenLite === 'undefined') {
    var msg = moduleName + ' Error: GSAP not loaded.\n';
    msg += 'If you do not wish to use GSAP set ' + moduleName + '.config.useGSAP = false\n';
    msg += 'Otherwise try adding <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/1.19.0/TweenMax.min.js">';
    msg += '</script> to your <head>';
    console.error(msg);
  }
};

var checkHeartcodeLoaded = function () {
  if (typeof CanvasLoader === 'undefined') {
    var msg = moduleName + ' Error: HeartcodeLoader not loaded.\n';
    msg += 'If you do not wish to use HeartcodeLoader set ' + moduleName + '.config.useHeartcodeLoader = false\n';
    msg += 'Otherwise get https://raw.githubusercontent.com/heartcode/';
    msg += 'CanvasLoader/master/js/heartcode-canvasloader-min.js\n';
    msg += 'and add <script src="path-to-script/heartcode-canvasloader-min.js">';
    msg += '</script> to your <head>';
    console.error(msg);
    return false;
  }
  return true;
};

var addLoaderElem = function () {
  var elem = document.querySelector('#loadingOverlay');
  if (elem === null) {
    var loadingOverlay = document.createElement('div');
    loadingOverlay.id = 'loadingOverlay';
    loadingOverlay.style = 'position: absolute; top: 0; left: 0; width: 100%; height: 100%;z-index: 999; background-color: black;';
    var loadingIcon = document.createElement('div');
    loadingIcon.id = 'loadingIcon';
    loadingIcon.style = 'position: fixed; top: 50%; left: 50%; -webkit-transform: translate(-50%, -50%); -ms-transform: translate(-50%, -50%); transform: translate(-50%, -50%); }';

    loadingOverlay.appendChild(loadingIcon);
    document.body.appendChild(loadingOverlay);
  }
};

var checkStatsLoaded = function () {
  if (typeof Stats === 'undefined') {
    var msg = moduleName + ' Error: Stats not loaded.\n';
    msg += 'If you do not wish to show Stats set ' + moduleName + '.config.showStats = false\n';
    msg += 'Otherwise get https://raw.githubusercontent.com/mrdoob/stats.js/master/build/stats.min.js\n';
    msg += 'and add <script src="path-to-script/stats.min.js">';
    msg += '</script> to your <head>';
    console.error(msg);
  }
};

var init = function () {
  if (config.useGSAP) checkGSAPLoaded();

  if (config.useHeartcodeLoader) {
    if (checkHeartcodeLoaded()) {
      addLoaderElem();
    }
  }

  if (config.showStats) checkStatsLoaded();
};

module.exports = {
  init: init,
  config: config,
  Object: Object$1,
  Drawing: Drawing
};
},{}],2:[function(require,module,exports){
'use strict';

var modularTHREE = require('modular-three');

modularTHREE.init();
console.log(modularTHREE);
},{"modular-three":1}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuLi8uLi9tb2R1bGFyLXRocmVlL2Rpc3QvaW5kZXguanMiLCJzcmMvZW50cnkuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBjbGFzc0NhbGxDaGVjayA9IGZ1bmN0aW9uIChpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHtcbiAgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpO1xuICB9XG59O1xuXG4vLyBpbXBvcnQge1xuLy8gICB0ZXh0dXJlTG9hZGVyLFxuLy8gfVxuLy8gZnJvbSAnLi9sb2FkZXJzL3RleHR1cmVMb2FkZXInO1xuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbi8vIE9CSkVDVFMgU1VQRVJDTEFTU1xuLy8gT2JqZWN0cyBhcmUgdXNlZCBieSBkcmF3aW5ncyBhbmQgZWFjaCByZXR1cm4gYSBUSFJFRS5PYmplY3QzRFxuLy8gKE1lc2gsIFNwcml0ZSBldGMuKVxuLy8gVGhpcyBjYW4gdGhlbiBiZSBhZGRlZCB3aXRoaW4gYSBkcmF3aW5nIHdpdGggdGhpcy5zY2VuZS5hZGQob2JqZWN0KVxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbi8vVE9ETzogcmVuYW1lIHRoaXMgY2xhc3NcbnZhciBPYmplY3QkMSA9IGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gT2JqZWN0KHNwZWMpIHtcbiAgICBjbGFzc0NhbGxDaGVjayh0aGlzLCBPYmplY3QpO1xuXG4gICAgdGhpcy5zcGVjID0gc3BlYyB8fCB7fTtcblxuICAgIHRoaXMuc3BlYy5jb2xvciA9IHRoaXMuc3BlYy5jb2xvciB8fCAweGZmZmZmZjtcblxuICAgIHRoaXMuaW5pdCgpO1xuICAgIGlmICh0aGlzLnNwZWMubGF5ZXIpIHtcbiAgICAgIHRoaXMubWVzaC5sYXllcnMuc2V0KHRoaXMuc3BlYy5sYXllcik7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMubWVzaDtcbiAgfVxuXG4gIE9iamVjdC5wcm90b3R5cGUuY3JlYXRlTWVzaCA9IGZ1bmN0aW9uIGNyZWF0ZU1lc2goZ2VvbWV0cnksIG1hdGVyaWFsKSB7XG4gICAgdmFyIG1lc2ggPSBuZXcgVEhSRUUuTWVzaChnZW9tZXRyeSwgbWF0ZXJpYWwpO1xuICAgIHJldHVybiBtZXNoO1xuICB9O1xuXG4gIC8vIGxvYWRUZXh0dXJlKHVybCkge1xuICAvLyAgIHJldHVybiB0ZXh0dXJlTG9hZGVyKHVybCk7XG4gIC8vIH1cblxuXG4gIHJldHVybiBPYmplY3Q7XG59KCk7XG5cbi8vIGltcG9ydCB7XG4vLyAgIFBvc3Rwcm9jZXNzaW5nLFxuLy8gfVxuLy8gZnJvbSAnLi9wb3N0cHJvY2Vzc2luZyc7XG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuLy8gUkVOREVSRVIgQ0xBU1Ncbi8vXG4vLyBDcmVhdGUgYSBUSFJFRS5qcyByZW5kZXJlciBhbmQgYWRkIHBvc3Rwcm9jZXNzaW5nIGlmIHJlcXVpcmVkXG4vLyBFYWNoIHNjZW5lIGN1cnJlbnRseSBuZWVkcyBhIHVuaXF1ZSByZW5kZXJlciBhbmQgYXNzb2NpYXRlZCBIVE1MIENhbnZhc1xuLy8gZWxlbSBmb3IgdGhlIGNhbmNlbFJlbmRlciBmdW5jdGlvbiB0byB3b3JrXG4vLyBUaGUgY29udGFpbmVyIGVsZW0gY2FuIGJlIG9taXR0ZWQgaWYgdXNpbmcgb25seSBvbmUgc2NlbmUgYXMgdGhlIGRlZmF1bHRcbi8vIHdpbGwgYmUgYXV0b21hdGljYWxseSBhZGRlZFxuLy8gTk9URTogQ3VycmVudGx5IHVzaW5nIFR3ZWVuTWF4IHRpY2tlciBmb3IgYW5pbWF0aW9uIHNvIHRoZSBnc2FwIGZpbGVzIG11c3Rcbi8vIGJlIGluY2x1ZGVkXG4vL1xuLy8gVGhlIHNwZWMgb2JqZWN0IGNhbiBiZSBvbWl0dGVkIGZvciB0aGUgZm9sbG93aW5nIGRlZmF1bHRzXG4vLyBjb25zdCBzcGVjID0ge1xuLy8gICBjb250YWluZXJFbGVtOiBjYW52YXNFbGVtLCAvLyBvbWl0IGZvciBUSFJFRSBqcyBkZWZhdWx0XG4vLyAgIGFudGlhbGlhczogdHJ1ZSwgLFxuLy8gICBhbHBoYTogZmFsc2UsIC8vdHJ1ZSByZXF1aXJlZCBmb3IgbXVsdGlwbGUgc2NlbmVzXG4vLyAgIGF1dG9DbGVhcjogdHJ1ZSwgLy9mYWxzZSByZXF1aXJlZCBmb3IgbXVsdGlwbGUgc2NlbmVzXG4vLyAgIGNsZWFyQ29sb3I6IDB4MDAwMDAwLFxuLy8gICBjbGVhckFscGhhOiAwLFxuLy8gICB3aWR0aDogd2luZG93LmlubmVyV2lkdGgsXG4vLyAgIGhlaWdodDogd2luZG93LmlubmVySGVpZ2h0LFxuLy8gICBwaXhlbFJhdGlvOiB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyxcbi8vIH07XG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxudmFyIFJlbmRlcmVyID0gZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBSZW5kZXJlcihzcGVjKSB7XG4gICAgY2xhc3NDYWxsQ2hlY2sodGhpcywgUmVuZGVyZXIpO1xuXG4gICAgdGhpcy5zcGVjID0gc3BlYyB8fCB7fTtcbiAgICB0aGlzLmluaXQoKTtcbiAgfVxuXG4gIFJlbmRlcmVyLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24gaW5pdCgpIHtcbiAgICB0aGlzLmluaXRQYXJhbXMoKTtcbiAgICB2YXIgcmVuZGVyZXJPcHRpb25zID0ge1xuICAgICAgYW50aWFsaWFzOiB0aGlzLnNwZWMuYW50aWFsaWFzLFxuICAgICAgLy9yZXF1aXJlZCBmb3IgbXVsdGlwbGUgc2NlbmVzIGFuZCB2YXJpb3VzIG90aGVyIGVmZmVjdHNcbiAgICAgIGFscGhhOiB0aGlzLnNwZWMuYWxwaGFcbiAgICB9O1xuICAgIGlmICh0aGlzLnNwZWMuY29udGFpbmVyRWxlbSkge1xuICAgICAgcmVuZGVyZXJPcHRpb25zLmNhbnZhcyA9IHRoaXMuc3BlYy5jb250YWluZXJFbGVtO1xuICAgICAgdGhpcy5yZW5kZXJlciA9IG5ldyBUSFJFRS5XZWJHTFJlbmRlcmVyKHJlbmRlcmVyT3B0aW9ucyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucmVuZGVyZXIgPSBuZXcgVEhSRUUuV2ViR0xSZW5kZXJlcihyZW5kZXJlck9wdGlvbnMpO1xuICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0aGlzLnJlbmRlcmVyLmRvbUVsZW1lbnQpO1xuICAgIH1cblxuICAgIHRoaXMuc2V0UmVuZGVyZXIoKTtcbiAgfTtcblxuICBSZW5kZXJlci5wcm90b3R5cGUuaW5pdFBhcmFtcyA9IGZ1bmN0aW9uIGluaXRQYXJhbXMoKSB7XG4gICAgaWYgKCF0aGlzLnNwZWMucG9zdHByb2Nlc3NpbmcpIHRoaXMuc3BlYy5wb3N0cHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgIGlmICghdGhpcy5zcGVjLmFudGlhbGlhcykgdGhpcy5zcGVjLmFudGlhbGlhcyA9IHRydWU7XG4gICAgaWYgKCF0aGlzLnNwZWMuYWxwaGEpIHRoaXMuc3BlYy5hbHBoYSA9IHRydWU7XG4gICAgaWYgKCF0aGlzLnNwZWMuYXV0b0NsZWFyKSB0aGlzLnNwZWMuYXV0b0NsZWFyID0gZmFsc2U7XG4gICAgdGhpcy5zcGVjLmNsZWFyQ29sb3IgPSB0aGlzLnNwZWMuY2xlYXJDb2xvciB8fCAweDAwMDAwMDtcbiAgICB0aGlzLnNwZWMuY2xlYXJBbHBoYSA9IHRoaXMuc3BlYy5jbGVhckFscGhhIHx8IDEuMDtcbiAgICB2YXIgdyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB3aW5kb3cuaW5uZXJXaWR0aDtcbiAgICB9O1xuICAgIHRoaXMuc3BlYy53aWR0aCA9IHRoaXMuc3BlYy53aWR0aCB8fCB3O1xuICAgIHZhciBoID0gZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIHdpbmRvdy5pbm5lckhlaWdodDtcbiAgICB9O1xuICAgIHRoaXMuc3BlYy5oZWlnaHQgPSB0aGlzLnNwZWMuaGVpZ2h0IHx8IGg7XG4gICAgdGhpcy5zcGVjLnBpeGVsUmF0aW8gPSB0aGlzLnNwZWMucGl4ZWxSYXRpbyB8fCB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbztcbiAgfTtcblxuICBSZW5kZXJlci5wcm90b3R5cGUuc2V0U2l6ZSA9IGZ1bmN0aW9uIHNldFNpemUoKSB7XG4gICAgdmFyIHcgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDAgfHwgYXJndW1lbnRzWzBdID09PSB1bmRlZmluZWQgPyB0aGlzLnNwZWMud2lkdGgoKSA6IGFyZ3VtZW50c1swXTtcbiAgICB2YXIgaCA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMSB8fCBhcmd1bWVudHNbMV0gPT09IHVuZGVmaW5lZCA/IHRoaXMuc3BlYy5oZWlnaHQoKSA6IGFyZ3VtZW50c1sxXTtcblxuICAgIHRoaXMucmVuZGVyZXIuc2V0U2l6ZSh3LCBoKTtcbiAgfTtcblxuICBSZW5kZXJlci5wcm90b3R5cGUuc2V0UmVuZGVyZXIgPSBmdW5jdGlvbiBzZXRSZW5kZXJlcigpIHtcbiAgICB0aGlzLnJlbmRlcmVyLmF1dG9DbGVhciA9IHRoaXMuc3BlYy5hdXRvQ2xlYXI7XG4gICAgdGhpcy5yZW5kZXJlci5zZXRDbGVhckNvbG9yKHRoaXMuc3BlYy5jbGVhckNvbG9yLCB0aGlzLnNwZWMuY2xlYXJBbHBoYSk7XG4gICAgdGhpcy5yZW5kZXJlci5zZXRTaXplKHRoaXMuc3BlYy53aWR0aCwgdGhpcy5zcGVjLmhlaWdodCk7XG4gICAgdGhpcy5yZW5kZXJlci5zZXRQaXhlbFJhdGlvKHRoaXMuc3BlYy5waXhlbFJhdGlvKTtcbiAgICB0aGlzLnNldFNpemUodGhpcy5zcGVjLndpZHRoKCksIHRoaXMuc3BlYy5oZWlnaHQoKSk7XG4gIH07XG5cbiAgUmVuZGVyZXIucHJvdG90eXBlLnNob3dTdGF0cyA9IGZ1bmN0aW9uIHNob3dTdGF0cygpIHtcbiAgICBpZiAodHlwZW9mIFN0YXRzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBpZiAodGhpcy5zdGF0cykgcmV0dXJuOyAvL2Rvbid0IGNyZWF0ZSBzdGF0cyBtb3JlIHRoYW4gb25jZVxuICAgICAgdGhpcy5zdGF0cyA9IG5ldyBTdGF0cygpO1xuICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0aGlzLnN0YXRzLmRvbSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUud2FybignaHR0cHM6Ly9naXRodWIuY29tL21yZG9vYi9zdGF0cy5qcyBtdXN0IGJlIGluY2x1ZGVkIGZvciBzdGF0cyB0byB3b3JrJyk7XG4gICAgfVxuICB9O1xuXG4gIFJlbmRlcmVyLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbiByZW5kZXIoc2NlbmUsIGNhbWVyYSkge1xuICAgIHZhciBzaG93U3RhdHMgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDIgfHwgYXJndW1lbnRzWzJdID09PSB1bmRlZmluZWQgPyBmYWxzZSA6IGFyZ3VtZW50c1syXTtcblxuICAgIGlmIChzaG93U3RhdHMpIHRoaXMuc2hvd1N0YXRzKCk7XG4gICAgdGhpcy5yZW5kZXJlci5zZXRDbGVhckNvbG9yKHRoaXMuc3BlYy5jbGVhckNvbG9yLCB0aGlzLnNwZWMuY2xlYXJBbHBoYSk7XG4gICAgLy9pZiAodGhpcy5zcGVjLnBvc3Rwcm9jZXNzaW5nKSB0aGlzLnBvc3RSZW5kZXJlciA9IG5ldyBQb3N0cHJvY2Vzc2luZyh0aGlzLnJlbmRlcmVyLCBzY2VuZSwgY2FtZXJhKTtcbiAgICB0aGlzLmFuaW1hdGUoc2NlbmUsIGNhbWVyYSk7XG4gIH07XG5cbiAgUmVuZGVyZXIucHJvdG90eXBlLmNhbmNlbFJlbmRlciA9IGZ1bmN0aW9uIGNhbmNlbFJlbmRlcigpIHtcbiAgICBUd2VlbkxpdGUudGlja2VyLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RpY2snLCB0aGlzLnJlbmRlckhhbmRsZXIpO1xuICAgIHRoaXMucmVuZGVyZXIuY2xlYXIoKTtcbiAgfTtcblxuICBSZW5kZXJlci5wcm90b3R5cGUuYW5pbWF0ZSA9IGZ1bmN0aW9uIGFuaW1hdGUoc2NlbmUsIGNhbWVyYSkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICB0aGlzLnJlbmRlckhhbmRsZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAoX3RoaXMuc3RhdHMpIF90aGlzLnN0YXRzLnVwZGF0ZSgpO1xuICAgICAgLy9pZiAodGhpcy5zcGVjLnBvc3Rwcm9jZXNzaW5nKSB0aGlzLnBvc3RSZW5kZXJlci5jb21wb3Nlci5yZW5kZXIoKTtcbiAgICAgIGVsc2UgX3RoaXMucmVuZGVyZXIucmVuZGVyKHNjZW5lLCBjYW1lcmEpO1xuICAgIH07XG5cbiAgICBUd2VlbkxpdGUudGlja2VyLmFkZEV2ZW50TGlzdGVuZXIoJ3RpY2snLCB0aGlzLnJlbmRlckhhbmRsZXIpO1xuICB9O1xuXG4gIHJldHVybiBSZW5kZXJlcjtcbn0oKTtcblxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbi8vICBDQU1FUkEgQ0xBU1Ncbi8vXG4vLyAgVXNlZCBieSBTY2VuZSBjbGFzcyAtIGVhY2ggc2NlbmUgd2lsbCBoYXZlIGFuIGFzc29jaWF0ZWQgY2FtZXJhIGNsYXNzXG4vL1xuLy8gIFRoZSBmb2xsb3dpbmcgc3BlYyBpcyBvcHRpb25hbCBhbmQgY2FuIGJlIG9taXR0ZWQgZm9yIHRoZSBkZWZhdWx0cyBzaG93blxuLy8gIGNvbnN0IGNhbWVyYVNwZWMgPSB7XG4vLyAgICB0eXBlOiAnUGVyc3BlY3RpdmVDYW1lcmEnLCAvL09yICdPcnRob2dyYXBoaWNDYW1lcmEnXG4vLyAgICBuZWFyOiAxMCxcbi8vICAgIGZhcjogLTEwLFxuLy8gICAgcG9zaXRpb246IG5ldyBUSFJFRS5WZWN0b3IzKDAsIDAsIDApLFxuLy8gICAgLy9QZXJzcGVjdGl2ZUNhbWVyYSBvbmx5XG4vLyAgICBmb3Y6IDQ1LCAvL1BlcnNwZWN0aXZlQ2FtZXJhIG9ubHlcbi8vICAgIGFzcGVjdDogd2luZG93LmlubmVyV2lkdGggLyB3aW5kb3cuaW5uZXJIZWlnaHQsXG4vLyAgICAvLyBPcnRob2dyYXBoaWNDYW1lcmEgb25seVxuLy8gICAgd2lkdGg6IHdpbmRvdy5pbm5lcldpZHRoLFxuLy8gICAgaGVpZ2h0OiB3aW5kb3cuaW5uZXJIZWlnaHQsXG4vLyAgfTtcbnZhciBDYW1lcmEgPSBmdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIENhbWVyYShzcGVjKSB7XG4gICAgY2xhc3NDYWxsQ2hlY2sodGhpcywgQ2FtZXJhKTtcblxuICAgIHRoaXMuc3BlYyA9IHNwZWM7XG4gICAgdGhpcy5pbml0KCk7XG4gIH1cblxuICBDYW1lcmEucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbiBpbml0KCkge1xuICAgIHRoaXMuaW5pdFBhcmFtcygpO1xuXG4gICAgaWYgKHRoaXMuc3BlYy50eXBlID09PSAnUGVyc3BlY3RpdmVDYW1lcmEnKSB7XG4gICAgICB0aGlzLmNhbSA9IG5ldyBUSFJFRS5QZXJzcGVjdGl2ZUNhbWVyYSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmNhbSA9IG5ldyBUSFJFRS5PcnRob2dyYXBoaWNDYW1lcmEoKTtcbiAgICB9XG4gICAgdGhpcy5zZXQoKTtcbiAgfTtcblxuICBDYW1lcmEucHJvdG90eXBlLmluaXRQYXJhbXMgPSBmdW5jdGlvbiBpbml0UGFyYW1zKCkge1xuICAgIHZhciBwb3NpdGlvbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBuZXcgVEhSRUUuVmVjdG9yMygpO1xuICAgIH07XG4gICAgdGhpcy5zcGVjLnBvc2l0aW9uID0gdGhpcy5zcGVjLnBvc2l0aW9uIHx8IHBvc2l0aW9uO1xuICAgIHRoaXMuc3BlYy5uZWFyID0gdGhpcy5zcGVjLm5lYXIgfHwgMTA7XG4gICAgdGhpcy5zcGVjLmZhciA9IHRoaXMuc3BlYy5mYXIgfHwgLTEwO1xuICAgIHRoaXMuc3BlYy50eXBlID0gdGhpcy5zcGVjLnR5cGUgfHwgJ1BlcnNwZWN0aXZlQ2FtZXJhJztcbiAgICBpZiAodGhpcy5zcGVjLnR5cGUgPT09ICdQZXJzcGVjdGl2ZUNhbWVyYScpIHtcbiAgICAgIHRoaXMuc3BlYy5mb3YgPSB0aGlzLnNwZWMuZm92IHx8IDQ1O1xuICAgICAgdmFyIGFzcGVjdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHdpbmRvdy5pbm5lcldpZHRoIC8gd2luZG93LmlubmVySGVpZ2h0O1xuICAgICAgfTtcbiAgICAgIHRoaXMuc3BlYy5hc3BlY3QgPSB0aGlzLnNwZWMuYXNwZWN0IHx8IGFzcGVjdDtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIHcgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB3aW5kb3cuaW5uZXJXaWR0aDtcbiAgICAgIH07XG4gICAgICB0aGlzLnNwZWMud2lkdGggPSB0aGlzLnNwZWMud2lkdGggfHwgdztcbiAgICAgIHZhciBoID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gd2luZG93LmlubmVySGVpZ2h0O1xuICAgICAgfTtcbiAgICAgIHRoaXMuc3BlYy5oZWlnaHQgPSB0aGlzLnNwZWMuaGVpZ2h0IHx8IGg7XG4gICAgfVxuICB9O1xuXG4gIENhbWVyYS5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24gc2V0KCkge1xuICAgIGlmICh0aGlzLnNwZWMudHlwZSA9PT0gJ1BlcnNwZWN0aXZlQ2FtZXJhJykge1xuICAgICAgdGhpcy5jYW0uZm92ID0gdGhpcy5zcGVjLmZvdjtcbiAgICAgIHRoaXMuY2FtLmFzcGVjdCA9IHRoaXMuc3BlYy5hc3BlY3QoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5jYW0ubGVmdCA9IC10aGlzLnNwZWMud2lkdGggLyAyO1xuICAgICAgdGhpcy5jYW0ucmlnaHQgPSB0aGlzLnNwZWMud2lkdGggLyAyO1xuICAgICAgdGhpcy5jYW0udG9wID0gdGhpcy5zcGVjLmhlaWdodCAvIDI7XG4gICAgICB0aGlzLmNhbS5ib3R0b20gPSAtdGhpcy5zcGVjLmhlaWdodCAvIDI7XG4gICAgfVxuICAgIHRoaXMuY2FtLnBvc2l0aW9uLmNvcHkodGhpcy5zcGVjLnBvc2l0aW9uKCkpO1xuICAgIHRoaXMuY2FtLm5lYXIgPSB0aGlzLnNwZWMubmVhcjtcbiAgICB0aGlzLmNhbS5mYXIgPSB0aGlzLnNwZWMuZmFyO1xuICAgIHRoaXMuY2FtLnVwZGF0ZVByb2plY3Rpb25NYXRyaXgoKTtcbiAgfTtcblxuICBDYW1lcmEucHJvdG90eXBlLmVuYWJsZUxheWVyID0gZnVuY3Rpb24gZW5hYmxlTGF5ZXIobikge1xuICAgIHRoaXMuY2FtLmxheWVycy5lbmFibGUobik7XG4gIH07XG5cbiAgQ2FtZXJhLnByb3RvdHlwZS5kaXNhYmxlTGF5ZXIgPSBmdW5jdGlvbiBkaXNhYmxlTGF5ZXIobikge1xuICAgIHRoaXMuY2FtLmxheWVycy5kaXNhYmxlKG4pO1xuICB9O1xuXG4gIENhbWVyYS5wcm90b3R5cGUudG9nZ2xlTGF5ZXIgPSBmdW5jdGlvbiB0b2dnbGVMYXllcihuKSB7XG4gICAgdGhpcy5jYW0ubGF5ZXJzLnRvZ2dsZShuKTtcbiAgfTtcblxuICByZXR1cm4gQ2FtZXJhO1xufSgpO1xuXG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuLy8gIFNDRU5FIENMQVNTXG4vL1xuLy8gIFRIUkVFLmpzIHNjZW5lIGlzIHVzZWQgYnkgRFJBV0lORyBjbGFzc2VzXG4vLyAgVGhlIHNjZW5lIHdpbGwgYXV0b21hdGljYWxseSBjbGVhciBhbGwgbWVzaGVzIGFuZCByZXNldCBjYW1lcmEgb25cbi8vICB3aW5kb3cgcmVzaXplIC0gdGhlIGRyYXdpbmcgaXMgcmVzcG9uc2libGUgZm9yIHJlcG9wdWxhdGluZyB0aGUgc2NlbmVcbi8vICB3aXRoIGl0J3Mgb3duIHJlc2V0KCkgZnVuY3Rpb25cbi8vXG4vLyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxudmFyIFNjZW5lID0gZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBTY2VuZShjYW1lcmFTcGVjLCByZW5kZXJlclNwZWMpIHtcbiAgICBjbGFzc0NhbGxDaGVjayh0aGlzLCBTY2VuZSk7XG5cbiAgICB0aGlzLmNhbWVyYVNwZWMgPSBjYW1lcmFTcGVjO1xuICAgIHRoaXMucmVuZGVyZXJTcGVjID0gcmVuZGVyZXJTcGVjO1xuICAgIHRoaXMuaW5pdCgpO1xuICB9XG5cbiAgU2NlbmUucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbiBpbml0KCkge1xuICAgIHRoaXMuc2NlbmUgPSBuZXcgVEhSRUUuU2NlbmUoKTtcbiAgICB0aGlzLmNhbWVyYSA9IG5ldyBDYW1lcmEodGhpcy5jYW1lcmFTcGVjKTtcbiAgICB0aGlzLnNjZW5lLmFkZCh0aGlzLmNhbWVyYS5jYW0pO1xuXG4gICAgLy91c2VkIHRvIGFkZCBPcmJpdCBDb250cm9scyB0byB0aGUgY2FtZXJhXG4gICAgdGhpcy5jYW1lcmEuY2FtLnVzZXJEYXRhLmRvbUVsZW1lbnQgPSB0aGlzLnJlbmRlcmVyU3BlYy5jb250YWluZXJFbGVtO1xuXG4gICAgdGhpcy5yZW5kZXJlciA9IG5ldyBSZW5kZXJlcih0aGlzLnJlbmRlcmVyU3BlYyk7XG4gIH07XG5cbiAgU2NlbmUucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uIGFkZCgpIHtcbiAgICBmb3IgKHZhciBfbGVuID0gYXJndW1lbnRzLmxlbmd0aCwgb2JqZWN0cyA9IEFycmF5KF9sZW4pLCBfa2V5ID0gMDsgX2tleSA8IF9sZW47IF9rZXkrKykge1xuICAgICAgb2JqZWN0c1tfa2V5XSA9IGFyZ3VtZW50c1tfa2V5XTtcbiAgICB9XG5cbiAgICBmb3IgKHZhciBfaXRlcmF0b3IgPSBvYmplY3RzLCBfaXNBcnJheSA9IEFycmF5LmlzQXJyYXkoX2l0ZXJhdG9yKSwgX2kgPSAwLCBfaXRlcmF0b3IgPSBfaXNBcnJheSA/IF9pdGVyYXRvciA6IF9pdGVyYXRvcltTeW1ib2wuaXRlcmF0b3JdKCk7Oykge1xuICAgICAgdmFyIF9yZWY7XG5cbiAgICAgIGlmIChfaXNBcnJheSkge1xuICAgICAgICBpZiAoX2kgPj0gX2l0ZXJhdG9yLmxlbmd0aCkgYnJlYWs7XG4gICAgICAgIF9yZWYgPSBfaXRlcmF0b3JbX2krK107XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBfaSA9IF9pdGVyYXRvci5uZXh0KCk7XG4gICAgICAgIGlmIChfaS5kb25lKSBicmVhaztcbiAgICAgICAgX3JlZiA9IF9pLnZhbHVlO1xuICAgICAgfVxuXG4gICAgICB2YXIgb2JqZWN0ID0gX3JlZjtcblxuICAgICAgdGhpcy5zY2VuZS5hZGQob2JqZWN0KTtcbiAgICB9XG4gIH07XG5cbiAgU2NlbmUucHJvdG90eXBlLnJlc2V0ID0gZnVuY3Rpb24gcmVzZXQoKSB7XG4gICAgdGhpcy5jbGVhclNjZW5lKCk7XG4gICAgdGhpcy5jYW1lcmEuc2V0KCk7XG4gICAgdGhpcy5yZW5kZXJlci5zZXRTaXplKCk7XG4gIH07XG5cbiAgU2NlbmUucHJvdG90eXBlLmNsZWFyU2NlbmUgPSBmdW5jdGlvbiBjbGVhclNjZW5lKCkge1xuICAgIGZvciAodmFyIGkgPSB0aGlzLnNjZW5lLmNoaWxkcmVuLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICB0aGlzLnNjZW5lLnJlbW92ZSh0aGlzLnNjZW5lLmNoaWxkcmVuW2ldKTtcbiAgICB9XG4gIH07XG5cbiAgU2NlbmUucHJvdG90eXBlLmNhbmNlbFJlbmRlciA9IGZ1bmN0aW9uIGNhbmNlbFJlbmRlcigpIHtcbiAgICB0aGlzLnJlbmRlcmVyLmNhbmNlbFJlbmRlcigpO1xuICB9O1xuXG4gIFNjZW5lLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbiByZW5kZXIoc2hvd1N0YXRzKSB7XG4gICAgdGhpcy5yZW5kZXJlci5yZW5kZXIodGhpcy5zY2VuZSwgdGhpcy5jYW1lcmEuY2FtLCBzaG93U3RhdHMpO1xuICB9O1xuXG4gIHJldHVybiBTY2VuZTtcbn0oKTtcblxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbi8vXG4vLyAgRFJBV0lORyBDTEFTU1xuLy9cbi8vICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG52YXIgRHJhd2luZyA9IGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gRHJhd2luZyhjYW1lcmFTcGVjLCByZW5kZXJlclNwZWMpIHtcbiAgICBjbGFzc0NhbGxDaGVjayh0aGlzLCBEcmF3aW5nKTtcblxuICAgIHRoaXMuc2NlbmUgPSBuZXcgU2NlbmUoY2FtZXJhU3BlYywgcmVuZGVyZXJTcGVjKTtcbiAgICB0aGlzLmNhbWVyYSA9IHRoaXMuc2NlbmUuY2FtZXJhO1xuICAgIHRoaXMudXVpZCA9IFRIUkVFLk1hdGguZ2VuZXJhdGVVVUlEKCk7XG4gICAgdGhpcy5pbml0KCk7XG4gIH1cblxuICAvL2dldHMgY2FsbGVkIG9uIHdpbmRvdyByZXNpemUgb3Igb3RoZXIgZXZlbnRzIHRoYXQgcmVxdWlyZSByZWNhbGN1bGF0aW9uIG9mXG4gIC8vb2JqZWN0IGRpbWVuc2lvbnNcblxuXG4gIERyYXdpbmcucHJvdG90eXBlLnJlc2V0ID0gZnVuY3Rpb24gcmVzZXQoKSB7XG4gICAgdGhpcy5zY2VuZS5yZXNldCgpO1xuICAgIHRoaXMuaW5pdCgpO1xuICB9O1xuXG4gIERyYXdpbmcucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uIHJlbmRlcihzaG93U3RhdHMpIHtcbiAgICB0aGlzLnNjZW5lLnJlbmRlcihzaG93U3RhdHMpO1xuICB9O1xuXG4gIERyYXdpbmcucHJvdG90eXBlLmNhbmNlbFJlbmRlciA9IGZ1bmN0aW9uIGNhbmNlbFJlbmRlcigpIHtcbiAgICB0aGlzLnNjZW5lLnJlbmRlcmVyLmNhbmNlbFJlbmRlcigpO1xuICB9O1xuXG4gIHJldHVybiBEcmF3aW5nO1xufSgpO1xuXG52YXIgY29uZmlnID0ge1xuICB1c2VHU0FQOiB0cnVlLFxuICB1c2VIZWFydGNvZGVMb2FkZXI6IHRydWUsXG4gIHNob3dTdGF0czogdHJ1ZVxufTtcblxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbi8vIFBlcmZvcm1zIHZhcmlvdXMgaW5pdGlhbGlzYXRpb24gY2hlY2tzIGFuZCBzZXR1cFxuLy8gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbnZhciBtb2R1bGVOYW1lID0gJ3VubmFtZWRUSFJFRVNldHVwTW9kdWxlJztcbi8vVE9ETzogdHVybiBjaGVjayBmdW5jdGlvbnMgaW50byBwcm9wZXIgY2hlY2tzXG52YXIgY2hlY2tUSFJFRUxvYWRlZCA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKHR5cGVvZiBUSFJFRSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICB2YXIgbXNnID0gbW9kdWxlTmFtZSArICcgRXJyb3I6IFRIUkVFIG5vdCBsb2FkZWQuIFRIUkVFLmpzIG11c3QgYmUgbG9hZGVkIGJlZm9yZSB0aGlzIG1vZHVsZVxcbic7XG4gICAgbXNnICs9ICdUcnkgYWRkaW5nIDxzY3JpcHQgc3JjPVwiaHR0cHM6Ly9jZG5qcy5jbG91ZGZsYXJlLmNvbS9hamF4L2xpYnMvdGhyZWUuanMvcjc5L3RocmVlLm1pbi5qc1wiPic7XG4gICAgbXNnICs9ICc8L3NjcmlwdD4gdG8geW91ciA8aGVhZD4nO1xuICAgIGNvbnNvbGUuZXJyb3IobXNnKTtcbiAgfVxufTtcblxuY2hlY2tUSFJFRUxvYWRlZCgpO1xuXG52YXIgY2hlY2tHU0FQTG9hZGVkID0gZnVuY3Rpb24gKCkge1xuICBpZiAodHlwZW9mIFR3ZWVuTGl0ZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICB2YXIgbXNnID0gbW9kdWxlTmFtZSArICcgRXJyb3I6IEdTQVAgbm90IGxvYWRlZC5cXG4nO1xuICAgIG1zZyArPSAnSWYgeW91IGRvIG5vdCB3aXNoIHRvIHVzZSBHU0FQIHNldCAnICsgbW9kdWxlTmFtZSArICcuY29uZmlnLnVzZUdTQVAgPSBmYWxzZVxcbic7XG4gICAgbXNnICs9ICdPdGhlcndpc2UgdHJ5IGFkZGluZyA8c2NyaXB0IHNyYz1cImh0dHBzOi8vY2RuanMuY2xvdWRmbGFyZS5jb20vYWpheC9saWJzL2dzYXAvMS4xOS4wL1R3ZWVuTWF4Lm1pbi5qc1wiPic7XG4gICAgbXNnICs9ICc8L3NjcmlwdD4gdG8geW91ciA8aGVhZD4nO1xuICAgIGNvbnNvbGUuZXJyb3IobXNnKTtcbiAgfVxufTtcblxudmFyIGNoZWNrSGVhcnRjb2RlTG9hZGVkID0gZnVuY3Rpb24gKCkge1xuICBpZiAodHlwZW9mIENhbnZhc0xvYWRlciA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICB2YXIgbXNnID0gbW9kdWxlTmFtZSArICcgRXJyb3I6IEhlYXJ0Y29kZUxvYWRlciBub3QgbG9hZGVkLlxcbic7XG4gICAgbXNnICs9ICdJZiB5b3UgZG8gbm90IHdpc2ggdG8gdXNlIEhlYXJ0Y29kZUxvYWRlciBzZXQgJyArIG1vZHVsZU5hbWUgKyAnLmNvbmZpZy51c2VIZWFydGNvZGVMb2FkZXIgPSBmYWxzZVxcbic7XG4gICAgbXNnICs9ICdPdGhlcndpc2UgZ2V0IGh0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9oZWFydGNvZGUvJztcbiAgICBtc2cgKz0gJ0NhbnZhc0xvYWRlci9tYXN0ZXIvanMvaGVhcnRjb2RlLWNhbnZhc2xvYWRlci1taW4uanNcXG4nO1xuICAgIG1zZyArPSAnYW5kIGFkZCA8c2NyaXB0IHNyYz1cInBhdGgtdG8tc2NyaXB0L2hlYXJ0Y29kZS1jYW52YXNsb2FkZXItbWluLmpzXCI+JztcbiAgICBtc2cgKz0gJzwvc2NyaXB0PiB0byB5b3VyIDxoZWFkPic7XG4gICAgY29uc29sZS5lcnJvcihtc2cpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbnZhciBhZGRMb2FkZXJFbGVtID0gZnVuY3Rpb24gKCkge1xuICB2YXIgZWxlbSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNsb2FkaW5nT3ZlcmxheScpO1xuICBpZiAoZWxlbSA9PT0gbnVsbCkge1xuICAgIHZhciBsb2FkaW5nT3ZlcmxheSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGxvYWRpbmdPdmVybGF5LmlkID0gJ2xvYWRpbmdPdmVybGF5JztcbiAgICBsb2FkaW5nT3ZlcmxheS5zdHlsZSA9ICdwb3NpdGlvbjogYWJzb2x1dGU7IHRvcDogMDsgbGVmdDogMDsgd2lkdGg6IDEwMCU7IGhlaWdodDogMTAwJTt6LWluZGV4OiA5OTk7IGJhY2tncm91bmQtY29sb3I6IGJsYWNrOyc7XG4gICAgdmFyIGxvYWRpbmdJY29uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgbG9hZGluZ0ljb24uaWQgPSAnbG9hZGluZ0ljb24nO1xuICAgIGxvYWRpbmdJY29uLnN0eWxlID0gJ3Bvc2l0aW9uOiBmaXhlZDsgdG9wOiA1MCU7IGxlZnQ6IDUwJTsgLXdlYmtpdC10cmFuc2Zvcm06IHRyYW5zbGF0ZSgtNTAlLCAtNTAlKTsgLW1zLXRyYW5zZm9ybTogdHJhbnNsYXRlKC01MCUsIC01MCUpOyB0cmFuc2Zvcm06IHRyYW5zbGF0ZSgtNTAlLCAtNTAlKTsgfSc7XG5cbiAgICBsb2FkaW5nT3ZlcmxheS5hcHBlbmRDaGlsZChsb2FkaW5nSWNvbik7XG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChsb2FkaW5nT3ZlcmxheSk7XG4gIH1cbn07XG5cbnZhciBjaGVja1N0YXRzTG9hZGVkID0gZnVuY3Rpb24gKCkge1xuICBpZiAodHlwZW9mIFN0YXRzID09PSAndW5kZWZpbmVkJykge1xuICAgIHZhciBtc2cgPSBtb2R1bGVOYW1lICsgJyBFcnJvcjogU3RhdHMgbm90IGxvYWRlZC5cXG4nO1xuICAgIG1zZyArPSAnSWYgeW91IGRvIG5vdCB3aXNoIHRvIHNob3cgU3RhdHMgc2V0ICcgKyBtb2R1bGVOYW1lICsgJy5jb25maWcuc2hvd1N0YXRzID0gZmFsc2VcXG4nO1xuICAgIG1zZyArPSAnT3RoZXJ3aXNlIGdldCBodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20vbXJkb29iL3N0YXRzLmpzL21hc3Rlci9idWlsZC9zdGF0cy5taW4uanNcXG4nO1xuICAgIG1zZyArPSAnYW5kIGFkZCA8c2NyaXB0IHNyYz1cInBhdGgtdG8tc2NyaXB0L3N0YXRzLm1pbi5qc1wiPic7XG4gICAgbXNnICs9ICc8L3NjcmlwdD4gdG8geW91ciA8aGVhZD4nO1xuICAgIGNvbnNvbGUuZXJyb3IobXNnKTtcbiAgfVxufTtcblxudmFyIGluaXQgPSBmdW5jdGlvbiAoKSB7XG4gIGlmIChjb25maWcudXNlR1NBUCkgY2hlY2tHU0FQTG9hZGVkKCk7XG5cbiAgaWYgKGNvbmZpZy51c2VIZWFydGNvZGVMb2FkZXIpIHtcbiAgICBpZiAoY2hlY2tIZWFydGNvZGVMb2FkZWQoKSkge1xuICAgICAgYWRkTG9hZGVyRWxlbSgpO1xuICAgIH1cbiAgfVxuXG4gIGlmIChjb25maWcuc2hvd1N0YXRzKSBjaGVja1N0YXRzTG9hZGVkKCk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgaW5pdDogaW5pdCxcbiAgY29uZmlnOiBjb25maWcsXG4gIE9iamVjdDogT2JqZWN0JDEsXG4gIERyYXdpbmc6IERyYXdpbmdcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgbW9kdWxhclRIUkVFID0gcmVxdWlyZSgnbW9kdWxhci10aHJlZScpO1xuXG5tb2R1bGFyVEhSRUUuaW5pdCgpO1xuY29uc29sZS5sb2cobW9kdWxhclRIUkVFKTsiXX0=
