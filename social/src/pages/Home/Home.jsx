import { useEffect, useState, useRef } from "react";
import Cookies from "js-cookie";

import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

import Layout from "../../layouts/Layout";
import Post from "../../components/Post";
import User from "../../components/User";
import Button from "../../components/Button";

import { useAuthContext } from '../../contexts/AuthContext';

import { fetchAction, useQuery } from "../../components/api/api";
import { useErrorStatus } from "../../contexts/ErrorContext";
import { GlobalModal } from "../../contexts/ModalContext";

const Home = () => {
  const {user, isAuthenticated, token} = useAuthContext();  
  const [modal, setModal] = useState(null);
  const [loading, setLoading] = useState(null);

  const [posts, setPosts] = useQuery({
    path: 'posts',    
    setLoading
  });
  console.log('posts: ', posts)

  return (
    <GlobalModal>
      <Layout modal={modal} setModal={setModal}>
        {user && (
          <section className="user-info">
            <div className="panel">
              <div className="panel-container">
                <div className='user'>
                  <div className="user__header">
                    <div>
                      <User.Avatar img={{src: user.profile_img, alt: 'profile'}} nickname={user.nickname} />
                    </div>
                    <div>
                      <User.Desc name={user.name} nickname={user.nickname} />
                    </div>
                  </div>
                </div>
                <div className="stats">
                  
                </div>
              </div>
            </div>
          </section>
        )}
        <section className="posts">
          <div className="flex-center">
            <div className="column">
              {user && (<Postbox posts={posts} setPosts={setPosts} token={token} />)}
                <div className="posts-wrapper">
                  {loading ? (
                    <div className="flex-center container">
                      <div className="loading">
                        <span></span>
                      </div>
                    </div>
                  ) : (!posts || posts.length === 0)
                  ?
                    (<div className="container">
                      <span>No posts to show</span>
                    </div>)
                  : 
                  posts.map((post) => (
                    <Post          
                      name={post.name}
                      nickname={post.nickname}
                      profile_img={post.profile_img}
                      date={post.date}
                      images={post.images}
                      key={post.post_id}
                      id={post.post_id}                    
                      text={post.text}                    
                      liked={post.liked}
                      totalLikes={post.total_likes}
                      totalComments={post.total_comments}
                      totalShares={post.total_shares}
                      setModal={setModal}
                      actions
                    />
                  ))}               
              </div>
            </div>
          </div>
        </section>
        {isAuthenticated && (
          <Chat />
        )}
      </Layout>
    </GlobalModal>
  )
}

const Postbox = ({posts, setPosts, token}) => {

  const {setErrorStatusCode} = useErrorStatus();

  const [message, setMessage] = useState({
    message: '',
    lastIndex: 0,
    lastEmojiIndex: 0,
  });

  const [files, setFiles] = useState([]);
  const [error, setError] = useState(null);
  const messageInputRef = useRef(null);

  useEffect(() => {
    
    const timeoutId = setTimeout(() => {
      messageInputRef.current.focus();
    }, 0)
    
    return(() => {
      clearTimeout(timeoutId);
    })
  }, [message.message]);
  

  async function sendPost() {

    const formData = new FormData();
    formData.append("message", message.message);
   
    if(files.length === 0) {
      if(message.message.length === 0) {
        messageInputRef.current.focus();
        return false;
      }
    } else {    
      for(const file of files) {
        formData.append('files', file.file);
        formData.append("sizes", file.width);
      }
    }

    const response =  await fetchAction({
      path: 'posts',
      options: {
        method: "POST",   
        headers: {},
        body: formData
      }
    })
    
    if(response.error && response.code) {
      if(response.code === 422 || response.code === 413) {
        return setError({error: response.error, files: response?.files});
      }
      return setErrorStatusCode(response.code);
    }

    const data = response.data;

    if(data.success) {
      for(const file of files) {
        URL.revokeObjectURL(file.url);
      }
      if(data.post) {
        setPosts([data.post, ...posts]);
      }
      setMessage({
        message: '',
        lastIndex: 0,
        lastEmojiIndex: 0,
      });
      setFiles([]);
    }
  }

  function getCaretIndex(e) {
    e.stopPropagation();
    
    const emojiRegex = /<a?:.+?:\d{18}>|\p{Extended_Pictographic}/gu;
   
    const temp = [];
    let indexCounter = 0;
    
    for(let i = 0; i < messageInputRef.current.selectionEnd; i++) {      
      
      const char = Array.from(message.message).slice(i, i+1).join('');      
      indexCounter += char.match(emojiRegex) ? 2 : 1;

      temp.push(char);

      if(indexCounter === messageInputRef.current.selectionEnd) {        
        const matchEmojis = temp.join('').match(emojiRegex);
        if(matchEmojis) {
          indexCounter = indexCounter - matchEmojis.length;
        }
        
        break;
      }
    }

    setMessage({ ...message, lastIndex: indexCounter });

    return indexCounter;
  }

  function onFocus() {    
    messageInputRef.current.selectionStart = message.lastEmojiIndex;
    messageInputRef.current.selectionEnd = message.lastEmojiIndex;
  }

  return (
    <div className="flex">
      <div className="post-box padding-container">
        <div className="post-box__field">
          <textarea 
            name=""
            id=""
            cols="30"
            rows="10"
            ref={messageInputRef}
            value={message.message}
            placeholder={`${message.length === 0 ? "What's happening?" : ""}`}
            onChange={(e) => setMessage({message: e.target.value, lastIndex: message.lastIndex + 1})}
            onClick={(e) => getCaretIndex(e)}
            onFocus={(e) => onFocus(e)}       
            onKeyUp={(e) => getCaretIndex(e)}
          />
        </div>
        {error && (
          <div>
            <span>{`${error.error}${error.files ? ': ' + error.files : ''}`}</span>
          </div>
        )}
        <Toolbar
          message={message}
          setMessage={setMessage}
          messageInputRef={messageInputRef}
          sendPost={sendPost} 
          files={files} 
          setFiles={setFiles} 
        />
      </div>
    </div>
  )
}

const Toolbar = ({message, messageInputRef, setMessage, files, setFiles, sendPost}) => {

  const [showPicker, setShowPicker] = useState(false);
  const imageInputRef = useRef(null);
  const shareLocationInputRef = useRef(null);

  async function chooseImage(images) {
    const validTypes = ['image/webp', 'image/jpeg', 'image/png', 'image/gif'];
    
    for(let i = 0; i < images.length; i++) {      
      if(files.length === 4) {
        break;
      }

      const file = images[i];      
      
      if(!(validTypes.includes(file.type))) {
        continue;
      }

      const url = URL.createObjectURL(file);
  
      const promise = new Promise((resolve) => {
        const img = new Image();
        img.onload = function(){          
          resolve({ width: img.width, height: img.height });
        }
        img.src = url;
      })

      const dimensions = await promise;
      setFiles(prevFiles => [...prevFiles, {file: file, url: url, width: dimensions.width, height: dimensions.height }]);
      
    }    
    imageInputRef.current.value = '';
  }

  function sliceText(text, initIndex, finalIndex) {
    return Array.from(text).slice(initIndex, finalIndex).join('');
  }

  function chooseEmoji(e) {

    const selectedText = window.getSelection().toString();
    
    let text = message.message;
    let lastIndex = message.lastIndex;
    let emojiIndex = messageInputRef.current.selectionStart;
    
    let init = sliceText(text, 0, lastIndex);
    let last = sliceText(text, lastIndex, message.message.length);   
    
    if(selectedText) {

      init = text.substring(0, messageInputRef.current.selectionStart);
      last = text.substring(messageInputRef.current.selectionStart, text.length).replace(selectedText, '');

      const regex = /[\p{L}]?.+/mgiu;
      
      const match = sliceText(selectedText, 0, selectedText.length).match(regex)?.[0];      

      let charCounter = 0;

      if(match) {
        for(let i = 0; i < match.length; i++) {
  
          const char = sliceText(match, i, i+1);
          if(char) {
            charCounter = charCounter + 1;
          }
          
        }
      }

      lastIndex = Math.max(0, lastIndex - charCounter);
      
    } 

    if(selectedText) {
      emojiIndex = messageInputRef.current.selectionEnd - selectedText.length;
    }

    setMessage({message: init + e.native + last, lastIndex: lastIndex + 1, lastEmojiIndex: emojiIndex + 2 });
    
  }

  function hidePicker() {
    if(showPicker) {
      setShowPicker(false);
    }
  }

  function togglePicker(e) {
    e.stopPropagation();
    setShowPicker(!showPicker);
  }

  return (
    <div className="post-box__toolbar">
      <div className="post-box__toolbar__actions">
        <div>
          <Button onClick={() => imageInputRef.current.click()} label="Upload image for share">
            <svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M212.309-140.001q-30.308 0-51.308-21t-21-51.308v-535.382q0-30.308 21-51.308t51.308-21h535.382q30.308 0 51.308 21t21 51.308v535.382q0 30.308-21 51.308t-51.308 21H212.309Zm0-59.999h535.382q4.616 0 8.463-3.846 3.846-3.847 3.846-8.463v-535.382q0-4.616-3.846-8.463-3.847-3.846-8.463-3.846H212.309q-4.616 0-8.463 3.846-3.846 3.847-3.846 8.463v535.382q0 4.616 3.846 8.463 3.847 3.846 8.463 3.846Zm57.693-90.001h423.073L561.538-465.384 449.231-319.231l-80-102.306-99.229 131.536ZM200-200V-760-200Z"/></svg>
          </Button>
          <input type="file" accept="image/jpeg, image/png, image/gif, image/webp" ref={imageInputRef} multiple onChange={(e) => chooseImage(e.target.files)} />
        </div>
        <div>
          <Button onClick={(e) => togglePicker(e)} label="Open Emoji Picker">
            <svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M616.244-527.693q21.832 0 37.025-15.283 15.192-15.282 15.192-37.115 0-21.832-15.283-37.024t-37.115-15.192q-21.832 0-37.024 15.283-15.193 15.282-15.193 37.115 0 21.832 15.283 37.024t37.115 15.192Zm-272.307 0q21.832 0 37.024-15.283 15.193-15.282 15.193-37.115 0-21.832-15.283-37.024t-37.115-15.192q-21.832 0-37.025 15.283-15.192 15.282-15.192 37.115 0 21.832 15.283 37.024t37.115 15.192ZM480-272.309q62.615 0 114.461-35.038T670.922-400H289.078q24.615 57.615 76.461 92.653Q417.385-272.309 480-272.309Zm.067 172.308q-78.836 0-148.204-29.92-69.369-29.92-120.682-81.21-51.314-51.291-81.247-120.629-29.933-69.337-29.933-148.173t29.92-148.204q29.92-69.369 81.21-120.682 51.291-51.314 120.629-81.247 69.337-29.933 148.173-29.933t148.204 29.92q69.369 29.92 120.682 81.21 51.314 51.291 81.247 120.629 29.933 69.337 29.933 148.173t-29.92 148.204q-29.92 69.369-81.21 120.682-51.291 51.314-120.629 81.247-69.337 29.933-148.173 29.933ZM480-480Zm0 320q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Z"/></svg>
          </Button>              
        </div>
        <div>
          <Button onClick={() => shareLocationInputRef.current.click()} label="Share location">
            <svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M519.385-102.001V-162q43.538-6.385 83.038-23 39.5-16.615 72.962-42.231l42.999 43.384q-43.539 34.307-93.308 54.692-49.769 20.384-105.691 27.154Zm256.152-139.846L733.385-284q26-33 42-72.5t22-83.5h61.229q-6.846 56.23-27.808 106.269-20.961 50.038-55.269 91.884ZM797.385-520q-6-45-22-84.5t-42-71.5l42.537-41.768q36.077 44.769 56.307 91.846Q852.46-578.846 858.614-520h-61.229Zm-358 417.999q-144.538-17.616-241.269-124.846-96.73-107.231-96.73-253.153 0-146.538 96.538-253.961 96.538-107.422 241.461-124.038V-798q-120 17-199 107t-79 211q0 121 79 210.5t199 107.5v59.999Zm238-629.999q-36-27-75.808-44-39.808-17-81.423-22v-59.999q54.769 5.77 104.345 26.347 49.577 20.576 93.885 55.499L677.385-732ZM480-299.617q-52.23-44.769-98.422-95.384t-46.192-118.691q0-61.461 41.884-104.845 41.884-43.385 102.73-43.385 60.846 0 102.73 43.385 41.884 43.384 41.884 104.845 0 68.076-46.192 118.691Q532.23-344.386 480-299.617Zm0-180.768q16.461 0 27.615-11.153 11.154-11.154 11.154-27.616 0-15.846-11.154-27.307-11.154-11.461-27.615-11.461t-27.615 11.461Q441.231-535 441.231-519.154q0 16.462 11.154 27.616 11.154 11.153 27.615 11.153Z"/></svg>
          </Button>
          <input type="file" ref={shareLocationInputRef} />
        </div>                      
      </div>
      {files.length > 0 && (
        <Suspense fallback={"loading..."}>
          <Preview images={files} setImages={setFiles} />
        </Suspense>
      )}
      {showPicker && (
        <Suspense>
          <div className='picker'>
            <Picker onEmojiSelect={(e) => chooseEmoji(e)} onClickOutside={hidePicker} />
          </div>
        </Suspense>
      )}
      <hr />
      <div className="">
        <Button title="Send" onClick={sendPost} className="btn-ghost" />
      </div>
    </div>
  )
}

