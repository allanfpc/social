import { useState, createContext, useContext, lazy, Suspense } from "react";

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

export const ErrorContextProvider = ({ children }) => {
	const [store, setStore] = useState();
	const { modalType, modalProps } = store || {};

	const showError = (modalType, modalProps) => {
		setStore({
			...store,
			modalType,
			modalProps
		});
	};

	const hideError = () => {
		setStore({
			...store,
			modalType: null,
			modalProps: {}
		});
	};

	const renderComponent = () => {
		if (modalType === 404) {
			return location.assign("/404");
		}

		if (modalType === 500) {
			return location.assign("/500");
		}

		const ErrorComponent = ERROR_COMPONENTS[modalType];

		if (!modalType || !ErrorComponent) {
			return null;
		}

		return (
			<Suspense>
				<ErrorComponent id="error" {...modalProps} />
			</Suspense>
		);
	};

	// We expose the context's value down to our components, while
	// also making sure to render the proper content to the screen
	const exceptionChildren = [404, 500];

	return (
		<ErrorContext.Provider value={{ store, showError, hideError }}>
			{renderComponent()}
			{!exceptionChildren.includes(modalType) && children}
		</ErrorContext.Provider>
	);
};

export const useErrorContext = () => useContext(ErrorContext);
