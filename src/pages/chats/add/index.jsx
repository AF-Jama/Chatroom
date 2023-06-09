import React,{useState,useEffect,useReducer} from "react";
import Cookies from "nookies";
import { adminSDK } from "@/Config/firebaseAdmin";
import { doc,getDoc,collection, setDoc,updateDoc,addDoc, query, where, onSnapshot } from "@firebase/firestore";
import { fetchSignInMethodsForEmail } from "@firebase/auth";
import db,{ auth } from "@/Config/firebase.config";
import HasEmailBeenRequestedOnceAlready, { getUserIdFromEmail, areUsersFriends, showFriendUid } from "@/utils/utils";
import Header from "@/Components/Header";
import styles from '../../../styles/pages/add.module.css';
import global from '../../../styles/global.module.css';
import SideBar from "@/Components/SideBar/SideBar";
import useAuth from "@/customHooks/useAuth";

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
            decoded: decodedToken,
            uid:uid,
            email:email,
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


const AddPage = ({ uid, email })=>{
    const [menuState,setMenuState] = useState(false); // set menu state
    const [requestInputState,setRequestInputState] = useState(false); // set request input state
    const [emailState,setEmailState] = useState(''); // set email state
    const [errorState,setErrorState] = useState('');
    const [numberOfRequests,setNumberOfRequests] = useState(0);  
    const { state:{ user } } = useAuth();

    let userRef = collection(db,'users');;

    let userSenderDocumentReference = doc(userRef,uid); // returns user document reference

    let requestSenderSubCollection = collection(userSenderDocumentReference,'requests');

    const onButtonClick = (event)=>{
        event.preventDefault(); 

        console.log("SUCCESFULL");

        setMenuState(!menuState);
    }


    const onSubmitClick = async (event)=>{

        const { displayName,email } = user; // destructures user object

        event.preventDefault();

        if(!emailState){
            setErrorState("Enter a valid email");
            return;
        };

        if(emailState===email){
            setErrorState("You cannot request yourself");
            return;
        }

        try{

            let emailQueryResponse = await fetchSignInMethodsForEmail(auth,emailState);

            if(emailQueryResponse.length===0){
                setErrorState("Email you are sending request to does not exist");
                return;
            }

            let userId = await getUserIdFromEmail(emailState); // returns user id

            let userRecieverDocumentReference = doc(userRef,userId); // returns user document reference

            let requestRecieverSubCollection = collection(userRecieverDocumentReference,'requests');

            
            await HasEmailBeenRequestedOnceAlready(email,requestRecieverSubCollection,requestSenderSubCollection,emailState);
            
            await areUsersFriends(userId,uid);

            await addDoc(requestRecieverSubCollection,{
                email:email,
                uid:uid,
                state:"Pending"
            })
            

            setErrorState("Sent Request");




            console.log("SUBMITTED");
        }catch(error){
            console.log(error);
            setErrorState(error.message);
            return;
        }
    }

    console.log("DATA IS:")
    console.log(data);

    useEffect(()=>{
        console.log("HERE")
        const unsubscribe = onSnapshot(requestSenderSubCollection,(snapshot)=>(
            setNumberOfRequests(snapshot.docs.length)
        ))

        return ()=>unsubscribe();
    },[])


    useEffect(()=>{
        if(errorState){
            // triggered if error state evaluates to true
            setTimeout(()=>{
                setErrorState('');
            },3000)
        }

    },[errorState]) // runs on initial render (on mount) and on dependency array change



    return (
        <div id="add-page-container" className={styles['add-page']}>
            <Header onButtonClick={onButtonClick}/>

            <main className={styles.main}>
                <SideBar showState={menuState} numberOfRequests={numberOfRequests} uid={uid} email={email}/>

                <div className={styles['add-input-container']}>
                    <h1 className={global['p-tag']}>Add a Friend</h1>
                    <div className={styles['form']}>
                        <div className={styles['input-group']}>
                            <input type="text" onChange={(event)=>setEmailState(event.target.value)} placeholder="Enter email of user" />
                        </div>
                        {/* <input type="submit" className={styles['submit-btn']} /> */}
                        <button onClick={onSubmitClick}>Submit</button>
                    </div>
                    {errorState?<p style={{color:"red"}} className={global['p-tag']}>{errorState}</p>:""}
                </div>
            </main>
        </div>
    )
}



export default AddPage;