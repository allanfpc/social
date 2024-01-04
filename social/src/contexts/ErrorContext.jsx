import {useState, useEffect, useMemo, createContext, useContext, lazy, Suspense} from 'react';

const ToastError = lazy(() => import('../components/Error/ToastError'));
const CreateModal = lazy(() => import('../components/Modal').then(module => ({ default: module.CreateModal })));

const initialState = {
  showError: () => {},
  hideError: () => {},
  store: {},
};

const ERROR_COMPONENTS = {
  "TOAST_ERROR": ToastError,
  "401": CreateModal
};

const ErrorStatusContext = createContext(initialState);

export const ErrorHandler = ({ children }) => {
  const [store, setStore] = useState();
  const { modalType, modalProps } = store || {};

  const showError = (modalType, modalProps) => {
    setStore({
      ...store,
      modalType,
      modalProps,
    });
  };

  const hideError = () => {
    setStore({
      ...store,
      modalType: null,
      modalProps: {},
    });
  };

  const renderComponent = () => {

    if(modalType == "401") {
      return location.assign("/login");
    }

    if(modalType == "404") {
      return location.assign("/404");
    }

    if(modalType == "500") {
      return location.assign("/500");
    }

    const ErrorComponent = ERROR_COMPONENTS[modalType];

    if (!modalType || !ErrorComponent) {
      return null;
    }

    return (
      <Suspense>
        <ErrorComponent id="error" {...modalProps} />
      </Suspense>
    );
  }
  
  // We wrap it in a useMemo for performance reasons. More here:
  // https://kentcdodds.com/blog/how-to-optimize-your-context-value/
  const contextPayload = useMemo(
    () => ({ store, showError, hideError }), 
    [store, showError, hideError]
  );
  
  // We expose the context's value down to our components, while
  // also making sure to render the proper content to the screen 
  const exceptionChildren = ["404", "500", "401"]

  return (
    <ErrorStatusContext.Provider value={contextPayload}>
      {renderComponent()}
      {!exceptionChildren.includes(modalType) && children}
    </ErrorStatusContext.Provider>
  )
}

export const useErrorContext = () => useContext(ErrorStatusContext);