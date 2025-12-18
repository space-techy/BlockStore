import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "@/components/Navbar/Navbar";

function Layout() {
  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
      <div className="w-full">
          <Outlet />
        </div>
      </div>
    </>
  );
}

export default Layout;
