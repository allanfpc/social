import { useLoaderData, useRouteError } from "react-router-dom";
import Page404 from "../../../pages/Error/404";
import Page500 from "../../../pages/Error/500";

const ErrorFallback = () => {
	const error = useRouteError();
	console.log('error: ', error);
	// error = useRouteError() || JSON.parse(error.message);
	const code = error.status;
	
	if(code === 404) {
		return <Page404 />
	}
	
	return <Page500 />
};

export default ErrorFallback;
