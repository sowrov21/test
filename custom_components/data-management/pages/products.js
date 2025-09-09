import $ from "jquery";
import { APIClient } from "../utils/fetch";
import { Toast, Alert } from "../utils/toastHelper";
import { SkeletonHelper } from "../utils/skeletonHelper";
import { apiRoutes } from "../utils/endpoints";
import * as XLSX from "xlsx";

let _productsList = [];
let _clientsSelectList = [];

class Products {
  constructor() {
    this.currentPage = 1;
    this.limit = 10;
    this.totalItems = 0;
  }

  async #services(payload = {}, url, type, message = "", defaultLoader = true) {
    const token = localStorage.getItem("token");
    if (!token) {
      Alert.warning("Token not found. Please login again.");
      return;
    }

    if (defaultLoader) {
      console.log("Please wait. Loading...");
      Snackbar.show(message || "Please wait...", "loading");
    }

    try {
      const data = await APIClient(url, payload, type, token);
      if (data.status_code === 200 && data.data) {
        return data;
      } else {
        console.error("Unexpected API response:", data);
        Alert.error(data?.detail || "Unexpected server error.");
      }
    } catch (err) {
      console.error("API Error:", err);
      Alert.error("Request failed: " + err);
    } finally {
      if (defaultLoader) Snackbar.hide();
    }
  }

  async refreshProductList(page = 1, filter = null) {
    SkeletonHelper.renderTableSkeleton("#products", this.limit, 5, [50, 75, 100, 50, 25]);
    this.currentPage = page;
    const skip = (page - 1) * this.limit;
    const payload = { skip, limit: this.limit, is_active: 1 };
    if (filter) {
      payload.is_active = filter.is_active;
      payload.client_id = filter.client_id;
    }
    const response = await this.#services(payload, apiRoutes.products.list, "POST", "Loading Products", true);
    console.log("Products response:", response);
    _productsList = response?.data?.items || [];
    this.totalItems = response?.data?.total || 0;

    let rows = "";
    _productsList.forEach((item, i) => {
      const status = item.is_active == 1 ? "<span class='active_status'>Active</span>" : "<span class='inactive_status'>Inactive</span>";
      rows += `
        <tr>
          <td>${skip + i + 1}</td>
          <td>${item.product_name}</td>
          <td>${item.code}</td>
          <td>${status}</td>
          <td>
            <button class="btn btn-sm btn-primary edit-product-btn" title="Click to Edit Product"
              data-id="${item.id}" 
              data-product='${JSON.stringify(item)}'>
               <i class="fas fa-edit"></i>
            </button>
          </td>
        </tr>`;
    });

    $("#products").html(rows || `<tr><td colspan="5" class="text-center">No Products Found</td></tr>`);
    this.#renderPagination();
  }

  #renderPagination() {
    const totalPages = Math.ceil(this.totalItems / this.limit);
    const container = $("#paginationContainer");
    container.empty();

    if (totalPages <= 1) return;

    let html = `<li class="page-item ${this.currentPage === 1 ? "disabled" : ""}">
                  <a class="page-link" href="#" data-page="${this.currentPage - 1}">Previous</a>
                </li>`;

    for (let i = 1; i <= totalPages; i++) {
      html += `<li class="page-item ${this.currentPage === i ? "active" : ""}">
                 <a class="page-link" href="#" data-page="${i}">${i}</a>
               </li>`;
    }

    html += `<li class="page-item ${this.currentPage === totalPages ? "disabled" : ""}">
               <a class="page-link" href="#" data-page="${this.currentPage + 1}">Next</a>
             </li>`;

    container.html(html);

    container.find("a.page-link").on("click", (e) => {
      e.preventDefault();
      const page = parseInt($(e.currentTarget).data("page"));
      if (!isNaN(page) && page !== this.currentPage) {
        this.refreshProductList(page);
      }
    });
  }

  async generateClientSelectList() {
    const response = await this.#services({}, apiRoutes.clients.dropdown, "POST", "Loading Clients", true);
    _clientsSelectList = response?.data || [];

    const options = _clientsSelectList.map(client => `<option value="${client.id}">${client.name}</option>`).join('');
    $("#client_id").html(`<option value="">Select a client</option>${options}`);
    $("#f_client_id").html(`<option value="">Select a client</option>${options}`);
  }
  async parseExcelOrCSV(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: "array" });

        // Assuming we're working with the first sheet
        workbook.header
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        /*
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null });
        console.log(rows);
        const headers = rows[0].map((h) => (h || "").toString().trim());
        console.log(headers);
        const expectedHeaders = ["code", "product_name", "client_code"];
        let isHeaderValid = true;
        for (let i = 0; i < expectedHeaders.length; i++) {
          if (headers[i] !== expectedHeaders[i]) {
            isHeaderValid = false;
            break; // Stop checking as soon as mismatch found
          }
        }
        if(!isHeaderValid){
          throw new Error(`Invalid file format. Expected headers: ${expectedHeaders.join(", ")}`);
        }*/
        const json = XLSX.utils.sheet_to_json(worksheet, {
          defval: null // If a cell is empty, set it to null
        });
        resolve(json);
      };

      reader.onerror = (error) => reject(error);

      reader.readAsArrayBuffer(file);
    });
  }
  #template() {
    return `
      <div class="container py-4">
        <div class="card shadow-sm">
            <div class="card-body">
                <div class="row justify-content-center">
                    <div class="col-2">
                        <div class="row form-check form-switch">
                            <label class="form-check-label" for="f_is_active">Is Active?</label>
                            <input class="form-check-input" type="checkbox" id="f_is_active" name="is_active" aria-label="Is Active" checked>
                        </div>
                    </div>
                    <div class="col-5">
                        <div class="row ">
                            <div class="col-4">
                                <label class="form-check-label" for="f_clients">Clients</label>
                            </div>
                            <div class="col-8">
                                <select class="form-select" id="f_client_id">
                                    <option value="">Select a client</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div class="col-2">
                        <button class="btn btn-primary" id="filterBtn"> <i class="bi bi-funnel"></i> Filter </button>
                    </div>
                </div>
            </div>
        </div>
        <div class="card shadow-sm mt-2">
          <div class="card-header bg-white d-flex justify-content-between">
            <h5 class="mb-0">Product List</h5>
            <button class="btn btn-success btn-sm" id="addProductBtn">
              <i class="bi bi-plus me-1"></i> Add New
            </button>
          </div>
          <div class="card-body">
          <div class="d-flex justify-content-between mb-2">
            <div>
             <div class="input-group input-group-sm mb-3" style="max-width: 150px;">
                <span class="input-group-text bg-white">
                  <i class="bi bi-list-ul"></i>
                </span>
                <select id="prdItemsPerPage" class="form-select">
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                </select>
              </div>
            </div>
            <div>
              <div class="input-group input-group-sm mb-3" style="width: 30vw;">
                <span class="input-group-text bg-white">
                  <i class="bi bi-search"></i>
                </span>
                <input type="search" id="searchInput" class="form-control" placeholder="Search...">
              </div>
            </div>
          </div>
            <div class="table-responsive" style="max-height: 400px; overflow-y: auto;">
              <table class="table table-hover table-sm mb-0">
                <thead class="table-light">
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Code</th>
                    <th>IsActive</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody id="products"></tbody>
              </table>
            </div>
            <nav class="mt-3">
              <ul class="pagination justify-content-center mb-0" id="paginationContainer"></ul>
            </nav>
          </div>
        </div>
        <div class="card shadow-sm mt-2">
            <div class="card-body">
                <div class="row justify-content-center">
                    <div class="col-5">
                        <div class="row ">
                            <div class="col-4">
                              <label for="uploadFile" class="form-label">Upload Products</label>
                            </div>
                            <div class="col-8">
                              <input class="form-control" type="file" id="uploadFile" accept=".csv,.xlsx,.xls">
                            </div>
                        </div>
                    </div>
                    <div class="col-2">
                        <button class="btn btn-primary" id="uploadBtn"> <i class="bi bi-upload"></i> Upload </button>
                    </div>
                </div>
            </div>
        </div>
        <div class="modal fade" id="productModal" tabindex="-1">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="productModalLabel">Add New Product</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <div class="modal-body">
                <form id="editProductForm">
                  <input type="hidden" id="product-id" value="0">
                  <div class="mb-3">
                    <label for="product_name" class="form-label">Name</label>
                    <input type="text" class="form-control" id="product_name">
                  </div>
                  <div class="mb-3">
                    <label for="product-code" class="form-label">Code</label>
                    <input type="text" class="form-control" id="product-code">
                  </div>
                  <div class="mb-3">
                    <label for="client_id" class="form-label">Choose Client</label>
                    <select class="form-select" id="client_id">
                      <option value="">Select a client</option>
                    </select>
                  </div>
                  <div class="mb-3 form-check form-switch">
                    <label class="form-check-label" for="is_active">Is Active?</label>
                    <input class="form-check-input" type="checkbox" id="is_active" name="is_active" aria-label="Is Active">
                  </div>

                </form>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                <button type="button" class="btn btn-primary" id="saveProductBtn">Save</button>
              </div>
            </div>
          </div>
        </div>
      </div>`;
  }

  async #bindEvents() {
    const self = this;
    await this.refreshProductList();
    await this.generateClientSelectList();

    $("#addProductBtn").on("click", () => {
      this.resetModal();
      $("#productModalLabel").text("Add New Product");
      $("#productModal").modal("show");
    });

    $(document).on("click", ".edit-product-btn", function () {
      const product = $(this).data("product");
      $("#product-id").val(product.id);
      $("#product_name").val(product.product_name);
      $("#product-code").val(product.code).attr("disabled", true);
      $("#client_id").val(product.client_id);
      $("#is_active").prop("checked", product.is_active);

      $("#productModalLabel").text("Edit Product");
      $("#productModal").modal("show");
    });

    $("#saveProductBtn").on("click", async () => {
      const id = $("#product-id").val();
      const product_name = $("#product_name").val().trim();
      const code = $("#product-code").val().trim();
      const client_id = $("#client_id").val();
      const is_active = $("#is_active").prop("checked") ? 1 : 0;

      if (!product_name) {
        Toast.fire({ icon: "warning", title: "Product name is required" });
        return $("#product_name").trigger("focus");
      }
      if (!code) {
        Toast.fire({ icon: "warning", title: "Product code is required" });
        return $("#product-code").trigger("focus");
      }
      if (!client_id) {
        Toast.fire({ icon: "warning", title: "Please select a client" });
        return $("#client_id").trigger("focus");
      }

      const payload = { product_name, code, client_id: parseInt(client_id), is_active };
      const url = id === "0" ? apiRoutes.products.create : apiRoutes.products.update(id);

      const response = await this.#services(payload, url, "POST", id === "0" ? "Creating..." : "Updating...", false);
      if (response && response.status_code === 200) {
        Toast.fire({ icon: "success", title: response.message || "Saved successfully" });
        $("#productModal").modal("hide");
        await this.refreshProductList(this.currentPage);
      }
    });
    $("#filterBtn").on("click", () => {
      const is_active = $("#f_is_active").prop("checked") ? 1 : 0;
      const client_id = $("#f_client_id").val();
      let filter = { is_active, client_id };
      if (!client_id || client_id == "") {
        delete filter.client_id;
      }
      this.refreshProductList(this.currentPage, filter);
    });

    $(document).on("hidden.bs.modal", "#productModal", () => {
      this.resetModal();
    });

    $("#prdItemsPerPage").on("change", async (e) => {
      this.limit = parseInt(e.target.value) || 10;
      this.currentPage = 1; // Reset to first page on limit change
      await this.refreshProductList();
    });

    $("#uploadBtn").on("click", async (event) => {
      // add confirmation dialog before proceeding
      event.preventDefault();
      const result = confirm("Are you sure you want to upload the selected file?")
      if (!result) return;

      const file = $("#uploadFile")[0].files[0];
      if (!file) return;
      const fileType = file.name.split('.').pop();
      if (fileType !== "csv" && fileType !== "xlsx" && fileType !== "xls") {
        Toast.fire({ icon: "error", title: "Invalid file type. Please upload a CSV or Excel file." });
        return;
      }
      try {
        console.log("File parse running...", file);
        const jsonData = await self.parseExcelOrCSV(file);
        console.log("Parsed JSON:", jsonData);
        if (jsonData && jsonData.length > 0) {
          const payload = { products: jsonData };
          // send data to server batch or chunk wise if large than 500 records
          const chunkSize = 500;
          let totalUploaded = 0;
          const error = false;
          for (let i = 0; i < jsonData.length; i += chunkSize) {
            const chunk = jsonData.slice(i, i + chunkSize);
            const response = await self.#services(chunk, apiRoutes.products.bulkCreate, "POST", "Uploading Products...", true);
            if (response && response.status_code !== 200) {
              Toast.fire({ icon: "error", title: response?.detail || "Failed to upload products." });
              error = true;
              break;
            }
            totalUploaded += chunk.length;
            Snackbar.show("Uploaded " + totalUploaded + " products of " + jsonData.length, "loading");
          }
          if (!error) {
            Toast.fire({ icon: "success", title: "Products uploaded successfully" });
            $("#uploadFile").val("");
            await self.refreshProductList(1);
          } else {
            Toast.fire({ icon: "error", title: "Failed to upload products." });
          }
          Snackbar.hide();

        } else {
          $("#uploadFile").val("");
          Toast.fire({ icon: "error", title: response?.detail || "Failed to upload products." });
        }
      }
      catch (err) {
        console.error("Error parsing file:", err);
      }
    });
  }

  resetModal() {
    $("#product-id").val("0");
    $("#product_name").val("");
    $("#product-code").val("").attr("disabled", false);
    $("#client_id").val("");
    $("#productModalLabel").text("Add New Product");
    $("#is_active").prop("checked", true);
  }

  render() {
    return this.#template();
  }

  async afterRender() {
    await this.#bindEvents();
  }
}

const productsPage = new Products();
export { productsPage };
