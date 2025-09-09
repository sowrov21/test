const Snackbar = (() => {
	const snackbarEl = document.getElementById("snackbar");
	const iconEl = document.getElementById("snackbar-icon");
	const messageEl = document.getElementById("snackbar-message");
	let hideTimeout = null;

	// Safety: warn if not found
	if (!snackbarEl || !iconEl || !messageEl) {
		console.warn("Snackbar elements missing. Check your HTML: #snackbar, #snackbar-icon, #snackbar-message");
	}

	const ICONS = {
		loading: '<i class="fas fa-spinner fa-spin"></i>',
		success: '<i class="fas fa-check-circle" style="color:green;"></i>',
		error: '<i class="fas fa-times-circle" style="color:red;"></i>',
		info: '<i class="fas fa-info-circle" style="color:#006064;"></i>',
	};

	return {
		show: function (text = "Processing...", type = "info", options = {}) {
			if (!snackbarEl || !iconEl || !messageEl) return;

			messageEl.textContent = text;
			iconEl.innerHTML = ICONS[type] || ICONS.info;

			snackbarEl.classList.remove("hidden");

			if (hideTimeout) clearTimeout(hideTimeout);
			if (options.autoHide && options.duration) {
				hideTimeout = setTimeout(() => this.hide(), options.duration);
			}
		},

		hide: function () {
			if (!snackbarEl) return;
			snackbarEl.classList.add("hidden");
		},

		done: function (text = "Done!") {
			this.show(text, "success", { autoHide: true, duration: 1500 });
		}
	};
})();

export default Snackbar;
