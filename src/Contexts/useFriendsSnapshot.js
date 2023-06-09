import React, { useState, useEffect } from "react";
import db from "@/Config/firebase.config";
import { collection, getDoc, onSnapshot } from "@firebase/firestore";
import { showFriendUid } from "@/utils/utils";



const useFriendsSnapshot = (uid)=>{
    const [data,setData] = useState([]); // set data state


    useEffect(()=>{
        const friendsCol = collection(db,"friends"); // reference friends collection

        const unsubscribe = onSnapshot(friendsCol, (snapshot)=>{
            let friends = [];

            snapshot.docs.forEach(async (element)=>{
                let res = await showFriendUid(uid,element.data())

                friends.push(res);
            })

            setData(friends);

        });


        return ()=>unsubscribe();

    },[]); // runs on initial render (on mount)

    return { data };
}



export default useFriendsSnapshot;