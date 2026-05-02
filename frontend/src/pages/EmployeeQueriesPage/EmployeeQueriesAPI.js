import axios from "../../config/Axiosconfig";
import { APIRoutes } from "../../API/APIRoutes";

const queryPath = APIRoutes.QUERIES_API;

export const submitQuery = (data) => axios.post(queryPath, data);

export const getMyQueries = (params = {}) =>
  axios.get(`${queryPath}/my`, { params });

export const getQueryById = (id) => axios.get(`${queryPath}/${id}`);

export const getAllQueries = (params = {}) =>
  axios.get(queryPath, { params });

export const updateQuery = (id, data) =>
  axios.patch(`${queryPath}/${id}`, data);

export const deleteQuery = (id) => axios.delete(`${queryPath}/${id}`);

export const getQueryStats = () => axios.get(`${queryPath}/stats`);

export const replyToQuery = (id, message) => 
  axios.post(`${queryPath}/${id}/reply`, { message });

export const getManagers = () => axios.get(APIRoutes.USERS_API + "/managers");
