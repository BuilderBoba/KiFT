import "./About.css";
import { Accordion } from "react-bootstrap";
import { useEffect, useState } from "react";
import axios from "axios";
import NotifyModal from "./Components/NotifyModal.js";
import Web3 from "web3";
import dotenv from "dotenv";
dotenv.config();
const Kift_Contract_Address = process.env.REACT_APP_KIFT_CONTRACT_ADDRESS;

var KiFTabi = require("./KiFTabi");
var erc721abi = require("./erc721abi");

function About({ loginAccount /* 로그인된 계정 */ }) {
  const [sellitem, setSellitem] = useState([]);
  const [priceSellerPut, setPrice] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [traits, setTraits] = useState([]);
  const [ownerAddress, setOwnerAddress] = useState(""); // 아이템의 주인
  const [message, setMessage] = useState("");
  const [closebox, setClosebox] = useState(false);
  const URLparam = document.location.href.split("mypage/")[1]; //about으로 변경준비

  const closeModal = () => {
    setShowModal(false);
    setClosebox(false);
  };

  const onChange = (e) => {
    setPrice(e.target.value);
  };

  async function ListItem() {
    //아이템 마켓에 올리기
    setMessage("");
    setShowModal(true);

    if (isNaN(priceSellerPut) === false && priceSellerPut !== null && priceSellerPut !== "") {
      if (typeof window.ethereum.providers === "undefined") {
        var metamaskProvider = window.ethereum;
        console.log("메타마스크만 다운되어있는 것 처리===>", metamaskProvider);
      } else {
        var metamaskProvider = window.ethereum.providers.find((provider) => provider.isMetaMask);
        console.log("여러개 지갑 처리 ==>", metamaskProvider);
      }

      const web = new Web3(metamaskProvider);
      await web.eth.getAccounts().then(async (account) => {
        if (ownerAddress === account[0].toLowerCase()) {
          setApprovalAll();
        } else {
          setMessage("You aren't NFT Owner!");
          setClosebox(true);
        }
      });
    } else {
      setClosebox(true);
      setMessage("Please Submit Price!");
    }
  }

  async function changePrice() {
    setMessage("");
    setShowModal(true);

    if (isNaN(priceSellerPut) === false && priceSellerPut !== null && priceSellerPut !== "") {
      changeItemPrice();
    } else {
      setClosebox(true);
      setMessage("Please Submit Price!");
    }
    //가격변경 함수가 추가된 솔리디티 함수 작동
    // 솔리디티 내 가격 변화 함수 작성
    // vscode abi 변경
    // setapprovalall 함수 복제
    // 복제 낸 내부속 가격변화함수 새로 작성후 주입
  }

  async function cancleItem() {
    setMessage("");
    setShowModal(true);
    cancleMarketItem();
  }

  useEffect(async () => {
    await loadSellItem();
  }, []);

  function runEtherscan(e) {
    //아이템 정보에 있는 계정으로 이더스캔 들어가기
    var win = window.open(`https://rinkeby.etherscan.io/address/${e.target.outerText}`, "_blank");
    win.focus();
  }

  async function loadSellItem() {
    //어바웃 페이지의 아이템 정보 가져오기

    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    //데이터베이스에서 NFT 조회 후 받아온 정보로 페이지 구성
    await axios
      .post(
        "http://localhost:3001/searchNFT",
        {
          openseaId: URLparam,
        },
        headers
      )
      .then((result) => {
        console.log("fetch", result);
        setSellitem(result.data);
        setTraits(result.data.traits);
        setOwnerAddress(result.data.owner.address);
      });
  }

  async function listNFTOnTheMarket(result) {
    //아이템 리스팅 후 기여도 1포인트 지급
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    await axios
      .post(
        "http://localhost:3001/listItem",
        {
          openseaId: URLparam,
          price: priceSellerPut,
          isSale: true,
          itemIdOnBlockChain: result.events.MarketItemCreated.returnValues.itemId,
        },
        headers
      )
      .then(async (result) => {
        if (result.status === 200) {
          setMessage("Upload your NFT Success!");

          await axios
            .post("http://localhost:3001/toGiveContributePoint", {
              address: loginAccount,
              point: 1,
            })
            .then((result) => {
              console.log("this is result", result);
            })
            .catch((err) => {
              console.log(err);
            });

          document.location.href = `/mypage/${URLparam}`;
        }
      })
      .catch((e) => {
        //에러를 프론트로 띄워주세요
        setClosebox(true);
        setMessage("listItem request failed! You can check error below");
      });
  }

  async function ChangePriceNFTOnTheMarket(priceSellerPut) {
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    await axios
      .post(
        "http://localhost:3001/listItem",
        {
          openseaId: URLparam,
          price: priceSellerPut,
        },
        headers
      )
      .then((result) => {
        if (result.status === 200) {
          setMessage("Change your NFT Item Price Success!");
          document.location.href = `/mypage/${URLparam}`;
        }
      })
      .catch((e) => {
        setClosebox(true);
        setMessage("listItemPrice Change request failed! you can check error below");
      });
  }

  async function CancleNFTOnTheMarket() {
    //리스팅 된 아이템 취소 후 기여도 1포인트 지급 (가스비 때문)
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    await axios
      .post(
        "http://localhost:3001/listItem",
        {
          openseaId: URLparam,
          isSale: false,
          price: 0,
        },
        headers
      )
      .then(async (result) => {
        if (result.status === 200) {
          setMessage("Cancle your NFT Item Success!");
          await axios
            .post("http://localhost:3001/toGiveContributePoint", {
              address: loginAccount,
              point: 1,
            })
            .then((result) => {
              console.log("this is result", result);
            })
            .catch((err) => {
              console.log(err);
            });
          document.location.href = `/mypage/${URLparam}`;
        }
      })
      .catch((e) => {
        //에러를 프론트로 띄워주세요
        setClosebox(true);
        setMessage("Cancle your NFT Item request failed! you can check error below");
      });
  }

  async function setApprovalAll() {
    setMessage(`Please wait until "Success!"`);
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
        web.eth.getAccounts().then(async (account) => {
          let contract = await new web.eth.Contract(KiFTabi, Kift_Contract_Address);
          await contract.methods
            .isApprovedForAll(sellitem.contract_address, Kift_Contract_Address)
            .call({
              from: account[0],
            })
            .then(async (result) => {
              console.log("now approve ===> ", result);
              if (result) {
                //어프로브 금지 후 아이템 리스팅
                await createItem();
              } else {
                //어프로브 시작
                let contract = await new web.eth.Contract(erc721abi, sellitem.contract_address);
                await contract.methods
                  .setApprovalForAll(
                    Kift_Contract_Address, //setapproval 받을 kift.sol 배포 주소
                    true
                  )
                  .send({
                    from: account[0],
                    gas: 100000,
                    gasPrice: "10000000000",
                  })
                  .then((result) => {
                    setMessage("Approve to KiFT! Please sign the next one", result.blockHash);
                    console.log("This is success result--->>>", result);
                    console.log("This is Hash ", result.blockHash);
                    return result;
                  })
                  .catch((err) => {
                    console.log("this is whole error message", err);
                    console.log("this is error message----->>>>", err.message);
                    setClosebox(true);
                    setMessage(err.message);
                  })
                  .then(async (result) => {
                    if (result) {
                      await createItem();
                    }
                  })
                  .catch((err) => {
                    console.log("this is whole error message", err);
                    console.log("this is error message----->>>>", err.message);
                    setClosebox(true);
                    setMessage(err.message);
                  });
              }
            })
            .catch((err) => {
              console.log("this is whole error message", err);
              console.log("this is error message----->>>>", err.message);
              setClosebox(true);
              setMessage(err.message);
            });
        });
      } catch (err) {
        console.log(err);
      }
    }
  }

  async function changeItemPrice() {
    setMessage(`Please wait until "Success!" to change the price`);
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
        web.eth.getAccounts().then(async (account) => {
          let contract = await new web.eth.Contract(KiFTabi, Kift_Contract_Address);

          await contract.methods
            .changeMarketItemPrice(sellitem.itemIdOnBlockChain, web.utils.toWei(String(priceSellerPut), "ether"))
            .send({
              from: account[0],
              gas: 500000,
              gasPrice: "2450000000",
            })
            .then(async () => {
              await setMessage("Change your NFT Item Price Success!");
              await ChangePriceNFTOnTheMarket(priceSellerPut);
            })
            .catch((err) => {
              console.log("this is whole error message", err);
              console.log("this is error message----->>>>", err.message);
              setClosebox(true);
              setMessage(err.message);
            });
        });
      } catch (err) {
        console.log(err);
      }
    }
  }

  async function cancleMarketItem() {
    setMessage(`Please wait until "Success!" to cancle your Item`);
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
        web.eth.getAccounts().then(async (account) => {
          let contract = await new web.eth.Contract(KiFTabi, Kift_Contract_Address);

          await contract.methods
            .soldOutMarketItem(sellitem.itemIdOnBlockChain)
            .send({
              from: account[0],
              gas: 1500000,
              gasPrice: "2450000000",
            })
            .then(async () => {
              await setMessage("Cancle your NFT Item Success!");
              await CancleNFTOnTheMarket();
            })
            .catch((err) => {
              console.log("this is whole error message", err);
              console.log("this is error message----->>>>", err.message);
              setClosebox(true);
              setMessage(err.message);
            });
        });
      } catch (err) {
        console.log(err);
      }
    }
  }

  async function createItem() {
    if (typeof window.ethereum !== "undefined") {
      //여러 wallet 플랫폼중 metaMask로 연결

      if (typeof window.ethereum.providers === "undefined") {
        var metamaskProvider = window.ethereum;
        console.log("메타마스크만 다운되어있는 것 처리===>", metamaskProvider);
      } else {
        var metamaskProvider = window.ethereum.providers.find((provider) => provider.isMetaMask);
        console.log("여러개 지갑 처리 ==>", metamaskProvider);
      }
      // window.ethereum이 있다면 여기서 window.ethereum이란 메타마스크 설치여부
      try {
        const web = new Web3(metamaskProvider);

        web.eth.getAccounts().then(async (account) => {
          let contract = await new web.eth.Contract(KiFTabi, Kift_Contract_Address);
          await contract.methods
            .createMarketItem(sellitem.contract_address, sellitem.NFT_Token_id, web.utils.toWei(String(priceSellerPut), "ether"))
            .send({
              from: account[0],
              gas: 500000,
              gasPrice: "2450000000",
            })
            .then(async (result) => {
              console.log("itemId", result.events.MarketItemCreated.returnValues.itemId);
              await setMessage("upload blockChain to KiFT Success!");
              await listNFTOnTheMarket(result);
            })
            .catch((err) => {
              console.log("this is whole error message", err);
              console.log("this is error message----->>>>", err.message);
              setClosebox(true);
              setMessage(err.message);
            });
        });
      } catch (err) {
        setMessage("upload blockChain to KiFT Fail!");
      }
    }
  }

  async function buyNFT() {
    //여러 wallet 플랫폼중 metaMask로 연결
    setShowModal(true);
    setMessage(`Please sign the MetaMask! and wait until "Success!"`);
    if (typeof window.ethereum.providers === "undefined") {
      var metamaskProvider = window.ethereum;
      console.log("메타마스크만 다운되어있는 것 처리===>", metamaskProvider);
    } else {
      var metamaskProvider = window.ethereum.providers.find((provider) => provider.isMetaMask);
      console.log("여러개 지갑 처리 ==>", metamaskProvider);
    }
    // window.ethereum이 있다면 여기서 window.ethereum이란 메타마스크 설치여부
    try {
      const web = new Web3(metamaskProvider);

      web.eth.getAccounts().then(async (account) => {
        let contract = await new web.eth.Contract(KiFTabi, Kift_Contract_Address);
        await contract.methods
          .createMarketSale(sellitem.contract_address, sellitem.itemIdOnBlockChain)

          .send({
            from: account[0],
            gas: 500000,
            gasPrice: "2450000000",
            value: web.utils.toWei(String(sellitem.price), "ether"),
          })
          .then(async (result) => {
            console.log("Receipt===>", result);
            await setMessage("Your purchase request Success!");
            await soldoutNFTOnTheMarket();

            await axios
              .post("http://localhost:3001/toGiveContributePoint", {
                address: loginAccount,
                secondAddress: ownerAddress,
                point: 10,
              })
              .then((result) => {
                console.log("this is result", result);
              })
              .catch((err) => {
                console.log(err);
              });
          })
          .catch((err) => {
            console.log("this is whole error message", err);
            console.log("this is error message----->>>>", err.message);
            setClosebox(true);
            setMessage(err.message);
          });
      });
    } catch (err) {
      setMessage("Your purchase request Fail!");
    }
  }

  async function soldoutNFTOnTheMarket() {
    //위에 buyNFT 후 디비 정보 변경
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    await axios
      .post(
        "http://localhost:3001/listItem",
        {
          openseaId: URLparam,
          price: 0,
          isSale: false,
          itemIdOnBlockChain: null,
        },
        headers
      )
      .then((result) => {
        if (result.status === 200) {
          setMessage("Your NFT purchase Success!");
          document.location.href = `/mypage/${URLparam}`;
        }
      })
      .catch((e) => {
        //에러를 프론트로 띄워주세요
        setClosebox(true);
        setMessage("Your purchase request failed! You can check error below");
      });
  }

  return (
    <div className="about_main">
      {showModal && <NotifyModal showModal={showModal} closeModal={closeModal} message={message} closebox={closebox}></NotifyModal>}

      <div className="sell_bar"></div>
      <div className="middle2">
        <div className="main_left">
          <div className="nft_name_box">
            <div className="nft_name">{sellitem.name}</div>
            <div className="nft_owned">
              Owned by{" "}
              <span className="owned_address">
                {ownerAddress.slice(0, 6)}
                {"..."}
                {ownerAddress.slice(-6)}
              </span>
            </div>
          </div>

          <img className="nft_image" src={sellitem.image_url} />
        </div>
        <div className="simple_description">
          <div className="price_input_box">
            {sellitem.isSale ? (
              loginAccount === ownerAddress ? (
                <>
                  {" "}
                  <input className="price" placeholder={`Current Price : ${sellitem.price} ETH`} value={priceSellerPut} onChange={onChange} />
                  <button className="sell_button addoption" onClick={changePrice}>
                    Change Price
                  </button>
                  <button className="cancle_button" onClick={cancleItem}>
                    Cancel Selling
                  </button>
                </>
              ) : (
                <>
                  <div className="price_box">
                    <img className="eth-logo" src="https://storage.opensea.io/files/6f8e2979d428180222796ff4a33ab929.svg" />
                    <span className="price_set">{sellitem.price}</span>
                  </div>
                  <button className="sell_button" onClick={buyNFT}>
                    BUY
                  </button>
                </>
              )
            ) : (
              <>
                {" "}
                <input className="price" placeholder="Amount" value={priceSellerPut} onChange={onChange} />
                <button className="sell_button" onClick={ListItem}>
                  Sell
                </button>
              </>
            )}
          </div>

          <div className="center_properties">
            <div className="properties_title">Properties</div>
            <div className="properties">
              {traits.map((prop, index) => {
                return (
                  <div className="props" key={index}>
                    <div className="props_1">{prop.trait_type}</div>
                    <div className="props_2">{prop.value}</div>
                    <div className="props_3">100% have this trait</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="center_details">
            <div className="details_title">Details</div>
            <div className="details">
              <div className="detail_menu">
                <span>contract Address</span>
                <span className="right_end addoption" onClick={(e) => runEtherscan(e)}>
                  {sellitem.contract_address}
                </span>
              </div>
              <div className="detail_menu">
                <span>token id</span>
                <span className="right_end">{sellitem.NFT_Token_id}</span>
              </div>
              <div className="detail_menu">
                <span>token standard</span>
                <span className="right_end">{sellitem.schema_name}</span>
              </div>
              <div className="detail_menu">
                <span>blockchain</span>
                <span className="right_end">Rinkeby</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="center_description addoption">
        <div className="description_title">Description</div>
        <div className="description2">{sellitem.description}</div>
      </div>
      <Accordion defaultActiveKey="0" className="accord addoption">
        <Accordion.Item className="acc_item" eventKey="0">
          <Accordion.Header className="acc_header">Price History</Accordion.Header>
          <Accordion.Body>NOT UPDATING..</Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </div>
  );
}

export default About;
