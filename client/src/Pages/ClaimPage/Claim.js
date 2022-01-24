import Web3 from "web3";
import dotenv from "dotenv";
import axios from "axios";
import { useState, useEffect } from "react";
import "./Claim.css";

dotenv.config();
var KiFTTokenabi = require("./KiFTTokenabi");

function Claim(isLogin) {
  const [status, setStatus] = useState("");
  const [account, setAccount] = useState("0x");

  useEffect(() => {
    if (typeof window.ethereum === undefined) {
      setStatus(
        "Wallet not connected. Please connect your Metamask wallet to browser."
      );
    } else {
      if (typeof window.ethereum.providers === "undefined") {
        var metamaskProvider = window.ethereum;
      } else {
        var metamaskProvider = window.ethereum.providers.find(
          (provider) => provider.isMetaMask
        );
      }

      try {
        const web = new Web3(metamaskProvider);
        setAccount(web.eth.getAccounts[0]);
        web.eth.getAccounts().then(async (account) => {
          await axios
            .post("http://localhost:3001/findUser", {
              address: account[0].toLowerCase()
            })
            .then((result) => {
              setStatus(
                "Wallet Connected: You are eligible for ",
                result.data.data.points,
                " tokens"
              );
            });
        });
      } catch (err) {
        console.log("Error: ", err);
      }
    }
  }, []);

  function claimKiFTToken() {
    if (typeof window.ethereum !== "undefined") {
      //여러 wallet 플랫폼중 metaMask로 연결

      if (typeof window.ethereum.providers === "undefined") {
        var metamaskProvider = window.ethereum;
        console.log("메타마스크만 다운되어있는 것 처리===>", metamaskProvider);
      } else {
        var metamaskProvider = window.ethereum.providers.find(
          (provider) => provider.isMetaMask
        );
        console.log("여러개 지갑 처리 ==>", metamaskProvider);
      }

      try {
        const web = new Web3(metamaskProvider);
        web.eth.getAccounts().then(async (account) => {
          //계정 조회후 포인트 받아옴
          await axios
            .post("http://localhost:3001/findUser", {
              address: account[0].toLowerCase()
            })
            .then((result) => {
              console.log(
                "how many got token======>>>>",
                result.data.data.points
              );
              return result.data.data.points;
            })
            .then(async (point) => {
              //포인트 있으면 민트 가능!!
              if (point > 0) {
                let numbersUserCanClaim = point * 7 * 1000000000000000000;
                console.log(numbersUserCanClaim.toString());
                let contract = await new web.eth.Contract(
                  KiFTTokenabi,
                  process.env.REACT_APP_KIFT_TOKEN_CONTRACT_ADDRESS
                );
                await contract.methods
                  .mintToken(account[0], numbersUserCanClaim.toString())
                  .send({
                    from: account[0],
                    gas: 100000,
                    gasPrice: "10000000000"
                  })
                  .then(async (receipt) => {
                    console.log(receipt);
                    if (receipt.blockHash) {
                      //민트 성공하면 디비 초기화 !!
                      await axios
                        .post("http://localhost:3001/initializePoints", {
                          address: account[0].toLowerCase()
                        })
                        .then((result) => {
                          console.log(
                            "requesting initialize points to zero successed!!!! =====>>",
                            result
                          );
                        });
                    } else {
                      //민트 실패
                      console.log(
                        "there's no points you got, it failed to claim Tokens"
                      );
                    }
                  })
                  .catch((err) => {
                    console.log(
                      "Error occured when minting Tokens!!!!!======>>",
                      err
                    );
                  });
              }
            })
            .catch((err) => {
              console.log(
                "Error occured when sending request about POINTS!! ====>>",
                err
              );
            });
        });
      } catch (err) {
        console.log("Claim Token failed!!!!!", err);
      }
    }
  }

  return (
    <div className="claimPageContainer">
      <div className="claimPageBlock">
        <div> Claim Your KiFT Tokens</div>
        <div>{status}</div>
        {isLogin ? <div>Your Account: {account}</div> : null}
      </div>
      <button onClick={claimKiFTToken}>클레임</button>
    </div>
  );
}

export default Claim;
