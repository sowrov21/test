import { APIClient } from "../utils/fetch";
import { getCurrentUser } from "../utils/userSession";

class Images {
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


  #template() {
    return `
      <div class="container py-4">
        <div class="card shadow-sm">
          <div class="card-header bg-white d-flex justify-content-between">
            <h5 class="mb-0">Images List</h5>
          </div>
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-striped table-hover mb-0">
                <thead class="table-light">
                  <tr>
                    <th>#</th>
                    <th>batch_no</th>
                    <th>Image</th>
                    <th>has_labeled</th>
                  </tr>
                </thead>
                <tbody id="images">
                  <tr class="text-center"><td colspan="5">No Data Found</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
    `;
  }

  async #generateUserList() {

    
    let add_edit = false;
    const currentUser = getCurrentUser();
    let userType = currentUser?._ut ?? "";
    if(userType == 0 || userType == 1 || userType == 2)
    {
      add_edit = true;
    }
    const payload = {
      skip: 0,
      limit: 20
    };
    var response = await this.#services(payload, "images/getImages", "POST");
    let imagesList = response.data.items;


    if (imagesList && imagesList.length > 0) {
      let rows = '';
      imagesList.forEach((item, i) => {
        rows += `
          <tr>
            <td>${i + 1}</td>
            <td>${item.batch_no}</td>
            <td><img src="${item.image_url}" alt="${item.image_url}" style="height: 60px; width: 60px;"/></td>
            <td>${item.has_labeled === 1 ? "Yes" : "No"}</td>
           
          </tr>
        `;
      });
       /*<td>
            ${add_edit ? '<a class="btn btn-sm btn-primary" href="#/edit_image?batch_id='+item.batch_id+'">Edit</a>':''}
        </td>*/
      $("#images").empty().append(rows);
    }
  }
  async #bindEvents() {
    await this.#generateUserList();

  }

  render() {
    return this.#template();
  }

  async afterRender() {
    await this.#bindEvents();
  }
}

const imagesPage = new Images();
export { imagesPage };
