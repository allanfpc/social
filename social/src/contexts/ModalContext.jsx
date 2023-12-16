import React, { useState, createContext, useContext } from 'react';
import { CreateModal, DeleteModal, UpdateModal } from '../components/Modal';

const initialState = {
  showModal: () => {},
  hideModal: () => {},
  store: {},
};

const MODAL_COMPONENTS = {
  "CREATE_MODAL": CreateModal,
  "DELETE_MODAL": DeleteModal,
  "UPDATE_MODAL": UpdateModal
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
   return <ModalComponent id="global-modal" {...modalProps} />;
 };

 return (
   <GlobalModalContext.Provider value={{ store, showModal, hideModal }}>
     {renderComponent()}
     {children}
   </GlobalModalContext.Provider>
 );
};

export const useGlobalModalContext = () => useContext(GlobalModalContext);