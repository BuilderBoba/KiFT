import "./SignIn.css";
import { useState,useEffect } from 'react'
import Web3 from 'web3'
import axios from 'axios'


function SignIn({setfooter,setLoginAccount,setWeb3}) {

    useEffect(()=>{
    setfooter(false)
    },[])

 

    const connectWallet = async () => {
        try{
           const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts',
              })
              const web = await new Web3(window.ethereum);
              setLoginAccount(accounts[0]);
              setWeb3(web)

            }
            catch(e){
                if(e.code===-32002){
                    console.log('error! ',e)
                }
                else{
                    var win = window.open('https://metamask.io/download.html', '_blank');
                        win.focus();
                }
            }
        
      };

      function test(){
        axios.get('http://localhost:3000/user').then((res)=>{
            console.log(res)
        })

        }
      
    return(
       <button onClick={()=>test()}>login</button>
    )
}


export default SignIn;