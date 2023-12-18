import { useState, useEffect } from "react";
import { useErrorStatus } from "../../contexts/ErrorContext";

const SERVER_BASE_URL = import.meta.env.VITE_SERVER_BASE_URL;

export function useQuery({path, options = {}, setLoading}) {
    const { setErrorStatusCode } = useErrorStatus();
    const [data, setData] = useState([]);

    const headers = options.headers == {} || {
        "Content-Type": "application/json",
        ...options.headers
    };

    useEffect(() => {
        fetch(`${SERVER_BASE_URL}/${path}`, {    
            method: options.method || "GET",
            headers: headers,
            credentials: "include",
            ...options,
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

    return [data, setData];
    
}

export async function fetchAction({path, options = {}}) {

    const headers = options.headers == {} || {
        "Content-Type": "application/json",
        ...options.headers
    };

    const response = await fetch(`${SERVER_BASE_URL}/${path}`, {        
        method: options.method || "GET",
        headers: headers,
        credentials: "include",
        ...options
    })

    if(code === 204) {
        return {data: null};
    }

    const data = await response.json();    

    if(!response.ok) {        
        const error = {error: data.error, code: code};
        
        if(data.files) {
            error.files = data.files;
        }

        return error;
    }
    
    return {data: data};
}