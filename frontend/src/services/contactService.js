import api from "./api";

const contactService = {
    // Get user contacts
    getAll: async () => {
        const response = await api.get("/contacts/");
        return response.data;
    },

    // Add a contact
    add: async (contactData) => {
        const response = await api.post("/contacts/", contactData);
        return response.data;
    },

    // Delete a contact
    delete: async (id) => {
        const response = await api.delete(`/contacts/${id}`);
        return response.data;
    },
};

export default contactService;
