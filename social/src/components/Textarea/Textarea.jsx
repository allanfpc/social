
import {useRef} from 'react';

const Textarea = ({label, placeholder, name, id, cols, rows, autofocus = false, value = '', maxlength, counter, onChange, error}) => {
  console.log('value: ', value);

  return (
    <>
      <div className="input">
      {label && (
        <div className="flex input-label">
          <label className="bold-16 text-white capitalize" htmlFor={id}>{label}</label>
        </div>
      )}
      <div className={`textarea-container ${(value === '' && error) ? 'input-error' : ''}`}>
        <div>
          <textarea 
            onChange={onChange}             
            className={``}
            name={name} 
            id={id} 
            value={value} 
            maxLength={maxlength}
            placeholder={placeholder}
            autoFocus={autofocus}
            cols={cols || 32}
            rows={rows || 4}
          />
        </div>
        {counter && (
          <div className={`counter ${(value.length >= maxlength) ? 'exceed' : ''}`}>
            <span>{`${value.length}/${maxlength}`}</span>
          </div>
        )}
      </div>      
    </div>
    {error && (
      <div className='alert'>
        <span>{error.message}</span>
      </div>
    )}
    </>
  )
}

export default Textarea