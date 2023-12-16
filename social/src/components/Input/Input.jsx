
import {useRef} from 'react';

const Input = ({label, placeholder, name, id, type, value = '', maxlength, minlength, onChange, error}) => {
  const inputRef = useRef(null);

  // if(error) {
  //   inputRef.current.focus();
  // }

  return (
    <div className="row">
      <div className={`input-container ${(value === '' && error) ? 'input-error' : ''}`}>
        <div>
          <input ref={inputRef} onChange={onChange} maxLength={maxlength} minLength={minlength} className={``} type={error ? 'text' : type} name={name} id={id} value={value} placeholder={error && error.message || placeholder} />
          {label && (
            <div className={`flex input-label ${value.length > 0 ? 'move-label' : ''}`}>
              <label className="bold-16 text-white capitalize" htmlFor={id}>{label}</label>
            </div>
          )}
        </div>
        {error && (
          <div className="icon-error">
            <svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M480-290.77q13.731 0 23.019-9.288 9.288-9.289 9.288-23.019 0-13.731-9.288-23.019-9.288-9.288-23.019-9.288-13.731 0-23.019 9.288-9.288 9.288-9.288 23.019 0 13.73 9.288 23.019 9.288 9.288 23.019 9.288Zm-29.999-146.153h59.998v-240h-59.998v240Zm30.066 336.922q-78.836 0-148.204-29.92-69.369-29.92-120.682-81.21-51.314-51.291-81.247-120.629-29.933-69.337-29.933-148.173t29.92-148.204q29.92-69.369 81.21-120.682 51.291-51.314 120.629-81.247 69.337-29.933 148.173-29.933t148.204 29.92q69.369 29.92 120.682 81.21 51.314 51.291 81.247 120.629 29.933 69.337 29.933 148.173t-29.92 148.204q-29.92 69.369-81.21 120.682-51.291 51.314-120.629 81.247-69.337 29.933-148.173 29.933Z"/></svg>
          </div>
        )}
      </div>      
    </div>
  )
}

export default Input