import { Suspense } from "react";

import Button from "../Button";

export const Modal = ({elem, onClose, message, fileUpload, actions, children}) => {
  function closeModal() {
	action,
    if(fileUpload) {      
      fileUpload.current.value = '';      
    }

    onClose();
  }

  return (    
    <div className="modal wrapper" onClick={onClose}>
      <div className="modal__content" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">  
          <div>
            <Button className="close" onClick={closeModal}>x</Button>
          </div>            
        </div>
        <div className="modal__body">              
          {elem ? (
            <Suspense fallback={<div>Loading...</div>}>
              {elem}
            </Suspense>
          ) : (
            <div className="container">
              <div className="modal__message">
                <h2>{message}</h2>
              </div>
            </div>
          )}
				</div>
				<div className="modal__actions">
					{actions ? (
						<div>{actions.map((action) => action)}</div>
					) : (
						<div>
							<Button
								className="success btn-filled"
								onClick={() => {
									action();
									onClose();
								}}
							>
								Confirm
							</Button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default Modal