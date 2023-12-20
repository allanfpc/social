import { createContext, useState, useEffect, useContext } from "react";

import { fetchAction } from "../components/api/api";
import { useErrorStatus } from "./ErrorContext";

export const AuthContext = createContext(null);
const preventRoutes = ['/login', '/register', '/signout', '/404', '/500'];

export default function AuthContextProvider({ children }) {
	const {setErrorStatusCode} = useErrorStatus();
	const [user, setUser] = useState(null);
	const isAuthenticated = user && !user.guest;
	
	useEffect(() => {		
		let isMounted = true;		
		let timeoutId;

		if(!preventRoutes.includes(location.pathname)) {
			fetchAction({     
				path: 'auth/user',			
			}).then((response) => {
				if(response.error && response.code) {
					return setErrorStatusCode(response.code);
				}		
				
				const user = response.data;
				if(isMounted) {
					if(user) {
						setUser(user);
						
						if(user.guest) {
							timeoutId = setTimeout(() => {
								location.href = '/login';
							}, 1000 * 60 * 60)
						}
					}
				}
			});
		}

		return(() => {
			isMounted = false;	
			clearTimeout(timeoutId)
		})

	}, []);


    async function signUp(user) {
		const response = await fetchAction({     
			path: 'register',       
			options: {
			  method: 'POST',
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

	async function signOut() {
		const response = await fetchAction({
			path: 'signout',
		});

		if(response.error && response.code) {			
			return setErrorStatusCode(response.code)
        }
	}

	return (
		<AuthContext.Provider value={{user, isAuthenticated, signIn, signUp, signOut}}>
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