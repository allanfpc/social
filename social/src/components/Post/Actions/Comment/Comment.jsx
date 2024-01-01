import { useEffect, useState } from "react";


import Textarea from "../../../Textarea";
import Button from "../../../Button"
import Post from "../..";

import { fetchAction, useQuery } from "../../../api/api";
import { useErrorStatus } from "../../../../contexts/ErrorContext";

const Comment = ({ postId, totalComments, setTotalComments, hideModal }) => {

  const { setErrorStatusCode } = useErrorStatus();
  const [message, setMessage] = useState('');
  const [counter, setCounter] = useState(0);
  const [error, setError] = useState(null);  

  const {data: post, loading } =  useQuery({
    path: `posts/${postId}`,
  })

  const comment = async () => {

    if(message.length === 0) {
        setError({message: 'Please comment something'});
        return false;
    }

    const regex = /[0-9]/i

    const match = regex.test(message);
    console.log('match: ', match);
    if(!match) {
      setError({message: 'Not valid regex'});
      return false;
    }

    const response = await fetchAction({
      path: `posts/${postId}/comments`,
      options: {
        method:  'POST',
        body: JSON.stringify({comment: message})
      }
    });

    if(response.error && response.code) {
        return setErrorStatusCode(response.code);
    }
    
    const data = response.data;

    if(data.success) {
      setTotalComments(totalComments + 1);
      hideModal();
    }
  }

  const handleMsgChange = (e) => {
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
          error={error}          
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
        {post && (
          <Post
            post={post}
          />
        )}
      </div>
      <div className="modal__actions">    
        <div>
          <Button title="Comment" onClick={comment} />
        </div>
      </div>
    </>
  )
}

export default Comment