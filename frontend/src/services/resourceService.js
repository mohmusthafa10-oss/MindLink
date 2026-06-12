import api from "./api";

const resourceService = {
    // Get all resources
    getAll: async (category = "") => {
        const query = category ? `?category=${category}` : "";
        const response = await api.get(`/resources/${query}`);
        return response.data;
    },

    // Add a resource (Admin)
    add: async (resourceData) => {
        const response = await api.post("/resources/", resourceData);
        return response.data;
    },

    // Delete a resource
    delete: async (id) => {
        const response = await api.delete(`/resources/${id}`);
        return response.data;
    },
};

export default resourceService;
