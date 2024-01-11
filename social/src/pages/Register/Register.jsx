import Form from "../../components/Form";
import { useState } from "react";
import { useAuthContext } from "../../contexts/AuthContext";

import {
	loginValidation,
	registerValidation
} from "../../utils/inputValidations";

const initialData = {
	name: "",
	nickname: "",
	email: "",
	password: ""
};

const validations = [...registerValidation, ...loginValidation];

export const Register = () => {
	const { signUp } = useAuthContext();
	const [registered, setRegistered] = useState(false);
	const [formErrors, setFormErrors] = useState([]);
	const [error, setError] = useState(null);
	const [formData, setFormData] = useState(initialData);

	const handleSubmit = async (e) => {
		e.preventDefault();
		const data = await signUp(formData);

		if (!data) {
			return;
		}

		if (data.error) {
			setError(data.error);
		}

		if (data.success) {
			setFormErrors([]);
			setFormData(initialData);
			setRegistered(true);
		}
	};

	return (
		<div>
			<div className="form-container">
				{registered ? (
					<div>
						<h2>Successfully registered! </h2>
						<a href="/login">Login</a>
					</div>
				) : (
					<>
						<div className="form-title">
							<h2>Register</h2>
						</div>
						<div className="register">
							<Form
								title={"Register"}
								validator={validations}
								formData={formData}
								setFormData={setFormData}
								formErrors={formErrors}
								setFormErrors={setFormErrors}
								error={error}
								onSubmit={handleSubmit}
							>
								<div className="form-message">
									<a href="/login">
										<p className="cursor-pointer regular-14 text-blue-300">
											Already have an account? Sign in
										</p>
									</a>
								</div>
							</Form>
						</div>
					</>
				)}
			</div>
		</div>
	);
};
