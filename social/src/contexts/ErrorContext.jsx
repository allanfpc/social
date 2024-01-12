import { useState, createContext, useContext, lazy, Suspense } from "react";

export class CustomError extends Error {
	constructor(code, message) {
		super(message);
		console.log(code, message);

		this.code = code;

		Object.setPrototypeOf(this, CustomError.prototype);
	}
}

const ToastError = lazy(() =>
	import("../components/Error/ToastError").then((module) => ({
		default: module.ToastError
	}))
);

const AuthModal = lazy(() =>
	import("../components/Modal").then((module) => ({
		default: module.AuthModal
	}))
);

const initialState = {
	showError: () => {},
	hideError: () => {},
	store: {}
};

const ERROR_COMPONENTS = {
	TOAST_ERROR: ToastError,
	401: AuthModal
};

const ErrorContext = createContext(initialState);
let retry = true;
export const ErrorContextProvider = ({ children }) => {
	const [store, setStore] = useState();
	const { error, errorProps, cb } = store || {};

	const showError = (error, errorProps, cb) => {
		setStore({
			...store,
			error,
			errorProps,
			cb
		});
	};

	const hideError = () => {
		setStore({
			...store,
			error: null,
			errorProps: {}
		});
	};

	const renderComponent = () => {
		const redirectRoutes = [403, 404, 500];

		if (error instanceof CustomError) {
			const code = error.code;
			if (code && redirectRoutes.includes(code)) {
				return location.assign(`/${code}`);
			}
		}

		if (error instanceof TypeError) {
			if (cb && retry) {
				setTimeout(() => {
					cb();
					retry = false;
				}, 3000);
			} else {
				showError("TOAST_ERROR", {
					error: "NetworkError, try again later"
				});
			}
		}

		const ErrorComponent = ERROR_COMPONENTS[error?.code || error];

		if (!error || !ErrorComponent) {
			return null;
		}

		return (
			<Suspense>
				<ErrorComponent id="error" {...errorProps} />
			</Suspense>
		);
	};

	// We expose the context's value down to our components, while
	// also making sure to render the proper content to the screen
	const exceptionChildren = [403, 404, 500];

	return (
		<ErrorContext.Provider value={{ store, showError, hideError }}>
			{renderComponent()}
			{!exceptionChildren.includes(error) && children}
		</ErrorContext.Provider>
	);
};

export const useErrorContext = () => useContext(ErrorContext);
