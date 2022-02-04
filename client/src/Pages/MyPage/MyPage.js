import "./MyPage.scss";
import { useState, useEffect } from "react";
import axios from "axios";
import Web3 from "web3";
import { Link } from "react-router-dom";
import { Spinner } from "react-bootstrap";
import Loading from "../../component/assets/Loading";
import styled from "styled-components";
import Caver from "caver-js";
var erc721abi = require("./erc721abi");

function MyPage({ setIsLogin, isKaikas, setIsKaikas }) {
  const [data, setData] = useState([]);
  const [nowAccount, setNowAccount] = useState("");
  const [loading, setLoading] = useState(true);
  const [specialColor, setColor] = useState("");
  const [regdate, setRegdate] = useState("");
  const [transTo, setTransTo] = useState("");
  const [message, setMessage] = useState("");
  const [inputbox, setInputbox] = useState(false);
  const [transloading, setTransloading] = useState(false);

  // console.log(isKaikas, "laisjef;laiefj;alsiefj;alsfjl;aseifjasliefjail;sjf;ailsejfi;");

  const ProfileCircle = styled.div`
    background-color: #${specialColor};
    border: 8px solid white;
    height: 7rem;
    width: 7rem;
    border-radius: 43%;
  `;

  function transferToInput(e) {
    setTransTo(e.target.value);
  }

  async function transferStart(item) {
    setInputbox(true);

    if (transTo !== "" && transTo.slice(0, 2) === "0x" && transTo.length === 42) {
      await setTransloading(true);
      await transferTo(item);
      await setMessage(`Please wait until "Success!"`);
    } else {
      await setMessage("");
    }
  }

  const fetchNFTs = async () => {
    const web = new Web3(window.ethereum);
    await web.eth
      .getAccounts()
      .then((account) => {
        setIsLogin(true);
        console.log("this is your account=====>", account);
        return account;
      })
      .then(async (account) => {
        await axios.get(`https://testnets-api.opensea.io/assets?owner=${account}`).then(async (result) => {
          setData(result.data.assets);
          console.log("account setting succssed!!!!!");
          setNowAccount(account);
          setLoading(false);
          console.log("opensea retrieve assets", result);
          const headers = {
            "Content-Type": "application/json",
            Accept: "application/json",
          };
          await axios
            .post(
              "http://localhost:3001/findUser",
              {
                address: account[0].toLowerCase(),
              },
              headers
            )
            .then(async (user) => {
              await console.log("this is your user's data ====>", user.data.data);
              const data = user.data.data;
              console.log("just data ---------> ", data);
              setRegdate(data.createdAt.slice(0, 10));
              return data;
            })
            .then((data) => {
              result.data.assets.map(async (item) => {
                const headers = {
                  "Content-Type": "application/json",
                  Accept: "application/json",
                };
                await axios
                  .post(
                    "http://localhost:3001/NFT",
                    {
                      owner: data._id,
                      name: item.name,
                      contract_address: item.asset_contract.address,
                      asset_contract_type: item.asset_contract.asset_contract_type,
                      schema_name: item.asset_contract.schema_name,
                      description: item.description,
                      NFT_Token_id: item.token_id,
                      createdAt: item.collection.created_date,
                      image_url: item.image_url,
                      creator_address: item.creator.address,
                      openseaId: item.id,
                      traits: item.traits,
                    },
                    headers
                  )
                  .then((result) => {
                    console.log("this is result from axios/NFT ===>", result);
                    return result;
                  })
                  .catch((err) => {
                    console.log("errrrrrr ", err);
                    return err;
                  });
              });
            })
            .catch((err) => {
              console.log(err);
              return err;
            });
        });
      });
  };

  async function transferTo(item) {
    await setMessage("");
    await setInputbox(true);

    if (typeof window.ethereum !== "undefined") {
      //여러 wallet 플랫폼중 metaMask로 연결
      if (typeof window.ethereum.providers === "undefined") {
        var metamaskProvider = window.ethereum;
        console.log("메타마스크만 다운되어있는 것 처리===>", metamaskProvider);
      } else {
        var metamaskProvider = window.ethereum.providers.find((provider) => provider.isMetaMask);
        console.log("여러개 지갑 처리 ==>", metamaskProvider);
      }

      try {
        const web = new Web3(metamaskProvider);

        web.eth
          .getAccounts()
          .then(async (account) => {
            let contract = await new web.eth.Contract(erc721abi, item.asset_contract.address);
            await contract.methods
              .transferFrom(account[0], transTo, item.token_id)
              .send({
                from: account[0],
                gas: 500000,
                gasPrice: "2450000000",
              })
              .then(async (result) => {
                await setMessage("Your NFT Item transfer Success!");
                await transferNFTOnTheMarket(result.from, transTo, item);
                return result;
              })
              .then(async (result) => {
                await changeOwner(item);
              })
              .catch((err) => {
                setTransloading(false);
                setMessage(err.message);
              });
          })
          .catch((err) => {
            console.log("this is whole error message", err);
            console.log("this is error message----->>>>", err.message);
            setTransloading(false);
            setMessage(err.message);
          });
      } catch (err) {
        setTransloading(false);
        setMessage(err.message);
      }
    }
  }

  async function transferNFTOnTheMarket(from, to, item) {
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    await axios
      .post(
        "http://localhost:3001/listItemOntransfer",
        {
          openseaId: item.id,
          to: to,
          from: from,
        },
        headers
      )
      .then((result) => {
        if (result.status === 200) {
          setMessage("Transfer Success!");
        }
      })
      .catch((e) => {
        //에러를 프론트로 띄워주세요
        setMessage("Your NFT Item transfer log DB failed! You can check error below");
      });
  }

  async function changeOwner(item) {
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    await axios
      .post(
        "http://localhost:3001/changeOwnerAndOwnedNFTs",
        {
          address: transTo.toLowerCase(),
          openseaId: item.id,
        },
        headers
      )
      .then((result) => {
        setTransloading(false);
        console.log("After changeownerandownedNFTS ==========================");
        console.log("fetching changeOwnerAndOwnedNFTs API!===>>", result);
        document.location.href = `/mypage`;
      })
      .catch((err) => {
        setTransloading(false);
        console.log("fetching changeOwnerAndOwnedNFTs API FAILED!!!! ===>", err);
      });
  }

  useEffect(() => {
    function fetchData() {
      window.klaytn._kaikas.isUnlocked().then(async (result) => {
        if (result === true) {
          await window.klaytn._kaikas.isApproved().then((result) => {
            if (result === true) {
              const caver = new Caver(window.klaytn);
              caver.klay.getAccounts().then((account) => {
                console.log("nopwacc", account[0].toLowerCase());
                console.log("nopwacc2", window.klaytn.selectedAddress);

                const headers = {
                  "Content-Type": "application/json",
                  Accept: "application/json",
                };
                axios.post("http://localhost:3001/klaytn/fetchNFT", { ownerAddress: account[0].toLowerCase() }, headers).then((result) => {
                  console.log("result??", result);
                  setRegdate(result.data.result.createdAt.slice(0, 10));
                  setData(result.data.result.ownedNFTs);
                  console.log(result.data.result.ownedNFTs);
                });

                setNowAccount(account);
                setLoading(false);
              });
            } else {
              fetchNFTs();
            }
          });
        } else {
          fetchNFTs();
        }
      });
    }
    fetchData();
  }, []);

  useEffect(() => {
    // console.log(nowAccount, "============================");

    if (nowAccount[0] !== undefined) {
      setColor(nowAccount[0].slice(-6));
    }
    console.log("this is special color=====>", specialColor);
  }, [nowAccount]);

  return (
    <div className="MyPage">
      <div>
        <div className="main">
          <div className="main_myimage_box">
            <ProfileCircle></ProfileCircle>
          </div>
        </div>
        <div className="middle">
          <div className="address_box">{String(nowAccount).slice(0, 6) + "..." + String(nowAccount).slice(-4)}</div>
          <div className="createdAt">
            joined {regdate.slice(5, 10)}
            {" , "}
            {regdate.slice(0, 4)}
          </div>
        </div>
        {loading ? (
          <Loading className="loading" />
        ) : (
          <>
            {data.length === 0 ? (
              <div className="noItem_box">
                <img
                  className="noItem"
                  src="https://images-ext-2.discordapp.net/external/trFmW50QKa9FxyNgDh4m400OaIuLnm9XVa0o-fIuXoQ/https/testnftbucketforcucumber.s3.ap-northeast-2.amazonaws.com/image/noItemFound.jpg?width=665&height=499"
                />
              </div>
            ) : (
              <div className="cardGroup">
                {data.map((item) => {
                  return (
                    <div key={isKaikas ? `${item.openseaId}` : `${item.id}`} className="card1">
                      <div className="card_img_block">
                        <img className="card_img" variant="top" src={item.image_url} />
                      </div>
                      <div className="card_addoption">
                        <div className="card_body">
                          {isKaikas ? <div className="card_title">KiNFT</div> : <div className="card_title">{item.asset_contract.name}</div>}

                          {isKaikas ? <div className="card_text">{item.name}</div> : <div className="card_text">{item.collection.name}</div>}
                        </div>

                        <div className="card_footer">
                          <Link to={isKaikas ? `/mypage/${item.openseaId}` : `/mypage/${item.id}`} className="button_link">
                            <button className="sell_button addoption2">Sell</button>
                          </Link>
                          <button className="sell_button addoption3" onClick={() => transferStart(item)}>
                            Send
                          </button>
                          {inputbox ? (
                            <>
                              <input className="sendInput" onChange={(e) => transferToInput(e)} placeholder=" To Address" />
                              {transloading ? (
                                <>
                                  <div className="trasnferMessage">
                                    <Spinner animation="border" variant="primary" className="transferSpinner" />
                                    {message}
                                  </div>
                                </>
                              ) : null}
                            </>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default MyPage;
