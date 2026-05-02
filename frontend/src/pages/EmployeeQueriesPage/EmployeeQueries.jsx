import { MessageSquarePlus, Plus, ClipboardList } from "lucide-react";
import { useState } from "react";
import Navbar from "../../components/navBar/NavBar";
import Sidebar from "../../components/sideBar/SideBar";
import QueryForm from "./QueryForm";
import QueryList from "./QueryList";
import "./EmployeeQueries.css";

const tabs = [
  { id: "new", label: "New Query", icon: Plus },
  { id: "list", label: "My Queries", icon: ClipboardList },
];

const EmployeeQueries = () => {
  const [activeTab, setActiveTab] = useState("new");
  const [listKey, setListKey] = useState(0);

  const handleQuerySuccess = () => {
    setActiveTab("list");
    setListKey((key) => key + 1);
  };

  return (
    <>
      <Navbar />
      <Sidebar />
      <main className="employee-queries-page">
        <div className="employee-queries-header">
          <div className="employee-queries-header-left">
            <div className="employee-queries-header-icon">
              <MessageSquarePlus size={28} />
            </div>
            <div>
              <h1>IT Support & Queries</h1>
              <p>Submit requests, track status, and review IT responses.</p>
            </div>
          </div>
        </div>

        <section className="employee-queries-info">
          <strong>How it works</strong>
          <span>
            Submit your request with the relevant details. The IT team can review
            and respond while you track progress from this page.
          </span>
        </section>

        <section className="employee-queries-card">
          <div className="employee-queries-tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  className={activeTab === tab.id ? "active" : ""}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="employee-queries-card-body">
            {activeTab === "new" && <QueryForm onSuccess={handleQuerySuccess} />}
            {activeTab === "list" && <QueryList key={listKey} />}
          </div>
        </section>
      </main>
    </>
  );
};

export default EmployeeQueries;
