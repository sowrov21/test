import $ from "jquery";
import { APIClient } from "../utils/fetch";
import { Toast, Alert } from "../utils/toastHelper";
import { SkeletonHelper } from "../utils/skeletonHelper";
import { apiRoutes } from "../utils/endpoints";

let _clientsList = [];

class Clients {
  constructor() {
    this.currentPage = 1;
    this.limit = 10;
    this.totalItems = 0;
  }

  async #services(payload = {}, url = apiRoutes.clients.list, type = "POST", message = "Loading Clients", defaultLoader = true) {
    const token = localStorage.getItem("token");
    if (!token) {
      Alert.warning("Token not found. Please login again.");
      return;
    }

    if (defaultLoader) {
      Snackbar.show(message, "loading");
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

  async refreshClientsList(search = "", page = 1) {
    this.currentPage = page;
    const skip = (page - 1) * this.limit;

    SkeletonHelper.renderTableSkeleton("#clients", this.limit, 7, [30, 80, 50, 50, 100, 40, 60]);

    const payload = {
      skip,
      limit: this.limit,
      is_active: 1,
      search: search.trim()
    };

    const response = await this.#services(payload);
    _clientsList = response?.data?.items || [];
    this.totalItems = response?.data?.total || 0;

    let rows = "";

    _clientsList.forEach((item, i) => {
      const idx = skip + i + 1;
      rows += `
        <tr>
          <td>${idx}</td>
          <td>${item.name}</td>
          <td>${item.contact_no}</td>
          <td>${item.client_type?.toUpperCase() || "N/A"}</td>
          <td>${item.address || ""}</td>
          <td>${item.is_active === 1 ? "Active" : "Inactive"}</td>
          <td>
            <button class="btn btn-sm btn-primary edit-client-btn" 
              data-id="${item.id}" 
              data-client='${JSON.stringify(item).replace(/'/g, "&apos;")}'>
              <i class="fas fa-edit"></i>
            </button>
          </td>
        </tr>`;
    });

    $("#clients").html(rows || `<tr class="text-center"><td colspan="7">No Clients Found</td></tr>`);
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
        this.refreshClientsList($("#clientSearchInput").val(), page);
      }
    });
  }

  resetModal() {
    $("#client-id").val("0");
    $("#client-code").val("").prop("disabled", false);
    $("#client-name").val("");
    $("#client-contact").val("");
    $("#client-address").val("");
    $("#client-status").val("1");
    $("#client_type").val("");
    $("#clientModalLabel").text("Add New Client");
  }

  #template() {
    return `
      <div class="container py-4">
        <div class="card shadow-sm">
          <div class="card-header bg-white d-flex justify-content-between">
            <h5 class="mb-0">Clients List</h5>
            <button class="btn btn-success btn-sm" id="addBtn">
              <i class="bi bi-plus me-1"></i> Add New
            </button>
          </div>
          <div class="card-body">

            <div class="d-flex justify-content-between mb-2">
              <div class="input-group input-group-sm" style="max-width: 150px;">
                <label class="input-group-text">Show</label>
                <select class="form-select" id="clientItemsPerPage">
                  <option value="10" selected>10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                </select>
              </div>
              <div class="input-group input-group-sm" style="width: 30vw;">
                <span class="input-group-text bg-white">
                  <i class="bi bi-search"></i>
                </span>
                <input type="search" id="clientSearchInput" class="form-control" placeholder="Search clients...">
              </div>
            </div>

            <div class="table-responsive">
              <table class="table table-striped table-hover table-sm mb-0">
                <thead class="table-light">
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Contact</th>
                    <th>Type</th>
                    <th>Address</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody id="clients">
                  <tr class="text-center"><td colspan="7">No Data Found</td></tr>
                </tbody>
              </table>
            </div>

            <nav class="mt-3">
              <ul class="pagination justify-content-center mb-0" id="paginationContainer"></ul>
            </nav>
          </div>
        </div>

        <!-- Modal -->
        <div class="modal fade" id="clientModal" tabindex="-1">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="clientModalLabel">Add New Client</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <div class="modal-body">
                <form id="editClientForm">
                  <input type="hidden" id="client-id" value="0">
                  <div class="mb-3">
                    <label for="client-code" class="form-label">Code*</label>
                    <input type="text" class="form-control" id="client-code">
                  </div>
                  <div class="mb-3">
                    <label for="client-name" class="form-label">Name*</label>
                    <input type="text" class="form-control" id="client-name">
                  </div>
                  <div class="mb-3">
                    <label for="client-contact" class="form-label">Contact No*</label>
                    <input type="text" class="form-control" id="client-contact">
                  </div>
                  <div class="mb-3">
                    <label for="client-address" class="form-label">Address</label>
                    <input type="text" class="form-control" id="client-address">
                  </div>
                  <div class="mb-3">
                    <label for="client-status" class="form-label">Status*</label>
                    <select class="form-select" id="client-status">
                      <option value="1">Active</option>
                      <option value="0">Inactive</option>
                    </select>
                  </div>
                  <div class="mb-3">
                    <label for="client_type" class="form-label">Client Type*</label>
                    <select class="form-select" id="client_type">
                      <option value="">Select a type</option>
                      <option value="fmcg">FMCG</option>
                      <option value="pharma">Pharma</option>
                    </select>
                  </div>
                </form>
              </div>
              <div class="modal-footer">
                <button class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                <button class="btn btn-primary" id="saveClientBtn">Save</button>
              </div>
            </div>
          </div>
        </div>
      </div>`;
  }

  async #bindEvents() {
    const self = this;

    await this.refreshClientsList();

    $("#addBtn").on("click", () => {
      this.resetModal();
      const modal = new bootstrap.Modal(document.getElementById("clientModal"));
      modal.show();
    });

    $(document).on("click", ".edit-client-btn", function () {
      const client = JSON.parse($(this).attr("data-client").replace(/&apos;/g, "'"));
      $("#client-id").val(client.id);
      $("#client-code").val(client.code).prop("disabled", true);
      $("#client-name").val(client.name);
      $("#client-contact").val(client.contact_no);
      $("#client-address").val(client.address);
      $("#client-status").val(client.is_active);
      $("#client_type").val(client.client_type);
      $("#clientModalLabel").text("Edit Client");

      const modal = new bootstrap.Modal(document.getElementById("clientModal"));
      modal.show();
    });

    $("#clientItemsPerPage").on("change", async (e) => {
      this.limit = parseInt(e.target.value) || 10;
      this.currentPage = 1;
      await this.refreshClientsList($("#clientSearchInput").val());
    });

    $("#clientSearchInput").on("input", async (e) => {
      const query = e.target.value;
      await this.refreshClientsList(query, 1);
    });

    $("#saveClientBtn").on("click", async () => {
      const id = $("#client-id").val();
      const code = $("#client-code").val();
      const name = $("#client-name").val();
      const contact_no = $("#client-contact").val();
      const address = $("#client-address").val();
      const is_active = parseInt($("#client-status").val());
      const client_type = $("#client_type").val();

      if (!code || !name || !contact_no || !client_type) {
        return Toast.fire({ icon: "warning", title: "Please fill all required fields." });
      }

      const payload = { code, name, contact_no, address, is_active, client_type };
      const url = id === "0" ? apiRoutes.clients.create : apiRoutes.clients.update(id);

      const response = await this.#services(payload, url, "POST", "Saving Client...");
      if (response?.status_code === 200) {
        Toast.fire({ icon: "success", title: "Client saved successfully!" });
        bootstrap.Modal.getInstance(document.getElementById("clientModal"))?.hide();
        await self.refreshClientsList($("#clientSearchInput").val(), this.currentPage);
      }
    });

    document.getElementById("clientModal").addEventListener("hidden.bs.modal", () => this.resetModal());
  }

  render() {
    return this.#template();
  }

  async afterRender() {
    await this.#bindEvents();
  }
}

const clientsPage = new Clients();
export { clientsPage };
