import React,{ useState, useEffect, useReducer, useRef } from "react";
import { useRouter } from "next/router";
import Cookies from "nookies";
import { adminSDK } from "@/Config/firebaseAdmin";
import Image from "next/image";
import MessageBar from "@/Components/MessageBar";
import ChatBar from "@/Components/ChatBar";
import { signOut } from "@firebase/auth";
import { showFriendUid } from "@/utils/utils";
import db from "@/Config/firebase.config";
import styles from '../../styles/pages/chat.slug.module.css';
import unknownUser from '../../assets/images/unknown-user.svg';
import useAuth from "@/customHooks/useAuth";
import { Timestamp, addDoc, collection, doc, getDoc, getDocs, onSnapshot, query } from "@firebase/firestore";

function areAllValuesNotNull(obj) {
    // method which verifies obj key values are not null
    return Object.values(obj).every(value => value !== null || value!=='');
}

export async function getServerSideProps(context) {
    // const cookies = Cookies.get(context); // returns cookie token 

    const { params } = context; // destructure context object

    const { slug } = params; // destructure params object

    const cookies = Cookies.get(context); // returns cookie token 
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
        const { uid, email } = decodedToken; // destructure token object and returns uid (user id)

        const userRef = collection(db,'users');

        let userDocumentReference = doc(userRef,uid); // returns user document reference based on user id

        let userDocument = await getDoc(userDocumentReference); // returns user document

        if(!areAllValuesNotNull(userDocument.data())) throw new Error("User does not have account or account data not up to date");

        const friendDocRef = doc(db,'friends',slug); // returns reference to document from friends collection

        const friendDoc = await getDoc(friendDocRef); // returns friend document

        if(!showFriendUid(uid,friendDoc.data())){
            context.res.writeHead(302, { Location: '/chats' }); // redirect to /chats endpoint if token evaluates to true 
            context.res.end();
        }

        const chatColRef = collection(friendDocRef,'chat'); // returns collection reference to sub collection within friend document

        let res = await getDocs(chatColRef);

        const data  = res.docs.map(element=>(
            {
                ...element.data(),
                id:element.id
            }
        )) // maps across document array and returns array

        data.sort((a,b)=>a.timestamp-b.timestamp);

        console.log(data);

     
        return {
          props: {
            isLoggedIn: true,
            test:"SUCCESFULLas",
            decoded: decodedToken,
            uid:uid,
            email:email,
            chatData: data, 
            chatId:slug,
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



const Chat = ({ chatData, chatId, uid })=>{

    const { user,onSignout } = useAuth();
    const scrollMessageContainer = useRef();
    const inputContainerRef = useRef();

    const [chatDataState,setChatData] = useState(chatData); // set chat data
    const [message,setMessage] = useState(''); // set message state

    const onMessageChange = (event)=>{
        event.preventDefault();

        console.log(event.target.value);
        setMessage(event.target.value);

    }

    const onSubmit = async (event)=>{
        event.preventDefault();

        const timestamp = Date.now();
        const time = new Timestamp()

        if(!message) return;

        await addDoc(chatCol,{
            message:message,
            timestamp:Date.now(),
            userId:uid
        });

        inputContainerRef.current.value="";
        setMessage("");


    }

    chatDataState.sort((a,b)=>a.timestamp-b.timestamp);

    const chatCol = collection(db,`friends/${chatId}/chat`); // references chat sub collection

    const scrollToBottom = () => {
        scrollMessageContainer.current.scrollTop = scrollMessageContainer.current.scrollHeight;
      };


    useEffect(()=>{

        const unsubscribe = onSnapshot(chatCol, async (snapshot)=>{
            let chat = [];

            for(const chatDoc of snapshot.docs){
                chat.push({
                    ...chatDoc.data(),
                    id:chatDoc.id
                })
            }

            setChatData(chat); //  set chat data

            scrollMessageContainer.current.addEventListener('DOMNodeInserted', event => {
                const { currentTarget: target } = event;
                target.scroll({ top: target.scrollHeight, behavior: 'smooth' });
                
            })

        });


        return ()=>unsubscribe();
    },[])


    return (
        <div id="chat-main-container" className={styles['chat-container']}>
            <div className={styles['inner-container']}>
                <div className={styles['messages-container']}>
                    <div id="user-messages-container" className={styles['user-messages-container']} ref={scrollMessageContainer}>
                        {(chatDataState.length===0) && <p>Add your first message</p>}
                        {chatDataState.map(element=>(
                            <p style={(element.userId===uid)?{backgroundColor:"#218aff",padding:"0.5rem",borderRadius:"10px",width:"90%",maxWidth:"500px"}:{backgroundColor:"#39ff5a",padding:"0.5rem",borderRadius:"10px",width:"90%",maxWidth:"500px"}}>{element.message}</p>
                        ))}
                    </div>
                    <ChatBar onMessageChange={onMessageChange} inputContainerRef={inputContainerRef} onSubmit={onSubmit}/>
                </div>

            </div>
        </div>
    )
}



export default Chat;