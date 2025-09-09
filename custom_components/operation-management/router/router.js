import { loginPage } from "../pages/login";
import dynamicRoute from "../utils/dynamicRoute";
import { dashboardPage } from "../pages/dashboard";
import { createTasksPage } from "../pages/create_task";
import { editTasksPage } from "../pages/edit_task";
import { tasksPage } from "../pages/tasks";
import { notFoundPage } from "../pages/not_found";
import { forbiddenPage } from "../pages/forbidden";
import { getToken, getCurrentUser } from "../utils/userSession";

const parseUrl = (url) => {
  const [path, queryString] = url.split("?");
  const queryParams = Object.fromEntries(new URLSearchParams(queryString));
  return { path, queryParams };
};

const router = () => {
  const url = window.location.hash.replace(/^#/, "") || "/";
  const { path, queryParams } = parseUrl(url);
  console.log("path========> ",path)
  console.log("params=====> ",queryParams)
  const token = getToken();
  const currentUser = getCurrentUser();
  const userType = currentUser?._ut;

  if (token && currentUser) {
    // Redirect root or fallback to dashboard
    if (url === "/" || url === "/data_management") {
      window.location.hash = "#/dashboard"; // Let hashchange handle the rest
      return;
    }
    // USER_TYPE_SUPER_ADMIN=0, USER_TYPE_XPERT_USER=1, USER_TYPE_CLIENT_USER=2, USER_TYPE_LABELLER=3, USER_TYPE_LABEL_MANAGER=4
    const routes = {
      "/dashboard": { page: dashboardPage, allowed: [0, 1, 2, 3, 4] },
      "/tasks": { page: tasksPage, allowed: [0, 1, 2, 3, 4] },
      "/create_tasks": { page: createTasksPage, allowed: [0, 1, 2, 4] },
      "/edit_tasks": { page: editTasksPage, allowed: [0, 1, 2, 4] },
    };

    //const route = routes[url];
    console.log(url);
    const route = routes[path];
    if (route) {
      const { page, allowed } = route;
      if (allowed.includes(userType)) {
        dynamicRoute(page,queryParams);
      } else {
        dynamicRoute(forbiddenPage);
      }
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

