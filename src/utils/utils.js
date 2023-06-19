import db,{ auth } from "@/Config/firebase.config";
import { collection, where } from "@firebase/firestore";
import { doc, getDoc,setDoc,addDoc,query,getDocs } from "@firebase/firestore";



const HasEmailBeenRequestedOnceAlready = async (senderEmail,reqRecieverCol,reqSenderCol,recieverEmail)=>{
    // method triggered to query if user has already requested email already, returns bool
    try{
        const q = query(reqRecieverCol, where('email','==',senderEmail)); // query of request sub collection
        const q1 = query(reqSenderCol,where('email','==',recieverEmail)); // opposite query run on request sender

        const querySnapshot = await getDocs(q);
        const querySnapshot1 = await getDocs(q1); // returns documents on sender request sub collection

        if(querySnapshot.size!==0) throw new Error("You have requested this user already");

        if(querySnapshot1.size!==0) throw new Error("The user you are requesting has already sent you a request");

        return false;

    }catch(error){
        return Promise.reject(error);
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


const areUsersFriends = async (uid1,uid2)=>{
    const friendCol = collection(db,'friends'); // returns reference to root level friends collection

    try{
        let q = query(friendCol,where('friend1','==',uid1),where('friend2','==',uid2));
        let q1 = query(friendCol,where('friend1','==',uid2),where('friend2','==',uid1));

        let querySnapshot = await getDocs(q); // return docs based on query
        let querySnapshot1 = await getDocs(q1); // return docs based on query

        if((querySnapshot.size!==0) || (querySnapshot1.size!==0)) throw new Error("You are friends already"); // snapshot array size returning 0, means query has not been matched

        return false; // returns false, signifying query has not matched a document

    }catch(error){
        return Promise.reject(error);
    }
}


const showNumberOfFriends = async (uid)=>{
    const friendsCol = collection(db,'friends'); // returns reference to root level friends collection

    try{
        const q = query(friendsCol,where('friend1','==',uid)); // query root level friends collection on the condition friend1 evaluates to uid value
        const q1 = query(friendsCol,where('friend2','==',uid)); // query root level friends collection on the condition friend2 evaluates to uid value

        const querySnapshot = await getDocs(q); // return docs based on query
        const querySnapshot1 = await getDocs(q1); // return docs based on query

        if((querySnapshot.size===0) && (querySnapshot1.size===0)) throw new Error("You have no friends on this account");

        // if(querySnapshot.size!==0){
        //     return querySnapshot.size;
        // }

        // if(querySnapshot1.size!==0){
        //     return querySnapshot1.size;
        // }

        return querySnapshot.size + querySnapshot1.size; // returns total number of friends by accumalating document array sizes

    
    }catch(error){
        return Promise.reject(0);
    }

}


const showFriends = async (uid)=>{
    const friendsCol = collection(db,'friends'); // returns reference to root level friends collection

    try{
        const q = query(friendsCol,where('friend1','==',uid)); // query root level friends collection on the condition friend1 evaluates to uid value
        const q1 = query(friendsCol,where('friend2','==',uid)); // query root level friends collection on the condition friend2 evaluates to uid value

        const querySnapshot = await getDocs(q); // return docs based on query
        const querySnapshot1 = await getDocs(q1); // return docs based on query

        if((querySnapshot.size===0) && (querySnapshot1.size===0)) throw new Error("You have no friends on this account");

        // console.log(querySnapshot1.docs);

        // querySnapshot.docs.forEach(element=>(
        //     console.log(element.data())
        // ))

        // console.log(querySnapshot.docs[0].data())

        return [...querySnapshot.docs,...querySnapshot1.docs].map(element=>({id:element.id,...element.data()}));     // returns friends document refeference by spreading documents within array and mapping documents which returns array

    
    }catch(error){
        return [];
    }

}

const showFriendUid = (uid,obj)=>{
    // method returns uid of friend, method takes uid and friend obj
    try{
        if(Object.values(obj).indexOf(uid)===-1) throw Error("User not in friendship Document"); // triggers error if uid is not present in friend document
        let friendUid = Object.values(obj).filter(val=>val!==uid); // returns uid of opposite user in array

        friendUid = friendUid[0];
    
        return friendUid;

    }catch(error){
        return null; // returns null on triggered error
    }
}



export default HasEmailBeenRequestedOnceAlready;
export {
    getUserIdFromEmail,
    areUsersFriends,
    showNumberOfFriends,
    showFriendUid,
    showFriends
}