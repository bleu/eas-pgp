import React from "react";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-100   text-gray-900">
      <main className="container mx-auto py-8">{children}</main>
    </div>
  );
};

export default Layout;
