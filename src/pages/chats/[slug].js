import React,{ useState, useEffect, useReducer } from "react";
import { useRouter } from "next/router";

export async function getServerSideProps(context) {
    // const cookies = Cookies.get(context); // returns cookie token 

    const { params } = context; // destructure context object

    const { slug } = params;


    return {
        props:{
            id:res
        }
    }

    
} //



const Chat = ({id})=>{


    return (
        <div>
            <p>{JSON.stringify(id)}</p>
        </div>
    )
}



export default Chat;