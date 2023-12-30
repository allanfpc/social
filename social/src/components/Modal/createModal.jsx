import React from "react";

import Modal from "./Modal";
import Button from "../Button";

import { useGlobalModalContext } from "../../contexts/ModalContext";

export const CreateModal = () => {

 const { hideModal, store } = useGlobalModalContext();
 const { modalProps } = store || {}; 
 const { title, confirmBtn, elem, message } = modalProps || {};

 const handleModalToggle = () => {
  hideModal();
 };

 return (
   <Modal
     title={title || "Create Modal"}
     isOpen={true}
     elem={elem}
     message={message || "Login now to interact with another users"}
     onClose={handleModalToggle}
     actions={[

     ]}
    >
    </Modal>
 );
};