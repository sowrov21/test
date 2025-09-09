import profile from "../public/img/profile.gif";
import { getCurrentUser } from "../utils/userSession";

class Nav {
	constructor() {}

	#getMenuItems(userType) {
		let menu = `
      <li class="nav-item">
        <a class="nav-link active" aria-current="page" href="#/dashboard">Dashboard</a>
      </li>
     <li class="nav-item dropdown">
          <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
            Images
          </a>
          <ul class="dropdown-menu" aria-labelledby="navbarDropdown">
            <li><a class="dropdown-item" href="#/upload_image">Upload New Image</a></li>
            <li><a class="dropdown-item" href="#/images">All Images</a></li>
          </ul>
        </li>
      `;

		return menu;
	}

	#getProfileDropdown(currentUser) {
		const userName = currentUser?._un ?? "User";

		return `
      <ul class="navbar-nav ms-auto mb-2 mb-lg-0">
        <li class="nav-item dropdown">
          <a class="nav-link dropdown-toggle" href="#" id="navbarDropdownMenuLink" role="button" data-bs-toggle="dropdown" aria-expanded="false">
            <img src="${profile}" alt="Profile" width="30" height="30" class="rounded-circle me-1">
            ${userName}
          </a>
          <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdownMenuLink">
            <li><a class="dropdown-item" href="#">Settings</a></li>
          </ul>
        </li>
      </ul>`;
	}

	#template(userType, currentUser) {
		const menuItems = this.#getMenuItems(userType);
		const profileDropdown = this.#getProfileDropdown(currentUser);

		return `
      <nav class="navbar navbar-expand-lg bg-light">
        <div class="container-fluid">
          <a class="navbar-brand" href="#/dashboard">Upload Management</a>
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent">
            <span class="navbar-toggler-icon"></span>
          </button>

          <div class="collapse navbar-collapse" id="navbarSupportedContent">
            <ul class="navbar-nav me-auto mb-2 mb-lg-0">
              ${menuItems}
            </ul>
            ${profileDropdown}
          </div>
        </div>
      </nav>`;
	}

	render() {
		const currentUser = getCurrentUser();
		const userType = currentUser?._ut ?? null;
		return this.#template(userType, currentUser);
	}
}

const nav = new Nav();
export { nav };
