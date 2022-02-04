import "./SignIn.scss";
import { useEffect } from "react";
import axios from "axios";
import Caver from "caver-js";

function SignIn({ setfooter, setLoginAccount, setIsLogin, setIsKaikas, isKaikas }) {
  useEffect(() => {
    setfooter(false);
  }, []);

  const connectWallet = async () => {
    if (typeof window.ethereum.providers === "undefined") {
      var metamaskProvider = window.ethereum;
      console.log("메타마스크만 다운되어있는 것 처리===>", metamaskProvider);
    } else {
      var metamaskProvider = window.ethereum.providers.find((provider) => provider.isMetaMask);
      console.log("여러개 지갑 처리 ==>", metamaskProvider);
    }

    try {
      const accounts = await metamaskProvider.request({
        method: "eth_requestAccounts",
      });

      setLoginAccount(accounts[0].toLowerCase());

      setIsLogin(true);
      setfooter(true);

      const headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "*/*",
      };

      const params = new URLSearchParams();
      params.append("loginAddress", accounts[0].toLowerCase());

      await axios.post("http://localhost:3001/sign", params, { headers }).then((res) => {
        console.log(res);
      });

      setIsKaikas(false);
      document.location.href = "/market";
    } catch (e) {
      if (typeof window.ethereum === "undefined") {
        var win = window.open("https://metamask.io/download.html", "_blank");
        win.focus();
      } else {
        console.log("error! ", e);
      }
    }
  };

  const connectKaikas = async () => {
    await window.klaytn.enable();
    console.log(window.klaytn.selectedAddress);

    const caver = new Caver(window.klaytn);
    caver.klay.getAccounts().then(async (account) => {
      setLoginAccount(account[0].toLowerCase());
      setIsLogin(true);
      setfooter(true);
      setIsKaikas(true);
      const headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "*/*",
      };

      const params = new URLSearchParams();
      params.append("loginAddress", account[0].toLowerCase());
      params.append("Chain", "baobab");

      await axios.post("http://localhost:3001/sign", params, { headers }).then((res) => {
        console.log(res);
      });

      document.location.href = "/";
    });
  };
  return (
    <div className="signInPageContainer">
      <div className="signInPage">
        <h2 className="signInTitle">Sign in with your wallet for connecting KiFT</h2>
        <div>
          <div className="signContainer">
            <button className="signInButton" onClick={() => connectWallet()}>
              Metamask
            </button>
            <button className="signInButton kaikasButton" onClick={connectKaikas}>
              Kaikas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignIn;
