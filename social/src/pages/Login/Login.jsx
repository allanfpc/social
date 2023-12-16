import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

import Input from "../../components/Input";
import Button from "../../components/Button";

import { useAuthContext } from "../../contexts/AuthContext";

import { loginValidation } from '../../utils/inputValidations';
import validateForm from "../../utils/formValidation";

const initialData = {
  email: '',
  password: '',
}

const Login = () => {

  const {signIn} = useAuthContext();
  const [formData, setFormData] = useState(initialData);
  const [formErrors, setFormErrors] = useState([]);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleSignIn = (e) => {
    const validate = validateForm(formData, loginValidation);

    if(validate.errors) {
      setFormErrors(validate.errors);
      e.preventDefault();
      return false;
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = await signIn(formData);

    if(!data) {
      return;
    }

    if(data.error) {
      setError(data.error);
    }

    if(data.success) {
      setFormErrors([]);
      setFormData(initialData);
    }

    if(data.token) {
      console.log('redirect');
			navigate('/');
			return true;
		}
  }

  const changeText = (e, validation, error) => {    
    if(error) {      
      setFormData({...formData, [validation.name]: ''})  
      const deleteError = formErrors.filter((err) => (
        err.name !== validation.name
      ))
      setFormErrors(deleteError);
    }
    setFormData({...formData, [validation.name]: e.target.value})
  }
  
  return (
    <div>
      <div className="form-container">
        <div className="form-title">
          <h2>Login</h2>
        </div>
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-body">
            {loginValidation.map((validation, i) => {
              const error = formErrors.find((err) => 
                err.name === validation.name
              )

              return (
                <Input
                  key={validation.id}
                  error={error}
                  label={validation.label}
                  name={validation.name}
                  type={validation.type}
                  id={validation.id}
                  minlength={validation.validation.minLength?.value}
                  maxlength={validation.validation.maxLength?.value}
                  value={error ? '' : formData[validation.name]}
                  onChange={(e) => changeText(e, validation, error)}                  
                />
              )
            })}                      
            {error && (
              <div className="error-container">
                <span>{error}</span>
              </div>
            )} 
          </div>
          <div className="form-actions">
            <div className="flex">
                <Button type="submit" title="Login" className="btn-filled" onClick={(e) => handleSignIn(e)}/>
            </div>
            <div className="form-message">
              <a href="/register">
                <p className="cursor-pointer regular-14 text-blue-300">Don't have an account? Sign Up</p>
              </a>
            </div>
          </div>
        </form>               
      </div>
    </div>
  )
}

export default Login