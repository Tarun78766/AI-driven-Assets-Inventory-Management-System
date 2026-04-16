import axios from "axios";
import { APIRoutes } from "../../../API/APIRoutes";
const BASE_URL = import.meta.env.VITE_API_URL;

const getAuthHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export const getIndividualSeats = async (page, limit, search = "", status = "") => {
  const response = await axios.get(`${BASE_URL}${APIRoutes.INDIVIDUAL_SOFTWARE_API}`, {
    headers: getAuthHeader(),
    params: {
      page,
      limit,
      ...(search && { search }),
      ...(status && status !== "All" && { status }),
    },
  });
  return response.data;
};

export const addIndividualSeat = async (data) => {
  const response = await axios.post(`${BASE_URL}${APIRoutes.INDIVIDUAL_SOFTWARE_API}`, data, {
    headers: getAuthHeader(),
  });
  return response.data;
};

export const updateIndividualSeat = async (id, data) => {
  const response = await axios.put(`${BASE_URL}${APIRoutes.INDIVIDUAL_SOFTWARE_API}/${id}`, data, {
    headers: getAuthHeader(),
  });
  return response.data;
};

export const deleteIndividualSeat = async (id) => {
  const response = await axios.delete(`${BASE_URL}${APIRoutes.INDIVIDUAL_SOFTWARE_API}/${id}`, {
    headers: getAuthHeader(),
  });
  return response.data;
};

// Fetches only tracked-type software for the dropdown
export const getSoftwareDropdown = async () => {
  const response = await axios.get(`${BASE_URL}${APIRoutes.SOFTWARE_API}/tracked`, {
    headers: getAuthHeader(),
  });
  return response.data;
};