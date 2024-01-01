import { useState, useEffect } from "react";

import Textarea from "../../../Textarea";
import Button from "../../../Button";
import Post from "../..";

import { fetchAction, useQuery } from "../../../api/api";

const Share = ({ postId, totalShares, setTotalShares, hideModal }) => {
  const [message, setMessage] = useState('');  
  const [counter, setCounter] = useState(0);  
  const [error,setError] = useState(null);
  
  const { data: post, loading } = useQuery({
    path: `posts/${postId}`,    
  })

  const share = async () => {
    console.log('share: ', message);

    const response = await fetchAction({
      path: `posts/${postId}/shares`,
      options: {
        method:  'POST',
        body: JSON.stringify({message})
      }
    });
    console.log('response: ', response);

    if(response.error && response.code) {
        return setErrorStatusCode(response.code);
    }

    const data = response.data;

    if(data.success) {
      setTotalShares(totalShares + 1);
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
          <Button title="Share" onClick={share} />
        </div>
      </div>
    </>
  )
}

export default Share