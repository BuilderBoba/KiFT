import "./About.css";
import { Accordion } from "react-bootstrap";
import { useEffect, useState } from "react";
import axios from "axios";
import Loading from "../../component/assets/Loading";
import NotifyModal from "./Components/NotifyModal.js";
import Web3 from "web3";
import Caver from "caver-js";
import dotenv from "dotenv";
dotenv.config();
const Kift_Contract_Address = process.env.REACT_APP_KIFT_CONTRACT_ADDRESS;
const Kift_Kip_Contract_Address = process.env.REACT_APP_KIFT_KIP_CONTRACT_ADDRESS;

var KiFTabi = require("./KiFTabi");
var erc721abi = require("./erc721abi");
var KiFTabi_Klaytn = require("./KiFTabi_Klaytn");
var kip17abi = require("./kip17abi");

function About({ loginAccount /* 로그인된 계정 */ }) {
  const [sellitem, setSellitem] = useState([]);
  const [priceSellerPut, setPrice] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [traits, setTraits] = useState([]);
  const [history, setHistory] = useState([]);
  const [ownerAddress, setOwnerAddress] = useState(""); // 아이템의 주인
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [closebox, setClosebox] = useState(false);
  const [isKaikas, setIsKaikas] = useState(false);

  const URLparam = document.location.href.split("mypage/")[1]; //about으로 변경준비

  const closeModal = () => {
    setShowModal(false);
    setClosebox(false);
  };

  const onChange = (e) => {
    setPrice(e.target.value);
  };

  async function ListItem() {
    //Sell 버튼을 통하여 아이템 판매 등록 시작
    setMessage("");
    setShowModal(true);

    if (isNaN(priceSellerPut) === false && priceSellerPut !== null && priceSellerPut !== "") {
      if (isKaikas === false) {
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
            setApprovalAll(); //서버에게 NFT 권한을 위임하고 블록체인에 NFT등록 및 DB등록 시작
          } else {
            setMessage("You aren't NFT Owner!");
            setClosebox(true);
          }
        });
      } else if (isKaikas === true) {
        window.klaytn._kaikas.isUnlocked().then(async (result) => {
          if (result === true) {
            await window.klaytn._kaikas.isApproved().then(async (result) => {
              if (result === true) {
                const caver = new Caver(window.klaytn);
                caver.klay.getAccounts().then(async (account) => {
                  if (ownerAddress === account[0].toLowerCase()) {
                    setApprovalAllKlaytn(); //서버에게 NFT 권한을 위임하고 블록체인에 NFT등록 및 DB등록 시작
                  } else {
                    setMessage("You aren't NFT Owner!");
                    setClosebox(true);
                  }
                });
              } else {
                setMessage("Please re-Log in Kaikas!");
                setClosebox(true);
              }
            });
          } else {
            setMessage("Please Log in Kaikas!");
            setClosebox(true);
          }
        });
      } else {
        alert("Kaikas or MetaMask Connect error");
        document.location.href = `/`;
      }
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
    window.klaytn._kaikas.isUnlocked().then(async (result) => {
      if (result === true) {
        await window.klaytn._kaikas.isApproved().then(async (result) => {
          if (result === true) {
            await setIsKaikas(true);
            await loadSellItemOnKlay();
          } else {
            await loadSellItem();
          }
        });
      } else {
        await setIsKaikas(false);
        await loadSellItem();
      }
    });
  }, []);

  function runEtherscan(e) {
    window.klaytn._kaikas.isUnlocked().then(async (result) => {
      if (result === true) {
        await window.klaytn._kaikas.isApproved().then(async (result) => {
          if (result === true) {
            var win = window.open(`https://baobab.scope.klaytn.com/account/${e.target.outerText}`, "_blank");
            win.focus();
          } else {
            var win = window.open(`https://rinkeby.etherscan.io/address/${e.target.outerText}`, "_blank");
            win.focus();
          }
        });
      } else {
        var win = window.open(`https://rinkeby.etherscan.io/address/${e.target.outerText}`, "_blank");
        win.focus();
      }
    });
  }

  function runEtherscan2(e) {
    window.klaytn._kaikas.isUnlocked().then(async (result) => {
      if (result === true) {
        await window.klaytn._kaikas.isApproved().then(async (result) => {
          if (result === true) {
            var win = window.open(`https://baobab.scope.klaytn.com/account/${e}`, "_blank");
            win.focus();
          } else {
            var win = window.open(`https://rinkeby.etherscan.io/address/${e}`, "_blank");
            win.focus();
          }
        });
      } else {
        var win = window.open(`https://rinkeby.etherscan.io/address/${e}`, "_blank");
        win.focus();
      }
    });
  }

  async function loadSellItem() {
    //어바웃 페이지의 아이템 정보 가져오기
    setLoading(true);
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    //데이터베이스에서 NFT 조회 후 받아온 정보로 페이지 구성
    await axios
      .post(
        "https://thekift.shop/searchNFT",
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
        setHistory(result.data.history);
        setLoading(false);
      });
  }
  async function loadSellItemOnKlay() {
    setLoading(true);
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    //데이터베이스에서 NFT 조회 후 받아온 정보로 페이지 구성
    await axios
      .post(
        "https://thekift.shop/klaytn/searchNFT",
        {
          openseaId: URLparam,
        },
        headers
      )
      .then((result) => {
        if (result.data.length === 0) {
          document.location.href = `/market`;
        } else {
          setSellitem(result.data);
          setTraits(result.data.traits);
          setOwnerAddress(result.data.owner.address);
          setHistory(result.data.history);
          setLoading(false);
        }
      });
  }

  async function listNFTOnTheMarket(result) {
    //아이템 리스팅 후 기여도 1포인트 지급
    if (isKaikas === false) {
      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };

      await axios
        .post(
          "https://thekift.shop/listItemOnlist",
          {
            openseaId: URLparam,
            price: priceSellerPut,
            isSale: true,
            itemIdOnBlockChain: result.events.MarketItemCreated.returnValues.itemId,
            from: result.from,
          },
          headers
        )
        .then(async (result) => {
          if (result.status === 200) {
            setMessage("Upload your NFT Success!");

            await axios
              .post("https://thekift.shop/toGiveContributePoint", {
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
    } else {
      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };

      await axios
        .post(
          "https://thekift.shop/klaytn/listItemOnlist",
          {
            openseaId: URLparam,
            price: priceSellerPut,
            isSale: true,
            itemIdOnBlockChain: result.events.MarketItemCreated.returnValues.itemId,
            from: result.from,
          },
          headers
        )
        .then(async (result) => {
          if (result.status === 200) {
            setMessage("Upload your NFT Success!");

            await axios
              .post("https://thekift.shop/toGiveContributePoint", {
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
            //서버에게 어프로브 되어있는지 검사합니다.
            .call({
              from: account[0],
            })
            .then(async (result) => {
              console.log("now approve ===> ", result);
              if (result) {
                //결과로 true일시 어프로브를 하지않고 블록체인에 올리는 과정 진행
                await createItem(); // 블록체인에 아이템 등록
              } else {
                //결과로 false일시 어프로브 진행
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
                      await createItem(); //블록체인에 아이템 등록
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

  async function setApprovalAllKlaytn() {
    setMessage(`Please wait until "Success!"`);
    window.klaytn._kaikas.isUnlocked().then(async (result) => {
      if (result === true) {
        await window.klaytn._kaikas.isApproved().then(async (result) => {
          if (result === true) {
            try {
              const caver = new Caver(window.klaytn);
              caver.klay.getAccounts().then(async (account) => {
                let contract = await new caver.klay.Contract(KiFTabi_Klaytn, Kift_Kip_Contract_Address);

                await contract.methods
                  .isApprovedForAll(sellitem.contract_address, Kift_Kip_Contract_Address)
                  //서버에게 어프로브 되어있는지 검사합니다.
                  .call({
                    from: account[0],
                  })
                  .then(async (result) => {
                    console.log("now approve ===> ", result);
                    if (result) {
                      //결과로 true일시 어프로브를 하지않고 블록체인에 올리는 과정 진행
                      await createItemKlaytn(); // 블록체인에 아이템 등록
                    } else {
                      //결과로 false일시 어프로브 진행
                      let contract = await new caver.klay.Contract(kip17abi, sellitem.contract_address);
                      await contract.methods
                        .setApprovalForAll(
                          Kift_Kip_Contract_Address, //setapproval 받을 kift.sol 배포 주소
                          true
                        )
                        .send({
                          from: account[0],
                          gas: 5000000,
                          gasPrice: "25000000000",
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
                            await createItemKlaytn(); //블록체인에 아이템 등록
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
          } else {
            setMessage("Please re-Log in Kaikas!");
            setClosebox(true);
          }
        });
      } else {
        setMessage("Please Log in Kaikas!");
        setClosebox(true);
      }
    });
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
      try {
        const web = new Web3(metamaskProvider);
        web.eth.getAccounts().then(async (account) => {
          let contract = await new web.eth.Contract(KiFTabi, Kift_Contract_Address);
          await contract.methods
            .createMarketItem(sellitem.contract_address, sellitem.NFT_Token_id, web.utils.toWei(String(priceSellerPut), "ether"))
            //마켓 블록체인에 아이템 등록
            .send({
              from: account[0],
              gas: 500000,
              gasPrice: "2450000000",
            })
            .then(async (result) => {
              console.log("itemId", result.events.MarketItemCreated.returnValues.itemId);
              await setMessage("upload blockChain to KiFT Success!");
              await listNFTOnTheMarket(result); //기여도를 지급하는 함수
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

  async function createItemKlaytn() {
    window.klaytn._kaikas.isUnlocked().then(async (result) => {
      if (result === true) {
        await window.klaytn._kaikas.isApproved().then(async (result) => {
          if (result === true) {
            try {
              const caver = new Caver(window.klaytn);
              caver.klay.getAccounts().then(async (account) => {
                let contract = await new caver.klay.Contract(KiFTabi_Klaytn, Kift_Kip_Contract_Address);
                await contract.methods
                  .createMarketItem(sellitem.contract_address, sellitem.NFT_Token_id, caver.utils.convertToPeb(String(priceSellerPut), "KLAY"))
                  //마켓 블록체인에 아이템 등록
                  .send({
                    from: account[0],
                    gas: 500000,
                    gasPrice: "25000000000",
                  })
                  .then(async (result) => {
                    console.log("test?", result);
                    // console.log("itemId", result.events.MarketItemCreated.returnValues.itemId);
                    await setMessage("upload blockChain to KiFT Success!");
                    await listNFTOnTheMarket(result); //기여도를 지급하는 함수
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
          } else {
            setMessage("Please re-Log in Kaikas!");
            setClosebox(true);
          }
        });
      } else {
        setMessage("Please Log in Kaikas!");
        setClosebox(true);
      }
    });
  }

  async function changeItemPrice() {
    //블록체인에 등록된 NFT 가격 변경 함수
    setMessage(`Please wait until "Success!" to change the price`);
    if (isKaikas === false) {
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
              .then(async (result) => {
                await setMessage("Change your NFT Item Price Success!");
                await ChangePriceNFTOnTheMarket(priceSellerPut, result);
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
    } else {
      window.klaytn._kaikas.isUnlocked().then(async (result) => {
        if (result === true) {
          await window.klaytn._kaikas.isApproved().then(async (result) => {
            if (result === true) {
              try {
                const caver = new Caver(window.klaytn);
                caver.klay.getAccounts().then(async (account) => {
                  let contract = await new caver.klay.Contract(KiFTabi_Klaytn, Kift_Kip_Contract_Address);
                  await contract.methods
                    .changeMarketItemPrice(sellitem.itemIdOnBlockChain, caver.utils.convertToPeb(String(priceSellerPut), "KLAY"))
                    //마켓 블록체인에 아이템 등록
                    .send({
                      from: account[0],
                      gas: 500000,
                      gasPrice: "25000000000",
                    })
                    .then(async (result) => {
                      await setMessage("Change your NFT Item Price Success!");
                      await ChangePriceNFTOnTheMarket(priceSellerPut, result);
                    })
                    .catch((err) => {
                      console.log("this is whole error message", err);
                      console.log("this is error message----->>>>", err.message);
                      setClosebox(true);
                      setMessage(err.message);
                    });
                });
              } catch (err) {
                setMessage("Change your NFT Item Price Fail!");
              }
            } else {
              setMessage("Please re-Log in Kaikas!");
              setClosebox(true);
            }
          });
        } else {
          setMessage("Please Log in Kaikas!");
          setClosebox(true);
        }
      });
    }
  }

  async function ChangePriceNFTOnTheMarket(priceSellerPut, result) {
    //블록체인에서 해당 NFT 가격 수정 후 DB에 저장된 가격도 수정 시작
    if (isKaikas === false) {
      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };
      await axios
        .post(
          "https://thekift.shop/listItemOnchange",
          {
            openseaId: URLparam,
            price: priceSellerPut,
            from: result.from,
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
    } else {
      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };
      await axios
        .post(
          "https://thekift.shop/klaytn/listItemOnchange",
          {
            openseaId: URLparam,
            price: priceSellerPut,
            from: result.from,
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
  }

  async function cancleMarketItem() {
    //블록체인에 등록된 NFT 판매 중지 함수
    setMessage(`Please wait until "Success!" to cancle your Item`);
    if (isKaikas === false) {
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
              .then(async (result) => {
                await setMessage("Cancle your NFT Item Success!");
                await CancleNFTOnTheMarket(result);
                // 블록체인에서 취소후 DB에도 취소 시작
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
    } else {
      window.klaytn._kaikas.isUnlocked().then(async (result) => {
        if (result === true) {
          await window.klaytn._kaikas.isApproved().then(async (result) => {
            if (result === true) {
              try {
                const caver = new Caver(window.klaytn);
                caver.klay.getAccounts().then(async (account) => {
                  let contract = await new caver.klay.Contract(KiFTabi_Klaytn, Kift_Kip_Contract_Address);
                  await contract.methods
                    .soldOutMarketItem(sellitem.itemIdOnBlockChain)
                    //마켓 블록체인에 아이템 등록
                    .send({
                      from: account[0],
                      gas: 500000,
                      gasPrice: "25000000000",
                    })
                    .then(async (result) => {
                      await setMessage("Cancle your NFT Item Success!");
                      await CancleNFTOnTheMarket(result);
                      // 블록체인에서 취소후 DB에도 취소 시작
                    })
                    .catch((err) => {
                      console.log("this is whole error message", err);
                      console.log("this is error message----->>>>", err.message);
                      setClosebox(true);
                      setMessage(err.message);
                    });
                });
              } catch (err) {
                setMessage("Cancle your NFT Item Fail!");
              }
            } else {
              setMessage("Please re-Log in Kaikas!");
              setClosebox(true);
            }
          });
        } else {
          setMessage("Please Log in Kaikas!");
          setClosebox(true);
        }
      });
    }
  }

  async function CancleNFTOnTheMarket(result) {
    //DB에서 해당하는 NFT아이템 취소 등록
    //리스팅 된 아이템 취소 후 기여도 1포인트 지급 (가스비 때문)
    if (isKaikas === false) {
      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };
      await axios
        .post(
          "https://thekift.shop/listItemOncancel",
          {
            openseaId: URLparam,
            isSale: false,
            price: 0,
            from: result.from,
          },
          headers
        )
        .then(async (result) => {
          if (result.status === 200) {
            setMessage("Cancle your NFT Item Success!");
            await axios
              .post("https://thekift.shop/toGiveContributePoint", {
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
    } else {
      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };
      await axios
        .post(
          "https://thekift.shop/klaytn/listItemOncancel",
          {
            openseaId: URLparam,
            isSale: false,
            price: 0,
            from: result.from,
          },
          headers
        )
        .then(async (result) => {
          if (result.status === 200) {
            setMessage("Cancle your NFT Item Success!");
            await axios
              .post("https://thekift.shop/toGiveContributePoint", {
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
  }

  async function buyNFT() {
    //여러 wallet 플랫폼중 metaMask로 연결
    setShowModal(true);
    setMessage(`Please sign the Wallet and wait until "Success!"`);
    if (isKaikas === false) {
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
            //블록체인에 등록된 NFT아이템 구매 시작
            .send({
              from: account[0],
              gas: 500000,
              gasPrice: "2450000000",
              value: web.utils.toWei(String(sellitem.price), "ether"),
            })
            .then(async (result) => {
              await setMessage("Your purchase request Success!");
              await soldoutNFTOnTheMarket(result.from, ownerAddress, sellitem.price);
              // NFT구매후 DB정보 수정 시작
              console.log("is there ownerAddress found???? =====>>>>>>", ownerAddress);
              console.log("Before changeownerandownedNFTS ==========================");
              await axios
                .post("https://thekift.shop/toGiveContributePoint", {
                  address: loginAccount,
                  secondAddress: ownerAddress,
                  point: 10,
                })
                .then(async (result) => {
                  await changeOwner(); //DB에 저장된 NFT소유 오너 변경
                  document.location.href = `/mypage/${URLparam}`;
                  console.log("contribute points done!", result);
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
    } else {
      window.klaytn._kaikas.isUnlocked().then(async (result) => {
        if (result === true) {
          await window.klaytn._kaikas.isApproved().then(async (result) => {
            if (result === true) {
              try {
                const caver = new Caver(window.klaytn);
                caver.klay.getAccounts().then(async (account) => {
                  let contract = await new caver.klay.Contract(KiFTabi_Klaytn, Kift_Kip_Contract_Address);
                  await contract.methods
                    .createMarketSale(sellitem.contract_address, sellitem.itemIdOnBlockChain)
                    //블록체인에 등록된 NFT아이템 구매 시작
                    .send({
                      from: account[0],
                      gas: 500000,
                      gasPrice: "25000000000",
                      value: caver.utils.convertToPeb(String(sellitem.price), "KLAY"),
                    })
                    .then(async (result) => {
                      await setMessage("Your purchase request Success!");
                      await soldoutNFTOnTheMarket(result.from, ownerAddress, sellitem.price);
                      // NFT구매후 DB정보 수정 시작
                      console.log("is there ownerAddress found???? =====>>>>>>", ownerAddress);
                      console.log("Before changeownerandownedNFTS ==========================");
                      await axios
                        .post("https://thekift.shop/toGiveContributePoint", {
                          address: loginAccount,
                          secondAddress: ownerAddress,
                          point: 10,
                        })
                        .then(async (result) => {
                          await changeOwner(); //DB에 저장된 NFT소유 오너 변경
                          document.location.href = `/mypage/${URLparam}`;
                          console.log("contribute points done!", result);
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
            } else {
              setMessage("Please re-Log in Kaikas!");
              setClosebox(true);
            }
          });
        } else {
          setMessage("Please Log in Kaikas!");
          setClosebox(true);
        }
      });
    }
  }

  async function soldoutNFTOnTheMarket(to, from, itemprice) {
    //위에 buyNFT 후 DB 정보 변경
    if (isKaikas === false) {
      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };
      await axios
        .post(
          "https://thekift.shop/listItemOnbuy",
          {
            openseaId: URLparam,
            price: 0,
            isSale: false,
            itemIdOnBlockChain: null,
            to: to,
            from: from,
            itemprice: itemprice,
          },
          headers
        )
        .then((result) => {
          if (result.status === 200) {
            setMessage("Your NFT purchase Success!");
          }
        })
        .catch((e) => {
          //에러를 프론트로 띄워주세요
          setClosebox(true);
          setMessage("Your purchase request failed! You can check error below");
        });
    } else {
      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };
      await axios
        .post(
          "https://thekift.shop/klaytn/listItemOnbuy",
          {
            openseaId: URLparam,
            price: 0,
            isSale: false,
            itemIdOnBlockChain: null,
            to: to,
            from: from,
            itemprice: itemprice,
          },
          headers
        )
        .then((result) => {
          if (result.status === 200) {
            setMessage("Your NFT purchase Success!");
          }
        })
        .catch((e) => {
          //에러를 프론트로 띄워주세요
          setClosebox(true);
          setMessage("Your purchase request failed! You can check error below");
        });
    }
  }

  async function changeOwner() {
    //구매가 완료되면 DB에서 해당 NFT의 오너 수정
    if (isKaikas === false) {
      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };
      await axios
        .post(
          "https://thekift.shop/changeOwnerAndOwnedNFTs",
          {
            address: loginAccount,
            openseaId: sellitem.openseaId,
          },
          headers
        )
        .then((result) => {
          console.log("After changeownerandownedNFTS ==========================");
          console.log("fetching changeOwnerAndOwnedNFTs API!===>>", result);
        })
        .catch((err) => {
          console.log("fetching changeOwnerAndOwnedNFTs API FAILED!!!! ===>", err);
        });
    } else {
      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };
      await axios
        .post(
          "https://thekift.shop/klaytn/changeOwnerAndOwnedNFTs",
          {
            address: loginAccount,
            openseaId: sellitem.openseaId,
          },
          headers
        )
        .then((result) => {
          console.log("After changeownerandownedNFTS ==========================");
          console.log("fetching changeOwnerAndOwnedNFTs API!===>>", result);
        })
        .catch((err) => {
          console.log("fetching changeOwnerAndOwnedNFTs API FAILED!!!! ===>", err);
        });
    }
  }

  return (
    <>
      {loading ? (
        <>
          <div className="setMargin"></div>
          <Loading className="loading" />
        </>
      ) : (
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
                      <input
                        className="price"
                        placeholder={`Current Price : ${sellitem.price} ${isKaikas ? "KLAY" : "ETH"}`}
                        value={priceSellerPut}
                        onChange={onChange}
                      />
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
                        {isKaikas ? (
                          <div className="klay-logo">
                            <svg
                              className="kaikas-Logo"
                              version="1.1"
                              id="Layer_1"
                              xmlns="http://www.w3.org/2000/svg"
                              xmlns="http://www.w3.org/1999/xlink"
                              x="0px"
                              y="0px"
                              viewBox="0 0 2000 1975.1"
                              xml="preserve"
                            >
                              {/* <style type="text/css">.st0{`fill:#4F473B`}</style> */}
                              <g>
                                <path className="st0" d="M1047.4,982.5l683.3,678.3c359.1-380.9,359.1-975.7,0-1356.6" />
                                <path className="st0" d="M997.5,1027.4l-673.3,668.3l673.3,279.3l673.3-279.3" />
                                <path className="st0" d="M972.6,957.6l698.3-693.3L1027.4,0L389,1541.2L972.6,957.6z" />
                                <path className="st0" d="M0,982.5c-0.5,252.3,95.9,495.1,269.3,678.3l668.3-1611" />
                              </g>
                            </svg>
                          </div>
                        ) : (
                          <img className="eth-logo" src="https://storage.opensea.io/files/6f8e2979d428180222796ff4a33ab929.svg" />
                        )}
                        {isKaikas ? <span className="price_set2">{sellitem.price}</span> : <span className="price_set">{sellitem.price}</span>}
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

                <div className={traits.length === 0 ? "properties_change" : "properties"}>
                  {traits.length === 0 ? (
                    <div className="props_addoption">
                      <div className="props_3">This Item traits empty!</div>
                    </div>
                  ) : (
                    <>
                      {traits.map((prop, index) => {
                        return (
                          <div className="props" key={index}>
                            <div className="props_1">{prop.trait_type}</div>
                            <div className="props_2">{prop.value}</div>
                            <div className="props_3">100% have this trait</div>
                          </div>
                        );
                      })}
                    </>
                  )}
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
                    <span className="right_end">{isKaikas ? "Baobab" : "Rinkeby"}</span>
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
              <Accordion.Header className="acc_header">Item History</Accordion.Header>
              <Accordion.Body>
                <div className="historyTitleBox">
                  <div className="history_event">Event</div>
                  <div className="history_price">Price</div>
                  <div className="history_from">From</div>
                  <div className="history_to">To</div>
                  <div className="history_date">Date (UTC)</div>
                </div>
                {/* hisory제어 */}
                {history.map((his, index) => {
                  if (history !== []) {
                    if (his.event === "minted") {
                      return (
                        <div className="historyBox" key={index}>
                          <div className="history_event2">
                            <span className="material-icons addoption">build</span>
                            Minted
                          </div>
                          <div className="history_price2">...</div>
                          {isKaikas ? (
                            <div className="history_from">
                              {String(his.from).slice(0, 6)}
                              {"..."}
                              {String(his.from).slice(-6)}
                            </div>
                          ) : (
                            <div className="history_from2" onClick={() => runEtherscan2(his.from)}>
                              {String(his.from).slice(0, 6)}
                              {"..."}
                              {String(his.from).slice(-6)}
                            </div>
                          )}
                          {isKaikas ? (
                            <div className="history_to2 url" onClick={() => runEtherscan2(his.to)}>
                              {String(his.to).slice(0, 6)}
                              {"..."}
                              {String(his.to).slice(-6)}
                            </div>
                          ) : (
                            <div className="history_to2 addoption">
                              {String(his.to).slice(0, 6)}
                              {"..."}
                              {String(his.to).slice(-6)}
                            </div>
                          )}
                          <div className="history_date2">
                            {" "}
                            {String(his.date).slice(0, 10)} {String(his.date).slice(11, 19)}
                          </div>
                        </div>
                      );
                    } else if (his.event === "list") {
                      return (
                        <div className="historyBox" key={index}>
                          <div className="history_event2">
                            <span className="material-icons addoption">store</span>
                            List
                          </div>
                          <div className="history_price2">
                            {isKaikas ? (
                              <svg
                                className="history_logo"
                                version="1.1"
                                id="Layer_1"
                                xmlns="http://www.w3.org/2000/svg"
                                xmlns="http://www.w3.org/1999/xlink"
                                x="0px"
                                y="0px"
                                viewBox="0 0 2000 1975.1"
                                xml="preserve"
                              >
                                {/* <style type="text/css">.st0{`fill:#4F473B`}</style> */}
                                <g>
                                  <path className="st0" d="M1047.4,982.5l683.3,678.3c359.1-380.9,359.1-975.7,0-1356.6" />
                                  <path className="st0" d="M997.5,1027.4l-673.3,668.3l673.3,279.3l673.3-279.3" />
                                  <path className="st0" d="M972.6,957.6l698.3-693.3L1027.4,0L389,1541.2L972.6,957.6z" />
                                  <path className="st0" d="M0,982.5c-0.5,252.3,95.9,495.1,269.3,678.3l668.3-1611" />
                                </g>
                              </svg>
                            ) : (
                              <img className="history_logo" src="https://storage.opensea.io/files/6f8e2979d428180222796ff4a33ab929.svg" />
                            )}

                            {his.price}
                          </div>
                          <div className="history_from2" onClick={() => runEtherscan2(his.from)}>
                            {String(his.from).slice(0, 6)}
                            {"..."}
                            {String(his.from).slice(-6)}
                          </div>
                          <div className="history_to2 addoption">
                            {String(his.to).slice(0, 6)}
                            {"..."}
                            {String(his.to).slice(-6)}
                          </div>
                          <div className="history_date2">
                            {" "}
                            {String(his.date).slice(0, 10)} {String(his.date).slice(11, 19)}
                          </div>
                        </div>
                      );
                    } else if (his.event === "buy") {
                      return (
                        <div className="historyBox" key={index}>
                          <div className="history_event2">
                            <span className="material-icons addoption">shopping_cart</span>
                            Buy
                          </div>
                          <div className="history_price2">
                            {isKaikas ? (
                              <svg
                                className="history_logo"
                                version="1.1"
                                id="Layer_1"
                                xmlns="http://www.w3.org/2000/svg"
                                xmlns="http://www.w3.org/1999/xlink"
                                x="0px"
                                y="0px"
                                viewBox="0 0 2000 1975.1"
                                xml="preserve"
                              >
                                {/* <style type="text/css">.st0{`fill:#4F473B`}</style> */}
                                <g>
                                  <path className="st0" d="M1047.4,982.5l683.3,678.3c359.1-380.9,359.1-975.7,0-1356.6" />
                                  <path className="st0" d="M997.5,1027.4l-673.3,668.3l673.3,279.3l673.3-279.3" />
                                  <path className="st0" d="M972.6,957.6l698.3-693.3L1027.4,0L389,1541.2L972.6,957.6z" />
                                  <path className="st0" d="M0,982.5c-0.5,252.3,95.9,495.1,269.3,678.3l668.3-1611" />
                                </g>
                              </svg>
                            ) : (
                              <img className="history_logo" src="https://storage.opensea.io/files/6f8e2979d428180222796ff4a33ab929.svg" />
                            )}
                            {his.price}
                          </div>
                          <div className="history_from2" onClick={() => runEtherscan2(his.from)}>
                            {String(his.from).slice(0, 6)}
                            {"..."}
                            {String(his.from).slice(-6)}
                          </div>
                          <div className="history_to2" onClick={() => runEtherscan2(his.to)}>
                            {String(his.to).slice(0, 6)}
                            {"..."}
                            {String(his.to).slice(-6)}
                          </div>
                          <div className="history_date2">
                            {" "}
                            {String(his.date).slice(0, 10)} {String(his.date).slice(11, 19)}
                          </div>
                        </div>
                      );
                    } else if (his.event === "unlist") {
                      return (
                        <div className="historyBox" key={index}>
                          <div className="history_event2">
                            <span className="material-icons addoption">dangerous</span>
                            {his.event}
                          </div>
                          <div className="history_price2">...</div>
                          <div className="history_from2" onClick={() => runEtherscan2(his.from)}>
                            {String(his.from).slice(0, 6)}
                            {"..."}
                            {String(his.from).slice(-6)}
                          </div>
                          <div className="history_to2 addoption">
                            {String(his.to).slice(0, 6)}
                            {"..."}
                            {String(his.to).slice(-6)}
                          </div>
                          <div className="history_date2">
                            {" "}
                            {String(his.date).slice(0, 10)} {String(his.date).slice(11, 19)}
                          </div>
                        </div>
                      );
                    } else if (his.event === "PriceChange") {
                      return (
                        <div className="historyBox" key={index}>
                          <div className="history_event2">
                            <span className="material-icons addoption">currency_exchange</span>
                            Price
                          </div>
                          <div className="history_price2">
                            {isKaikas ? (
                              <svg
                                className="history_logo"
                                version="1.1"
                                id="Layer_1"
                                xmlns="http://www.w3.org/2000/svg"
                                xmlns="http://www.w3.org/1999/xlink"
                                x="0px"
                                y="0px"
                                viewBox="0 0 2000 1975.1"
                                xml="preserve"
                              >
                                {/* <style type="text/css">.st0{`fill:#4F473B`}</style> */}
                                <g>
                                  <path className="st0" d="M1047.4,982.5l683.3,678.3c359.1-380.9,359.1-975.7,0-1356.6" />
                                  <path className="st0" d="M997.5,1027.4l-673.3,668.3l673.3,279.3l673.3-279.3" />
                                  <path className="st0" d="M972.6,957.6l698.3-693.3L1027.4,0L389,1541.2L972.6,957.6z" />
                                  <path className="st0" d="M0,982.5c-0.5,252.3,95.9,495.1,269.3,678.3l668.3-1611" />
                                </g>
                              </svg>
                            ) : (
                              <img className="history_logo" src="https://storage.opensea.io/files/6f8e2979d428180222796ff4a33ab929.svg" />
                            )}
                            {his.price}
                          </div>
                          <div className="history_from2" onClick={() => runEtherscan2(his.from)}>
                            {String(his.from).slice(0, 6)}
                            {"..."}
                            {String(his.from).slice(-6)}
                          </div>
                          <div className="history_to">
                            {String(his.to).slice(0, 6)}
                            {"..."}
                            {String(his.to).slice(-6)}
                          </div>
                          <div className="history_date2">
                            {" "}
                            {String(his.date).slice(0, 10)} {String(his.date).slice(11, 19)}
                          </div>
                        </div>
                      );
                    } else if (his.event === "Transfer") {
                      return (
                        <div className="historyBox" key={index}>
                          <div className="history_event2">
                            <span className="material-icons addoption">send</span>
                            {his.event}
                          </div>
                          <div className="history_price2">{"..."}</div>
                          <div className="history_from2" onClick={() => runEtherscan2(his.from)}>
                            {String(his.from).slice(0, 6)}
                            {"..."}
                            {String(his.from).slice(-6)}
                          </div>
                          <div className="history_to2" onClick={() => runEtherscan2(his.to)}>
                            {String(his.to).slice(0, 6)}
                            {"..."}
                            {String(his.to).slice(-6)}
                          </div>
                          <div className="history_date2">
                            {" "}
                            {String(his.date).slice(0, 10)} {String(his.date).slice(11, 19)}
                          </div>
                        </div>
                      );
                    } else {
                      return (
                        <div className="historyBox" key={index}>
                          <div className="history_event2">
                            <span className="material-icons addoption">help_outline</span>
                            {his.event}
                          </div>
                          <div className="history_price2">
                            {isKaikas ? (
                              <svg
                                className="history_logo"
                                version="1.1"
                                id="Layer_1"
                                xmlns="http://www.w3.org/2000/svg"
                                xmlns="http://www.w3.org/1999/xlink"
                                x="0px"
                                y="0px"
                                viewBox="0 0 2000 1975.1"
                                xml="preserve"
                              >
                                {/* <style type="text/css">.st0{`fill:#4F473B`}</style> */}
                                <g>
                                  <path className="st0" d="M1047.4,982.5l683.3,678.3c359.1-380.9,359.1-975.7,0-1356.6" />
                                  <path className="st0" d="M997.5,1027.4l-673.3,668.3l673.3,279.3l673.3-279.3" />
                                  <path className="st0" d="M972.6,957.6l698.3-693.3L1027.4,0L389,1541.2L972.6,957.6z" />
                                  <path className="st0" d="M0,982.5c-0.5,252.3,95.9,495.1,269.3,678.3l668.3-1611" />
                                </g>
                              </svg>
                            ) : (
                              <img className="history_logo" src="https://storage.opensea.io/files/6f8e2979d428180222796ff4a33ab929.svg" />
                            )}
                            {his.price}
                          </div>
                          <div className="history_from2" onClick={() => runEtherscan2(his.from)}>
                            {String(his.from).slice(0, 6)}
                            {"..."}
                            {String(his.from).slice(-6)}
                          </div>
                          <div className="history_to2" onClick={() => runEtherscan2(his.to)}>
                            {String(his.to).slice(0, 6)}
                            {"..."}
                            {String(his.to).slice(-6)}
                          </div>
                          <div className="history_date2">
                            {" "}
                            {String(his.date).slice(0, 10)} {String(his.date).slice(11, 19)}
                          </div>
                        </div>
                      );
                    }
                  } else {
                    return (
                      <div className="historyBox" key={index}>
                        <div className="history_event2">
                          <span className="material-icons addoption">store</span>
                          NoData
                        </div>
                        <div className="history_price2">
                          {isKaikas ? (
                            <svg
                              className="history_logo"
                              version="1.1"
                              id="Layer_1"
                              xmlns="http://www.w3.org/2000/svg"
                              xmlns="http://www.w3.org/1999/xlink"
                              x="0px"
                              y="0px"
                              viewBox="0 0 2000 1975.1"
                              xml="preserve"
                            >
                              {/* <style type="text/css">.st0{`fill:#4F473B`}</style> */}
                              <g>
                                <path className="st0" d="M1047.4,982.5l683.3,678.3c359.1-380.9,359.1-975.7,0-1356.6" />
                                <path className="st0" d="M997.5,1027.4l-673.3,668.3l673.3,279.3l673.3-279.3" />
                                <path className="st0" d="M972.6,957.6l698.3-693.3L1027.4,0L389,1541.2L972.6,957.6z" />
                                <path className="st0" d="M0,982.5c-0.5,252.3,95.9,495.1,269.3,678.3l668.3-1611" />
                              </g>
                            </svg>
                          ) : (
                            <img className="history_logo" src="https://storage.opensea.io/files/6f8e2979d428180222796ff4a33ab929.svg" />
                          )}
                          0
                        </div>
                        <div className="history_from2">0x0</div>
                        <div className="history_to2">0x0</div>
                        <div className="history_date2">NoData</div>
                      </div>
                    );
                  }
                })}
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        </div>
      )}
    </>
  );
}

export default About;
