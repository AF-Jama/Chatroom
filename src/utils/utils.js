import db,{ auth } from "@/Config/firebase.config";
import { collection, where } from "@firebase/firestore";
import { doc, getDoc,setDoc,addDoc,query,getDocs } from "@firebase/firestore";



const HasEmailBeenRequestedAlready = async (email,reqCol)=>{
    // method triggered to query if user has already requested email already, returns bool
    try{
        const q = query(reqCol, where('email','==',email)); // query of request sub collection

        const querySnapshot = await getDocs(q);

        if(querySnapshot.size===0) return false; // returns true if query snapshot exists method evaluates to true

        throw new Error("Email does already exist within request sub collection");

    }catch(error){
        return Promise.reject(new Error("true"));
    }
}


const getUserIdFromEmail = async (email)=>{
    // returns user id from email, queries user collection
    const userCol = collection(db,'users'); // returns reference to user collection
    try{
        const q = query(userCol,where('email','==',email))

        const querySnapshot = await getDocs(q);

        if(querySnapshot.size>0){
            return querySnapshot.docs[0].id; // returns user id
        }

        throw new Error("Cannot found user id associated with email");



    }catch(error){
        return Promise.reject(new Error(error));
    }
}



export default HasEmailBeenRequestedAlready;
export {
    getUserIdFromEmail
}