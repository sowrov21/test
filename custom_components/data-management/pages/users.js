import { apiRoutes } from "../utils/endpoints";
import { APIClient } from "../utils/fetch";
import { Toast, Alert } from "../utils/toastHelper";
import { getCurrentUser } from "../utils/userSession";

let _clientsSelectList = [];

class Users {
  constructor() {
    this.currentPage = 1;       // pagination state
    this.limit = 10;
    this.totalItems = 0;
  }

  async #services(payload = {}, url, type, message = "") {
    const token = localStorage.getItem("token");
    if (!token) {
      Alert.warning("Token not found. Please login again.");
      return;
    }
    Loader.show(message || "Please wait. Loading...");
    try {
      const data = await APIClient(url, payload, type, token);
      if (data && data.status_code === 200 && data.data) {
        return data;
      } else {
        console.error("Unexpected API response:", data);
        Alert.error(data?.detail || "Unexpected error.");
      }
    } catch (err) {
      console.error("API Error:", err);
      Alert.error("Request failed: " + err);
    } finally {
      Loader.hide();
    }
  }

  getUsertTypeOption(userType) {
    let options = "";
    //for sa and xp
    if (userType === 0 || userType === 1) {
      options += `
      <option value="1">Xpert User</option>
      <option value="2">Client User</option>
      <option value="3">Labeller</option>
      <option value="4">Labeller Manager</option>
      `;
    } else if (userType === 2) {
      options += `
      <option value="3">Labeller</option>
      <option value="4">Labeller Manager</option>`;
    }
    return options;
  }
  #template(userType, currentUser) {
    const options = this.getUsertTypeOption(userType);
    return `
      <div class="container py-4">
        <div class="card shadow-sm" style="display:none">
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
            <h5 class="mb-0">Users List</h5>
            <button class="btn btn-success btn-sm" id="addBtn">
              <i class="bi bi-plus me-1"></i> Add New
            </button>
          </div>
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-striped table-hover mb-0">
                <thead class="table-light">
                  <tr>
                    <th>#Sl</th><th>Name</th><th>User Name</th>
                    <th>Mobile</th><th>Email</th><th>Status</th>
                    <th>User Type</th><th>Action</th>
                  </tr>
                </thead>
                <tbody id="clients">
                  <tr class="text-center"><td colspan="8">No Data Found</td></tr>
                </tbody>
              </table>
            </div>
            <nav class="mt-3">
              <ul class="pagination justify-content-center mb-0" id="paginationContainer"></ul>
            </nav>
          </div>
        </div>

        <!-- Modal -->
        <div class="modal fade" id="userModal" tabindex="-1" aria-labelledby="userModalLabel" aria-hidden="true">
          <div class="modal-dialog modal-lg">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="userModalLabel">Add New User</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <div class="modal-body">
                <form id="editUserForm">
                  <input type="hidden" id="id" value="0">
                  <div class="row mb-3">
                    <div class="col-6">
                      <label class="form-label">User Name *</label>
                      <input type="text" class="form-control" id="username">
                    </div>
                    <div class="col-6">
                      <label class="form-label">Full Name</label>
                      <input type="text" class="form-control" id="full_name">
                    </div>
                  </div>
                  <div class="row mb-3">
                    <div class="col-6">
                      <label class="form-label">Email</label>
                      <input type="email" class="form-control" id="email">
                    </div>
                    <div class="col-6">
                      <label class="form-label">Contact No *</label>
                      <input type="number" class="form-control" id="mobile">
                    </div>
                  </div>
                  <div class="row mb-3">
                    <div class="col-6">
                      <label class="form-label">Status</label>
                      <select class="form-select" id="is_active">
                        <option value="1">Active</option>
                        <option value="0">Inactive</option>
                      </select>
                    </div>
                    <div class="col-6">
                      <label class="form-label">Choose Client*</label>
                      <select class="form-select" id="client_id">
                      </select>
                    </div>
                  </div>
                  <div class="row mb-3 passwordDiv">
                    <div class="col-6">
                      <label class="form-label">Password*</label>
                      <input type="password" class="form-control" id="password">
                    </div>
                    <div class="col-6">
                      <label class="form-label">Confirm Password*</label>
                      <input type="password" class="form-control" id="confirm_password">
                    </div>
                  </div>
                  <div class="row mb-3">
                    <div class="col-6">
                      <label class="form-label">User Type *</label>
                      <select class="form-select" id="userTypeSelect">
                        ${options}
                      </select>
                    </div>
                  </div>
                </form>
              </div>
              <div class="modal-footer">
                <button class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                <button class="btn btn-primary" id="saveClientBtn">Save changes</button>
              </div>
            </div>
          </div>
        </div>
      </div>`;
  }

  async generateClientSelectList() {
    const response = await this.#services({}, apiRoutes.clients.dropdown, "POST");
    _clientsSelectList = response?.data || [];
    console.log('users _clientsSelectList',_clientsSelectList);
    if (_clientsSelectList.length > 1) {
      $("#client_id").empty().append(`<option value="">select a client</option>`);
    }
    _clientsSelectList.forEach(c => {
      $("#client_id,#f_client_id").append(`<option value="${c.id}">${c.name}</option>`);
    });
  }

  async refreshUsersList(page = 1) {
    this.currentPage = page;
    const skip = (page - 1) * this.limit;
    const payload = { skip, limit: this.limit };
    const response = await this.#services(payload, apiRoutes.users.list, "POST");
    const data = response?.data;

    const usersList = Array.isArray(data?.items) ? data.items : data;
    this.totalItems = data?.total ?? usersList.length;
    const user_role = {
          0:"Super Admin",
          1:"Xpert user",
          2:"Company User(client)",
          3:"Labeller",
          4:"Label Manager"
      }
    let rows = "";
    if (usersList.length) {
      usersList.forEach((item, i) => {
        const idx = skip + i + 1;
        const status = item.is_active == 1 ? "<span class='active_status'>Active</span>" : "<span class='inactive_status'>Inactive</span>";
        const btnText = item.is_active == 1 ? "Deactivate" : "Activate";
        const btnClass = item.is_active == 1 ? "btn-warning" : "btn-success";
        const btnTitle = item.is_active == 1 ? "Click to Deactivate User" : "Click to Activate User";
        rows += `
          <tr>
            <td>${idx}</td>
            <td>${item.full_name}</td>
            <td>${item.username}</td>
            <td>${item.mobile}</td>
            <td>${item.email}</td>
            <td>${status}</td>
            <td>${user_role[item.user_type]}</td>
            <td>
              <button class="btn btn-sm btn-primary edit-user-btn" data-user='${JSON.stringify(item)}' title="Click to Edit User">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn btn-sm btn-secondary reset-pw-btn" data-id="${item.id}" title="Reset Password">
                <i class="fas fa-key"></i>
              </button>
              <button class="btn btn-sm ${btnClass} deactivate-btn" data-id="${item.id}" title="${btnTitle}" data-currstats = "${item.is_active}">
                ${btnText}
              </button>
            </td>
          </tr>`;
      });
    } else {
      rows = `<tr class="text-center"><td colspan="8">No Data Found</td></tr>`;
    }
    $("#clients").html(rows);
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

    container.find("a.page-link").on("click", e => {
      e.preventDefault();
      const page = parseInt($(e.currentTarget).data("page"));
      if (!isNaN(page) && page !== this.currentPage) {
        this.refreshUsersList(page);
      }
    });
  }

  async #bindEvents() {
    await this.generateClientSelectList();
    await this.refreshUsersList(1);

    $("#addBtn").on("click", () => {
      const modal = new bootstrap.Modal(document.getElementById("userModal"));
      modal.show();
    });

    $(document).on("click", ".edit-user-btn", (e) => {
      const userStr = e.currentTarget.dataset.user; // This is a string
      const user = JSON.parse(userStr);
      $("#id").val(user.id);
      $("#username").val(user.username).attr("disabled", true);
      $("#full_name").val(user.full_name);
      $("#email").val(user.email);
      $("#mobile").val(user.mobile);
      $("#is_active").val(user.is_active);
      $("#client_id").val(user.client_id);
      $("#userTypeSelect").val(user.user_type);
      $(".passwordDiv").hide();
      $("#userModalLabel").text("Edit User");
      $("#saveClientBtn").text("Update");
      $("#userModal").modal("show");
    });

    $(document).on("click", ".reset-pw-btn", (e) => {
      const userId = $(e.currentTarget).data("id");
      Alert.confirm("Are you sure you want to reset the password?", "Reset Password")
        .then(async result => {
          if (result) {
            const resp = await this.#services({ user_id: userId }, apiRoutes.users.reset_pw, "POST");
            if (resp?.status_code === 200) {
              Toast.fire({ icon: "success", title: resp.message || "Password reset successfully" });
            }
          }
        });
    });

    $(document).on("click", ".deactivate-btn", (e) => {
      const userId = $(e.currentTarget).data("id");
      const currstats = $(e.currentTarget).data("currstats");
      const msg = currstats && currstats == 1 || currstats == "1" ? "Deactivate" : "Activate";
      Alert.confirm("Are you sure you want to " + msg + " this user?", msg + " User")
        .then(async result => {
          if (result) {
            const resp = await this.#services({}, apiRoutes.users.toggleStatus(userId), "POST");
            if (resp?.status_code === 200) {
              Toast.fire({ icon: "success", title: resp.message || "User updated successfully" });
              await this.refreshUsersList(this.currentPage);
            }
          }
        });
    });

    $("#saveClientBtn").on("click", async () => {
      const id = $("#id").val();
      const username = $("#username").val();
      const full_name = $("#full_name").val();
      const email = $("#email").val();
      const mobile = $("#mobile").val();
      const is_active = $("#is_active").val();
      const client_id = $("#client_id").val();
      const password = $("#password").val();
      const confirm_password = $("#confirm_password").val();
      const user_type = $("#userTypeSelect").val();

      if (!username) return Toast.fire({ icon: "warning", title: "Enter UserName" }) && $("#username").trigger("focus");
      if (/\s/.test(username)) return Toast.fire({ icon: "warning", title: "UserName can not have space" }) && $("#username").trigger("focus");

      if (!mobile) return Toast.fire({ icon: "warning", title: "Enter Contact No" }) && $("#mobile").trigger("focus");
      if (!client_id) return Toast.fire({ icon: "warning", title: "Choose a client" }) && $("#client_id").trigger("focus");
      if (!user_type) return Toast.fire({ icon: "warning", title: "Choose User Type" }) && $("#userTypeSelect").trigger("focus");
      if (id === "0") {
        if (!password) return Toast.fire({ icon: "warning", title: "Enter Password" }) && $("#password").trigger("focus");
        if (!confirm_password) return Toast.fire({ icon: "warning", title: "Enter Confirm Password" }) && $("#confirm_password").trigger("focus");
        if (password !== confirm_password) return Toast.fire({ icon: "warning", title: "Passwords do not match" });
      }

      const formData = { id, username, full_name, email, mobile, is_active, client_id, password, user_type };
      const url = id === "0" ? apiRoutes.users.create : apiRoutes.users.update;
      const resp = await this.#services(formData, url, "POST");
      if (resp?.status_code === 200) {
        await this.refreshUsersList(this.currentPage);
        Toast.fire({ icon: "success", title: resp.message || "Saved successfully" });
        $("#userModal").modal("hide");
      }
    });

    document.getElementById("userModal").addEventListener("hidden.bs.modal", () => {
      $("#id").val("0");
      $("#username").val("").attr("disabled", false);
      $("#full_name").val("");
      $("#email").val("");
      $("#mobile").val("");
      $("#is_active").val("1");
      $("#client_id").val("");
      $("#password").val("");
      $("#confirm_password").val("");
      $("#userTypeSelect").val("1");
      $("#userModalLabel").text("Add New User");
      $("#saveClientBtn").text("Save");
      $(".passwordDiv").show();
    });
  }

  render() {
    //return this.#template();
    const currentUser = getCurrentUser();
    const userType = currentUser?.user_type ?? null;
    return this.#template(userType, currentUser);
  }

  async afterRender() {
    await this.#bindEvents();
  }
}

const usersPage = new Users();
export { usersPage };
