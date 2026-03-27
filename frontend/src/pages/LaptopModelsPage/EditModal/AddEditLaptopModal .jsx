import { useState, useEffect } from "react";
import "./AddEditLaptopModal.css";
import { X, Save, Laptop } from "lucide-react";

const AddEditLaptopModal = ({ isOpen, onClose, model, onSave }) => {
  const [formData, setFormData] = useState({
    modelName: "",
    brand: "",
    processor: "",
    ram: "",
    storage: "",
    screenSize: "",
    graphicsCard: "",
    weight: "",
    batteryLife: "",
    ports: "",
    operatingSystem: "",
    warranty: "",
    price: "",
    specifications: "",
  });

  const [errors, setErrors] = useState({});

  // Populate form if editing
  useEffect(() => {
    if (model) {
      setFormData({
        modelName: model.modelName || "",
        brand: model.brand || "",
        processor: model.processor || "",
        ram: model.ram || "",
        storage: model.storage || "",
        screenSize: model.screenSize || "",
        graphicsCard: model.graphicsCard || "",
        weight: model.weight || "",
        batteryLife: model.batteryLife || "",
        ports: model.ports || "",
        operatingSystem: model.operatingSystem || "",
        warranty: model.warranty || "",
        price: model.price || "",
        specifications: model.specifications || "",
      });
    } else {
      // Reset form for new model
      setFormData({
        modelName: "",
        brand: "",
        processor: "",
        ram: "",
        storage: "",
        screenSize: "",
        graphicsCard: "",
        weight: "",
        batteryLife: "",
        ports: "",
        operatingSystem: "",
        warranty: "",
        price: "",
        specifications: "",
      });
    }
    setErrors({});
  }, [model, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.modelName.trim()) {
      newErrors.modelName = "Model name is required";
    }
    if (!formData.brand.trim()) {
      newErrors.brand = "Brand is required";
    }
    if (!formData.processor.trim()) {
      newErrors.processor = "Processor is required";
    }
    if (!formData.ram.trim()) {
      newErrors.ram = "RAM is required";
    }
    if (!formData.storage.trim()) {
      newErrors.storage = "Storage is required";
    }
    if (!formData.screenSize.trim()) {
      newErrors.screenSize = "Screen size is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      const dataToSave = {
        ...formData,
        id: model ? model.id : Date.now(), // Generate ID for new model
        totalAssets: model ? model.totalAssets : 0,
        available: model ? model.available : 0,
        inUse: model ? model.inUse : 0,
        underRepair: model ? model.underRepair : 0,
      };

      onSave(dataToSave);
      onClose();
    }
  };

  const handleCancel = () => {
    setFormData({
      modelName: "",
      brand: "",
      processor: "",
      ram: "",
      storage: "",
      screenSize: "",
      graphicsCard: "",
      weight: "",
      batteryLife: "",
      ports: "",
      operatingSystem: "",
      warranty: "",
      price: "",
      specifications: "",
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleCancel}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-section">
            <div className="modal-icon">
              <Laptop size={24} />
            </div>
            <div>
              <h2 className="modal-title">
                {model ? "Edit Laptop Model" : "Add New Laptop Model"}
              </h2>
              <p className="modal-subtitle">
                {model
                  ? "Update laptop model information"
                  : "Enter laptop model specifications and details"}
              </p>
            </div>
          </div>
          <button className="modal-close" onClick={handleCancel}>
            <X size={24} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Basic Information Section */}
            <div className="form-section">
              <h3 className="section-title">Basic Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">
                    Model Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="modelName"
                    value={formData.modelName}
                    onChange={handleChange}
                    className={`form-input ${errors.modelName ? "error" : ""}`}
                    placeholder="e.g., Dell XPS 15, MacBook Pro 16"
                  />
                  {errors.modelName && (
                    <span className="error-text">{errors.modelName}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Brand <span className="required">*</span>
                  </label>
                  <select
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    className={`form-input ${errors.brand ? "error" : ""}`}
                  >
                    <option value="">Select Brand</option>
                    <option value="Dell">Dell</option>
                    <option value="Apple">Apple</option>
                    <option value="HP">HP</option>
                    <option value="Lenovo">Lenovo</option>
                    <option value="ASUS">ASUS</option>
                    <option value="Acer">Acer</option>
                    <option value="Microsoft">Microsoft</option>
                    <option value="MSI">MSI</option>
                    <option value="Razer">Razer</option>
                    <option value="Samsung">Samsung</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.brand && (
                    <span className="error-text">{errors.brand}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Hardware Specifications Section */}
            <div className="form-section">
              <h3 className="section-title">Hardware Specifications</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">
                    Processor <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="processor"
                    value={formData.processor}
                    onChange={handleChange}
                    className={`form-input ${errors.processor ? "error" : ""}`}
                    placeholder="e.g., Intel Core i7-13700H"
                  />
                  {errors.processor && (
                    <span className="error-text">{errors.processor}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    RAM <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="ram"
                    value={formData.ram}
                    onChange={handleChange}
                    className={`form-input ${errors.ram ? "error" : ""}`}
                    placeholder="e.g., 16GB DDR5"
                  />
                  {errors.ram && (
                    <span className="error-text">{errors.ram}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Storage <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="storage"
                    value={formData.storage}
                    onChange={handleChange}
                    className={`form-input ${errors.storage ? "error" : ""}`}
                    placeholder="e.g., 512GB SSD"
                  />
                  {errors.storage && (
                    <span className="error-text">{errors.storage}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Graphics Card</label>
                  <input
                    type="text"
                    name="graphicsCard"
                    value={formData.graphicsCard}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g., NVIDIA RTX 4050"
                  />
                </div>
              </div>
            </div>

            {/* Display & Physical Section */}
            <div className="form-section">
              <h3 className="section-title">Display & Physical</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">
                    Screen Size <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="screenSize"
                    value={formData.screenSize}
                    onChange={handleChange}
                    className={`form-input ${errors.screenSize ? "error" : ""}`}
                    placeholder='e.g., 15.6"'
                  />
                  {errors.screenSize && (
                    <span className="error-text">{errors.screenSize}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Weight</label>
                  <input
                    type="text"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g., 1.8 kg"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Battery Life</label>
                  <input
                    type="text"
                    name="batteryLife"
                    value={formData.batteryLife}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g., Up to 10 hours"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Ports</label>
                  <input
                    type="text"
                    name="ports"
                    value={formData.ports}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g., 2x USB-C, 1x HDMI, 1x USB-A"
                  />
                </div>
              </div>
            </div>

            {/* Additional Information Section */}
            <div className="form-section">
              <h3 className="section-title">Additional Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Operating System</label>
                  <select
                    name="operatingSystem"
                    value={formData.operatingSystem}
                    onChange={handleChange}
                    className="form-input"
                  >
                    <option value="">Select OS</option>
                    <option value="Windows 11 Pro">Windows 11 Pro</option>
                    <option value="Windows 11 Home">Windows 11 Home</option>
                    <option value="macOS">macOS</option>
                    <option value="Linux">Linux</option>
                    <option value="Chrome OS">Chrome OS</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Warranty Period</label>
                  <input
                    type="text"
                    name="warranty"
                    value={formData.warranty}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g., 3 years"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Price (₹)</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="e.g., 85000"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Additional Specifications</label>
                <textarea
                  name="specifications"
                  value={formData.specifications}
                  onChange={handleChange}
                  className="form-textarea"
                  rows="4"
                  placeholder="Enter any additional specifications or notes about this laptop model..."
                ></textarea>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="modal-footer">
            <button
              type="button"
              className="btn-secondary"
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button type="submit" className="btn-submit">
              <Save size={18} />
              {model ? "Update Model" : "Add Model"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditLaptopModal;
