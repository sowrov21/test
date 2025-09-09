import { loginPage } from "../pages/login";
import dynamicRoute from "../utils/dynamicRoute";
import { dashboardPage } from "../pages/dashboard";
import { clientsPage } from "../pages/clients";
import { usersPage } from "../pages/users";
import { productsPage } from "../pages/products";
import { imageBatchPage } from "../pages/image_batch";
import { notFoundPage } from "../pages/not_found";
import { forbiddenPage } from "../pages/forbidden";
import { getToken, getCurrentUser } from "../utils/userSession";

const setActiveLink = () => {
    const links = document.querySelectorAll('.nav-link');
    links.forEach(link => {
      if (link.getAttribute('href') === window.location.hash) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  };
const router = () => {
  const url = window.location.hash.replace(/^#/, "") || "/";
  const token = getToken();
  const currentUser = getCurrentUser();
  const userType = currentUser?._ut;

  if (token && currentUser) {
    // Redirect root or fallback to dashboard
    if (url === "/" || url === "/data_management") {
      window.location.hash = "#/dashboard"; // Let hashchange handle the rest
      return;
    }
  //     // USER_TYPE_SUPER_ADMIN=0, USER_TYPE_XPERT_USER=1, USER_TYPE_CLIENT_USER=2, USER_TYPE_LABELLER=3, USER_TYPE_LABEL_MANAGER=4
    const routes = {
      "/dashboard": { page: dashboardPage, allowed: [0, 1, 2, 3, 4] },
      "/clients": { page: clientsPage, allowed: [0, 1] },
      "/users": { page: usersPage, allowed: [0, 1, 2] },
      "/products": { page: productsPage, allowed: [0, 1, 2] },
      "/image_batch": { page: imageBatchPage, allowed: [0, 1, 2] },
    };

    const route = routes[url];
    if (route) {
      const { page, allowed } = route;
      if (allowed.includes(userType)) {
        dynamicRoute(page);
      } else {
        dynamicRoute(forbiddenPage);
      }
      setActiveLink(); // Update active link on route change
    } else {
      dynamicRoute(notFoundPage);
    }
  } else {
    window.location.hash = "#/login"; // triggers login page load
  }
};

// Hash change or initial load triggers router
window.addEventListener("hashchange", router);
window.addEventListener("load", router);

export default router;


//======== without hash router ===========
// const router = () => {
// 	const url = window.location.pathname;
// 	const token = getToken();
// 	const currentUser = getCurrentUser();
// 	const userType = currentUser?.user_type;

// 	if (token && currentUser) {
// 		if (url === "/" || url == "/data_management") {
// 			//window.history.replaceState({}, "", "/dashboard");
// 			dynamicRoute(dashboardPage);
// 			return;
// 		}
// 		// Route map with user type permissions

// 		const routes = {
// 			"/dashboard": { page: dashboardPage, allowed: [0, 1, 2, 3, 4] }, // all roles
// 			"/clients": { page: clientsPage, allowed: [0, 1] }, // super admin, xpert user
// 			"/users": { page: usersPage, allowed: [0, 1] },
// 			"/products": { page: productsPage, allowed: [0, 1, 2] },
// 			"/images": { page: imagesPage, allowed: [0, 1, 2] },
// 			"/tasks": { page: tasksPage, allowed: [0, 1, 3, 4] }, // exclude client users
// 			"/create_tasks": { page: createTasksPage, allowed: [0, 1, 4] }, // exclude labellers
// 			// Add more routes here...
// 		};

// 		const route = routes[url];
// 		if (route) {
// 			const { page, allowed } = route;
// 			if (allowed.includes(userType)) {
// 				dynamicRoute(page);
// 			} else {
// 				// Forbidden:
// 				dynamicRoute(forbiddenPage);
// 			}
// 		} else {
// 			dynamicRoute(notFoundPage);
// 		}
// 	} else {
// 		// Not authenticated → show login page
// 		window.history.replaceState({}, "", "/login");
// 		dynamicRoute(loginPage);
// 		document.querySelector("#app").innerHTML = `
//       <div>
//         ${loginPage.render()}
//       </div>
//     `;
// 	}
// };
// export default router;

//=========== Old router code ===========
// const router = () => {
// 	const url = window.location.pathname;
// 	const token = getToken();
// 	const currentUser = getCurrentUser();

// 	//If user is authenticated
// 	if (token && currentUser) {
// 		// Handle redirection from `/` or `/login` to `/dashboard`
// 		if (url === "/" || url === "/login") {
// 			window.history.replaceState({}, "", "/dashboard");
// 			dynamicRoute(dashboardPage);
// 			return;
// 		}

// 		//Route map
// 		const routes = {
// 			"/dashboard": dashboardPage,
// 			"/clients": clientsPage,
// 			"/users": usersPage,
// 			"/products": productsPage,
// 			"/images": imagesPage,
// 			"/tasks": tasksPage,
// 			"/create_tasks": createTasksPage,
// 			// Add more routes here...
// 		};

// 		// Render matched route or fallback
// 		if (routes[url]) {
// 			dynamicRoute(routes[url]);
// 		} else {
// 			// Unknown path → fallback to show 404
// 			dynamicRoute(notFoundPage);
// 		}
// 	} else {
// 		//Not authenticated → show login page
// 		window.history.replaceState({}, "", "/login");
// 		dynamicRoute(loginPage);
// 		document.querySelector("#app").innerHTML = `
//       <div>
//         ${loginPage.render()}
//       </div>
//     `;
// 	}
// };

// export default router;
