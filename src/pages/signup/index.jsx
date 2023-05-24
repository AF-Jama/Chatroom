import React,{useState,useEffect,useReducer,useContext} from "react";
import useAuth from "@/customHooks/useAuth";
import { useRouter } from "next/router";
import db from "@/Config/firebase.config";
import { collection,addDoc,getDoc,getDocs, setDoc,query,where, doc } from "@firebase/firestore";
import Image from "next/image";
import whatsappLogo from '../../assets/images/whatsapp-logo.svg';
import GoogleButton from 'react-google-button'
import style from '../../styles/signup.module.css';
import { GoogleAuthProvider, TwitterAuthProvider } from "@firebase/auth";
import { getAdditionalUserInfo } from "@firebase/auth";


const SignUpPageContainer = ()=>{
    const { onProviderPopUpSignUp,onSignout,state:{isAuthenticated},dataState } = useAuth();
    const { first_name,last_name,age,occupation,hasDetails } = dataState; // destructure data state

    const router = useRouter(); // router

    const onHandleGoogleSignIn = async ()=>{
        const provider = new GoogleAuthProvider();
        try{
            let result = await onProviderPopUpSignUp(provider);

            await createUserAccount(result); // create user account

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

    const createUserAccount = async (result)=>{
        // triggered if user does not exist in firebase db 
        try{
            const user = result.user;

            console.log(user);

            const userRef = collection(db,'users');

            let emailQuery = query(userRef,where('email',"==",user.email)); // email query 

            const data = await getDocs(emailQuery);

            if(data.size>0) throw new Error("Email Already exists in firestore"); // data returned >0 signifies that email exists within persistant store db already

            await addDoc(userRef,{
                email:user.email
            })
            

        }catch(error){
            // triggered if error in try block
            console.log(error);
        }
    }

    if(isAuthenticated){
        router.push('/createuser');
    }
    
    if(!isAuthenticated){
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


    // router.push('/createuser');


}



export default SignUpPageContainer;