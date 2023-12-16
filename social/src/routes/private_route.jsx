import { useNavigate, Outlet } from "react-router-dom";

import Home from "../pages/Home";

import { useEffect } from "react";
import Cookies from "js-cookie";

const ProtectedRoute = () => {
	const navigate = useNavigate();

	const token = Cookies.get('token')

	useEffect(() => {
		if(!token) {
			navigate('/login')
		}
	}, [token])

	return (
	  <Outlet />
	);
  };

export default function privateRoutes() {

	return [		
		{
			element: <ProtectedRoute />,
			children: [
				{
					path: "/private",
					element: <Home />
				},
				{
					path: "/settings",
					element: <Home />
				}
			]
		}
	];
	
}
