import React,{useState,useReducer,useEffect} from "react";
import { useRouter } from "next/router";
import Cookies from 'nookies';
import db from "@/Config/firebase.config";
import { collection,getDoc,getDocs,query,setDoc,addDoc,doc, where, updateDoc } from "@firebase/firestore";
import useAuth from "@/customHooks/useAuth";
import { adminSDK } from "@/Config/firebaseAdmin";
import styles from '../../styles/pages/userInfo.module.css';
import whatsappLogo from '../../assets/images/whatsapp-logo.svg';
import Image from "next/image";

const userRef = collection(db,'users'); // users collection reference

function areAllValuesNotNull(obj) {
    // method which verifies obj key values are not null
    return Object.values(obj).every(value => value !== null || value!=='');
}

export async function getServerSideProps(context) {
    const cookies = Cookies.get(context); // returns cookie token 
    console.log(123);
    if (!cookies.token) {
        context.res.writeHead(302, { Location: '/' }); // redirect to /chats endpoint if token evaluates to true 
        context.res.end();
    }

    try {
        const decodedToken = await adminSDK.auth().verifyIdToken(cookies.token);
        if (!decodedToken) {
            Cookies.destroy(context);
            context.res.writeHead(302, { Location: '/' }); // redirect to /chats endpoint if token evaluates to true 
            context.res.end();
        }
     
        // the user is authenticated!
        console.log(decodedToken);
        const { uid, email } = decodedToken; // destructure token object and returns uid (user id)
        // const user = await adminSDK.auth().getUser(uid);
        // console.log(user);
        let userDocumentReference = doc(userRef,uid); // returns user document reference based on user id

        let userDocument = await getDoc(userDocumentReference); // returns user document

        if(!areAllValuesNotNull(userDocument.data())){
            console.log("ERROR HERE")
            console.log(error);
            return {
              props: {
                user:"TEST",
                email:email
              },
            };

        };


        throw new Error("User does have account");


        
        
    } catch (error) {
          context.res.writeHead(302, { Location: '/chats' }); // redirect to /chats endpoint if token evaluates to true 
          context.res.end();
    }

    
} //


const UserInfoForm = ({ user, email })=>{

    const { state:{isAuthenticated,uid,user:u} } = useAuth();
    const router = useRouter();

    console.log(uid);

    const userReducer = (state,action)=>{
        switch(action.type){
            case "UPDATE_FIRST_NAME":
                return {...state,...action.payload};

            case "UPDATE_LAST_NAME":
                return {...state,...action.payload};

            case "UPDATE_AGE":
                return {...state,...action.payload};

            case "UPDATE_OCCUPATION":
                return {...state,...action.payload};
        }
    }

    const [state,dispatch] = useReducer(userReducer,{
        firstName:"",
        lastName:"",
        age:null,
        occupation:""
    })


    const onSubmit = async (event)=>{
        event.preventDefault();

        const { firstName,lastName,age,occupation } = state; // destructure state object
        const userRef = collection(db,'users'); // users collection ref

        if(firstName && lastName && age && occupation){
            // const docQuery = query(userRef,where('email','==',authState.user.email)); // query
            const docRef = doc(userRef,uid); // returns document reference based on user uid

            // const querySnapshot = await getDocs(docQuery); // returns document snapshot based on query

            // const docRef = doc(db,'users',querySnapshot.docs[0].id); // returns document ref based on returned docuement id
            
            // console.log(querySnapshot.docs[0].id)

            await setDoc(docRef,{
                first_name:firstName,
                last_name:lastName,
                age:age,
                occupation:occupation,
                email:email
            })

            router.push('/chats');

        }else{
            return;
        }
    }



    return (
        <div className={styles.main}>
            <Image src={whatsappLogo} width={100} height={100} alt="Logo"/>
            <h3>Create Your Account</h3>
            <p>{user}</p>
            <div className={styles['form-container']}>
                <form action="" className={styles['user-info-form']}>
                    <div className={styles['input-group']}>
                        <input type="text" placeholder="First Name" onChange={(event)=>dispatch({type:"UPDATE_FIRST_NAME",payload:{firstName:event.target.value}})}/>
                    </div>

                    <div className={styles['input-group']}>
                        <input type="text" placeholder="Last Name" onChange={(event)=>dispatch({type:"UPDATE_LAST_NAME",payload:{lastName:event.target.value}})} />
                    </div>

                    <div className={styles['input-group']}>
                        <input type="number" placeholder="Your Age" onChange={(event)=>dispatch({type:"UPDATE_AGE",payload:{age:event.target.value}})}/>
                    </div>

                    <div className={styles['input-group']}>
                        <select id="select-1" onClick={(event)=>dispatch({type:"UPDATE_OCCUPATION",payload:{occupation:event.target.value}})}>
                            <option value=""></option>
                            <option value="Student" >Student</option>
                            <option value="Professional">Professional</option>
                            <option value="Retired">Retired</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <input type="submit" onClick={onSubmit} />
                </form>
            </div>
        </div>
    )
}



export default UserInfoForm;