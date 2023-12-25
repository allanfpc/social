import { lazy, Suspense } from "react";

const ErrorFallback = lazy(() => import('../components/Error/ErrorFallback'));

export default function route() {
	return [
		{
			path: "/",
			async lazy() {
				let { Layout } = await import("../layouts/Layout");
				return { Component: Layout };
			},
			children: [{
				index: true,
				async lazy() {
					let { Home } = await import("../pages/Home");
					return { Component: Home };
				},
			},
			{
				path: `/users/:nickname`,				
				errorElement: <Suspense><ErrorFallback/></Suspense>,
				async loader({ request, params }) {
					let { default: loader } = await import("../pages/Timeline");
					return loader({ request, params });
				},				
				lazy: () => import("../pages/Timeline"),
			},
			{
				path: "/post/:post_id/status",				
				errorElement: <Suspense><ErrorFallback /></Suspense>,
				async loader({ request, params }) {
					let { default: loader } = await import("../pages/Status");
					return loader({ request, params });
				},
				lazy: () => import("../pages/Status"),
			}]
		},		
		{
			path: "/login",
			async lazy() {
				let { Login } = await import("../pages/Login");
				return { Component: Login };
			},
		},
		{
			path: "/register",
			async lazy() {
				let { Register } = await import("../pages/Register");
				return { Component: Register };
			},
		},
		{
			path: "/500",
			async lazy() {
				let { Page500 } = await import("../pages/Error/500");
				return { Component: Page500 };
			},
		},		
		{
			path: "/404",
			async lazy() {
				let { Page404 } = await import("../pages/Error/404");
				return { Component: Page404 };
			},
		}		
	];
}
