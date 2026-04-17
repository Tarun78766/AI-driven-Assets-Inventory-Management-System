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
  const res = await axios.get(`${APIRoutes.INDIVIDUAL_LAPTOP_API}?laptopModelId=${modelId}&status=Available&limit=1000`);
  return res.data.data;
};

export const getAvailableSoftwareSeats = async () => {
  const res = await axios.get(`${APIRoutes.INDIVIDUAL_SOFTWARE_API}?status=Available`);
  return res.data.data;
};

export const getSoftwareModels = async () => {
  const res = await axios.get(APIRoutes.SOFTWARE_API);
  return res.data.data;
};

export const getAvailableSoftwareSeatsByModel = async (modelId) => {
  const res = await axios.get(`${APIRoutes.INDIVIDUAL_SOFTWARE_API}?softwareModelId=${modelId}&status=Available&limit=1000`);
  return res.data.data;
};