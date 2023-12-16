import Input from "../../components/Input";
import Button from "../../components/Button";
import { useContext, useState } from "react";
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

const Register = () => {

  const {signUp} = useAuthContext();
  const [registered, setRegistered] = useState(false);
  const [formData, setFormData] = useState(initialData);
  const [formErrors, setFormErrors] = useState([]);
  const [error, setError] = useState(null);

  const handleSignUp = (e) => {    
    const validate = validateForm(formData, validations);

    if(validate.errors) {
      console.log('errors: ', validate.errors);
      setFormErrors(validate.errors);      
      
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
                    {validations.map((validation, i) => {
                      const error = formErrors.find((err) => 
                        err.name === validation.name
                      )
                      console.log('find: ', error);
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

export default Register