import { Link } from "react-router-dom"

const Logo = () => {
  return (
    <div className="logo">
      <Link  to={'/'}>        
        <img src="images/android-chrome-192x192.png" alt="Logo" width={56} height={56} />
      </Link>
    </div>
  )
}

export default Logo