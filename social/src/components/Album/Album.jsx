import { useState, useEffect } from "react";

const Album = ({images}) => {
    console.log('images: ', images)
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

  return (
    <div className="album">
        <div className="picture-wrapper">  
            <div>
                <div className="adjust-aspect" style={{paddingBottom: `${images.length > 1 ? '56.25%' : '100%'}`}}>
                    <div style={{position: 'absolute', top: '0', left: '0', width: '100%', height: '100%' }}>
                        <div className="grid">                                                    
                            {images.length > 2 ? (
                                <GridTwoColumn  images={images} size={size} />
                            ) : (
                                <GridOneColumn  images={images} size={size} />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}

const GridOneColumn = ({images, size}) => {
    
    const handleImageClick = (e) => {
        e.stopPropagation();
        e.preventDefault();

        //setModal({type: 'picture' });
    }

    return (
        <div style={{flexDirection: 'row'}}>
            {images.map((img, i) => {                                
                const name = img.img + '-' + (img.responsive ? size : 'small') + '.' + img.ext;                
                return (
                    <div key={i} className="picture">
                        <a href={`/photo/${i}`} onClick={(e) => handleImageClick(e)}>
                            <div className="picture-content">         
                                <div className="" style={{backgroundImage: `url('/uploads/${name}')`}}></div>
                            </div>
                        </a>                        
                    </div>
                )
            })}
        </div>
    )
}

const GridTwoColumn = ({images, size}) => {
    
    const firstImages = images.slice(0, 2);
    const lastImages = images.slice(2, images.length);

    const handleImageClick = (e) => {
        console.log('click:');
        e.stopPropagation();
        e.preventDefault();

        //setModal({type: 'picture'});
    }

    return (
        <>
            <div style={{flexDirection: 'column'}}>
                {firstImages.map((img, i) => {
                    const name = img.img + '-' + (img.responsive ? size : 'small') + '.' + img.ext;
                    
                    return (
                        <div key={i} className="picture">
                            <a href={`/photo/${i}`} onClick={(e) => handleImageClick(e)}>
                                <div className="picture-content">         
                                    <div className="" style={{backgroundImage: `url('/uploads/${name}')`}}></div>
                                </div>
                            </a>                            
                        </div>
                    )
                }
                )}
            </div> 
            <div style={{display: 'flex', flexDirection: 'column', flexGrow: '1', gap: '2px'}}>
                {lastImages.map((img, i) => {
                    const name = img.img + '-' + (img.responsive ? size : 'small') + '.' + img.ext;
                    
                    return (
                        <div key={i} className="picture">
                            <a href={`/photo/${i}`} onClick={(e) => handleImageClick(e)}>
                                <div className="picture-content">         
                                    <div className="" style={{backgroundImage: `url('/uploads/${name}')`}}></div>
                                </div>
                            </a>                            
                        </div>
                    )   
                })}
            </div>
        </>
                                                   
    )
}

export default Album