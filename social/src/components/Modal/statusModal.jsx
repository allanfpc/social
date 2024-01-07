import { useState, useEffect, useRef } from "react";

import Post from "../Post";
import Album from "../Album";
import Comment from "../Post/Comment";
import Button from "../Button";

import { useGlobalModalContext } from "../../contexts/ModalContext";
import { useQuery } from "../api/api";
import { useScroll } from "../../hooks/useScroll";

const Canvas = ({image, setPredominantColor}) => {
  const canvasRef = useRef(null);
  const destruct = useRef(null);

  useEffect(() => {
    if(!canvasRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    const img = new Image();
    img.onload = function(){
      const blockSize = 5
      let data
      let width
      let height
      let i = -4
      let length
      const rgb = {r:0,g:0,b:0}
      let count = 0;

      if (!context) {
          return;
      }

      height = canvas.height = img.naturalHeight || img.offsetHeight || img.height;
      width = canvas.width = img.naturalWidth || img.offsetWidth || img.width;

      context.drawImage(img, 0, 0);

      try {
          data = context.getImageData(0, 0, width, height);
      } catch(e) {
          /* security error, img on diff domain */
          return;
      }

      length = data.data.length;

      while ( (i += blockSize * 4) < length ) {
          ++count;
          rgb.r += data.data[i];
          rgb.g += data.data[i+1];
          rgb.b += data.data[i+2];
      }

      // ~~ used to floor values
      rgb.r = ~~(rgb.r/count);
      rgb.g = ~~(rgb.g/count);
      rgb.b = ~~(rgb.b/count);

      setPredominantColor(`rgb(${rgb.r},${rgb.g},${rgb.b},0.6)`);
      canvas.width = 0;
      canvas.height = 0;
      destruct.current = true;
      return;
    }
    img.src = `/uploads/${image.img}-small.${image.ext}`;
  
  }, [])
  
  return !destruct.current ? <canvas ref={canvasRef} height={0} width={0} /> : null
}

export const StatusModal = ({post, index, restoreScroll}) => {
 
  const { hideModal } = useGlobalModalContext(); 
  const [predominantColor, setPredominantColor] = useState(null);
  const lastCommentRef = useRef(null);
  const commentsRef = useRef(null);

  const {page, setPage, less} = useScroll(commentsRef, {more: false, less: true});
  console.log('less: ', page, less);
  const { data: comments, loading } = useQuery({
      path: `posts/${post.post_id}/comments`,
      options: {
        less: less,
        page: page
      }
  });

  console.log('comments: ', comments);

  useEffect(() => {
    let timeoutId;
    if(restoreScroll) {
      timeoutId = setTimeout(() => {
        window.scrollTo(0, restoreScroll.y);
        document.body.classList.add('modal-open');
      }, 0)
    }

    return () => {
      clearTimeout(timeoutId);
      document.body.classList.remove('modal-open');
    }
  }, [])

  useEffect(() => {
    if(page > 1) {           
      if(lastCommentRef.current && commentsRef.current) {
        commentsRef.current.scrollTo(0, ((commentsRef.current.getBoundingClientRect().top - lastCommentRef.current.getBoundingClientRect().top) - 160) + 40);
      }
    }
  }, [page])

  return (
    <div className="modal" onClick={hideModal} style={{background: predominantColor}}>
      {!predominantColor && (
        <Canvas image={post.images[index]} setPredominantColor={setPredominantColor} />
      )}
      <section className="image">
        <Album images={[post.images[index]]} maxWidth post={post} onClick={(e) => {e.stopPropagation(); e.preventDefault()}} />            
      </section>
      <section className="post" onClick={(e) => {e.stopPropagation(); e.preventDefault()}}>
        <div className="post-wrapper">
          <Post post={post} noAlbum />
          <div ref={commentsRef} className="comments-wrapper">
            {loading 
            ? (
              <div className="flex-center container">
                <div className="loading">
                  <span></span>
                </div>
              </div>
            ) 
            : (comments.length === 0)
              ?
              (<div className="container">
                  <span>No comments to show</span>
              </div>)
              :
              (comments.map((comment, i) => (
                <Comment ref={page > 1 && i === 9 ? lastCommentRef : null} comment={comment} key={i} />
              ))
            )}
            {comments.length > 0 && (
              <div className="container flex-center">
                <Button disabled={page * 30 > post.total_comments} onClick={() => {setPage(page + 1)}} label="Load more">
                  <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M450.001-450.001h-230v-59.998h230v-230h59.998v230h230v59.998h-230v230h-59.998v-230Z"/></svg>
                </Button>
              </div>
            )}
          </div>                            
        </div>
      </section>              
    </div>    
  )
};