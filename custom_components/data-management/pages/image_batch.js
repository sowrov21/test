import { APIClient } from "../utils/fetch";
import { Toast, Alert } from "../utils/toastHelper";
import { SkeletonHelper } from "../utils/skeletonHelper";
import { apiRoutes } from "../utils/endpoints";

let _imageBatchList = [];
let _clientsSelectList = [];

class ImageBatch {
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
      Loader.show(message || "Please wait...");
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
      Loader.hide();
    }
  }

  async refreshImageBatchList(search = "", page = 1, filter = null) {
    SkeletonHelper.renderTableSkeleton("#images", this.limit, 6, [20, 90, 75, 70, 85, 25]);
    this.currentPage = page;
    const skip = (page - 1) * this.limit;

    const payload = { skip, limit: this.limit, search: search };
    if(filter){
       if (filter.status && filter.status != "None") {
           payload.status = parseInt(filter.status,10);
      }
      if (filter.client_id && filter.client_id != "") {
           payload.client_id = parseInt(filter.client_id,10)
      }
    }
    const response = await this.#services(payload, apiRoutes.image_batches.list, "POST", "", false);

    _imageBatchList = response?.data?.items || [];
    this.totalItems = response?.data?.total || 0; 

    let rows = "";
    _imageBatchList.forEach((item, i) => {
      const statusText = ["Pending", "Labeled", "Completed"][item.status] || "Unknown";
      rows += `
      <tr>
        <td>${skip + i + 1}</td>
        <td>${item.batch_no}</td>
        <td>${statusText}</td>
        <td>${item.source}</td>
        <td>${item.client_name}</td>
        <td>
          <button class="btn btn-sm btn-primary edit-img-batch-btn" 
            data-id="${item.id}" 
            data-imagebatch='${JSON.stringify(item)}'>
            <i class="fas fa-edit"></i>
          </button>
        </td>
      </tr>`;
    });

    $("#images").html(rows || `<tr class="text-center"><td colspan="6">No Data Found</td></tr>`);
    this.#renderPagination();
  }


  #renderPagination() {
    const totalPages = Math.ceil(this.totalItems / this.limit);
    const container = $("#paginationContainer");
    container.empty();

    if (totalPages <= 1) return;

    let html = ``;
    html += `<li class="page-item ${this.currentPage === 1 ? "disabled" : ""}">
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
        this.refreshImageBatchList("", page);
      }
    });
  }

  async generateClientSelectList() {
    const response = await this.#services({}, apiRoutes.clients.dropdown, "POST", "", false);
    _clientsSelectList = response?.data || [];

    let options = `<option value="">Select a client</option>`;
    _clientsSelectList.forEach(client => {
      options += `<option value="${client.id}">${client.name}</option>`;
    });

    $("#client_id").html(options);
    $("#f_client_id").html(options);
  }

  getBatchNo() {
    const client_id = $("#client_id").val();
    if (!client_id) {
      Toast.fire({ icon: "warning", title: "Select a client first" });
      return;
    }

    const now = new Date();
    const datePart = `${String(now.getDate()).padStart(2, "0")}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getFullYear()).slice(-2)}`;

    const client = _clientsSelectList.find(c => c.id == client_id);
    const clientCode = client?.code || client_id;

    return `${clientCode}-${datePart}`;
  }

  #resetModal() {
    $("#batch_id").val("0");
    $("#client_id").val("").prop("disabled", false);
    $("#batch_no").val("").prop("disabled", false);
    $("#status").val("0");
    $("#final_batch_no").val("");
    $(".batch-form-text").hide();
    $("#imageBatchModalLabel").text("Add New Image Batch");
    $("#saveImageBtn").text("Save");
  }

  async #bindEvents() {
    const self = this;
    await this.refreshImageBatchList("", 1);
    await this.generateClientSelectList();
    await this.#services({}, apiRoutes.auth.genrateSASToken, "POST", "", false);

    $("#addBtn").on("click", () => {
      //this.#resetModal();
      $("#imageBatchModal").modal("show");
      // const modal = new bootstrap.Modal(document.getElementById("imageBatchModal"));
      // modal.show();
    });

    $(document).on("click", ".edit-img-batch-btn", function () {
      const image_batch = $(this).data("imagebatch");

      $("#batch_id").val(image_batch.id);
      $("#client_id").val(image_batch.client_id).prop("disabled", true);
      $("#batch_no").val(image_batch.batch_no).prop("disabled", true);
      $("#final_batch_no").val(image_batch.batch_no);
      $("#status").val(image_batch.status);

      $("#imageBatchModalLabel").text("Edit Image Batch");
      $("#saveImageBtn").text("Update");

      // const modal = new bootstrap.Modal(document.getElementById("imageBatchModal"));
      // modal.show();
      $("#imageBatchModal").modal("show");
    });

    $(document).on("keyup", "#batch_no", () => {
      const raw = $("#batch_no").val().trim();
      const prefix = this.getBatchNo();

      if (raw && prefix) {
        const full = `${prefix}-${raw}`;
        $("#final_batch_no").val(full);
        $(".batch-form-text").text(`Final Batch No: ${full}`).show();
      } else {
        $(".batch-form-text").hide();
      }
    });
    $("#imageSearchInput").on("input", async (e) => {
      const query = e.target.value;
      if (query.length > 3) {
        await self.refreshImageBatchList(query, 1);
      }
    });
    $("#saveImageBtn").on("click", async () => {
      const id = $("#batch_id").val();
      const client_id = $("#client_id").val();
      const batch_no = $("#batch_no").val().trim();
      const status = $("#status").val();
      const source = $("#source").val();
      const final_batch_no = $("#final_batch_no").val();

      if (!client_id) {
        Toast.fire({ icon: "warning", title: "Please select a client" });
        return $("#client_id").trigger("focus");
      }
      if (!batch_no || !final_batch_no) {
        Toast.fire({ icon: "warning", title: "Batch number is required" });
        return $("#batch_no").trigger("focus");
      }

      const payload = {
        id,
        client_id,
        batch_no: final_batch_no,
        status,
        source
      };

      const isNew = id === "0";
      const url = isNew ? apiRoutes.image_batches.create : apiRoutes.image_batches.update(id);
      const actionText = isNew ? "Creating" : "Updating";

      const response = await this.#services(payload, url, "POST", `${actionText} image batch...`);

      if (response && response.status_code === 200) {
        Toast.fire({ icon: "success", title: response.message || `${actionText} successful` });
        const modal = bootstrap.Modal.getInstance(document.getElementById("imageBatchModal"));
        modal.hide();
        await this.refreshImageBatchList("", this.currentPage);
      }
    });

    $(document).on("hidden.bs.modal", "#imageBatchModal", () => {
      this.#resetModal();
    });
    // document.getElementById("imageBatchModal").addEventListener("hidden.bs.modal", () => {
    //   this.#resetModal();
    // });

    $("#img_batch_itemsPerPage").on("change", async (e) => {
      this.limit = parseInt(e.target.value) || 10;
      this.currentPage = 1; // Reset to first page on limit change
      await this.refreshImageBatchList("");
    });
    $("#filterBtn").on("click", () => {
      const status = $("#f_status").val();
      const client_id = $("#f_client_id").val();
      let filter = { status, client_id };
      this.refreshImageBatchList("", this.currentPage, filter);
    });
  }

  render() {
    return this.#template();
  }

  async afterRender() {
    await this.#bindEvents();
  }

  #template() {
    return `
      <div class="container py-4">
        <div class="card shadow-sm">
            <div class="card-body">
                <div class="row justify-content-center">
                    <div class="col-5">
                        <div class="row">
                            <div class="col-4">
                                <label class="form-check-label" for="f_status">Status</label>
                            </div>
                            <div class="col-8">
                                <select class="form-select" id="f_status">
                                  <option value="None">select a status</option>
                                  <option value="0">Pending</option>
                                  <option value="1">Labeled</option>
                                  <option value="2">Completed</option>
                                </select>
                            </div>
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
            <h5 class="mb-0">Images Batch List</h5>
            <button class="btn btn-success btn-sm" id="addBtn">
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
                <select id="img_batch_itemsPerPage" class="form-select">
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
                <input type="search" id="imageSearchInput" class="form-control" placeholder="Search...">
              </div>
            </div>
          </div>
            <div class="table-responsive" style="max-height: 200px; overflow-y: auto;">
              <table class="table table-hover table-sm mb-0">
                <thead class="table-light">
                  <tr>
                    <th>#</th>
                    <th>Batch No</th>
                    <th>Status</th>
                    <th>Source</th>
                    <th>Client</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody id="images">
                  <tr class="text-center"><td colspan="6">No Data Found</td></tr>
                </tbody>
              </table>
            </div>

            <nav class="mt-3">
              <ul class="pagination justify-content-center mb-0" id="paginationContainer"></ul>
            </nav>
          </div>
        </div>

        <!-- Modal -->
        <div class="modal fade" id="imageBatchModal" tabindex="-1">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="imageBatchModalLabel">Add New Image Batch</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <div class="modal-body">
                <form id="editImageForm">
                  <input type="hidden" id="batch_id" value="0">

                  <div class="mb-3">
                    <label for="client_id" class="form-label">Choose a Client</label>
                    <select class="form-select" id="client_id">
                      <option value="">Select a client</option>
                    </select>
                  </div>

                  <div class="mb-3">
                    <label for="batch_no" class="form-label">Batch No</label>
                    <input type="text" class="form-control" id="batch_no">
                    <div class="batch-form-text text-muted small mt-1" style="display:none"></div>
                    <input type="hidden" class="form-control" id="final_batch_no">
                  </div>

                  <div class="mb-3">
                    <label for="status" class="form-label">Status</label>
                    <select class="form-select" id="status">
                      <option value="0">Pending</option>
                      <option value="1">Labeled</option>
                      <option value="2">Completed</option>
                    </select>
                  </div>

                  <div class="mb-3">
                    <label for="source" class="form-label">Source</label>
                    <select class="form-select" id="source">
                      <option value="Azure">Azure</option>
                    </select>
                  </div>
                </form>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                <button type="button" class="btn btn-primary" id="saveImageBtn">Save</button>
              </div>
            </div>
          </div>
        </div>
      </div>`;
  }
}

const imageBatchPage = new ImageBatch();
export { imageBatchPage };
