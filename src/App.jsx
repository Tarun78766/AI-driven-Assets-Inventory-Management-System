import "./App.css";
import Navbar from "./components/navBar/NavBar";
import SideBar from "./components/sideBar/SideBar";
import "bootstrap/dist/css/bootstrap.min.css";
import Dashboard from "./pages/DashboardPage/DashBoard";
import { Routes, Route } from "react-router-dom";
import Login from "./components/Login/Login";
import SignUp from "./components/signUp/SignUp";
import LaptopModels from "./pages/LaptopModelsPage/Laptopmodels";
import Software from "./pages/SoftwarePage/Software";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />

        <Route path="/signup" element={<SignUp />} />
        <Route path="/navbar" element={<Navbar />} />
        <Route path="/sidebar" element={<SideBar />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/laptops" element={<LaptopModels />} />
        <Route path="/software" element={<Software />} />
      </Routes>
    </>
  );
}

export default App;
