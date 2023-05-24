import React,{useState,useEffect,useReducer} from "react";
import db from "@/Config/firebase.config";
import { getDoc,doc,updateDoc, query, collection, where, getDocs } from "@firebase/firestore";
import {GoogleAuthProvider,EmailAuthProvider,onAuthStateChanged,signOut,signInWithPopup,signInWithRedirect } from "@firebase/auth";
import { auth } from "@/Config/firebase.config";
import authContext from "./authContext";


const AuthContextProvider = ({ children })=>{

    const authReducer = (state,action)=>{
        switch(action.type){
            case "UPDATE":
                return {...action.payload} //spreads payload object

            case "CLEAR":
                return{
                    user:null,
                    isAuthenticated:null,
                    accessToken:null,
                }
        }
    }

    const AccountDataReducer = (state,action)=>{
        switch(action.type){
            case "UPDATE":
                if(areAllValuesNotNull(action.payload)){
                    return {...state,...action.payload,hasDetails:true};
                }

                return {...state,...action.payload,hasDetails:false};
                

            case "CLEAR":
                return {
                    first_name:'',
                    last_name:'',
                    age:null,
                    occupation:null,
                    hasDetails:false
                }
        }
    }

    
    const [state,dispatch] = useReducer(authReducer,{
        user:null,
        isAuthenticated:false,
        accessToken:null
    });

    const [dataState,dataDispatch] = useReducer(AccountDataReducer,{
        first_name:'',
        last_name:'',
        age:null,
        occupation:null,
        hasDetails:false
    });
    
    // console.log(state);

    const onProviderPopUpSignUp = async (provider)=>{
        // on provider signup with popup

        let result = await signInWithPopup(auth,provider);


        return result; // returns promise value
    }

    const onSignout = ()=>{
        signOut(auth);
    }

    function areAllValuesNotNull(obj) {
        // method which verifies obj key values are not null
        return Object.values(obj).every(value => value !== null || value!=='');
      }



    useEffect(()=>{
        const unsubscribe = onAuthStateChanged(auth,(currentUser)=>{
            if(!currentUser){
                dispatch({type:"CLEAR"});
                dataDispatch({type:"CLEAR"});
                return;
            }
            // const userRef = collection(db,'users'); // user collection reference 
            // const userQuery = query(userRef,where('email','==',currentUser.email)); // user query reference, which queries based on user email
            // getDocs(userQuery)
            // .then((snapshot)=>{
            //     // console.log(snapshot.docs[0].data());
            //     const { email,first_name,last_name,occupation } = snapshot.docs[0].data(); // destructure user account

            //     dataDispatch({type:"UPDATE",payload:{...snapshot.docs[0].data()}}); // data dispatch
            // })
            // .catch(error=>console.log("Error on querying user account"));
            // dispatch({type:"UPDATE",payload:{user:{displayName:currentUser.displayName,email:currentUser.email,emailVerified:currentUser.emailVerified},isAuthenticated:true,accessToken:currentUser.accessToken}})

            dispatch({type:"UPDATE",payload:{user:{displayName:currentUser.displayName,email:currentUser.email,emailVerified:currentUser.emailVerified},isAuthenticated:true,accessToken:currentUser.accessToken}})

        }) // returns unsubscribe method

        


        return ()=>{
            unsubscribe();
            dataDispatch({type:"CLEAR"});
        }
    },[state,dataState]); // runs on initial render (on mount) and dependecy array change 


    return (
        <authContext.Provider value={{onProviderPopUpSignUp,onSignout,state,dataState}}>
            { children }
        </authContext.Provider>
    )
}



export default AuthContextProvider;