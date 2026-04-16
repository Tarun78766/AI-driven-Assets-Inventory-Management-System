import axios from "axios";
import { APIRoutes } from "../../API/APIRoutes";
const BASE_URL = import.meta.env.VITE_API_URL;

export const registerUser = async (userData) => {
  try {
    const response = await axios.post (`${BASE_URL}${APIRoutes.REGISTER}`, userData);
    return response.data;
  } catch (error) {
    console.error("Error registering user:", error);
    throw error;
  }
};