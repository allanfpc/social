import { useNavigate } from "react-router-dom";

import Actions from "./Actions"
import Album from '../Album';
import User from "../User";

const Post = ({name, nickname, profile_img, date, actions, text, images, id, liked, totalLikes, totalComments, totalShares, setModal}) => {  
  
  const navigate = useNavigate();

  const handlePostClick = (e) => {
    const target = e.target;
    
    if(target.localName === "button" || target.localName === 'a') {
      e.stopPropagation();      
    } else {
      navigate(`/post/${id}/status`);
    }
  }

  return (
    <div className="container">
      <article onClick={(e) => handlePostClick(e)}>
        <div className="post">
          <div className="post__header">
            <User.Avatar img={{src: profile_img, alt: name}} nickname={nickname} />
          </div>
          <div className="post__body"> 
            <User.Desc nickname={nickname} name={name} date={date} />
            <div className="flex">
              <div className="flex-container">
                <div className="">
                  <div className="post__text">
                    <span>{text}</span>
                  </div>
                </div>
                {images && (
                  <Album
                    images={images}
                    setModal={setModal}
                  />
                )}
              </div>
            </div>            
            {actions && (
              <Actions
                id={id}
                liked={liked}
                initialTotalLikes={totalLikes}
                initialTotalComments={totalComments}
                initialTotalShares={totalShares}
                setModal={setModal}
              />
            )}      
          </div>
        </div>
      </article>
    </div>
  )
}

export default Post