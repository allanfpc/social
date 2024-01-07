import Modal from "./Modal";

import { useGlobalModalContext } from "../../contexts/ModalContext";

export const CreateModal = () => {
 const { hideModal, store } = useGlobalModalContext();
 const { modalProps } = store || {}; 
 const { title, confirmBtn, elem, message, clear, fileUpload, actions, restoreScroll } = modalProps || {};

 const handleModalToggle = () => {
  if(fileUpload) {
    fileUpload.value = '';
  }
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
        actions
      ]}
      restoreScroll={restoreScroll}
      clear={clear}
      fileUpload={fileUpload}
    >
    </Modal>
 );
};