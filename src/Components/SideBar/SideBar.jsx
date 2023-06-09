import React,{useState,useEffect,useReducer} from "react";
import db, { auth } from "@/Config/firebase.config";
import { doc, onSnapshot,collection, getDoc } from "@firebase/firestore";
import Image from "next/image";
import chatLogo from '../../assets/images/chat.svg';
import useAuth from "@/customHooks/useAuth";
import { showFriendUid } from "@/utils/utils";
import styles from '../../styles/components/sidebar.module.css';
import global from '../../styles/global.module.css';

const userRef = collection(db,'users');

const SideBar = ({ showState, numberOfRequests,uid,email })=>{
    const { state:{user}} = useAuth();
    const [data, setData] = useState([]);


    const friendsCol = collection(db,"friends"); // reference friends collection

    useEffect(()=>{

        const unsubscribe = onSnapshot(friendsCol, async (snapshot)=>{
            let friends = [];

            for(const docs of snapshot.docs){
                let friendUid = showFriendUid(uid,docs.data());
                let friendDocRef = doc(db,'users',friendUid);
    
                let res = await getDoc(friendDocRef);
    
                friends.push({...res.data(),id:res.id});

            }

            setData(friends);

        });


        return ()=>unsubscribe();
    },[])


    return (
        <div id="side-bar-container" className={showState?styles['side-bar-show']:styles['side-bar-hide']}>

            <Image src={chatLogo}/>

            <h2>Overview</h2>

            <div id="friends-container" className={styles['friends-container']}>
                {data.map(element=>(
                    <a href="" style={{textDecoration:"none",color:"black"}}><p>{element.first_name} {element.last_name}</p></a>
                ))}
            </div>

            <div id="overview-actions" className={styles['overview-actions']}>
                <a href="/chats/add" style={{textDecoration:"none",color:"black"}}><p className={global['p-tag']}>Add Friend</p></a>
                <a href="/chats/requests" style={{textDecoration:"none",color:"black"}}><p className={global['p-tag']}>Friend Requests {(numberOfRequests===0)?"":<span style={{backgroundColor:"#4682B4",borderRadius:"50%",padding:"0.5rem"}}>{(numberOfRequests)}</span>}</p></a>
            </div>

            {/* <div id="user-account-information-container" className={styles['user-account-container']}>
            </div> */}
            <div id="user-details-container">
                <h3 className={styles['user-details']}>{user?.displayName}</h3>
                <p className={styles['user-details']}>{email}</p>
            </div>
            
        </div>
    )
}



export default SideBar;