import Web3 from "web3";
import dotenv from "dotenv";
import axios from "axios";
import { useState, useEffect } from "react";
import "./Claim.css";
import styled from "styled-components";
import claimMountain from "./background2.jpeg";
import Caver from "caver-js";

dotenv.config();

var KiFTTokenForKlaytnAbi = require("./KiftTokenForKlaytnAbi");
var tokenAddress = process.env.REACT_APP_KIFT_TOKEN_FOR_KLAYTN_CONTRACT_ADDRESS;

const ClaimContainer = styled.div`
  ::after {
    background: url(${claimMountain});
    background-repeat: no-repeat;
    background-size: 100%;
    /* background-position: 0px -260px; */
    opacity: 45% !important;
    top: 35px;
    left: 0px;
    position: absolute;
    z-index: -1;
    content: "";
    width: 100%;
    height: 111%;
    /* object-fit: contain; */
  }
`;

function ClaimForKlaytn(isLogin) {
  const [status, setStatus] = useState("");
  const [account, setAccount] = useState("");
  const [token, setToken] = useState();
  const [current, setCurrent] = useState(0);

  useEffect(async () => {
    await window.klaytn.enable();
    const caver = new Caver(window.klaytn);

    await caver.klay.getAccounts().then(async (account) => {
      // console.log(account);
      try {
        setAccount(account[0].toLowerCase());
        await axios
          .post("http://localhost:3001/findUser", {
            address: account[0].toLowerCase(),
          })
          .then(async (result) => {
            let tokenPaid = parseInt(result.data.data.points) * 7;
            console.log(tokenPaid);
            setToken(result.data.data.points);
            setStatus("Wallet Connected: You are eligible for " + tokenPaid + " tokens");
          });
      } catch (err) {
        console.log(err);
      }

      try {
        await window.klaytn.enable();
        const caver = new Caver(window.klaytn);
        caver.klay.getAccounts().then(async (account) => {
          console.log(account[0].toLowerCase());
          let contract = new caver.klay.Contract(KiFTTokenForKlaytnAbi, tokenAddress);
          await contract.methods
            .balanceOf(account[0].toLowerCase())
            .call()
            .then((result) => {
              const final = caver.utils.fromWei(String(result), "ether");
              setCurrent(final);
            });
        });
      } catch (err) {
        console.log(err);
      }
    });
  }, []);

  async function claimKiFTToken() {
    await window.klaytn.enable();
    const caver = new Caver(window.klaytn);

    try {
      caver.klay.getAccounts().then(async (account) => {
        await axios
          .post("http://localhost:3001/findUser", {
            address: account[0].toLowerCase(),
          })
          .then((result) => {
            return result.data.data.points;
          })
          .then(async (point) => {
            if (point > 0) {
              let numberUserCanClaim = point * 7;
              let contract = new caver.klay.Contract(KiFTTokenForKlaytnAbi, tokenAddress);
              await contract.methods
                .mintToken(account[0], caver.utils.toWei(String(numberUserCanClaim), "ether"))
                .send({
                  from: account[0],
                  gas: 2100000,
                  gasPrice: "25000000000",
                })
                .then(async (receipt) => {
                  if (receipt.blockHash) {
                    await axios
                      .post("http://localhost:3001/initializePoints", {
                        address: account[0].toLowerCase(),
                      })
                      .then((result) => {
                        document.location.href = `/claimforklaytn`;
                      });
                  }
                });
            } else {
              console.log("there's no points you got");
            }
          });
      });
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <ClaimContainer className="claimPageContainer">
      {isLogin ? <div className="current">{current} KFT</div> : null}

      <div className="title_box">
        <div className="claimTitle"> Claim Your KiFT Tokens</div>

        {isLogin ? <div className="account">{"Your Address: \n" + account}</div> : null}
        <div className="amount">{status}</div>
        {token > 0 ? (
          <button className="claim" onClick={claimKiFTToken}>
            Claim Tokens{" "}
          </button>
        ) : (
          <button className="claim" disabled>
            {" "}
            No Claimable Tokens{" "}
          </button>
        )}
      </div>
    </ClaimContainer>
  );
}

export default ClaimForKlaytn;
