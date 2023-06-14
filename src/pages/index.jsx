import React,{useState,useEffect,useReducer,useContext} from "react";
import Cookies from 'nookies';
import { setCookie, destroyCookie, parseCookies } from "nookies";
import useAuth from "../customHooks/useAuth";
import { useRouter } from "next/router";
import { Redirect } from "next";
import db from "../Config/firebase.config";
import { collection,addDoc,getDoc,getDocs, setDoc,query,where, doc } from "@firebase/firestore";
// import { adminSDK } from "@/Config/firebaseAdmin";
import Image from "next/image";
import whatsappLogo from '../assets/images/whatsapp-logo.svg';
import GoogleButton from 'react-google-button';
import style from '../styles/pages/signup.module.css';
import { GoogleAuthProvider, TwitterAuthProvider, signOut } from "@firebase/auth";
import { getAdditionalUserInfo } from "@firebase/auth";
import { redirect } from "next/dist/server/api-utils";


export async function getServerSideProps(context) {
 const cookies = Cookies.get(context); // returns cookie token 
 console.log(123);
 if (!cookies.token) {
    return { props: {
    } }; // returns null and stays on page
 }

 context.res.writeHead(302, { Location: '/chats' }); // redirect to /chats endpoint if token evaluates to true 
 context.res.end();
}



const SignUpPageContainer = ({ isLoggedIn,result2 })=>{
    const { onProviderPopUpSignUp,onSignout,state:{isAuthenticated} } = useAuth();

    const router = useRouter(); // router

    const onHandleGoogleSignIn = async ()=>{
        const provider = new GoogleAuthProvider();
        try{
            let result = await onProviderPopUpSignUp(provider);

            const token = await result.user.getIdToken(); // returns id token promise value

            setCookie(null,'token',token,{
                maxAge:"3600"
            }) // sets id token

            window.location.href = "/chats"; // redirects to chats endpoint

            // await createUserAccount(result); // create user account

        }catch(error){
            // triggered if error on try block
            console.log(error)
            return;
        }
    }

    const onHandleTwitterSignIn = async ()=>{
        try{
            const provider = new TwitterAuthProvider();

            let result = await onProviderPopUpSignUp(provider);

        }catch(error){
            console.log(error);
            return;
        }
    }

    return (
        <div id="sign-up-page-container" className={style.signup}>
            <Image src={whatsappLogo} width={100} height={100} alt="Logo"/> 
            <h3>Sign In</h3>

            <div id="identity-providers-container" className={style['sign-up-btn-container']}>
                <GoogleButton onClick={onHandleGoogleSignIn}/>
            </div>
        </div>
        
    )


}



export default SignUpPageContainer;