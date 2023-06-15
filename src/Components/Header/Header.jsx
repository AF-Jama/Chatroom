import React,{useState,useEffect,useReducer} from "react";
import chatLogo from '../../assets/images/chat.svg';
import Image from "next/image";
import styles from '../../styles/components/header.module.css';


const Header = (props)=>{




    return (
        <header className={styles.header}>
            <div className="inner-header-container">
                <Image src={chatLogo} alt="Image Logo"/>

                <div id="button">
                    <button onClick={props.onButtonClick} style={{display:"flex",flexDirection:"row", justifyContent:"space-between",alignItems:"center",fontSize:"1.3rem",backgroundColor:"black",color:"#fff",border:"0",outline:"0",borderRadius:"5px",margin:"0.1rem"}}>
                        Menu

                    <div id="b-btn-container" className={styles['bar-container']}>
                        <div id="bar" className={styles.bar1}></div>
                        <div id="bar" className={styles.bar1}></div>
                        <div id="bar" className={styles.bar1}></div>
                    </div>
                    </button>
                </div>
            </div>
        </header>
    )
}



export default Header;