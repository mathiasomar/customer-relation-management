import FooterSection from "@/components/footer-two";
import Navbar from "@/components/layout/home/navbar";
import React from "react";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <Navbar />
      {children}
      <FooterSection />
    </div>
  );
};

export default layout;
