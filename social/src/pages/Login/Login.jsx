import { useState, useEffect, useRef } from "react";
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

export const Login = () => {

  const {signIn} = useAuthContext();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialData);
  const [formErrors, setFormErrors] = useState([]);
  const [error, setError] = useState(null);
  const loginInputRefs = useRef([]);

  const err = formErrors.reduce((acc, el) => {
    acc[el.name] = el;    
    return acc;
  }, []);

  useEffect(() => {
    loginInputRefs.current['email'].focus();    
  }, []);

  const handleSignIn = (e) => {
    const validate = validateForm(formData, loginValidation);

    if(validate.errors) {
      const errors = validate.errors
      setFormErrors(errors);      
      
      const firstErrorRef = loginInputRefs.current[errors[0].name];
      firstErrorRef.focus();

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
			navigate('/');
			return true;
		}
  }

  const changeText = (e, validation) => {        
    if(formErrors.length > 0) {      
      const filteredErrors = formErrors.filter((err) => (
        err.name !== validation.name
      ))
      setFormErrors(filteredErrors);
    }
    
    setFormData({...formData, [validation.name]: err[validation.name] ? e.nativeEvent.data : e.target.value})
  }

  return (
    <div>
      <div className="form-container">
        <div className="form-title">
          <h2>Login</h2>
        </div>
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-body">
            {loginValidation.map((validation, i) => (
              <Input
                className={err[validation.name] ? 'error' : ''}
                key={validation.id}
                inputRef={(ref) => loginInputRefs.current[validation.name] = ref}
                label={validation.label}                      
                name={validation.name}
                type={validation.type}
                id={validation.id}                      
                minlength={validation.validation.minLength?.value}
                maxlength={validation.validation.maxLength?.value}
                value={err[validation.name] ? '' : formData[validation.name]}
                error={err[validation.name]}
                onChange={(e) => changeText(e, validation)}                    
              />              
            ))}              
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