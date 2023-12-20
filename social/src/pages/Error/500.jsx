
export const Page500 = () => {
  return (
    <div className="flex-center">
        <div className="error-container">
            <div className="">
                <div className="icon">
                    <img src="/src/assets/maitenance.png" alt="maitenance" width={120} height={120} />
                </div>
                <div className="code">
                    <span>500</span>
                </div>
            </div>
            <div className="message">
                <span>Internal Server Error</span>
            </div>
        </div>
    </div>    
  )
}