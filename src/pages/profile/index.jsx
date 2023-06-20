import React,{useState,useEffect,useReducer} from "react";
import styles from '../../styles/pages/profile.module.css';
import db from "@/Config/firebase.config";
import { doc,getDoc,getDocs,collection } from "@firebase/firestore";
import { showFriends, showNumberOfRequests } from "@/utils/utils";
import { adminSDK } from "@/Config/firebaseAdmin";
import person from '../../assets/images/person.jpg';
import Cookies from 'nookies';
import { setCookie } from "nookies";
import { destroyCookie } from "nookies";
import Image from "next/image";
import useAuth from "@/customHooks/useAuth";

function areAllValuesNotNull(obj) {
    // method which verifies obj key values are not null
    return Object.values(obj).every(value => value !== null || value!=='');
}

const userColRef = collection(db,'users'); // return reference to root user collection
const friendsColRef = collection(db,'friends'); // return reference to root friend collection


export async function getServerSideProps(context){
    const cookies = Cookies.get(context); // returns cookie token 
    if (!cookies.token) {
        console.log("HIT3233");
        console.log(!cookies.token);
        context.res.writeHead(302, { Location: '/' }); // redirect to /chats endpoint if token evaluates to true 
        context.res.end();
    }

    try {
        const decodedToken = await adminSDK.auth().verifyIdToken(cookies.token);
        if (!decodedToken) {
            Cookies.destroy(context,'token');
            context.res.writeHead(302, { Location: '/' }); // redirect to /chats endpoint if token evaluates to true 
            context.res.end();
        }

        const { uid, email } = decodedToken; // destructures token object and returns uid and email

        let userDocumentReference = doc(userColRef,uid); // returns user document reference based on user id

        const userDoc = await getDoc(userDocumentReference);

        if(!areAllValuesNotNull(userDoc.data())) throw new Error("User does not have account or account data not up to date"); // triggers error if user data object values are null or evaluate to false

        let numberOfFriends = await showFriends(uid);

        console.log(numberOfFriends);

        const numberOfChats = numberOfFriends.reduce((accumalator, currentValue)=>{
            // let docRef = doc(friendsColRef,accumalator.id); // returns reference to document within friends collection

            // let chatColRef = collection(docRef,'chat');

            // let chatColDocs = await getDocs(chatColRef);

            // if(chatColDocs.empty){
            //     return accumalator + 0;
            // }


            // return accumalator + 1;
            return accumalator + currentValue+5;
        },0)

        numberOfFriends = numberOfFriends.length;   

        let numberOfRequests = await showNumberOfRequests(uid);


        const { first_name, last_name, age, occupation } = userDoc.data(); // destructures user document data object


        return {
            props:{
                first_name:first_name,
                last_name:last_name,
                age:age,
                occupation:occupation,
                numberOfFriends:numberOfFriends,
                numberOfRequests:numberOfRequests,
                numberOfChats:numberOfChats
            }
        }


    }
    catch(error){
        if(error.message="User does not have account or account data not up to date"){
            context.res.writeHead(302, { Location: '/createuser' }); // redirect to /chats endpoint if token evaluates to true 
            context.res.end();
            return;
        }

        if(error instanceof FirebaseError){
            // triggered if error is instance of firebase error
            Cookies.destroy(context,'token');
            context.res.writeHead(302, { Location: '/' }); // redirect to /chats endpoint if token evaluates to true 
            context.res.end();
            return;
        }
    }
}


const Profile = ({ first_name, last_name, age, occupation, uid, numberOfFriends, numberOfRequests, numberOfChats })=>{
    const { onSignout } = useAuth();



    return (
        <div className={styles.main}>
            <div id="profile-container" className={styles['profile-container']}>
                <Image src={person}/>
                <h3>{first_name.toUpperCase()} {last_name.toUpperCase()}</h3>
                <h3>{occupation.toUpperCase()}</h3>
                <div className={styles['profile-info-container']}>
                    <div className={styles['info-card']}>
                        <p>Friends</p>
                        <h3>{numberOfFriends}</h3>
                    </div>
                    <div className={styles['info-card']}>
                        <p>Chats</p>
                        <h3>2</h3>
                    </div>
                    <div className={styles['info-card']}>
                        <p>Requests</p>
                        <h3>{numberOfRequests}</h3>
                    </div>
                </div>
            </div>
        </div>
    )
}



export default Profile;