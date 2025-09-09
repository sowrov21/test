const domain = import.meta.env.VITE_ENDPOINT;
const apiRoutes = {
    clients: {
        dropdown: "clients/getClientSelectList",
    },
    image_batches: {
        dropdown: (searchTerm, clientId) => `image_batches/getImageBatchSelectList/${encodeURIComponent(searchTerm)}?client_id=${clientId}`,
    },
    users: {
        dropdownWithSearch: (queryString, clientId) => `users/getUserSelectList/${encodeURIComponent(queryString)}?client_id=${clientId}`,
    },
    tasks: {
        create: "tasks/create",
        update: (id) => `tasks/updateTask/${id}`,
        withItems: (taskId) => `tasks/getTaskWithItems/${encodeURIComponent(parseInt(taskId))}`,
    }
    // Add more...
};
export { domain, apiRoutes };