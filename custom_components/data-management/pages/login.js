import brain from "../public/img/brain.jpg";
import { APIClient } from "../utils/fetch";
import { jwtDecode } from "jwt-decode";

class Login {
	constructor() {}
	async #services(payload) {
		Loader.show("Login in ...");

		try {
			const res = await APIClient("auth/login", payload, "POST", token);
			if (res.status_code === 200) {
				//console.log(res.message);
				var token = res.data.token.access_token;
				var rf_token = res.data.token.refresh_token;
				//localStorage.setItem("token", res.token);
				var decode = jwtDecode(token);
				localStorage.setItem("token", token);
				localStorage.setItem("rf_token", rf_token);
				localStorage.setItem("_cu", JSON.stringify(res.data));
				const expired = jwtDecode(data.token)?.exp || 0;
				localStorage.setItem("expired", expired.toString());
				window.location.pathname = "dashboard";
			} else {
				console.error("API returned:", res);
			}
		} catch (err) {
			console.error("API error:", err);
		} finally {
			Loader.hide();
		}
	}
	#template() {
		return `
        <section class="vh-100">
          <div class="container-fluid h-custom">
            <div class="row d-flex justify-content-center align-items-center h-100">
              <div class="col-md-9 col-lg-6 col-xl-3">
                <img src="${brain}"
                  class="img-fluid" alt="Sample image">
              </div>
              <div class="col-md-8 col-lg-6 col-xl-4 offset-xl-1">
                <form>

                  <div class="divider d-flex align-items-center my-4">
                    <p class="text-center fw-bold mx-3 mb-0">Login - Systems</p>
                  </div>

                  <!-- Email input -->
                  <div class="form-outline mb-4">
                    <input type="email"  id="email" class="form-control form-control-lg"
                      placeholder="Enter Username" />
                    
                  </div>

                  <!-- Password input -->
                  <div class="form-outline mb-3">
                    <input type="password" id="password" class="form-control form-control-lg"
                      placeholder="Enter password" />
                    
                  </div>

        

                  <div class="text-center text-lg-start mt-4 pt-2">
                    <button type="button" id="confirm" class="btn btn-primary btn-lg"
                      style="padding-left: 2.5rem; padding-right: 2.5rem;">Login</button>
                    
                  </div>
                </form>
              </div>
            </div>
          </div>
          
        </section>
    `;
	}

	// #handlePayload() {
	async #bindEvents() {
		//window.addEventListener("DOMContentLoaded", (event) => {
		const email = document.getElementById("email");
		const password = document.getElementById("password");
		const confirm = document.getElementById("confirm");
		confirm.addEventListener("click", async () => {
			const payload = {
				//email: email.value,
				username: email.value,
				password: password.value,
			};
			await this.#services(payload);
		});
		//});
	}

	render() {
		//this.#handlePayload();

		return this.#template();
	}
	async afterRender() {
		await this.#bindEvents(); // event binding logic only
	}
}

const loginPage = new Login();
export { loginPage };
