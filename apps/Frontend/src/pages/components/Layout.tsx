import type { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import "../../public/pages/components/Layout.css";

type LayoutProps = {
  children: ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="layout">
      <Navbar />
      <main className="layout-content">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;