
export const Page404 = () => {
    return (
        <div className="flex-center">
            <div className="error-container">
                <div className="">
                    <div className="icon">
                        <img src="/src/assets/not-found.png" alt="not found" width={120}  height={120} />
                    </div>
                    <div className="code">
                        <span>404</span>
                    </div>
                </div>
                <div className="message">
                    <span>Not found</span>
                </div>
            </div>
        </div>    
    )
}