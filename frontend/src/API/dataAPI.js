import axios from "../config/Axiosconfig";
import { APIRoutes } from "./APIRoutes";

export const getEmployees = async () => {
  const res = await axios.get(APIRoutes.EMPLOYEE_API);
  return res.data.data.data;
};
export const getLaptopModels = async () => {
  const res = await axios.get(`${APIRoutes.LAPTOP_MODEL_API}`);
  return res.data.data.data;
};

export const getAvailableLaptops = async () => {
  const res = await axios.get(`${APIRoutes.INDIVIDUAL_LAPTOP_API}?status=Available`);
  return res.data.data;
};

export const getAvailableLaptopsByModel = async (modelId) => {
  const res = await axios.get(`${APIRoutes.INDIVIDUAL_LAPTOP_API}?laptopModelId=${modelId}&status=Available`);
  return res.data.data;
};
