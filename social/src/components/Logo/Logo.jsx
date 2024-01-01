import { Link } from "react-router-dom"

const Logo = () => {
  return (
    <div className="logo">
      <Link  to={'/'}>
        <img src="/src/assets/logo/bird-sm.png" alt="Logo" width={32} height={32} />
      </Link>
    </div>
  )
}

export default Logo