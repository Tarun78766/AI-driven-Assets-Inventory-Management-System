import axios from "axios";
import { APIRoutes } from "../../../API/APIRoutes";

export const getIndividualLaptops = async (page, limit, filters = {}) => {
  try {
    const response = await axios.get(`${APIRoutes.INDIVIDUAL_LAPTOP_API}`, {
      params: { page, limit, ...filters },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching Individual laptops:", error);
    throw error;
  }
};

export const addIndividualLaptop = async (data) => {
  try {
    const response = await axios.post(`${APIRoutes.INDIVIDUAL_LAPTOP_API}`, data);
    return response.data;
  } catch (error) {
    console.error("Error adding individual laptop:", error);
    throw error;
  }
};

export const updateIndividualLaptop = async (id, data) => {
  try {
    const response = await axios.put(`${APIRoutes.INDIVIDUAL_LAPTOP_API}/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating individual laptop:", error);
    throw error;
  }
};  

export const deleteIndividualLaptop = async (id) => {
  try {
    const response = await axios.delete(`${APIRoutes.INDIVIDUAL_LAPTOP_API}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting individual laptop:", error);
    throw error;
  }
};
