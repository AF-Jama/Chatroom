import React,{useState,useEffect,useReducer} from "react";
import styles from '../../styles/profile.module.css';
import Cookies from 'nookies';
import { setCookie } from "nookies";
import { destroyCookie } from "nookies";
import useAuth from "@/customHooks/useAuth";


export const getStaticProps = async ()=>{
    let res = await fetch('https://jsonplaceholder.typicode.com/comments');
    res = await res.json();


    return {
        props:{data:res}
    }
}


const Profile = ({ data })=>{
    const { onSignout } = useAuth();

    // setCookie(null,'test','234');



    return (
        <div className="main">
            <h1>PROFILE SECTION</h1>
            <p>{JSON.stringify(data)}</p>
            <button onClick={onSignout}>ON SIGN OUT</button>
            <button onClick={()=>destroyCookie(null,'test')}>REMOVE</button>
        </div>
    )
}



export default Profile;