import { useEffect, useRef } from "react"

import Button from "../../../components/Button"

import { fetchAction } from "../../../components/api/api";

const ImageContainer = ({image, type, token, onImageChange, fileUpload}) => {

    async function saveUpdate() {
        const formData = new FormData();
        formData.append("file", image);
        
        const response = await fetchAction({
            path: `user/update?type=${type}`,
            options: {
              method: 'POST',
              headers: {},
              body: formData
            }
          })
          console.log(response);

          if(response.error && response.code) {
            return showError(response.code);
          }
          
          const data = response.data;
          console.log('daa: ', data)
          if(data.success) {
              onImageChange(data.filename);  
            
              if(fileUpload) {
                fileUpload.value = '';
              }
          }
    }

  return (
    <>
        <div className="preview">
            <div className="container">
                <div>
                    <Canvas image={image} />
                </div>
            </div>
        </div>
        <div className="modal__actions">    
            <div>
            <Button title="Save" onClick={saveUpdate} />
            </div>
        </div>
    </>
  )
}

const Canvas = ({image, type}) => {
    const canvasRef = useRef(null);

    console.log('image: ', image)
  
    useEffect(() => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
  
      new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = function(event) {
            const img = new Image();
            img.onload = function(){
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img,0,0);
                resolve()
            }
            img.src = event.target.result;
        }
        reader.readAsDataURL(image);
      })
    }, [image])
    
    return <canvas ref={canvasRef} height={300}/>
  }
  

export default ImageContainer