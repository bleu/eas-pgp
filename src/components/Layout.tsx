import React from "react";
import Header from "./Header";
import Footer from "./Footer";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <Header />
      <main className="min-h-96 container mx-auto py-8 my-12 bg-white shadow-custom-drop-shadow rounded-[20px] ">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
