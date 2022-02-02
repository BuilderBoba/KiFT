var express = require("express");
var router = express.Router();
const User = require("../models/User");
const NFT = require("../models/NFT");
const KlayNFT = require("../models/KlaynFT");
const CaverExtKAS = require("caver-js-ext-kas");

const axios = require("axios");

//카스 테스트
const accessKeyId = "KASKGXY61FBDCS5DG3H4X9QF";
const secretAccessKey = "fdQtUVnPBvQRKHc2h5JnixThYZ_kKKasdM8zIMRk";
const chainId = 1001;

const caver = new CaverExtKAS();
caver.initKASAPI(chainId, accessKeyId, secretAccessKey);

router.get("/", function (req, res) {
  res.status(200).send("welcome");
});

router.post("/fetchNFT", async (req, res) => {
  //결과로 유저의 정보 빼와줌
  let reqOwnerAddress = req.body.ownerAddress;
  let mintedDate;
  const contractAddress = "0xDD80ed1937e840dD2266667772bA460d37150392";
  const query = {
    size: 100,
  };
  const result = caver.kas.tokenHistory.getNFTListByOwner(contractAddress, reqOwnerAddress, query);
  result
    .then((result) => {
      result.items.map((item) => {
        mintedDate = new Date(item.createdAt * 1000);
        KlayNFT.findOneAndUpdate(
          {
            NFT_Token_id: item.tokenId,
            contract_address: contractAddress,
          },
          {
            ownerAddress: reqOwnerAddress,
            NFT_Token_id: item.tokenId,
            tokenUri: item.tokenUri,
            transactionHash: item.transacitonHash,
            createdAt: new Date(item.createdAt * 1000),
          },
          {
            upsert: true,
          }
        ).then((result) => {
          console.log(result);
        });
        //URI들어가서 정보빼오기
        User.findOne({ address: reqOwnerAddress }).then((owner) => {
          axios.get(item.tokenUri).then((result) => {
            KlayNFT.findOneAndUpdate(
              { NFT_Token_id: item.tokenId, contract_address: contractAddress },
              {
                name: result.data.name,
                collection: result.data.collection,
                description: result.data.description,
                image_url: result.data.image,
                traits: result.data.attributes,
                owner: owner._id,
                $addToSet: {
                  history: {
                    event: "minted",
                    date: mintedDate, //어떻게 해야할지 모르겠어서 일단 이렇게 해둠
                    price: "",
                    from: "",
                    to: reqOwnerAddress,
                  },
                },
              }
            ).then((result) => {
              console.log("tesult@@@", result);
              console.log(result._id);
              User.findOneAndUpdate({ address: reqOwnerAddress }, { $addToSet: { ownedNFTs: result._id } }).then((result) => {
                console.log("tsult!@#@!##", result);
              });
            });
          });
        });
      });
      User.findOne({ address: reqOwnerAddress })
        .populate("ownedNFTs")
        .then((result) => {
          res.status(200).send({
            result: result,
            message: "adding NFTs to ownedNFTs in user DB",
          });
        })
        .catch((err) => {
          console.log(err, "this is errererjoerierjoerioejriojeriojerojerio");
          res.status(401).send({ result: err, message: "something's wrong" });
        });
    })
    .catch((err) => {
      console.log(err);
      res.status(401).send({ result: err, message: "something's wrong" });
    });
});

router.post("/searchNFT", async (req, res) => {
  KlayNFT.findOne({ openseaId: req.body.openseaId })
    .populate("owner")
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((err) => {
      console.log(err);
      res.status(401).send({ result: err, message: "done" });
    });
});

router.post("/sign", async (req, res) => {
  let reqAddress = req.body.address;

  User.findOne({
    address: reqAddress,
  })
    .then((result) => {
      if (!result) {
        const user = new User({
          address: reqAddress,
          createdAt: new Date(),
          Chain: "baobab",
          ownedNFTs: [],
        });
        user.save();
        res.status(200).send("새로운 계정 DB 생성");
      } else {
        res.status(408).send("기존 계정 DB 존재");
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(409).send({ message: e });
    });
});

module.exports = router;
