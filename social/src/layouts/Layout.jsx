import {useEffect} from "react";
import { Outlet, useLocation } from "react-router-dom";

import Navbar from "../components/Navbar";
import { GlobalModal } from "../contexts/ModalContext";

export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0 });
    
    return () => {
      
    }
  }, [pathname]);

  return null;
}


export const Layout = () => {
  return (
    <GlobalModal>
      <header>
        <Navbar />
      </header>
      <main>
        <div className="wrapper">
          <div className="content">
            <Outlet />
          </div>
        </div>          
      </main>  
      <ScrollToTop />    
    </GlobalModal>    
  )
}
