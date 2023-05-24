import React,{useContext} from "react";
import authContext from "@/Contexts/AuthContext/authContext";


const useAuth = ()=>{
    return useContext(authContext);
}



export default useAuth;