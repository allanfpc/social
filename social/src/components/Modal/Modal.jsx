import { useEffect, useState } from "react";

import Button from "../Button";

export const Modal = ({type, elem, onClose, message, fileUpload, actions, children}) => {
  
  function closeModal() {
    if(fileUpload) {      
      fileUpload.current.value = '';      
    }

    onClose();
  }

  return (    
    <div className="modal wrapper" onClick={onClose}>
      {type === 'picture' ? (
        <div>PICTURE</div>
      ) : (
        <div className="modal__content" onClick={(e) => e.stopPropagation()}>
          <div className="modal__header">  
            <div>
              <Button className="close" onClick={closeModal}>x</Button>
            </div>            
          </div>
          <div className="modal__body">              
            {elem ? (
              elem
            ) : (
              <div className="container">
                <div className="modal__message">
                  <h2>{message}</h2>
                </div>
              </div>
            )}
          </div>            
          {!elem && (
            <div className="modal__actions">    
              <div>
                {actions.map((action) => (
                  action
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>    
  )
}

export default Modal