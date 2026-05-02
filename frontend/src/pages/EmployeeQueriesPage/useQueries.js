import { useCallback, useEffect, useState } from "react";
import {
  getMyQueries as fetchMyQueries,
  submitQuery as submitQueryRequest,
} from "./EmployeeQueriesAPI";

export const useSubmitQuery = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [data, setData] = useState(null);

  const submit = useCallback(async (formData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await submitQueryRequest(formData);
      setData(response.data.data);
      setSuccess(true);
      return response.data;
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Failed to submit query. Please try again.";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setError(null);
    setSuccess(false);
    setData(null);
  }, []);

  return { submit, loading, error, success, data, reset };
};

export const useMyQueries = (initialFilters = {}) => {
  const [queries, setQueries] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Stringify to avoid infinite loop on re-renders when initialFilters is passed as an inline object (or defaults to {})
  const filterKey = JSON.stringify(initialFilters);

  const refetch = useCallback(
    async (params = {}) => {
      setLoading(true);
      setError(null);

      try {
        const parsedFilters = JSON.parse(filterKey);
        const response = await fetchMyQueries({ ...parsedFilters, ...params });
        setQueries(response.data.queries || []);
        setPagination(response.data.pagination || null);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load queries.");
      } finally {
        setLoading(false);
      }
    },
    [filterKey],
  );

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { queries, pagination, loading, error, refetch };
};
