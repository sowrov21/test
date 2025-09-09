
import { APIClient } from "../utils/fetch";
import { uploadToAzureBlob } from '../utils/azureBlobHelper';
import Loader from "../utils/loader";
var _sasToken = '';
class EditImage {
	imageBatchId = null;
	#dzImageSrcList = [];
	#validImageFiles = [];
	constructor() { }
	async #services(payload = {}, url, type, message = "") {
		const token = localStorage.getItem("token");
		if (token) {
			Loader.show(message || "Please wait. Loading...");

			try {
				const data = await APIClient(url, payload, type, token);

				if (data.status_code === 200 && data.data) {
					return data;
				} else {
					console.error("API returned an unexpected response:", data);
				}

			} catch (err) {
				console.error("API error:", err);
			} finally {
				Loader.hide();
			}

		}
	}
	async generateBatchSelectList(client_id) {
		if (!client_id || isNaN(client_id)) {
			console.warn("Invalid client_id:", client_id);
			return;
		}

		client_id = parseInt(client_id);
		const response = await this.#services({}, `image_batches/getImageBatchSelectList?client_id=${client_id}`, "POST");
		const batchSelectList = response.data;

		if (Array.isArray(batchSelectList) && batchSelectList.length > 0) {
			$("#batch").empty();
			let options = `<option value="">Select a batch</option>`;

			for (const batch of batchSelectList) {
				options += `<option value="${batch.id}">${batch.batch_no}</option>`;
			}

			$("#batch").append(options);
		} else {
			alert("No batches found");
			$("#batch").empty();
			return;
		}
	}

	async generateProductSelectList(client_id) {
		if (!client_id || isNaN(client_id)) {
			console.warn("Invalid client_id:", client_id);
			return;
		}

		client_id = parseInt(client_id);
		var response = await this.#services({}, "products/getProductSelectList?client_id=" + client_id, "POST");
		var productSelectList = response.data;
		//console.log(productSelectList);
		if (Array.isArray(productSelectList) && productSelectList.length > 0) {
			$("#product").empty();
			let options = `<option>select a product</option>`;
			for (let idx = 0; idx < productSelectList.length; idx++) {
				const element = productSelectList[idx];
				options += `<option value ="${productSelectList[idx].id}">${productSelectList[idx].product_name}</option>`
			}
			$("#product").append(options);
		} else {
			alert("No Product found");
			$("#product").empty();
			return;
		}
	}
	async generateClientSelectList() {
		var response = await this.#services({}, "clients/getClientSelectList", "POST");
		var clientSelectList = response.data;
		//console.log(clientSelectList);
		if (Array.isArray(clientSelectList) && clientSelectList.length > 0) {
			$("#client").empty();
			let options = `<option>select a client</option>`;
			for (let idx = 0; idx < clientSelectList.length; idx++) {
				const element = clientSelectList[idx];
				options += `<option value ="${clientSelectList[idx].id}">${clientSelectList[idx].name}</option>`
			}
			$("#client").append(options);
		}
	}
	#template() {
		return `
			<div class="container py-4">
			<div class="card shadow-sm">
				<div class="card-header bg-white">
				<h5 class="mb-0">Upload Image</h5>
				</div>
				<div class="card-body">
				<div class="row mb-3">
					<div class="col-4">
						<label class="form-label" for="client">Client</label>
						<select class="form-select" id="client">
							<option>choose a client</option>
						</select>
					</div>
					<div class="col-4">
						<label class="form-label" for="product">Product</label>
						<select class="form-select" id="product">
							<option>choose a client first</option>
						</select>
					</div>
					<div class="col-4">
						<label class="form-label" for="product">Batch</label>
						<select class="form-select" id="batch">
							<option>choose a batch</option>
						</select>
					</div>
				</div>
				<div class="row mb-3">
					<div class="col-12">
					<label class="form-label d-block">Upload Images</label>
					<div class="form-check form-check-inline">
						<input class="form-check-input" type="checkbox" id="selectAllCheckbox">
						<label class="form-check-label" for="selectAllCheckbox">Select All</label>
					</div>
					<button id="deleteSelectedBtn" class="btn btn-danger btn-sm ms-2">
						Delete Selected
					</button>
					</div>
					<div class="col-12 mt-3">
					<form action="/fake-upload" class="dropzone" id="my-dropzone"></form>
						<button type="button" class="btn btn-primary mt-3" id="saveBtn">Save Data</button>
					</div>
				</div>
				</div>
			</div>
			</div>
    `;
	}

	render(params = {}) {
		if (params) {
			this.imageBatchId = params.batch_id;
		}
		return this.#template();
	}

	async afterRender() {
		await this.generateClientSelectList();
		var response = await this.#services({}, "auth/genrateSASToken", "POST");
		_sasToken = response.data;
		//console.log(_sasToken);
		//this.#bindEvents("_sasToken", _sasToken);
		this.#bindEvents();
	}

	updateDzImageSrcList = () => {
		this.#dzImageSrcList = this.dz.files
			.filter(f => f.type && f.type.startsWith("image/"))
			.map(f => f.dataURL || f.previewElement?.querySelector("img")?.src)
			.filter(Boolean);

		this.#validImageFiles = this.dz.files.filter(f => f.type && f.type.startsWith("image/"));
	}

	#updateSelectAllCheckbox() {
		const checkbox = document.getElementById("selectAllCheckbox");
		const files = this.dz.files;
		const selectedCount = files.filter(f => f._selected).length;

		if (selectedCount === 0) {
			checkbox.checked = false;
			checkbox.indeterminate = false;
		} else if (selectedCount === files.length) {
			checkbox.checked = true;
			checkbox.indeterminate = false;
		} else {
			checkbox.checked = false;
			checkbox.indeterminate = true;
		}
	}

	#addCheckboxToPreview(file) {
		if (!file.previewElement) return;

		const checkbox = document.createElement("input");
		checkbox.type = "checkbox";
		checkbox.className = "dz-select-checkbox";
		checkbox.checked = !!file._selected;

		checkbox.addEventListener("click", (e) => e.stopPropagation());
		checkbox.addEventListener("change", (e) => {
			file._selected = checkbox.checked;
			file.previewElement.classList.toggle("selected", checkbox.checked);
			this.#updateSelectAllCheckbox();
		});

		file.previewElement.insertBefore(checkbox, file.previewElement.firstChild);
	}
	async #uploadImages() {
		Loader.show("Please wait. Processing Images to upload");

		const accountName = import.meta.env.VITE_ACCOUNT_NAME;
		const containerName = import.meta.env.VITE_CONTAINER_NAME;
		const path = "XpertPredict_Images/";

		if (!_sasToken || _sasToken === "") {
			Loader.hide();
			alert("Image upload token not found. Contact admin");
			return [];
		}

		const uploadedBlobObj = [];
		const files = this.#validImageFiles;

		for (let i = 0; i < files.length; i++) {
			const file = files[i];
			const blobName = `${Date.now()}-${file.name.replaceAll(" ", "_")}`;

			try {
				const sasUrl = `https://${accountName}.blob.core.windows.net/${containerName}?${_sasToken}`;
				const blobUrl = await uploadToAzureBlob(sasUrl, containerName, blobName, path, file);
				uploadedBlobObj.push({
					image_url: blobUrl
				});
			} catch (err) {
				console.error(`Error uploading ${file.name}:`, err);
			}
		}

		Loader.hide();
		return uploadedBlobObj;
	}
	async  #getImageMetadata(url) {
		try {
			const response = await fetch(url, { method: 'HEAD' });
			const size = parseInt(response.headers.get('Content-Length')) || 0;
			const type = response.headers.get('Content-Type') || 'image/jpeg';
			return { size, type };
		} catch (err) {
			console.warn("Could not fetch image metadata:", err);
			return { size: 123456, type: 'image/jpeg' }; // fallback
		}
	}
	async #bindEvents() {
		const self = this;
		//get images data by imageid
		///getImage/{image_id}
		var res = await this.#services({}, `images/getImagesByBatch/${encodeURIComponent(parseInt(self.imageBatchId))}`, "POST");

		if (!res) {
			return alert("Images not found for :" + self.imageBatchIdd);
		}
		const predefinedImages = [];

		if (res && res.data && Array.isArray(res.data)) {
			for (const item of res.data) {
				const metadata = await self.#getImageMetadata(item.image_url);

				// Fetch the blob from Azure Blob URL
				const response = await fetch(item.image_url);
				const blob = await response.blob();

				const file = new File([blob], item.image_url.split('/').pop(), {
					type: metadata.type,
					lastModified: new Date().getTime(),
				});

				// Store file and ID together
				predefinedImages.push({
					file: file,
					url: item.image_url,
					id: item.id,
				});
			}
		}

		this.dz = new Dropzone($("#my-dropzone")[0], {
			url: "/fake-upload",
			autoProcessQueue: false,
			addRemoveLinks: true,
			acceptedFiles: "image/*",
			init: function () {
				const dz = this;

				predefinedImages.forEach(image => {
					const mockFile = { name: image.file.name, size: image.file.size, type: image.file.type };
					dz.files.push(mockFile);
					dz.emit('addedfile', mockFile);

					dz.createThumbnailFromUrl(
						mockFile,
						image.url,
						dz.options.thumbnailWidth,
						dz.options.thumbnailHeight,
						dz.options.thumbnailMethod,
						true,
						thumb => {
							dz.emit('thumbnail', mockFile, thumb);
							dz.emit('success', mockFile);
							dz.emit('complete', mockFile);
							if (mockFile.previewElement) {
								mockFile.previewElement.dataset.imageId = image.id;
							}
						}
					);
				});

				this.on("addedfile", file => {
					file._selected = false;
					setTimeout(() => {
						file.status = Dropzone.SUCCESS;
						file.accepted = true;
						this.emit("success", file, { fake: true });
						this.emit("complete", file);
						self.updateDzImageSrcList();
					}, 300);
				});
			}

		});


		this.dz.on("success", (file) => {
			this.#addCheckboxToPreview(file);
			this.updateDzImageSrcList();
		});

		this.dz.on("removedfile", () => {
			this.#updateSelectAllCheckbox();
			this.updateDzImageSrcList();
		});

		// Select All
		$("#selectAllCheckbox").on("change", () => {
			this.dz.files.forEach(file => {
				file._selected = $("#selectAllCheckbox").prop("checked");
				const checkbox = file.previewElement?.querySelector(".dz-select-checkbox");
				if (checkbox) checkbox.checked = file._selected;
				file.previewElement?.classList.toggle("selected", file._selected);
			});
			this.#updateSelectAllCheckbox();
		});

		// Delete selected
		$("#deleteSelectedBtn").on("click", () => {
			const filesToDelete = this.dz.files.filter(f => f._selected);
			if (filesToDelete.length === 0) return alert("No files selected");
			filesToDelete.forEach(f => this.dz.removeFile(f));
		});

		//client change

		$("#client").on("change", async (event) => {
			let client_id = $(event.currentTarget).val();

			if (!client_id || client_id === "") return;
			if (!client_id || client_id == "") return;
			await this.generateProductSelectList(client_id);
			await this.generateBatchSelectList(client_id);

		});


		// Save data
		$("#saveBtn").on("click", async () => {

			var formData = {};
			let client_id = $("#client").val();
			let product_id = $("#product").val();
			let batch_id = $("#batch").val();
			let batch_no = $("#batch :selected").text();

			if (!client_id) {
				alert("Client is required. Choose a client.");
				return;
			}

			if (!product_id) {
				alert("Product is required. Choose a product.");
				return;
			}

			if (!batch_id) {
				alert("Batch is required. Choose a batch.");
				return;
			}

			var formData = {};

			formData.client_id = parseInt(client_id);
			formData.product_id = parseInt(product_id);
			formData.image_source = "Azure";
			formData.batch_id = batch_id;
			formData.batch_no = batch_no;

			//call upload image
			var uploadedImages = await this.#uploadImages();

			if (!Array.isArray(uploadedImages) || uploadedImages.length <= 0) {
				alert("No Image found to save. Upload some images to save.");
				return;
			}

			formData.images = uploadedImages;
			console.log("save", formData);
			var response = await this.#services(formData, "images/upload", "POST", "Please wait. Saving Data...");
			alert(response.message)

		});


	}
}

export const editImagePage = new EditImage();
