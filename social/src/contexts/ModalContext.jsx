import { useState, createContext, useContext, lazy, Suspense } from 'react';

const StatusModal = lazy(() => import('../components/Modal').then(module => ({ default: module.StatusModal })));
const CreateModal = lazy(() => import('../components/Modal').then(module => ({ default: module.CreateModal })));


const initialState = {
  showModal: () => {},
  hideModal: () => {},
  store: {},
};

const MODAL_COMPONENTS = {
  "STATUS_MODAL": StatusModal,
  "CREATE_MODAL": CreateModal
 };

const GlobalModalContext = createContext(initialState);

export const GlobalModal = ({ children }) => {
 const [store, setStore] = useState();
 const { modalType, modalProps } = store || {};

 const showModal = (modalType, modalProps) => {
  setStore({
    ...store,
    modalType,
    modalProps,
  });
 };

 const hideModal = () => {
   setStore({
     ...store,
     modalType: null,
     modalProps: {},
   });
 };

 const renderComponent = () => {
   const ModalComponent = MODAL_COMPONENTS[modalType];
   if (!modalType || !ModalComponent) {
     return null;
   }
   return (
    <Suspense>
      <ModalComponent id="global-modal" {...modalProps} />
    </Suspense>
   );
 };

 return (
   <GlobalModalContext.Provider value={{ store, showModal, hideModal }}>
      {renderComponent()}
      {children}
   </GlobalModalContext.Provider>
 );
};

export const useGlobalModalContext = () => useContext(GlobalModalContext);