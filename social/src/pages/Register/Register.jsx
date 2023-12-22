import Input from "../../components/Input";
import Button from "../../components/Button";
import { useEffect, useRef, useState } from "react";
import { useAuthContext } from "../../contexts/AuthContext";

import { loginValidation, registerValidation } from '../../utils/inputValidations';

import validateForm from "../../utils/formValidation";

const initialData = {
  name: '',
  nickname: '',
  email: '',
  password: '',
}

const validations = [...registerValidation, ...loginValidation];

export const Register = () => {

  const {signUp} = useAuthContext();
  const [registered, setRegistered] = useState(false);
  const [formData, setFormData] = useState(initialData);
  const [formErrors, setFormErrors] = useState([]);
  const [error, setError] = useState(null);
  const registerInputRefs = useRef([]);

  const err = formErrors.reduce((acc, el) => {
    acc[el.name] = el;    
    return acc;
  }, []);

  useEffect(() => {
    registerInputRefs.current['name'].focus();    
  }, []);

  const handleSignUp = (e) => {
    const validate = validateForm(formData, validations);
    
    if(validate.errors) {
      const errors = validate.errors
      setFormErrors(errors);      
      
      const firstErrorRef = registerInputRefs.current[errors[0].name];
      firstErrorRef.focus();

      e.preventDefault();
      return false;
    }
  }  

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = await signUp(formData);

    if(!data) {
      return;
    }

    if(data.error) {
      setError(data.error);
    }

    if(data.success) {
      setFormErrors([])
      setFormData(initialData);
      setRegistered(true);
    }    
  }

  const changeText = (e, validation) => {
    if(formErrors.length > 0) {      
      const filteredErrors = formErrors.filter((err) => (
        err.name !== validation.name
      ))
      setFormErrors(filteredErrors);
    }
    
    setFormData({...formData, [validation.name]: e.target.value})
  }

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
              <form onSubmit={handleSubmit} noValidate>
                <div className="form-body">
                  {validations.map((validation, i) => (
                    <Input
                      className={err[validation.name] ? 'error' : ''}
                      key={validation.id}
                      inputRef={(ref) => registerInputRefs.current[validation.name] = ref}
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
                    <Button type="submit" title="Register" className="btn-filled" onClick={(e) => handleSignUp(e)}/>
                  </div>
                  <div className="form-message">
                    <a href="/login">
                      <p className="cursor-pointer regular-14 text-blue-300">Already have an account? Sign in</p>
                    </a>
                  </div>
                </div>
              </form>                
            </div>
          </>
        )}
      </div>
    </div>
  )
}