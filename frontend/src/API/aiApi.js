import axios from "../config/Axiosconfig";
import { APIRoutes } from "./APIRoutes";

export const predictFailure = async (assetId) => {
  try {
    const response = await axios.post(`/${APIRoutes.AI_API}/predict-failure/${assetId}?t=${Date.now()}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getHighRiskLaptops = async () => {
  try {
    const response = await axios.get(`/${APIRoutes.AI_API}/high-risk-laptops`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getBrandFailureAnalysis = async () => {
  try {
    const response = await axios.get(`/${APIRoutes.AI_API}/brand-failure-analysis`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
