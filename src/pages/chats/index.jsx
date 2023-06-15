import React, { useEffect, useState } from "react";
import MessageBar from "@/Components/MessageBar";
import ChatBar from "@/Components/ChatBar";
import Cookies from "nookies";
import db from "@/Config/firebase.config";
import { getDoc,doc,updateDoc, query, collection, where, getDocs, onSnapshot,orderBy } from "@firebase/firestore";
import { adminSDK } from "@/Config/firebaseAdmin";
import { useRouter } from "next/router";
import useAuth from "@/customHooks/useAuth";
import Image from "next/image";
import Link from "next/link";
import unknownUser from '../../assets/images/unknown-user.svg';
import styles from '../../styles/pages/chats.module.css';
import { showFriendUid, showFriends } from "@/utils/utils";

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
        // console.log(decodedToken);
        const { uid } = decodedToken; // destructure token object and returns uid (user id)
        // const user = await adminSDK.auth().getUser(uid);
        // console.log(user);
        let userDocumentReference = doc(userRef,uid); // returns user document reference based on user id

        console.log("1");

        let userDocument = await getDoc(userDocumentReference); // returns user document

        console.log("2");

        if(!areAllValuesNotNull(userDocument.data())) throw new Error("User does not have account or account data not up to date");

        // const friendColRef = collection(db,'friends'); // reference to friends collection

        console.log("3");

        const friendsDocs = await showFriends(uid); // returns friends id within friend collection

        let chatData = [];

        for(const friendDoc of friendsDocs){
            const friendsDocRef = doc(db,'friends',friendDoc.id); // returns reference to document in friend collection
            const chatCol = collection(friendsDocRef,'chat'); // returns reference to chat sub collection
            const friendRes = await getDoc(friendsDocRef); // returns friend document within collection
            const friendUid = showFriendUid(uid,friendRes.data()); // returns friend uid within friend document

            const friendUserData = await getDoc(doc(db,'users',friendUid)); // returns user document within collection
            const { first_name,last_name } = friendUserData.data(); // destuctures user document data
            // let res = await getDocs(chatCol)

            // // res.docs.forEach((element)=>{
            // // })

            // console.log(res.docs[0].data());

            let q = query(chatCol,orderBy('timestamp','desc')); 

            let res = await getDocs(q);

            chatData.push({...res.docs[0].data(),id:friendDoc.id,name:`${first_name} ${last_name}`});


        }

        

     
        return {
          props: {
            uid:uid,
            isLoggedIn: true,
            test:"SUCCESFULLas",
            decoded: decodedToken,
            chatData:chatData,
            messageData:{} // message data object
          },
        };
      } catch (error) {
        console.log("ERROR");
        console.log(error);
        context.res.writeHead(302, { Location: '/createuser' }); // redirect to /chats endpoint if token evaluates to true 
        context.res.end();
    }

    
} //


const ChatDashboard = ({ uid,isLoggedIn, test, decoded,chatData })=>{
    const { isAuthenticated,hasDetails,onSignout, state:{user} } = useAuth();
    const [messageText,setMessageText] = useState('');
    const router = useRouter();
    const [chatDataState,setChatData] = useState(chatData); // set chat data state



    const onMessageSubmit = (event)=>{
        // submits message to firebase message collection
        event.preventDefault();

        if(messageText==="") return;
    }


    const onMessageChange = (event)=>{
        event.preventDefault();

        console.log(event.target.value);
        setMessageText(event.target.value);
    }


    useEffect(()=>{
        const unsubscribeArray = [];

        const chatCallData = async ()=>{
            const friendsDocs = await showFriends(uid); // returns friends id within friend collection

            friendsDocs.forEach(async element=>{
                const friendsDocRef = doc(db,'friends',element.id); // returns reference to document in friend collection
                const chatCol = collection(friendsDocRef,'chat'); // returns reference to chat sub collection

                let q = query(chatCol,orderBy('timestamp','desc')); // queries chat collection  

                const friendRes = await getDoc(friendsDocRef); // returns friend document within collection
                const friendUid = showFriendUid(uid,friendRes.data()); // returns friend uid within friend document

                const friendUserData = await getDoc(doc(db,'users',friendUid)); // returns user document within collection
                const { first_name,last_name } = friendUserData.data(); // destuctures user document data

                const unsubscribe = onSnapshot(q,(snapshot)=>{
                    let friendsData = [];
                    friendsData.push({...snapshot.docs[0].data(),id:element.id,name:`${first_name} ${last_name}`});
                    setChatData([...friendsData]);
                })

                unsubscribeArray.push(unsubscribe);
            })
            
        }

        chatCallData();

        return ()=>{
            unsubscribeArray.forEach(unsubscribe=>unsubscribe());
        }

    },[uid]); // side effect runs on initial render (on mount) and on dependecy array change



    return (
        <main className={styles.main}>
            <div className={styles['inner-container']}>
                <div className={styles['chats-container']}>
                        {chatDataState.map(element=>(
                            <a key={element.id} style={{textDecoration:"none",color:"#000"}} href={`/chats/${element.id}`}>
                                <MessageBar senderImage="" message={element.message} friendName={element.name}/>
                            </a>
                        ))}
                </div>
                {/* <div className={styles['messages-container']}>
                    <div id="user-messages-container" className={styles['user-messages-container']}>
                    </div>
                    <ChatBar onMessageChange={onMessageChange}/>
                </div> */}

                <div id="profile" className={styles['profile-actions']}>
                    <Image src={unknownUser} alt="user"/>

                    <div id="profile-actions-container" style={{padding:"0 1rem"}}>
                        <div className="actions">Show Profile</div>
                        <Link href='chats/requests' style={{textDecoration:"none",color:"#fff"}}>
                            <div className="account-information">Account Information</div>
                        </Link>
                        <div className="actions" onClick={onSignout}>Logout</div>
                        <div>{user?.displayName}</div>
                    </div>
                </div>
            </div>
        </main>
    )
}



export default ChatDashboard;