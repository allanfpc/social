const Button = ({label, title, type, className, onClick, children, buttonRef}) => {  
  return (
    <button className={className} onClick={onClick} type={type} ref={buttonRef || undefined}>
      {title && (
        <span>{title}</span>
      )}        
      {children}
      {label && (
        <span className='visually-hidden'>{label}</span>          
      )}
    </button>
  )
}

export default Button;