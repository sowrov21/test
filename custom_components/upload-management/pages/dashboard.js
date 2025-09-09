import { APIClient } from "../utils/fetch";
import { getToken, getCurrentUser } from "../utils/userSession";

class Dashboard {
  constructor() {}
  #services(payload) {
    APIClient("login", payload, "POST")
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        console.log(data.message);
      });
  }
  #template(cu = {}) {
       const user_role = {
          0:"Super Admin",
          1:"Xpert user",
          2:"Company User(client)",
          3:"Labeller",
          4:"Label Manager"
      }
      
    return `<div class="layout_template">
      <div class="card shadow-sm mb-4 welcome-card mt-2">
      <div class="card-body d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center">
        <div>
          <h4 class="card-title mb-1">Welcome, <span class="text-primary">${cu._fn || "Unknown"}</span></h4>
          <p class="mb-0 text-muted">You have logged in as <strong>${user_role[cu._ut] || "Unknown"}</strong></p>
        </div>
        <div class="mt-3 mt-md-0">
          <ul class="list-group list-group-flush">
            <li class="list-group-item px-0 py-1"><strong>User:</strong> ${cu._un || "Unknown"}</li>
            <li class="list-group-item px-0 py-1"><strong>Type:</strong> ${user_role[cu._ut] || "Unknown"}</li>
          </ul>
        </div>
      </div>
  </div>
    </div>`;
  }


  #bindEvents() {
    window.addEventListener("DOMContentLoaded", (event) => {});
  }

  render() {
    const cu = getCurrentUser();
    return this.#template(cu);
  }

  afterRender() {
    this.#bindEvents(); // event binding logic only
  }
}

const dashboardPage = new Dashboard();
export { dashboardPage };
