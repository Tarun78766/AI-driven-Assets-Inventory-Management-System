import {
  AlertCircle,
  Box,
  Calendar,
  CheckCircle,
  Cpu,
  HardDrive,
  Hash,
  KeyRound,
  Laptop,
  Package,
  RefreshCw,
  ShieldCheck,
  User,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import Navbar from "../../components/navBar/NavBar";
import Sidebar from "../../components/sideBar/SideBar";
import { getMyAssets } from "./EmployeeAssetsAPI";
import "./EmployeeAssets.css";

const formatDate = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const EmployeeAssets = () => {
  const [assets, setAssets] = useState([]);
  const [stats, setStats] = useState({ assigned: 0, laptops: 0, software: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedAsset, setSelectedAsset] = useState(null);

  useEffect(() => {
    const fetchAssets = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await getMyAssets();
        setAssets(data.assets || []);
        setStats(data.stats || { assigned: 0, laptops: 0, software: 0 });
      } catch (err) {
        setError(err.response?.data?.message || "Unable to fetch assigned assets.");
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, []);

  return (
    <>
      <Navbar />
      <Sidebar />
      <main className="view-assets-page">
        <div className="view-assets-header">
          <h1>My Assigned Assets</h1>
          <p>View laptops and software currently assigned to you.</p>
        </div>

        <section className="employee-assets-summary">
          <div>
            <Box size={24} />
            <span>Total Assigned</span>
            <strong>{stats.assigned}</strong>
          </div>
          <div>
            <Laptop size={24} />
            <span>Laptops</span>
            <strong>{stats.laptops}</strong>
          </div>
          <div>
            <Package size={24} />
            <span>Software</span>
            <strong>{stats.software}</strong>
          </div>
        </section>

        <section className="assets-container">
          <div className="assets-topbar">
            <div className="assets-count">
              Assigned Assets: <span>{assets.length}</span>
            </div>
          </div>

          {loading && (
            <div className="empty-state">
              <RefreshCw className="employee-assets-spin" size={42} />
              <h3>Loading assets</h3>
              <p>Please wait while we fetch your assigned inventory.</p>
            </div>
          )}

          {!loading && error && (
            <div className="empty-state">
              <AlertCircle size={42} />
              <h3>Could not load assets</h3>
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && assets.length === 0 && (
            <div className="empty-state">
              <Box size={42} />
              <h3>No assigned assets</h3>
              <p>You do not have any active laptop or software assignments yet.</p>
            </div>
          )}

          {!loading && !error && assets.length > 0 && (
            <div className="assets-grid">
              {assets.map((asset) => {
                const isLaptop = asset.assetType === "Laptop";
                const Icon = isLaptop ? Laptop : Package;

                return (
                  <article className="asset-card" key={asset.id}>
                    <div className="asset-card-top">
                      <div className="asset-icon">
                        <Icon size={24} />
                      </div>
                      <span className="status-badge active">
                        <CheckCircle size={14} />
                        {asset.status}
                      </span>
                    </div>

                    <h3>{asset.assetName}</h3>

                    <div className="asset-info">
                      <p>
                        <Package size={16} />
                        <span>{asset.assetType}</span>
                      </p>
                      <p>
                        <Calendar size={16} />
                        <span>Assigned {formatDate(asset.assignDate)}</span>
                      </p>
                      <p>
                        <User size={16} />
                        <span>Assigned by {asset.assignedBy || "Admin"}</span>
                      </p>
                    </div>

                    <button
                      type="button"
                      className="view-details-btn"
                      onClick={() => setSelectedAsset(asset)}
                    >
                      View Details
                    </button>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {selectedAsset && (
        <div className="employee-asset-modal" role="dialog" aria-modal="true">
          <button
            type="button"
            className="employee-asset-modal-backdrop"
            onClick={() => setSelectedAsset(null)}
            aria-label="Close asset details"
          />
          <div className="employee-asset-modal-panel">
            <div className="employee-asset-modal-header">
              <div>
                <span>{selectedAsset.assetType}</span>
                <h2>{selectedAsset.assetName}</h2>
              </div>
              <button
                type="button"
                className="employee-asset-close-btn"
                onClick={() => setSelectedAsset(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="employee-asset-detail-list">
              <p>
                <Calendar size={17} />
                <span>Assigned Date</span>
                <strong>{formatDate(selectedAsset.assignDate)}</strong>
              </p>
              <p>
                <ShieldCheck size={17} />
                <span>Status</span>
                <strong>{selectedAsset.status}</strong>
              </p>

              {selectedAsset.assetType === "Laptop" ? (
                <>
                  <p>
                    <Hash size={17} />
                    <span>Serial Number</span>
                    <strong>{selectedAsset.details?.serialNumber}</strong>
                  </p>
                  <p>
                    <Cpu size={17} />
                    <span>Processor</span>
                    <strong>{selectedAsset.details?.processor}</strong>
                  </p>
                  <p>
                    <HardDrive size={17} />
                    <span>Memory / Storage</span>
                    <strong>
                      {selectedAsset.details?.ram} / {selectedAsset.details?.storage}
                    </strong>
                  </p>
                  <p>
                    <Laptop size={17} />
                    <span>Operating System</span>
                    <strong>{selectedAsset.details?.operatingSystem}</strong>
                  </p>
                </>
              ) : (
                <>
                  <p>
                    <KeyRound size={17} />
                    <span>License / Seat</span>
                    <strong>{selectedAsset.details?.licenseKeyOrSeatName}</strong>
                  </p>
                  <p>
                    <Calendar size={17} />
                    <span>Activation Date</span>
                    <strong>{formatDate(selectedAsset.details?.activationDate)}</strong>
                  </p>
                  <p>
                    <Calendar size={17} />
                    <span>Expiry Date</span>
                    <strong>{formatDate(selectedAsset.details?.expiryDate)}</strong>
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EmployeeAssets;
