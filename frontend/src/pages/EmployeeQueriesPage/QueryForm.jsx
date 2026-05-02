import { CheckCircle, Loader2, Send, XCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useSubmitQuery } from "./useQueries";
import { getManagers } from "./EmployeeQueriesAPI";

const QUERY_TYPES = [
  "New Laptop Request",
  "Laptop Replacement",
  "Laptop Issue / Repair",
  "Software Installation Request",
  "Software Access Request",
  "General IT Query",
];

const PRIORITIES = ["Low", "Medium", "High"];

const QueryForm = ({ onSuccess }) => {
  const { submit, loading, error, success, reset } = useSubmitQuery();
  const [form, setForm] = useState({
    queryType: "",
    subject: "",
    description: "",
    priority: "Medium",
    assignedTo: "",
  });
  const [touched, setTouched] = useState({});
  const [managers, setManagers] = useState([]);

  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const res = await getManagers();
        if (res.data?.data) {
          setManagers(res.data.data);
        }
      } catch (err) {
        console.error("Failed to load managers", err);
      }
    };
    fetchManagers();
  }, []);

  const validationErrors = {};
  if (!form.queryType) validationErrors.queryType = "Please select a query type.";
  if (!form.subject.trim()) validationErrors.subject = "Subject is required.";
  if (form.subject.length > 200) {
    validationErrors.subject = "Subject must be under 200 characters.";
  }
  if (!form.description.trim()) {
    validationErrors.description = "Description is required.";
  }
  if (form.description.length > 2000) {
    validationErrors.description = "Description must be under 2000 characters.";
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setTouched({
      queryType: true,
      subject: true,
      description: true,
      priority: true,
    });

    if (Object.keys(validationErrors).length > 0) return;

    try {
      await submit(form);
      setForm({
        queryType: "",
        subject: "",
        description: "",
        priority: "Medium",
        assignedTo: "",
      });
      setTouched({});
      onSuccess?.();
    } catch {
      // The hook exposes the user-facing error.
    }
  };

  const getFieldClass = (name) =>
    touched[name] && validationErrors[name] ? "employee-query-field error" : "employee-query-field";

  if (success) {
    return (
      <div className="employee-query-success">
        <div className="employee-query-success-icon">
          <CheckCircle size={42} />
        </div>
        <h3>Query submitted</h3>
        <p>
          Your request has been received and is now pending review. You can track
          its status in My Queries.
        </p>
        <button type="button" className="employee-query-primary-btn" onClick={reset}>
          Submit Another Query
        </button>
      </div>
    );
  }

  return (
    <form className="employee-query-form" onSubmit={handleSubmit} noValidate>
      {error && (
        <div className="employee-query-alert error">
          <XCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="employee-query-form-grid">
        <label className="employee-query-form-group full">
          <span>Query Type</span>
          <select
            name="queryType"
            value={form.queryType}
            onChange={handleChange}
            className={getFieldClass("queryType")}
          >
            <option value="">Select a query type</option>
            {QUERY_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {touched.queryType && validationErrors.queryType && (
            <small>{validationErrors.queryType}</small>
          )}
        </label>

        <label className="employee-query-form-group full">
          <span>Subject</span>
          <input
            type="text"
            name="subject"
            value={form.subject}
            onChange={handleChange}
            placeholder="Brief summary of your request"
            maxLength={200}
            className={getFieldClass("subject")}
          />
          <div className="employee-query-field-meta">
            <small>{touched.subject ? validationErrors.subject : ""}</small>
            <small>{form.subject.length}/200</small>
          </div>
        </label>

        <div className="employee-query-form-group">
          <span>Assign To (Optional)</span>
          <select
            name="assignedTo"
            value={form.assignedTo}
            onChange={handleChange}
            className="employee-query-field"
          >
            <option value="">General IT Queue</option>
            {managers.map((m) => (
              <option key={m._id} value={m._id}>
                {m.firstName} {m.lastName} ({m.role})-{m.department}
              </option>
            ))}
          </select>
        </div>

        <div className="employee-query-form-group">
          <span>Priority</span>
          <div className="employee-query-priority-options">
            {PRIORITIES.map((priority) => (
              <button
                key={priority}
                type="button"
                className={`employee-query-priority ${priority.toLowerCase()} ${
                  form.priority === priority ? "active" : ""
                }`}
                onClick={() => setForm((prev) => ({ ...prev, priority }))}
              >
                <span />
                {priority}
              </button>
            ))}
          </div>
        </div>

        <label className="employee-query-form-group full">
          <span>Description</span>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={5}
            maxLength={2000}
            placeholder="Describe the issue or request. Include asset tags, software names, error messages, or timing where relevant."
            className={getFieldClass("description")}
          />
          <div className="employee-query-field-meta">
            <small>{touched.description ? validationErrors.description : ""}</small>
            <small>{form.description.length}/2000</small>
          </div>
        </label>
      </div>

      <div className="employee-query-form-actions">
        <p>Requests are saved immediately. Email notifications send when SMTP is configured.</p>
        <button type="submit" className="employee-query-primary-btn" disabled={loading}>
          {loading ? <Loader2 className="employee-query-spin" size={18} /> : <Send size={18} />}
          Submit Query
        </button>
      </div>
    </form>
  );
};

export default QueryForm;
