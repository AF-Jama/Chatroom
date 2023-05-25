import React,{useState,useEffect,useReducer} from "react";
import styles from '../../styles/componentStyles/chatbar.module.css';

const ChatBar = ({ onMessageChange })=>{





    return (
        <div id="chat-bar-container" className={styles['chat-bar']}>
            <div id="chat-bar-input-container" className={styles['chat-bar-input']}>
                <input type="text" onChange={onMessageChange} />
            </div>

            <div id="submit-btn" className={styles['submit-btn-container']}>
                <button>Send</button>
            </div>
        </div>
    )
}



export default ChatBar;