import axios from "../../config/Axiosconfig";
import { APIRoutes } from "../../API/APIRoutes";



export const getLaptopModels = async (page, limit, search = "", statusFilter = "") => {
  try {
    const response = await axios.get(`${APIRoutes.LAPTOP_MODEL_API}`, {
      
      params: { page, limit, ...(search && { search }), ...(statusFilter && { statusFilter }) },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching laptop models:", error);
    throw error;
  }
};

export const addLaptopModel = async (modelData) => {
  try {
    const response = await axios.post(
      `${APIRoutes.LAPTOP_MODEL_API}`,
      modelData,
      
    );
    return response.data;
  } catch (error) {
    console.error("Error adding laptop model:", error);
    throw error;
  }
};

export const updateLaptopModel = async (id, modelData) => {
  try {
    const response = await axios.put(
      `${APIRoutes.LAPTOP_MODEL_API}/${id}`,
      modelData,
      
    );
    return response.data;
  } catch (error) {
    console.error("Error updating laptop model:", error);
    throw error;
  }
};

export const deleteLaptopModel = async (id) => {
  try {
    const response = await axios.delete(`${APIRoutes.LAPTOP_MODEL_API}/${id}`, );
    return response.data;
  } catch (error) {
    console.error("Error deleting laptop model:", error);
    throw error;
  }
};
