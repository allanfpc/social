import { useState, useEffect } from "react";
import { useErrorStatus } from "../../contexts/ErrorContext";

const SERVER_BASE_URL = import.meta.env.VITE_SERVER_BASE_URL;

export function useQuery({path, options, setLoading}) {
    
    const { setErrorStatusCode } = useErrorStatus();
    const [data, setData] = useState([]);

    useEffect(() => {
        fetch(`${SERVER_BASE_URL}/${path}`, {
            method: options.method || "GET",            
            ...options
        })
          .then(response => {
            console.log('respon: ', response);
            if(!response.ok) {
                console.log('here')
                setErrorStatusCode(response.status);
            }

            if(response.status === 204) {
                return null;
            } else {
                return response.json();
            }
            
          })
          .then((data) => {
            console.log('datA: ', data);
            if(data) {
                setData(data);              
            }
          }).finally(() => {
            if(setLoading) {
                setLoading(false);
            }
          })
        
      }, [path]);

      console.log('daAta: ', data);
    return [data, setData];
    
}

export async function fetchAction({path, options}) {    
    console.log(path);
    console.log(options);

    const response = await fetch(`${SERVER_BASE_URL}/${path}`, {
        method: options.method || "GET",
        ...options
    })
    console.log(response);
    const code = response.status;

    if(code === 204) {
        return {data: null};
    }

    const data = await response.json();    
    console.log('data: ', data);
    if(!response.ok) {        
        const error = {error: data.error, code: code};
        
        if(data.files) {
            error.files = data.files;
        }

        return error;
    }
    
    return {data: data};
}