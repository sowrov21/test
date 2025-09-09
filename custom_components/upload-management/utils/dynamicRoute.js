import { nav } from "../components/nav";
import { footer } from "../components/footer";
// export default dynamicRoute;
const dynamicRoute = (pageInstance,params = {}) => {
  const template = pageInstance.render(params); // get HTML
  document.querySelector("#app").innerHTML = `
   ${nav.render()}${template}${footer.render()}
  `;
  setTimeout(() => {
    pageInstance.afterRender(); // call events after DOM appended
  }, 50);
};

export default dynamicRoute;

//===== old ====

// const dynamicRoute = (template) => {
//   return (document.querySelector("#app").innerHTML = `
//       <div>
//        ${nav.render()}${template}${footer.render()}
//       </div>
//     `);
// };

