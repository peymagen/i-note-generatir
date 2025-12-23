import { Outlet } from "react-router-dom";
import Sidebar from "../../component/SideBar/SideBar";
import style from "./Dashboard.module.css";

const Dashboard: React.FC<{ children?: React.ReactNode }> = () => {
  // const location = useLocation();
  
  return (
    <div className={style.dashboard}> 
      <div className={style.SideBar}>
        <Sidebar />
      </div>
      <div className={style.contentArea}>
        {/* {children || (location.pathname === '/' && <h1>Welcome to Dashboard</h1>)} */}
        <Outlet />
      </div>
    </div>
  );
};

export default Dashboard;