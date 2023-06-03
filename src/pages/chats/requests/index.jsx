import React,{useState,useEffect,useReducer} from "react";
import { doc,getDoc,collection, onSnapshot } from "@firebase/firestore";
import { adminSDK } from "@/Config/firebaseAdmin";
import db from "@/Config/firebase.config";
import Cookies from "nookies";
import Header from "@/Components/Header";
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
        context.res.writeHead(302, { Location: '/signup' }); // redirect to /chats endpoint if token evaluates to true 
        context.res.end();
    }

    try {
        const decodedToken = await adminSDK.auth().verifyIdToken(cookies.token);
        if (!decodedToken) {
            context.res.writeHead(302, { Location: '/signup' }); // redirect to /chats endpoint if token evaluates to true 
            context.res.end();
        }
     
        // the user is authenticated!
        console.log(decodedToken);
        const { uid } = decodedToken; // destructure token object and returns uid (user id)
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
            decoded: decodedToken,
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

const RequestsPage = ({ uid })=>{
    const [menuState,setMenuState] = useState(false);
    const [ friendRequests, setFriendRequests ] = useState([]); // set friend requests state

    const onButtonClick = (event)=>{
        event.preventDefault(); 

        console.log("SUCCESFULL");

        setMenuState(!menuState);
    }

    let userRef = collection(db,'users');;

    let userDocumentReference = doc(userRef,uid); // returns user document reference

    let requestSubCollection = collection(userDocumentReference,'requests');



    onSnapshot(requestSubCollection,(snapshot)=>{
        const requests = [];
        snapshot.docs.forEach(element=>{
            console.log(requests.push(element.data()));
        })

        setFriendRequests([...requests])
    })


    console.log(friendRequests);





    return (
        <div id="request-page-container" className={styles.requests}>
            <Header onButtonClick={onButtonClick}/>

            <main className={styles['requests-main-page']}>
                <SideBar showState={menuState}/>

                <div id="requests-container" className={styles['requests-container']}>
                    <h3>Your Friend Requests</h3>

                    {(friendRequests.length===0) && <p>No Friend Requests</p>}

                    <div className={styles['user-request-container']}>
                        {
                            friendRequests.map((element,index)=>(
                            <div className={styles['user-requests-container']}>
                                <p className={global['p-tag']}>{element.email} {index}</p>

                                <div className={styles['request-btns-outer-container']}>
                                    <div className={styles['request-btn-container']}>
                                        <button>✓</button>
                                    </div>
                                    <div className={styles['request-btn-container']}>
                                        <button>☓</button>
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