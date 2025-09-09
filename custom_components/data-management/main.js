import "@popperjs/core";
import "./node_modules/bootstrap/dist/css/bootstrap.min.css";
//import "./node_modules/bootstrap/dist/js/bootstrap.min.js";
//import * as bootstrap from "bootstrap/dist/js/bootstrap.bundle.min.js"; // <- Add this
import * as bootstrap from 'bootstrap/dist/js/bootstrap.esm.min.js';

import jQuery from "jquery";
//import "toastr/build/toastr.min.css"; // Or toastr.css
//import * as toastr from 'toastr';
import "./public/css/main.css";
import router from "./router/router";
import StreamlitUtil from "./utils/streamlitUtil";
import { jwtDecode } from "jwt-decode";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import Loader from "./utils/loader"; // <- Import Loader module
import Snackbar from "./utils/snackbarHelper"; // <- Import Loader module
import {encryptData} from "./utils/crp"; 

let initialized = false;

// Set up Streamlit component communication
StreamlitUtil.init({
	onData: (props) => {
		if (initialized) return;

		initialized = true;
		const data = props?.data || {};
		if (data.token) {
			localStorage.setItem("token", data.token);
			const expired = jwtDecode(data.token)?.exp || 0;
			localStorage.setItem("expired", expired.toString());
			localStorage.setItem(
				"last_request",
				Math.floor(Date.now() / 1000).toString()
			);
			localStorage.setItem("rf_token", data.rf_token);

			const cu_obj = {
				_un: data.un,
				_eml: data.eml,
				_fn: data.fn,
				_mob: data.mob,
				_ut: data.ut
			}
			const cObj = encryptData(cu_obj);
			localStorage.setItem("_cu", cObj);
			// localStorage.setItem("_cu", JSON.stringify(cu_obj));
			// localStorage.setItem("current_user", JSON.stringify(data.cu));
			// localStorage.setItem("current_user", data.cu);

			// hashchange trigger router — no direct router() call
			if (
				!window.location.hash ||
				window.location.hash === "#/" ||
				window.location.hash === "#/login"
			) {
				window.location.hash = "#/dashboard";
			}
		}

		console.log("Received from Python:", props);

		// Optional: respond with some data
		// if (props.shouldRespond) {
		//   StreamlitUtil.send({ status: "Received props", timestamp: Date.now() });
		// }

		// Show toast if passed
		// if (props.toastMessage) {
		//   toastr.success(props.toastMessage, "Python says:");
		// }

		// If you want to call a custom handler:
		// if (typeof window.onStreamlitData === "function") {
		//   window.onStreamlitData(props);
		// }
	},
});

Object.assign(window, { $, jQuery });
window.bootstrap = bootstrap;
window.flatpickr = flatpickr;
window.Loader = Loader; // Make Loader globally accessible
window.Snackbar = Snackbar; // Make Snackbar globally accessible

//configure toastr
// window.toastr = toastr;
// window.toastr.options = {
// 	closeButton: true,
// 	debug: false,
// 	newestOnTop: false,
// 	progressBar: true,
// 	positionClass: "toast-top-right",
// 	preventDuplicates: false,
// 	onclick: null,
// 	showDuration: "300",
// 	hideDuration: "1000",
// 	timeOut: "5000",
// 	extendedTimeOut: "1000",
// 	showEasing: "swing",
// 	hideEasing: "linear",
// 	showMethod: "fadeIn",
// 	hideMethod: "fadeOut",
// };





//============ old============
// import "@popperjs/core";
// import "./node_modules/bootstrap/dist/css/bootstrap.min.css";
// //import "./node_modules/bootstrap/dist/js/bootstrap.min.js";
// import * as bootstrap from "bootstrap/dist/js/bootstrap.bundle.min.js"; // <- Add this
// import jQuery from "jquery";
// //import "toastr/build/toastr.min.css"; // Or toastr.css
// //import * as toastr from 'toastr';
// import "./public/css/main.css";
// import router from "./router/router";
// import StreamlitUtil from "./utils/streamlitUtil";
// import { jwtDecode } from "jwt-decode";
// import flatpickr from "flatpickr";
// import "flatpickr/dist/flatpickr.min.css";
// import Loader from "./components/loader";

// //router();

// let initialized = false;
// //Set up Streamlit component communication
// StreamlitUtil.init({
// 	onData: (props) => {
// 		if (initialized) return;

// 		initialized = true;
// 		const data = props?.data || {};
// 		if (data.token && data.cu) {
// 			localStorage.setItem("token", data.token);
// 			const expired = jwtDecode(data.token)?.exp || 0;
// 			localStorage.setItem("expired", expired.toString());
// 			localStorage.setItem(
// 				"last_request",
// 				Math.floor(Date.now() / 1000).toString()
// 			);
// 			localStorage.setItem("rf_token", data.rf_token);
// 			localStorage.setItem("current_user", JSON.stringify(data.cu));
// 			router();
// 			window.location.hash = "#/dashboard"; // ← changed from replaceState
// 		}
// 		console.log("Received from Python:", props);

// 		// Optional: respond with some data
// 		// if (props.shouldRespond) {
// 		//   StreamlitUtil.send({ status: "Received props", timestamp: Date.now() });
// 		// }

// 		// Show toast if passed
// 		// if (props.toastMessage) {
// 		//   toastr.success(props.toastMessage, "Python says:");
// 		// }

// 		// If you want to call a custom handler:
// 		// if (typeof window.onStreamlitData === "function") {
// 		//   window.onStreamlitData(props);
// 		// }
// 	},
// });

// Object.assign(window, { $, jQuery });
// window.bootstrap = bootstrap;
// //configure toastr
// // window.toastr = toastr;
// // window.toastr.options = {
// // 	closeButton: true,
// // 	debug: false,
// // 	newestOnTop: false,
// // 	progressBar: true,
// // 	positionClass: "toast-top-right",
// // 	preventDuplicates: false,
// // 	onclick: null,
// // 	showDuration: "300",
// // 	hideDuration: "1000",
// // 	timeOut: "5000",
// // 	extendedTimeOut: "1000",
// // 	showEasing: "swing",
// // 	hideEasing: "linear",
// // 	showMethod: "fadeIn",
// // 	hideMethod: "fadeOut",
// // };
// window.flatpickr = flatpickr;
// window.Loader = Loader;
