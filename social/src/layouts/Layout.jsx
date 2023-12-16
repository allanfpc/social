
import { useEffect, useState } from "react";
import Modal from "../components/Modal_copy";
import Navbar from "../components/Navbar";
import { useLocation, useNavigate } from "react-router-dom";
import { useErrorStatus } from "../contexts/ErrorContext";
import { GlobalModal } from "../contexts/ModalContext";


const Layout = ({modal, setModal, children}) => {
  return (
    <>     
      {modal && (        
        <Modal setIsOpen={setModal} type={modal.type} elem={modal.elem} />
      )}
      <header>
        <Navbar />
      </header>
      <main>
        <div className="wrapper">
          <div className="content">
            {children}
          </div>
        </div>
      </main>
    </>
    
  )
}

export default Layout