import { useState, useEffect, useRef } from "react";
import { useGlobalModalContext } from "../../contexts/ModalContext";
const AlbumImage = ({ src, post, maxWidth, index, onClick }) => {  
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
      <a href={`post/${post.post_id}/status/photo/${index}`} onClick={(e) => onClick ? onClick(e) : handleImageClick(e)}>
        <div className="picture-content">        
          <img src={src} height={100} width={100} />
        </div>
      </a>
    </div>  
  )
};

const Album = ({ images, post, maxWidth, onClick }) => {
  const [padding, setPadding] = useState(56.25);
  const [size, setSize] = useState('medium');
  const midpoint = Math.ceil(images.length / 2);
  const firstPart = images.slice(0, midpoint);
  const lastPart =  images.slice(midpoint);
  
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width <= 600) {
        setSize('small');
      } else if (width <= 1200) {
        setSize('medium');
      } else {
        setSize('large');
      }
    };

    handleResize();

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    async function setMagicPadding() {
      await new Promise((resolve) => {
        const img = new Image();
        img.onload = function() {        
          setPadding(parseInt((this.height / this.width * 100).toFixed(4)));
          resolve();
        }
    
        img.src = srcExtract(images[0]);
      })
    }
    if(images.length === 1) {
      setMagicPadding();
    }

    return () => {}
  }, [images])

  const srcExtract = (img) => {
    const keys = Object.keys(img.sizes);
    return `/uploads/${img.img}-${img.sizes[size] ? size : keys[keys.length - 1]}.${img.ext}`
  }

  return (
    <div className={`album ${(padding > 90 && maxWidth) ? 'album-max-width' : ''}`}>
      <div className="picture-wrapper">
        <div className="fix-aspect" style={{ paddingBottom: padding + '%' }}>
          <div className="preview-grid-position">
            <div className="fix">
              {
                firstPart.length > 0 && (
                  <div className="preview-grid" style={{gap: '2px'}}>
                    {firstPart.map((img, i) => (
                      <AlbumImage key={i} index={i} post={post} src={srcExtract(img)} onClick={onClick} />                                        
                    ))}
                  </div>                      
                )
              }
              {
                lastPart.length > 0 && (
                  <div className="preview-grid" style={{gap: '2px'}}>
                    {lastPart.map((img, i) => (
                      <AlbumImage key={(images.length - midpoint) + i} index={(images.length - midpoint) + i} post={post} src={srcExtract(img)} onClick={onClick} />                                        
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