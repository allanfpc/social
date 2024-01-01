import {useState, useEffect, useMemo, createContext, useContext} from 'react';

export const ErrorStatusContext = createContext();

export const ErrorHandler = ({ children }) => {  
  console.log('handler')
  const [errorStatusCode, setErrorStatusCode ] = useState();

  useEffect(() => {
    // Listen for changes to the current location.
    const unlisten = (() => 
      setErrorStatusCode(undefined)
    );
    // cleanup the listener on unmount
    return unlisten;
  }, [])
  

  const renderContent = () => {    
    console.log('errorStatusCode: ', errorStatusCode);
    if(errorStatusCode === 401) {      
      // const x = scrollX
      // const y = scrollY
      
      // window.history.replaceState({login: 'need', scroll: {x, y} }, document.title, window.location.pathname);      
      // window.location.reload(false)
      return <div>asdsad</div>;
      
    }

    if (errorStatusCode === 404) {
      return <Page404 />
    }

    if(errorStatusCode === 500) {
      return <Page500 />
    }

    return children;
  }
  
  // We wrap it in a useMemo for performance reasons. More here:
  // https://kentcdodds.com/blog/how-to-optimize-your-context-value/
  const contextPayload = useMemo(
    () => ({ setErrorStatusCode }), 
    [setErrorStatusCode]
  );
  
  // We expose the context's value down to our components, while
  // also making sure to render the proper content to the screen 
  return (
    <ErrorStatusContext.Provider value={contextPayload}>
      {renderContent()}
    </ErrorStatusContext.Provider>
  )
}

export const useErrorStatus = () => useContext(ErrorStatusContext);