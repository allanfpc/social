export const Desc = ({nickname, name, date}) => {
  return (
    <div className="user">
      <div className="user__desc">
        <a href={`/users/${nickname}`}>
          <div className="user__desc__info">
            <div className="name">
              <span>{name}</span>
            </div>
            {date && (
              <div className="date">
                <span>{date}</span>
              </div>
            )}
          </div>
        </a>
      </div>
    </div>
  )
}

export const Avatar = ({img, size, nickname, children}) => {
  return (
    <div className="avatar">
        <a href={`/users/${nickname}`}>
          <div className="avatar__img">
            <img src={`/uploads/profile/${img.src || 'default.png'}`} alt={img.alt} width={size || 62} height={size || 62} />
            {children}
          </div>
        </a>
    </div>
  )
}

const User = {
  Desc: Desc,
  Avatar: Avatar,
}

export default User;