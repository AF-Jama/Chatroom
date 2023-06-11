import React,{useState,useEffect,useReducer} from "react";
import styles from '../../styles/components/chatbar.module.css';

const ChatBar = ({ onMessageChange, onSubmit, inputContainerRef })=>{





    return (
        <div id="chat-bar-container" className={styles['chat-bar']}>
            <div id="chat-bar-input-container" className={styles['chat-bar-input']}>
                <input type="text" onChange={onMessageChange} ref={inputContainerRef} />
            </div>

            <div id="submit-btn" className={styles['submit-btn-container']}>
                <button onClick={onSubmit}>Send</button>
            </div>
        </div>
    )
}



export default ChatBar;