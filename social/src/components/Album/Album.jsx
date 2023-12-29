import { useState, useEffect } from "react";

const AlbumImage = ({ src, onClick }) => (    
  <div className="picture">
    <a href="" onClick={onClick}>
      <div className="picture-content">        
        <img src={src} alt="Image" height={100} width={100} />
      </div>
    </a>
  </div>  
);

const Album = ({ images, isVisible }) => {
  const [size, setSize] = useState('medium');

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

  const handleImageClick = (e, index) => {
    e.stopPropagation();
    e.preventDefault();
    // Handle image click or set modal here
    // setModal({ type: 'picture', index });
  };

  const midpoint = images.length / 2;
  const firstPart = images.slice(0, midpoint);
  const lastPart = images.slice(midpoint);

  return (
    <div className="album">
      <div className="picture-wrapper">
        <div>
          <div className="fix-aspect" style={{ paddingBottom: `${images.length > 1 ? '56.25%' : '100%'}` }}>
            <div style={{ position: 'absolute', top: '0', left: '0', width: '100%', height: '100%' }}>
              <div className="fix">
                  {firstPart.length > 0 && (
                    <div className="preview-grid" style={firstPart.length > 1 ? {gap: '2px'} : {}}>
                      {firstPart.map((img, i) => {          
                        return <AlbumImage key={i} src={`/uploads/${img.img}-small.${img.ext}`} onClick={(e) => onClick(e, i)} />;
                      })}
                    </div>
                  )}
                  {lastPart.length > 0 && (
                    <div className="preview-grid" style={lastPart.length > 1 ? {gap: '2px'} : {}}>
                      {lastPart.map((img, i) => {          
                        return <AlbumImage key={i} src={`/uploads/${img.img}-small.${img.ext}`} onClick={(e) => onClick(e, i)} />;
                      })}
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
  
export default Album;