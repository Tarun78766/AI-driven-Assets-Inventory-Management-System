import axios from "../../config/Axiosconfig";
import { APIRoutes } from "../../API/APIRoutes";

export const getMyAssets = async () => {
  const response = await axios.get(`${APIRoutes.EMPLOYEE_ASSETS_API}/my`);
  return response.data;
};
