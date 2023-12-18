import Cookies from "js-cookie";

import Login from "../pages/Login";
import Register from '../pages/Register';
import Home from "../pages/Home";
import Timeline from "../pages/Timeline";
import Status from "../pages/Status/Status";

import ErrorFallback from "../components/Error/ErrorFallback/ErrorFallback";

export default function route() {
	const token = Cookies.get('token');

	return [
		{
			path: "/",
			element: <Home />
		},
		{
		  path: "/login",
		  element: <Login />
		},
		{
		  path: "/register",
		  element: <Register />
		},
		{
		  path: "/post/:post_id/status",
		  element: <Status />,
		  errorElement: <ErrorFallback />,
		  loader: async ({ params }) => {
			  const response = await fetch(`${import.meta.env.VITE_SERVER_BASE_URL}/posts/${params.post_id}`, {
				  method: 'GET',				  
			  });
			  console.log(response)
			  if (!response.ok) {
				  const errorResponse = await response.json();
				  const { error, message } = errorResponse;				

				  throw new Response(error || message, {status: response.status});
			  }
			  
			  return await response.json();
			},
		},
		{
			path: `/users/:nickname`,
			element: <Timeline />,
			errorElement: <ErrorFallback />,
			loader: async ({params}) => {				
				const response = await fetch(`${import.meta.env.VITE_SERVER_BASE_URL}/users?username=${params.nickname}`, {
					method: 'GET',					
				});

				if (!response.ok) {
					const errorResponse = await response.json();
					const { error, message } = errorResponse;

					throw new Response(error || message, {status: response.status});
				}
				
				return await response.json();
			}
		}
	];
}
