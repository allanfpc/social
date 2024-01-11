import { useState, forwardRef } from "react";
import { useNavigate } from "react-router-dom";

import Actions from "./Actions"
import Album from '../Album';
import User from "../User";

const Post = ({ postsRef, post, actions, noAlbum }, ref) => {
	const navigate = useNavigate();

const Post = ({postsRef, post, lazy, actions, noAlbum}) => {
  const navigate = useNavigate();
  
  const [isVisible, setIsVisible] = useState(null);
  const {name, nickname, profile_img, date, text, images, id, post_id, liked, total_likes, total_comments, total_shares} = post;
  

  // useEffect(() => {

  //   const options = {
  //     root: null,
  //     rootMargin: "72px 0px 72px 0px",
  //     threshold: 0
  //   };

  //   const observer = new IntersectionObserver((entries) => {
  //     console.log(entries);
  //     const [entry] = entries;
  //     console.log(entry)
  //     //if(entry.isIntersecting)
  //     //setIsVisible(counter.current);
  //     if(entry.isIntersecting) {
  //       const id = entry.target.id;
  //       setIsVisible(id);
  //       observer.unobserve(entry.target);
  //     }
  //   }, options);

   
  //   if(lazy && postsRef) {    
  //     console.log(postsRef)    
  //     if (postsRef.length > 0) {
  //       for(const postRef of postsRef) {
  //         observer.observe(postRef);
  //       }
  //     };
  //   }

  //   return () => {
  //     console.log(postsRef, lazy)
  //     if(postsRef && lazy) {
  //       if (postsRef.length > 0) {
  //         for(const postRef of postsRef) {          
  //           observer.unobserve(postRef);
  //         }
  //       }
  //     }
  //   };
    
  // }, [])


  const handlePostClick = (e) => {
    const target = e.target;
    
    if(target.localName === "button" || target.localName === 'a') {
      e.stopPropagation();
    } else {
      navigate(`/post/${post.post_id}/status`);
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
            <div className="column">
              {text.length > 1 && (
                <div className="flex">
                  <div className="post__text">
                    <span>{text}</span>
                  </div>
                </div>
              )}
              {(images && !noAlbum) && (
                <Album
                  maxWidth={maxWidth}
                  post={post}
                  images={images}
                  isVisible={isVisible}
                />
              )}                
            </div>                        
            {actions && (
              <Actions
                postId={post_id}
                liked={liked}
                initialTotalLikes={total_likes}
                initialTotalComments={total_comments}
                initialTotalShares={total_shares}                
              />
            )}      
          </div>
        </div>
      </article>
    </div>
  )  
}

	return (
		<div className="container">
			<article onClick={(e) => handlePostClick(e)}>
				<div ref={ref} className="post">
					<div className="post-header">
						<User.Avatar
							img={{ src: profile_img, alt: name }}
							nickname={nickname}
						/>
					</div>
					<div className="post-body">
						<User.Desc nickname={nickname} name={name} date={date} />
						<div className="column post-body-content">
							{text && (
								<div className="message-wrapper">
									<div className="message">
										<p>{text}</p>
									</div>
								</div>
							)}
							{images && !noAlbum && (
								<Album
									maxWidth
									post={post}
									images={images}
									isVisible={isVisible}
								/>
							)}
						</div>
						{actions && (
							<Actions
								postId={post_id}
								liked={liked}
								initialTotalLikes={total_likes}
								initialTotalComments={total_comments}
								initialTotalShares={total_shares}
							/>
						)}
					</div>
				</div>
			</article>
		</div>
	);
};

export default forwardRef(Post);
