import axios from "../../config/Axiosconfig";
import { APIRoutes } from "../../API/APIRoutes";

export const getAllUsers = async () => {
  // Uses Axiosconfig to automatically inject the Bearer token intercepted
  const response = await axios.get(APIRoutes.USERS_API);
  return response.data;
};

export const updateUserRole = async (userId, newRole) => {
  const response = await axios.put(`${APIRoutes.USERS_API}/${userId}/role`, {
    role: newRole,
  });
  return response.data;
};
