import React,{useState,useEffect,useReducer} from "react";
import styles from '../../styles/pages/profile.module.css';
import global from '../../styles/global.module.css';
import db from "@/Config/firebase.config";
import { doc,getDoc,getDocs,collection, onSnapshot } from "@firebase/firestore";
import { storage } from "@/Config/firebase.config";
import { getDownloadURL, ref, uploadBytes, UploadTask } from "@firebase/storage";
import { showFriends, showNumberOfRequests, getImageURL } from "@/utils/utils";
import { adminSDK } from "@/Config/firebaseAdmin";
import person from '../../assets/images/person.jpg';
import unknownUser from '../../assets/images/unknown-user.svg';
import add from '../../assets/images/add-plus.svg';
import Cookies from 'nookies';
import { setCookie } from "nookies";
import { destroyCookie } from "nookies";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
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

        const imageRef = ref(storage,`profiles/${uid}.png`); // reference to images directory

        const imageUrl = await getImageURL(imageRef);

        console.log("IMAGE URL:");
        console.log(imageUrl)



        return {
            props:{
                first_name:first_name,
                last_name:last_name,
                age:age,
                occupation:occupation,
                numberOfFriends:numberOfFriends,
                numberOfRequests:numberOfRequests,
                numberOfChats:numberOfChats,
                uid:uid,
                image: (imageUrl?imageUrl:'')
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


const Profile = ({ first_name, last_name, age, occupation, uid, numberOfFriends, numberOfRequests, numberOfChats, image })=>{
    const { onSignout } = useAuth();
    const [imageUrl, setImageUrl] = useState(image); // set image url state
    const [file,setFile] = useState(null); // set file state
    const [progression,setProgression] = useState(null); // set upload progression state
    const [status,setStatus] = useState(''); // set status state

    const router = useRouter();


    // useEffect(()=>{
    //     const userColRef = collection(db,'users'); // returns reference to user collection

    //     const unsubscribe = onSnapshot(doc(userColRef,uid),(snapshot)=>{
    //         const { imageUrl } = snapshot.data(); // destructure data object

    //         setImageUrl(imageUrl);
    //     })


    //     return ()=>unsubscribe();

    // },[])


    function handleFileUpload(event) {
        const file = event.target.files[0];

        console.log(file.name);

    }

    const uploadImage = async (event)=>{
        if(!file) return;

        console.log(file.name);

        try{
            let bool = ['png','jpeg','jpg'].includes(file.name.split('.')[1]); // returns bool if file contains png or jpeg filename ext

            if(!bool) throw Error;

            const imageRef = ref(storage,`profiles/${uid}.png`); // reference to images directory
        
            await uploadBytes(imageRef, file ); 

            let url = await getDownloadURL(imageRef);

            setImageUrl(url);

            setStatus("Profile  Updated");
            setFile('');
        }catch(error){
            setStatus('Error updating display photo');
            setFile('');
            console.log(error);
            return;
        }

    }


    useEffect(()=>{
        if(status){
            setTimeout(()=>{
                setStatus('');
            },3000)
        }
    },[status])


    return (
        <div className={styles.main}>
            <div id="profile-container" className={styles['profile-container']}>
                <div id="image-container" className={styles['img-container']}>
                        {imageUrl?<Image src={imageUrl} width={120} height={150} style={{objectFit:"cover"}} alt="a"/>:<Image src={unknownUser} alt="a"/>}
                        <label for="image">
                            <input type="file" name="image" id="image" style={{display:"none"}} onChange={(event)=>setFile(event.target.files[0])}/>
                            <Image src={add}/>
                        </label>

                        {status && <p className={global['p-tag']}>{status}</p>}

                        {file
                        &&

                        <div>
                            <button type="submit" onClick={uploadImage}>Upload</button>
                            <p className={global['p-tag']}>{file.name}</p>
                        </div>
                        }
                </div>

                <h3>{first_name} {last_name}</h3>
                <h3>{occupation}</h3>
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


            <div id="back-container" className={styles['back-container']} onClick={(event)=>router.push('/chats')}>
                <h3>Back to Chats</h3>
            </div>
        </div>
    )
}



export default Profile;