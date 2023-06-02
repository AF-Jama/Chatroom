import React,{useState,useEffect,useReducer} from "react";
import unknownUser from '../../assets/images/unknown-user.png';
import styles from '../../styles/components/messagebar.module.css';


const MessageBar = ({ senderImage, message })=>{


    const onImageError = (event)=>{
        event.target.src = {unknownUser};
    }





    return (
        <div id="message-bar-container" className={styles['message-bar']}>
            {/* <img src={senderImage} alt="" width={50} height={50} onError={onImageError} /> */}

            <div className="inner-message-container">
                <p className={styles['message-text']}>Hey this is a new message...</p>
            </div>
        </div>
    )
}



export default MessageBar;