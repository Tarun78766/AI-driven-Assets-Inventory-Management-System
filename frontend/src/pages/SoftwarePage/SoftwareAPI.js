import axios from '../../config/Axiosconfig';

export const getSoftwares = async (page = 1, limit = 10, search = "", catFilter = "All", statusFilter = "All") => {
    try {
        const params = new URLSearchParams({ page, limit });
        if (search && search.trim() !== "") params.append("search", search);
        if (catFilter !== "All") params.append("category", catFilter);
        if (statusFilter !== "All") params.append("status", statusFilter);

        const response = await axios.get(`software?${params.toString()}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const addSoftware = async (formData) => {
    try {
        const response = await axios.post(`software`, formData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const updateSoftware = async (id, formData) => {
    try {
        const response = await axios.put(`software/${id}`, formData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteSoftware = async (id) => {
    try {
        const response = await axios.delete(`software/${id}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};