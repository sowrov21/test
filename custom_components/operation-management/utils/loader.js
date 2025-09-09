const Loader = (() => {
	const loaderEl = document.getElementById("pc-loader");
	const className = "pc-loader-default";
	const textAttr = "data-text";
	let hideTimeout = null;

	return {
		show: function (text = "Loading...", options = {}) {
			if (!loaderEl) return;

			loaderEl.className = "pc-loader " + className + " is-active";
			loaderEl.setAttribute(textAttr, text);

			if (hideTimeout) clearTimeout(hideTimeout);
			if (options.autoHide && options.duration) {
				hideTimeout = setTimeout(() => this.hide(), options.duration);
			}
		},

		hide: function () {
			if (!loaderEl) return;

			loaderEl.classList.remove("is-active", className);
			loaderEl.removeAttribute(textAttr);
		}
	};
})();

window.Loader = Loader; // Optional, for global use (e.g. in browser console)

export default Loader;



//========== old ====================
// // loader.js or at bottom of main.js
// window.addEventListener("DOMContentLoaded", () => {
// const Loader = (function () {
//   const loaderEl = document.getElementById("pc-loader");
//   const className = "pc-loader-default";
//   const textAttr = "data-text";
//   let hideTimeout = null;

//   return {
//     show: function (text = "Loading...", options = {}) {
//       if (!loaderEl) return;

//       // Reset classes
//       loaderEl.className = "pc-loader " + className + " is-active";

//       // Set custom text or fallback
//       loaderEl.setAttribute(textAttr, text);

//       // Optional: auto-hide after a delay (default off)
//       if (hideTimeout) clearTimeout(hideTimeout);
//       if (options.autoHide && options.duration) {
//         hideTimeout = setTimeout(() => this.hide(), options.duration);
//       }
//     },

//     hide: function () {
//       if (!loaderEl) return;

//       loaderEl.classList.remove("is-active", className);
//       loaderEl.removeAttribute(textAttr);
//     }
//   };
// })();

// // Make available globally if needed
// window.Loader = Loader;

// });
