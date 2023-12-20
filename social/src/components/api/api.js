import { useState, useEffect } from "react";
import { useErrorStatus } from "../../contexts/ErrorContext";

const SERVER_BASE_URL = import.meta.env.VITE_SERVER_BASE_URL;

export function useQuery({path, options = {}}) {
    const { setErrorStatusCode } = useErrorStatus();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const headers = options.headers == {} || {
        "Content-Type": "application/json",
        ...options.headers
    };

    useEffect(() => {
        const cachedData = localStorage.getItem(path);

        if(cachedData) {
            setData(JSON.parse(cachedData));
            setLoading(false);
        } else {
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
                    localStorage.setItem(path, JSON.stringify(data));
                }
              }).finally(() => {            
                setLoading(false);
              })
        }

        
      }, [path]);

    return {data, setData, loading, error};
    
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

    const code = response.status;

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