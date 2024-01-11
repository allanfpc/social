import { useEffect } from "react";

import Button from "../Button";
import { Login } from "../../pages/Login";

import { useErrorContext } from "../../contexts/ErrorContext";

export const AuthModal = () => {
	const { hideError } = useErrorContext();

	// useEffect(() => {
	// 	document.body.classList.add("modal-open");

	// 	return () => {
	// 		document.body.classList.remove("modal-open");
	// 	};
	// }, []);
	const onClose = () => {
		hideError();
	};

	return (
		<div className="modal auth" onClick={onClose}>
			<div className="modal__content" onClick={(e) => e.stopPropagation()}>
				<div className="modal__header">
					<div>
						<Button className="close" onClick={onClose}>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								height="24"
								viewBox="0 -960 960 960"
								width="24"
							>
								<path d="M256-213.847 213.847-256l224-224-224-224L256-746.153l224 224 224-224L746.153-704l-224 224 224 224L704-213.847l-224-224-224 224Z" />
							</svg>
						</Button>
					</div>
				</div>
				<div className="modal__body">
					<Login />
				</div>
			</div>
		</div>
	);
};
