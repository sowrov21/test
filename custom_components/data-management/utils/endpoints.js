//Development
//export const endpoint = "http://127.0.0.1:8000/api/v1/";
//Production
//export const endpoint = "https://visionapi.xpertcapture.com/api/v1/";
const domain = import.meta.env.VITE_ENDPOINT;
const apiRoutes = {
    auth: {
        genrateSASToken: "auth/genrateSASToken",
    },
    clients: {
        list: "clients/getClients",
        create: "clients/create",
        update: (id) => `clients/updateClient/${id}`,
        dropdown: "clients/getClientSelectList",
    },
    image_batches: {
        list: "image_batches/getImageBatches",
        create: "image_batches/create",
        update: (id) => `image_batches/updateImageBatch?${id}`,
    },
    products: {
        list: "products/getProducts",
        create: "products/create",
        update: (id) => `products/updateProduct/${id}`,
        bulkCreate: "products/uploadProductFromFile",
    },
    users: {
        list: "users/getAllUsers",
        create: "users/create",
        update: "users/update",
        reset_pw: "users/resetPassword",
        toggleStatus: (id) => `users/toggleIsActive/${id}`,
    }
    // Add more as needed...
};
export { domain, apiRoutes };