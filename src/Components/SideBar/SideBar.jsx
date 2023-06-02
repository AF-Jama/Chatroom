import React,{useState,useEffect,useReducer} from "react";
import Image from "next/image";
import chatLogo from '../../assets/images/chat.svg';
import useAuth from "@/customHooks/useAuth";
import styles from '../../styles/components/sidebar.module.css';
import global from '../../styles/global.module.css';



const SideBar = (props)=>{
    const { state:{user} } = useAuth();





    return (
        <div id="side-bar-container" className={props.showState?styles['side-bar-show']:styles['side-bar-hide']}>

            <Image src={chatLogo}/>

            <h2>Overview</h2>

            <div id="overview-actions">
                <a href="/chats/add" style={{textDecoration:"none",color:"black"}}><p className={global['p-tag']}>Add Friend</p></a>
                <a href="/chats/requests" style={{textDecoration:"none",color:"black"}}><p className={global['p-tag']}>Friend Requests</p></a>
            </div>

            <div id="user-account-information-container" className={styles['user-account-container']}>
                <img src="" alt="" />

                <div id="user-details-container">
                    <h3 className={styles['user-details']}>{user?.displayName}</h3>
                    <p className={styles['user-details']}>{user?.email}</p>
                </div>
            </div>
            
        </div>
    )
}



export default SideBar;