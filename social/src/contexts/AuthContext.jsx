import { createContext, useState, useEffect, useContext } from "react";
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

import { fetchAction } from "../components/api/api";
import { useErrorStatus } from "./ErrorContext";

export const AuthContext = createContext(null);

export default function AuthContextProvider({ children }) {
	const {setErrorStatusCode} = useErrorStatus();
	const [user, setUser] = useState(null);
	const isAuthenticated = !!user;
	
	const token = Cookies.get('token');
	
	useEffect(() => {		
		let isMounted = true;		
		
		// const timeoutId = setTimeout(() => {
		// 	token = Cookies.get('token');
		// 	console.log('check token: ')
		// 	if(!token) {
		// 		console.log('token expired');
		// 		//navigate('/login');
		// 	}
		// }, (1000 * 60 * 60) + 10000)

		fetchAction({     
			path: 'auth/user',
			options: {
			  method: 'GET',
			  headers: { 
				'Content-Type': 'application/json',
				authorization: token ? `Bearer ${token}` : undefined
			  },
			  credentials: 'include',
			}
		}).then((response) => {
			console.log("RESP: ", response)
			if(response.error && response.code) {
				return setErrorStatusCode(response.code)
			}		

			const user = response.data;

			if(isMounted) {
				if(user && !user.guest) {
					setUser(user);
				}
			}
		});

		return(() => {
			isMounted = false;	
			//clearTimeout(timeoutId)
		})

	}, [token]);


    async function signUp(user) {
		const response = await fetchAction({     
			path: 'register',       
			options: {
			  method: 'POST',
			  headers: { 
				'Content-Type': 'application/json'
			  },
			  body: JSON.stringify(user)
			}
		});
		
		if(response.error && response.code) {
			if(response.code === 409) {
				return response;
			} else {
				return setErrorStatusCode(response.code)
			}
        }
        
        return response.data;
		
	}

	async function signIn(user) {
		signOut();

		const response = await fetchAction({     
			path: 'login',       
			options: {
			  method: 'POST',
			  headers: { 
				'Content-Type': 'application/json'				
			  },
			  credentials: 'include',
			  body: JSON.stringify(user)
			}
		});
	
		
		if(response.error && response.code) {
			if(response.code === 401) {
				return response;
			} else {
				return setErrorStatusCode(response.code)
			}
        }
        
		const data = response.data;
		
		if(data.success) {			
			setUser(data.user);
		}

		return data;
	}

	function signOut() {
		const token = Cookies.get('token');
		if(token) {			
			Cookies.remove('token');
		}
	}

	return (
		<AuthContext.Provider value={{user, isAuthenticated, token, signIn, signUp, signOut}}>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuthContext() {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error(
			"useAuthContext must be used within a useAuthContext"
		);
	}

	return context;
}