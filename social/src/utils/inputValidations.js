const loginValidation = [	
	{
		name: "email",
		label: "email",
		type: "email",
		id: "email",
		placeholder: "Email",
		validation: {
			required: {
				value: true,
				message: "required"
			},
			maxLength: {
				value: 30,
				message: "30 characters max"
			},
			pattern: {
				value: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/,
				message: "invalid email"
			}
		}
	},	
	{
		name: "password",
		label: "password",
		type: "password",
		id: "password",
		placeholder: "Password",
		validation: {
			required: {
				value: true,
				message: "required"
			},
			minLength: {
				value: 8,
				message: "min 8 characters"
			},
			maxLength: {
				value: 30,
				message: "30 characters max"
			},
			pattern: {
				value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*_=+-]).{8,16}$/,
				message: "Password must contain at least one number and one uppercase letter"
			}
		}
	},
]

const registerValidation = [
	{
		name: "name",
		label: "name",
		type: "text",
		id: "name",
		placeholder: "Name",
		validation: {
			required: {
				value: true,
				message: "required"
			},
			maxLength: {
				value: 50,
				message: "50 characters max"
			},
			pattern: {
				value: /^[a-z0-9A-Z]+$/u,
				message: "invalid name"
			}
		}
	},
	{
		name: "nickname",
		label: "nickname",
		type: "text",
		id: "nickname",
		placeholder: "Nickname",
		validation: {
			required: {
				value: true,
				message: "required"
			},
			maxLength: {
				value: 30,
				message: "30 characters max"
			},
			pattern: {
				value: /^[a-z0-9A-Z]+$/u,
				message: "invalid nickname"
			}
		}
	}
]

export {loginValidation, registerValidation};