import React,{useState,useEffect,useReducer} from "react";
import Cookies from 'nookies';
import { setCookie, destroyCookie, parseCookies } from "nookies";
import db from "@/Config/firebase.config";
import { getDoc,doc,updateDoc, query, collection, where, getDocs } from "@firebase/firestore";
import {GoogleAuthProvider,EmailAuthProvider,onAuthStateChanged,signOut,signInWithPopup,signInWithRedirect, onIdTokenChanged } from "@firebase/auth";
import { useRouter } from "next/router";
import { auth } from "@/Config/firebase.config";
import authContext from "./authContext";


const AuthContextProvider = ({ children })=>{

    const router = useRouter();

    const authReducer = (state,action)=>{
        switch(action.type){
            case "UPDATE":
                return {...action.payload} //spreads payload object

            case "CLEAR":
                return{
                    user:null,
                    isAuthenticated:null,
                    accessToken:null,
                    uid:null
                }
        }
    }

    
    const [state,dispatch] = useReducer(authReducer,{
        user:null,
        isAuthenticated:false,
        accessToken:null,
        uid:null
    });

    const onProviderPopUpSignUp = async (provider)=>{
        // on provider signup with popup

        let result = await signInWithPopup(auth,provider);


        return result; // returns promise value
    }

    const onSignout = ()=>{
        console.log("SIGNOUT");
        destroyCookie(null,'token');
        signOut(auth);
        window.location.href = "/";
    }

    function areAllValuesNotNull(obj) {
        // method which verifies obj key values are not null
        return Object.values(obj).every(value => value !== null || value!=='');
      }

    useEffect(()=>{
        const unsubscribe = onIdTokenChanged(auth, async (currentUser)=>{
            if(!currentUser){
                // triggered if current user evaluates to false
                dispatch({type:"CLEAR"});
                return;
            }
            dispatch({type:"UPDATE",payload:{user:{displayName:currentUser.displayName,email:currentUser.email,emailVerified:currentUser.emailVerified}, uid:currentUser.uid,isAuthenticated:true,accessToken:currentUser.accessToken}});


        }) // returns unsubscribe method

        


        return ()=>{
            unsubscribe();
        }
    },[]); // runs on initial render (on mount) and dependecy array change 


    return (
        <authContext.Provider value={{onProviderPopUpSignUp,onSignout,state}}>
            { children }
        </authContext.Provider>
    )
}



export default AuthContextProvider;