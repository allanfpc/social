import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Cookies from "js-cookie";

import ErrorBoundary from './components/Error/ErrorBoundary';

import ThemeContextProvider from "./contexts/ThemeContext";
import AuthContextProvider from "./contexts/AuthContext";

import { ErrorHandler } from "./contexts/ErrorContext";

import PrivateRoute from "./routes/private_route";
import PublicRoute from "./routes/public_route";


const publicRoutes = PublicRoute();
const privateRoutes = PrivateRoute();

function App() {
    
    const router = createBrowserRouter([
        ...publicRoutes,
        ...privateRoutes,
    ]);

	return (
        <ErrorBoundary>
            <ErrorHandler>
                <AuthContextProvider>     
                    <ThemeContextProvider>                        
                        <RouterProvider router={router} />
                    </ThemeContextProvider>
                </AuthContextProvider>
            </ErrorHandler>
        </ErrorBoundary>
	);
}

export default App;