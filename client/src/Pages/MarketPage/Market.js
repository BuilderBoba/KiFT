import "./Market.css";
import { useState, useEffect } from "react";
import axios from "axios";
import Item from "./Components/Item";
import Loading from "../../component/assets/Loading";

function Market({ setfooter }) {
  const [userMarketData, setUserMarketData] = useState([]);
  const [marketData, setMarketData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(async () => {
    const dataLoad = async () => {
      await axios
        .get("http://localhost:3001/fetchItemsonsale")
        .then((result) => {
          console.log("==유저들의 리스팅 토큰 갖고오기 완료 ==");
          console.log(result.data.data);
          setUserMarketData(result.data.data);
        })
        .catch((err) => {
          console.log("== 유저 토큰 가져오는 중 에러 발생 ==");
          console.log(err);
        });

      await axios
        .get(`https://api.opensea.io/api/v1/assets?order_direction=desc&limit=21`)
        .then((result) => {
          console.log("== 오픈씨 데이터 가져오기 완료 ==");
          console.log(result.data.assets);
          setMarketData(result.data.assets);
          setLoading(false);
        })
        .catch((err) => {
          console.log(err);
          setLoading(false);
        });
    };
    await dataLoad();

    await setfooter(true);
  }, []);

  return (
    <div>
      <div className="container">
        <h1 className="marketTitle">Market</h1>

        <div className="row">
          <hr className="divider" />
        </div>
        {loading ? <Loading className="loading" /> : <Item marketData={marketData} userMarketData={userMarketData}></Item>}
      </div>
    </div>
  );
}

export default Market;
