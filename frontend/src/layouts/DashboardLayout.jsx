import { Outlet } from "react-router-dom";
import Header from "../components/Header/header";
import AIChatbot from "../components/AIChatbot/AIChatbot";

function DashboardLayout() {
  return (
    <div>
      <Header />
      <main>
        <Outlet />
      </main>
      <AIChatbot />
    </div>
  );
}

export default DashboardLayout;
