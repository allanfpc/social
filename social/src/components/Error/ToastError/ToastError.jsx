import { useEffect } from "react";
import { useErrorContext } from "../../../contexts/ErrorContext";

export const ToastError = () => {
	const { hideError, store } = useErrorContext();
	const { errorProps } = store || {};
	const { error, files } = errorProps || {};

	useEffect(() => {
		let timeoutId;
		if (error) {
			timeoutId = setTimeout(() => {
				hideError();
			}, 10000);
		}

		return () => {
			clearTimeout(timeoutId);
		};
	}, [error]);

	return (
		<div className="error-toast-container">
			<div className="error-toast">
				<span>{`${error}`}</span>
			</div>
		</div>
	);
};
