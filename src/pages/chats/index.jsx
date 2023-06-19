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
import global from '../../styles/global.module.css';
import { showFriendUid, showFriends } from "@/utils/utils";
import { FirebaseError } from "firebase/app";

const userRef = collection(db,'users'); // users collection reference

function areAllValuesNotNull(obj) {
    // method which verifies obj key values are not null
    return Object.values(obj).every(value => value !== null || value!=='');
}



export async function getServerSideProps(context) {
    // console.log(context.req.cookies.remove());
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
            Cookies.destroy('token');
            context.res.writeHead(302, { Location: '/' }); // redirect to /chats endpoint if token evaluates to true 
            context.res.end();
        }
     
        // the user is authenticated!
        // console.log(decodedToken);
        console.log("HERE");
        const { uid } = decodedToken; // destructure token object and returns uid (user id)
        // const user = await adminSDK.auth().getUser(uid);
        // console.log(user);
        let userDocumentReference = doc(userRef,uid); // returns user document reference based on user id

        let userDocument = await getDoc(userDocumentReference); // returns user document

        if(!areAllValuesNotNull(userDocument.data())) throw new Error("User does not have account or account data not up to date");

        // const friendColRef = collection(db,'friends'); // reference to friends collection

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

            // if(!res.docs[0].data().message) continue;
            if(res.empty) continue; // triggered if sub collection is empty

            chatData.push({...res.docs[0].data(),id:friendDoc.id,name:`${first_name} ${last_name}`});


        }

        console.log("HERE");
        console.log(cookies);
        console.log(cookies.token);

        

     
        return {
          props: {
            uid:uid,
            isLoggedIn: true,
            test:"SUCCESFULLas",
            decoded: decodedToken,
            chatData:chatData.sort((a,b)=>b.timestamp - a.timestamp),
            messageData:{} // message data object
          },
        };
      } catch (error) {
        //   context.res.writeHead(302, { Location: '/createuser' }); // redirect to /chats endpoint if token evaluates to true 
        //   context.res.end();
        if(error instanceof FirebaseError){
            // triggered if error is instance of firebase error
            Cookies.destroy(context,'token');
            context.res.writeHead(302, { Location: '/' }); // redirect to /chats endpoint if token evaluates to true 
            context.res.end();
            return;
        }

        if(error.message==="User does not have account or account data not up to date"){
            context.res.writeHead(302, { Location: '/createuser' }); // redirect to /chats endpoint if token evaluates to true 
            context.res.end();
        }
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
        const friendsCol = collection(db,'friends');
        
        const chatCallData = async ()=>{
            console.log(1);
            const friendsDocs = await showFriends(uid); // returns friends id within friend collection
            let friendsData = [];
            for (const element of friendsDocs){
                const friendsDocRef = doc(db,'friends',element.id); // returns reference to document in friend collection
                const chatCol = collection(friendsDocRef,'chat'); // returns reference to chat sub collection
                
                let q = query(chatCol,orderBy('timestamp','desc')); // queries chat collection  
                
                const friendRes = await getDoc(friendsDocRef); // returns friend document within collection
                const friendUid = showFriendUid(uid,friendRes.data()); // returns friend uid within friend document
                
                // if(!friendUid) continue;
                
                const friendUserData = await getDoc(doc(db,'users',friendUid)); // returns user document within collection
                const { first_name,last_name } = friendUserData.data(); // destuctures user document data
                
                const chatRes = await getDocs(q);
                
                if(chatRes.empty) continue;
                
                const unsubscribe = onSnapshot(q,(snapshot)=>{
                    const set = new Set(); // set object which can store unique values
                    // const { message } = snapshot.docs[0].data(); // returns latest message
                    const newChatData = { ...snapshot.docs[0].data(), id: element.id, name: `${first_name} ${last_name}` };

                    // const updatedArray = [...chatData,newChatData].filter(value=>{
                    //     if(set.has(value.name)) return; // triggered if name is already in set and return false object not added in returned array
    
                    //     set.add(value.name); // triggered if name is not in set and object is added in returned array
                    //     return value;
                    // });

                    // updatedArray.sort((a,b)=>b.timestamp-a.timestamp);

                    // setChatData(updatedArray);

                    setChatData((prevChatData) => {
                        const updatedChatData = [...prevChatData, newChatData];
                        return updatedChatData
                          .sort((a, b) => b.timestamp - a.timestamp) // sorts based on message timestamp
                          .filter((value) => { // filters based on object name
                            if (set.has(value.name)) return false; // triggered if name is already in set and return false object not added in returned array
              
                            set.add(value.name); // triggered if name is not in set and object is added in returned array
                            return true;
                          });
                    });


                })

    
                unsubscribeArray.push(unsubscribe);

            }
            
        }

        chatCallData();

        return ()=>{
            unsubscribeArray.forEach(unsubscribe=>unsubscribe());
        }

    },[uid]);    // side effect runs on initial render (on mount) and on dependecy array change



    return (
        <main className={styles.main}>
            <div className={styles['inner-container']}>
                <div className={styles['chats-container']}>
                    {(chatDataState.length===0) && <p className={global['p-tag']} style={{fontSize:"1.3rem"}}>No Available Chats</p>}
                        {chatDataState.map(element=>(
                            <a key={element.id} style={{textDecoration:"none",color:"#000"}}     href={`/chats/${element.id}`}>
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