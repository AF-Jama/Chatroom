import React from "react";
import { useRouter } from "next/router";
import useAuth from "@/customHooks/useAuth";
import styles from '../../styles/chats.module.css';


const ChatDashboard = ()=>{
    const { isAuthenticated,hasDetails } = useAuth();
    const router = useRouter();


    if(!isAuthenticated){
        router.push('')
    }

    if(!hasDetails){
        <p>HERE</p>
    }





    return (
        <main className={styles.main}>
            <div className={styles['inner-container']}>
                <div className={styles['chats-container']}></div>
                <div className={styles['messages-container']}></div>
            </div>
        </main>
    )
}



export default ChatDashboard;