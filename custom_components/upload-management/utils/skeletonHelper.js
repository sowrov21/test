export const SkeletonHelper = {
	/**
	 * Render skeleton rows inside a <tbody>
	 * @param {string} selector - CSS selector for tbody
	 * @param {number} rows - Number of rows to render
	 * @param {number} cols - Number of columns per row
	 * @param {Array<number>} colWidths - Optional array of widths (as percentage)
	 */
	renderTableSkeleton(selector, rows = 5, cols = 4, colWidths = []) {
		const $el = $(selector);
		if (!$el.length) return;

		let html = "";
		for (let i = 0; i < rows; i++) {
			html += "<tr>";
			for (let j = 0; j < cols; j++) {
				const width = colWidths[j] || 75;
				html += `<td><div class="skeleton w-${width}"></div></td>`;
			}
			html += "</tr>";
		}
		$el.html(html);
	},

	/**
	 * Render card or list placeholders (optional helper)
	 * @param {string} selector - Target container
	 * @param {number} count - Number of skeleton items
	 */
	renderCardSkeleton(selector, count = 5) {
		const $el = $(selector);
		if (!$el.length) return;

		let html = "";
		for (let i = 0; i < count; i++) {
			html += `
        <div class="card mb-2 p-2">
          <div class="skeleton w-75 mb-2"></div>
          <div class="skeleton w-100 mb-2"></div>
          <div class="skeleton w-50"></div>
        </div>
      `;
		}
		$el.html(html);
	},
};
