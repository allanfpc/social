import { useState } from "react";

import Form from "../../components/Form";

import { useAuthContext } from "../../contexts/AuthContext";

import { loginValidation } from "../../utils/inputValidations";

const initialData = {
	email: "",
	password: ""
};

export const Login = () => {
	const { signIn } = useAuthContext();
	const [formData, setFormData] = useState(initialData);
	const [formErrors, setFormErrors] = useState([]);
	const [error, setError] = useState(null);

	const handleSubmit = async (e) => {
		e.preventDefault();
		const data = await signIn(formData);

		if (!data) {
			return;
		}

		if (data.error) {
			setError(data.error);
		}

		if (data.success) {
			setFormErrors([]);
			setFormData(initialData);
		}

		if (data.token) {
			location.assign("/");
		}
	};

	return (
		<div>
			<div className="form-container">
				<div className="form-title">
					<h2>Login</h2>
				</div>
				<Form
					title={"Login"}
					validator={loginValidation}
					formData={formData}
					setFormData={setFormData}
					formErrors={formErrors}
					setFormErrors={setFormErrors}
					error={error}
					onSubmit={handleSubmit}
				>
					<div className="form-actions">
						<div className="form-message">
							<a href="/register">
								<p className="cursor-pointer regular-14 text-blue-300">
									Don&apos;t have an account? Sign Up
								</p>
							</a>
						</div>
					</div>
				</Form>
			</div>
		</div>
	);
};
