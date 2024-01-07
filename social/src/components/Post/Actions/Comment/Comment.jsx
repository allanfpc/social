import { useEffect, useState } from "react";


import Textarea from "../../../Textarea";
import Button from "../../../Button"
import Post from "../..";

import { fetchAction, useQuery } from "../../../api/api";
import { useErrorContext } from "../../../../contexts/ErrorContext";

const Comment = ({ postId }) => {
  const [message, setMessage] = useState(sessionStorage.getItem('comment_text') || '');
  const [counter, setCounter] = useState(0);

  const {data: post, loading } =  useQuery({
    path: `posts/${postId}`,
  })

  const handleMsgChange = (e) => {
    sessionStorage.setItem('comment_text', e.target.value);
    setMessage(e.target.value);
    setCounter(counter + 1);
  }

  return (
    <>
      <div className="modal__message">
        <Textarea
          type="text"
          onChange={handleMsgChange}
          value={message}
          maxlength={500}
          id="comment"
          name="comment"
          placeholder="Write here..."         
          autofocus
          counter
        />        
      </div>
      <div className="post-wrapper">
        {loading && (
          <div className="flex-center container">
            <div className="loading">
              <span></span>
            </div>
          </div>
        )}
        {post.length > 0 && (
          <Post
            post={post[0]}
            maxWidth
          />
        )}
      </div>      
    </>
  )
}

export default Comment