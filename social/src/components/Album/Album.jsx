import { useState, useEffect, useRef } from "react";
import { useGlobalModalContext } from "../../contexts/ModalContext";
const AlbumImage = ({ src, post, index }) => {  
  const {showModal} = useGlobalModalContext();

  const handleImageClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    
    showModal("STATUS_MODAL", {
      post,
      index
    });
  } 

  return (
    <div className="picture">
      <a href={`post/${post.post_id}/status/photo/${index}`} onClick={(e) => handleImageClick(e)}>
        <div className="picture-content">        
          <img src={src} height={100} width={100} />
        </div>
      </a>
    </div>  
  )
};

const Album = ({ images, post, resize }) => { 

  const [padding, setPadding] = useState('100%');
  
  useEffect(() => {
    if(images.length === 1) {
      const img = new Image();
      img.onload = function() {
        const magicPadding = (this.height / this.width * 100).toFixed(4) + '%';
        setPadding(magicPadding);
        images[0].magicPadding = magicPadding;
      }
      img.src = images[0].url;
    }
  }, [])

  const midpoint = Math.ceil(images.length / 2);
  const firstPart = images.slice(0, midpoint);
  const lastPart =  images.slice(midpoint)

  return (
    <div className="album">
      <div className="picture-wrapper">
        <div className="fix-aspect" style={{ paddingBottom: `${images.length > 1 ? '56.25%' : padding}`}}>
          <div className="preview-grid-position">
            <div className="fix">              
                {
                  firstPart.length > 0 && (
                    <div className="preview-grid" style={{gap: '2px'}}>
                      {firstPart.map((img, i) => (
                        <AlbumImage key={i} index={i} post={post} src={`/uploads/${img.img}-${resize ? resize : 'small'}.${img.ext}`} />                                        
                      ))}
                    </div>                      
                  )
                }
                {
                  lastPart.length > 0 && (
                    <div className="preview-grid" style={{gap: '2px'}}>
                      {lastPart.map((img, i) => (
                        <AlbumImage key={(images.length - midpoint) + i} index={(images.length - midpoint) + i} post={post} src={`/uploads/${img.img}-${resize ? resize : 'small'}.${img.ext}`} />                                        
                      ))}
                    </div>
                  )
                }
            </div>
          </div>
        </div>      
      </div>
    </div>
  );
}
  
export default Album;