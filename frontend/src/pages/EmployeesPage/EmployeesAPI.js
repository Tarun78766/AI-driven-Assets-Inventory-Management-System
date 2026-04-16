import axios from "../../config/Axiosconfig";
import { APIRoutes } from "../../API/APIRoutes";
const BASE_URL = import.meta.env.VITE_API_URL;

export const addEmployee = async (employeeData) => {
  try {
    const response = await axios.post(
      `${APIRoutes.EMPLOYEE_API}`,
      employeeData,
      
    );
    return response.data;
  } catch (error) {
    console.error("Error adding employee:", error);
    throw error;
  }
};

export const getEmployees = async (page, limit, search = "", status = "") => {
  try {
    const response = await axios.get(`${APIRoutes.EMPLOYEE_API}`, {
      
      params: {
        page,
        limit,
        ...(search && { search }),
        ...(status && status !== "All" && { status }),
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error getting employee:", error);
    throw error;
  }
};

export const deleteEmployee = async (id) => {
  try {
    
    const response = await axios.delete(
      `${APIRoutes.EMPLOYEE_API}/${id}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting employee:", error);
    throw error;
  }
};

export const updateEmployee = async (id, updateData) => {
  try {
    const response = await axios.put(
      `${APIRoutes.EMPLOYEE_API}/${id}`,
      updateData,
      {
        headers: { Authorization: `Bearer ${token}` },
        
      },
    );
    return response.data;
  }catch (error) {
    console.error("Error updating employee:", error);
    throw error;
  }
}
