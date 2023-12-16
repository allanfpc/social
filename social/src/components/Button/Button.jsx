import logo from '../../assets/bx-share.svg';
console.log(logo)

const Button = ({icon, label, title, type, className, onClick, children}) => {  
  return (
    <button className={className} onClick={onClick} type={type}>
        {icon 
        ? (<img className="svg" src={icon.src} alt={icon.alt} width={icon.width || 24} height={icon.height || 24} />) 
        : title && (<span>{title}</span>)
        }
        {children}
        {label && (
          <span className='visually-hidden'>{label}</span>          
        )}
    </button>
  )
}

export default Button