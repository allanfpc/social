import { useContext, useEffect, useState } from "react";

import { useGlobalModalContext } from "../../../contexts/ModalContext";

import Button from "../../Button";
import Comment from "./Comment/Comment";
import Share from "./Share";

import { useAuthContext } from "../../../contexts/AuthContext";
import { fetchAction } from "../../api/api";
import { useErrorStatus } from "../../../contexts/ErrorContext";

const Actions = ({id, liked, initialTotalLikes, initialTotalComments, initialTotalShares, setModal}) => {
    const {isAuthenticated, token} = useAuthContext();
    const { setErrorStatusCode } = useErrorStatus();
    const [isLiked, setIsLiked] = useState(liked);    
    const [totalLikes, setTotalLikes] = useState(initialTotalLikes);
    const [totalComments, setTotalComments] = useState(initialTotalComments);
    const [totalShares, setTotalShares] = useState(initialTotalShares);

    const { showModal } = useGlobalModalContext();

    const createModal = (props) => {
        console.log('create: ', props);
        showModal("CREATE_MODAL", {
            ...props
        })  
    };

    const like = async (e) => {
        e.preventDefault();
        console.log('isLiked: ', isLiked);
        if(!isAuthenticated) {
            createModal();
        } else {
            const response = await fetchAction({
                path: `posts/${id}/likes`,
                options: {
                    method: isLiked ? 'PUT' : 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        authorization: `Bearer ${token}`
                    }
                }
            });
            console.log(response);
            if(response.error && response.code) {                
                return setErrorStatusCode(response.code)
            }
    
            const data = response.data;
            console.log('data: ', data);
    
            if(data.success) {
                setIsLiked(!isLiked);
                setTotalLikes(!isLiked ? totalLikes + 1 : totalLikes - 1);
            }
        }
        
    }  
    
    const openShareModal = (e) => {
        e.preventDefault();
        
        if(!isAuthenticated) {
            createModal();
        } else {
            createModal({ elem: <Share token={token} totalShares={totalShares} setTotalShares={setTotalShares} id={id} setModal={setModal} /> })
        }        
    }

    const openCommentModal = (e) => {
        e.preventDefault();

        if(!isAuthenticated) {
            createModal();
        } else {
            createModal({elem: <Comment token={token} totalComments={totalComments} setTotalComments={setTotalComments} id={id} setModal={setModal} />})
        }
    }

    return (
        <div className="actions">
            <div className="actions__wrapper">
                <div className="actions__like">
                    <Button      
                        className="rounded"
                        onClick={(e) => like(e)}
                        label="Like this post"
                    >
                        {isLiked ? (
                            <svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="m480-146.925-44.153-39.691q-99.461-90.231-164.5-155.077-65.038-64.846-103.076-115.423-38.039-50.577-53.154-92.269-15.116-41.692-15.116-84.615 0-85.153 57.423-142.576Q214.847-833.999 300-833.999q52.385 0 99 24.501 46.615 24.5 81 70.269 34.385-45.769 81-70.269 46.615-24.501 99-24.501 85.153 0 142.576 57.423Q859.999-719.153 859.999-634q0 42.923-15.116 84.615-15.115 41.692-53.154 92.269-38.038 50.577-102.884 115.423T524.153-186.616L480-146.925Z"/></svg>
                            ) 
                            : (
                            <svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="m480-146.925-44.153-39.691q-99.461-90.231-164.5-155.077-65.038-64.846-103.076-115.423-38.039-50.577-53.154-92.269-15.116-41.692-15.116-84.615 0-85.153 57.423-142.576Q214.847-833.999 300-833.999q52.385 0 99 24.501 46.615 24.5 81 70.269 34.385-45.769 81-70.269 46.615-24.501 99-24.501 85.153 0 142.576 57.423Q859.999-719.153 859.999-634q0 42.923-15.116 84.615-15.115 41.692-53.154 92.269-38.038 50.577-102.884 115.423T524.153-186.616L480-146.925ZM480-228q96-86.385 158-148.077 62-61.692 98-107.192 36-45.5 50-80.808 14-35.308 14-69.923 0-60-40-100t-100-40q-47.385 0-87.577 26.885-40.192 26.884-63.654 74.808h-57.538q-23.846-48.308-63.846-75.001Q347.385-774 300-774q-59.615 0-99.808 40Q160-694 160-634q0 34.615 14 69.923t50 80.808q36 45.5 98 107T480-228Zm0-273Z"/></svg>
                        )}
                    </Button>
                    <div>
                        <span>{totalLikes}</span>
                    </div>
                </div>
                <div className="actions__comment">
                    <Button
                        className="rounded"
                        onClick={(e) => openCommentModal(e)}
                        label="Comment this post"
                    >
                       <svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M250.001-410.001h459.998v-59.998H250.001v59.998Zm0-120h459.998v-59.998H250.001v59.998Zm0-120h459.998v-59.998H250.001v59.998Zm-77.692 390q-30.308 0-51.308-21t-21-51.308v-455.382q0-30.308 21-51.308t51.308-21h615.382q30.308 0 51.308 21t21 51.308v669.227L718.461-260.001H172.309Z"/></svg> 
                    </Button>
                    <div>
                        <span>{totalComments}</span>
                    </div>
                </div>
                <div className="actions__share">
                    <Button                  
                        className="rounded"
                        onClick={(e) => openShareModal(e) }
                        label="Share this post"
                    >
                        <svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                            <path fill="inherit" d="M5.5 15a3.51 3.51 0 0 0 2.36-.93l6.26 3.58a3.06 3.06 0 0 0-.12.85 3.53 3.53 0 1 0 1.14-2.57l-6.26-3.58a2.74 2.74 0 0 0 .12-.76l6.15-3.52A3.49 3.49 0 1 0 14 5.5a3.35 3.35 0 0 0 .12.85L8.43 9.6A3.5 3.5 0 1 0 5.5 15zm12 2a1.5 1.5 0 1 1-1.5 1.5 1.5 1.5 0 0 1 1.5-1.5zm0-13A1.5 1.5 0 1 1 16 5.5 1.5 1.5 0 0 1 17.5 4zm-12 6A1.5 1.5 0 1 1 4 11.5 1.5 1.5 0 0 1 5.5 10z"/>
                        </svg>
                    </Button>
                    <div>
                        <span>{totalShares}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Actions;