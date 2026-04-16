import axios from "../../config/Axiosconfig";
import { APIRoutes } from "../../API/APIRoutes";


export const getAssignments = async (page = 1, limit = 10, search = "", statusFilter = "All", typeFilter = "All") => {
  const params = new URLSearchParams({ page, limit });
  if (search && search.trim() !== "") params.append("search", search);
  if (statusFilter !== "All") params.append("status", statusFilter);
  if (typeFilter !== "All") params.append("type", typeFilter);

  const res = await axios.get(`${APIRoutes.ASSIGNMENTS_API}?${params.toString()}`);
  return res.data;
};

export const createAssignmentApi = async (data) => {
  const res = await axios.post(APIRoutes.ASSIGNMENTS_API, data);
  return res.data.data;
};

export const returnAssignmentApi = async (id) => {
  const res = await axios.put(`${APIRoutes.ASSIGNMENTS_API}/return/${id}`);
  return res.data.data;
};