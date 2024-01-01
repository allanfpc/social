import { Outlet } from "react-router-dom";
import { useQuery } from "../components/api/api";

const ProtectedRoute = () => {
	const [user] = useQuery({
		path: 'auth/user',
	})

	if(!user || user.guest) {
		return location.href = '/login';
	}
	
	return (
	  <Outlet />
	);
  };

export default function privateRoutes() {

	return [		
		{	
			path: '/protected',
			element: <ProtectedRoute />,
			children: [
				{
					index: true,					
				}
			]
		}
	];	
}
