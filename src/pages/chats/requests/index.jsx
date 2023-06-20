import React,{useState,useEffect,useReducer} from "react";
import { doc,getDoc,collection, onSnapshot, deleteDoc, addDoc } from "@firebase/firestore";
import { adminSDK } from "@/Config/firebaseAdmin";
import db from "@/Config/firebase.config";
import Cookies from "nookies";
import Header from "@/Components/Header";
import { showFriendUid } from "@/utils/utils";
import useFriendsSnapshot from "@/Contexts/useFriendsSnapshot";
import styles from '../../../styles/pages/requests.module.css';
import global from '../../../styles/global.module.css';
import SideBar from "@/Components/SideBar/SideBar";

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
            Cookies.destroy(context,'token');
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

        if(!areAllValuesNotNull(userDocument.data())) throw new Error("User does not have account or account data not up to date");

     
        return {
          props: {
            isLoggedIn: true,
            test:"SUCCESFULLas",
            uid: uid,
            email:email,
            decoded: decodedToken,
            messageData:{} // message data object
          },
        };
      } catch (error) {
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

    
} //

const RequestsPage = ({ uid, email })=>{
    const [menuState,setMenuState] = useState(false);
    const [ friendRequests, setFriendRequests ] = useState([]); // set friend requests state
    const [numberOfRequests,setNumberOfRequests] = useState(0);

    let userRef = collection(db,'users');;

    let userDocumentReference = doc(userRef,uid); // returns user document reference

    let requestSubCollection = collection(userDocumentReference,'requests');

    const friendshipCollection = collection(db,'friends'); // creating root level friends collection


    const onButtonClick = (event)=>{
        event.preventDefault(); 

        console.log("SUCCESFULL");

        setMenuState(!menuState);
    }

    const onAcceptClick = async (event,requesterUuid,id)=>{
        // on click, friend request is "accepted" and friendship added to a friend collection
        event.preventDefault();

        await addDoc(friendshipCollection,{
            friend1:uid, // friend 1 (current user)
            friend2: requesterUuid // friend 2 (requester)
        }) // add doc to friendship collection

        await deleteDoc(doc(requestSubCollection,id)) // removes request doc from request collection

    }

    const onDeclineClick = async (event,id)=>{
        event.preventDefault();

        await deleteDoc(doc(requestSubCollection,id))

    }




    useEffect(()=>{

        const unsubscribe = onSnapshot(requestSubCollection,(snapshot)=>{
            setNumberOfRequests(snapshot.docs.length);
            const requests = [];
            snapshot.docs.forEach(element=>{
                requests.push({...element.data(),id:element.id});
            })
    
            setFriendRequests([...requests])
        })


        return ()=>unsubscribe();
    },[requestSubCollection])



    return (
        <div id="request-page-container" className={styles.requests}>
            <Header onButtonClick={onButtonClick}/>

            <main className={styles['requests-main-page']}>
                <SideBar showState={menuState} numberOfRequests={numberOfRequests} uid={uid} email={email}/>

                <div id="requests-container" className={styles['requests-container']}>
                    <h3>Your Friend Requests</h3>

                    {(friendRequests.length===0) && <p className={global['p-tag']} >No Friend Requests</p>}

                    <div className={styles['user-request-container']}>
                        {
                            friendRequests.map((element,index)=>(
                            <div key={element.id} className={styles['user-requests-container']}>
                                <p className={global['p-tag']}>{element.email}</p>

                                <div className={styles['request-btns-outer-container']}>
                                    <div className={styles['request-btn-container']}>
                                        <button onClick={(event)=>onAcceptClick(event,element.uid,element.id)}>✓</button>
                                    </div>
                                    <div className={styles['request-btn-container']}>
                                        <button onClick={(event)=>onDeclineClick(event,element.id)}>☓</button>
                                    </div>
                                </div>
                            </div>
                            ))
                        }
                    </div>
                </div>
            </main>
        </div>
    )
}



export default RequestsPage;