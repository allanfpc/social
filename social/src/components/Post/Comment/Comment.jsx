import User from "../../User";

const Comment = ({comment}) => {
  return (
    <div>
        <div className="comment">
            <div>
                <User.Avatar img={{src: comment.profile_img, alt: comment.name}} nickname={comment.nickname} size={48} />                
                <div>
                    <div>
                        <User.Desc name={comment.name} nickname={comment.nickname} date={comment.date} />
                    </div>
                    <div className="message">
                        <p>{comment.comment}</p>
                    </div>                    
                </div>
            </div>
        </div>
    </div>
  )
}

export default Comment