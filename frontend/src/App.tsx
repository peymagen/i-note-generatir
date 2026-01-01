import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import Login from "./pages/login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import ManageTemplate from "./pages/ManageTemp/ManageTemplate";
import ManageCreateUser from "./pages/ManageCreateuser/ManageCreateUser";
import ChangePassword from "./pages/ChangePassword/ChangePassword";
import Dash from "./pages/Daash/Dash";
import ItemDetail from './pages/itemDetail/itemDetail'
import VendorDetail from "./pages/VendorDetail/VendorDetail";
import PoDetail from "./pages/PoDetail/PoDetail";
import PoHeader from "./pages/PoHeader/PoHeader";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styles from "./App.module.css";
import { useSelector } from "react-redux";
import type { RootState } from "./store/store";
import PurchaseOrder from "./pages/PurchaseOrder/PurchaseOrder";
import MoDetail from "./pages/MoDetail/Mo";
import TemplatePage from "./pages/Template/Template";


const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, loading } = useSelector((state: RootState) => state.auth);

  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <Outlet />; 
};

const App: React.FC = () => {
  return (
    <div className={styles.container}>
      <Router>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes with Dashboard Layout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Dashboard />}>
              <Route index element={<Dash />} />
              <Route path="manage-template" element={<ManageTemplate />} />
              <Route path="manage-users" element={<ManageCreateUser />} />
              <Route path="change-password" element={<ChangePassword />} />
              <Route path="edit/:pageId" element={<ManageTemplate />} />
              <Route path="new" element={<ManageTemplate />} />
              <Route path="dashboard" element={<Dash />} />
              <Route path="item-detail" element={<ItemDetail />} />
              <Route path="po-detail" element={<PoDetail />} />
              <Route path="po-header" element={<PoHeader />} />
              <Route path="vendor-detail" element={<VendorDetail />} />
              <Route path="mo-detail" element={<MoDetail />} />
              <Route path="purchase-order" element={<PurchaseOrder />} />
              {/* <Route path="page" element={<TemplatePage />} /> */}
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <ToastContainer />
      </Router>
    </div>
  );
};

export default App;
