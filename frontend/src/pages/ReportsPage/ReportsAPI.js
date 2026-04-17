import axios from "../../config/Axiosconfig";
import { APIRoutes } from "../../API/APIRoutes";

export const getReportsData = async () => {
  const res = await axios.get(APIRoutes.REPORTS_API);
  return res.data.data;
};
