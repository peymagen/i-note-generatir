import { Link, useNavigate } from "react-router-dom";
import styles from "./SideBar.module.css";
import Button from "../Button/Button";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { resetTokens } from "../../store/reducers/authReducers";
import type { AppDispatch } from "../../store/store"; 
import {toast} from "react-toastify";

const Sidebar: React.FC = () => {

  const dispatch = useDispatch<AppDispatch>(); 
  const navigate = useNavigate(); 

  const menuItems = [
    { label: "Dashboard", path: "dashboard" },
    { label: "Users", path: "manage-users" },
    { label: "Template Management", path: "manage-template" },
    {label:"Data Collective", path:"data-collective"},
    {label:"Vendor Detail", path:"vendor-detail"},
    {label:"Mo Detail", path:"mo-detail"},
    {label:"I-Note", path:"inote"},
  ];
 


  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);

    try {
      dispatch(resetTokens()); 
      toast.success("Logged out successfully!");
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setLoading(false);
      navigate("/login", { replace: true }); 
    }
  };

  return (
    <div className={styles.sidebar}>
      <div className={styles.upper}>
        <h1 className={styles.title}>Document Generator</h1>
        <ul className={styles.menuList}>
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`${styles.menuItem} ${
                  location.pathname === item.path ? styles.active : ''
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.lower}>
        <Button
          label={loading ? "Logging out..." : "Logout"}
          onClick={handleLogout}
          disabled={loading}
          loading={loading} 
        />
      </div>
    </div>
  );
};

export default Sidebar;
