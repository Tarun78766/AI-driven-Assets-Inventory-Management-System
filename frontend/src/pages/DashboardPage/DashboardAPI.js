import axios from "../../config/Axiosconfig";
import { APIRoutes } from "../../API/APIRoutes";

export const getDashboardData = async () => {
  const res = await axios.get(APIRoutes.DASHBOARD_API);
  return res.data.data;
};