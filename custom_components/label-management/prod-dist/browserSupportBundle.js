/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/browserSupport/browserSupport.js":
/*!**********************************************!*\
  !*** ./src/browserSupport/browserSupport.js ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   validateBrowserType: () => (/* binding */ validateBrowserType),\n/* harmony export */   validateCanvasSupport: () => (/* binding */ validateCanvasSupport)\n/* harmony export */ });\nvar CANVAS_BROWSER_SUPPORT_URL = 'https://community.canvaslms.com/docs/DOC-10720-what-are-the-browser-and-computer-requirements-for-canvas';\nvar CHROMIUM_SUPPORT_URL = 'https://www.zdnet.com/pictures/all-the-chromium-based-browsers/';\nvar displayingBrowserSupportOverlay = false;\nfunction validateBrowserType() {\n  var agent = navigator.userAgent;\n  if (agent.toLowerCase().indexOf('chrome') > -1 && agent.indexOf('Edge') === -1 || agent.toLowerCase().indexOf('firefox') > -1) return;\n  var inadequateClientResourcesOverlay = document.getElementById('inadequate-client-resources-overlay');\n  var inadequateClientResourcesOverlayText = document.getElementById('inadequate-client-resources-overlay-text');\n  inadequateClientResourcesOverlayText.innerHTML = \"Please switch to a <a href=\\\"\".concat(CHROMIUM_SUPPORT_URL, \"\\\" target=\\\"_blank\\\">Chromium</a> based browser or Firefox\");\n  inadequateClientResourcesOverlayText.style.marginTop = '32px';\n  inadequateClientResourcesOverlayText.style.maxWidth = 'none';\n  inadequateClientResourcesOverlay.style.display = 'block';\n  document.body.style.overflow = 'hidden';\n  displayingBrowserSupportOverlay = true;\n}\nfunction validateCanvasSupport() {\n  if (displayingBrowserSupportOverlay) return;\n  var canvasElement = document.createElement('canvas');\n  var isCanvasSupported = !!(canvasElement.getContext && canvasElement.getContext('2d'));\n  if (!isCanvasSupported) {\n    var inadequateClientResourcesOverlay = document.getElementById('inadequate-client-resources-overlay');\n    var inadequateClientResourcesOverlayText = document.getElementById('inadequate-client-resources-overlay-text');\n    inadequateClientResourcesOverlayText.innerHTML = \"Your browser does not support the Canvas feature, please update or choose another one from <a href=\\\"\".concat(CANVAS_BROWSER_SUPPORT_URL, \"\\\" target=\\\"_blank\\\">here</a>\");\n    inadequateClientResourcesOverlay.style.display = 'block';\n    document.body.style.overflow = 'hidden';\n  }\n}\n\n\n//# sourceURL=webpack://myvision/./src/browserSupport/browserSupport.js?");

/***/ }),

/***/ "./src/browserSupport/index.js":
/*!*************************************!*\
  !*** ./src/browserSupport/index.js ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _browserSupport__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./browserSupport */ \"./src/browserSupport/browserSupport.js\");\n\n(0,_browserSupport__WEBPACK_IMPORTED_MODULE_0__.validateBrowserType)();\n(0,_browserSupport__WEBPACK_IMPORTED_MODULE_0__.validateCanvasSupport)();\n\n//# sourceURL=webpack://myvision/./src/browserSupport/index.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./src/browserSupport/index.js");
/******/ 	
/******/ })()
;