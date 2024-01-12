import { useState, useEffect } from "react";
import { CustomError, useErrorContext } from "../../contexts/ErrorContext";

const SERVER_BASE_URL = import.meta.env.VITE_SERVER_BASE_URL;

export function useQuery({ path, options = {} }) {
	const { showError } = useErrorContext();
	const [data, setData] = useState([]);
	const [loading, setLoading] = useState(true);

	const headers = options.headers == {} || {
		"Content-Type": "application/json",
		...options.headers
	};

	useEffect(() => {
		if (loading) {
			document.body.classList.add("loading");
		}

		return () => {
			document.body.classList.remove("loading");
		};
	}, [loading]);

	useEffect(() => {
		const abortController = new AbortController();
		const signal = abortController.signal;
		const lastOpt = {
			method: options.method || "GET",
			headers,
			credentials: "include",
			...options,
			signal
		};
		const fetchData = async () => {
			try {
				const response = await fetch(`${SERVER_BASE_URL}/${path}`, lastOpt);

				if (response.status === 204) {
					if (!signal.aborted) {
						setLoading(false);
					}
					return;
				}

				if (!response.ok) {
					throw new CustomError(response.status, response.statusText);
				}

				const data = await response.json();

				if (!signal.aborted) {
					setData(data);

					// sessionStorage.setItem(path, JSON.stringify({ data, page: 1 }));
					// sessionStorage.setItem('storedPaths', JSON.stringify([...JSON.parse(storedPaths || '[]'), path]))
				}
			} catch (error) {
				if (error.name !== "AbortError") {
					showError(error, undefined, fetchData);
				}
			} finally {
				if (!signal.aborted) {
					setLoading(false);
				}
			}
		};

		fetchData();

		return () => {
			abortController.abort();
		};
	}, [path]);

	return { data, setData, loading };
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