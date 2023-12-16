import { Link } from "react-router-dom"

const Logo = () => {
  return (
    <Link  to={'/'}>
      <img src="/src/assets/logo/bird-sm.png" alt="Logo"/>
    </Link>
  )
}

export default Logo