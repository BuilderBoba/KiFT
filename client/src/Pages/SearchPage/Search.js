import "./Search.css";
import { useState, useEffect } from "react";
import axios from "axios";
import Loading from "../../component/assets/Loading";
import TrendingItems from "./Components/TrendingItems";
import SearchedItems from "./Components/SearchedItems";

function Search() {
  const [loading, setLoading] = useState(true);
  const [searchFinished, setSearchFinised] = useState(false);
  const [inputData, setInputData] = useState("");
  const [searchedItems, setSearchedItems] = useState([]);
  const [trendingItems, setTrendingItems] = useState([]);

  const handleChange = (e) => {
    setInputData(e.target.value);
    console.log("result of Input==========>>>>>", e.target.value);
  };

  const handleKeyPress = async (e) => {
    if (e.key === "Enter") {
      setInputData(inputData);

      console.log(e.target.value);

      console.log(inputData);
      if (inputData !== "") {
        await fetchItem(inputData);
        setInputData("");
      }
    }
  };

  const buttonClicked = async () => {
    console.log("this is inputdata ==========>>>>", inputData);

    await fetchItem(inputData);
    setInputData("");
  };

  async function fetchItem(searchQuery) {
    await axios
      .post("https://thekift.shop/searchItems", {
        nameOfItem: searchQuery,
      })
      .then((result) => {
        console.log("아이템 검색하는 중 =======>>");
        console.log("this is result ======>>>>>>>", result);
        console.log(result.data.result);
        console.log(result.status);
        if (result.status === 200) {
          setSearchedItems(result.data.result);
          setSearchFinised(true);
        } else if (result.status === 201) {
          setSearchedItems([]);
          setSearchFinised(true);
        } else {
          setSearchFinised(false);
        }
      })
      .catch((err) => {
        console.log("아이템 검색 중 에러 발생");
        console.log(err);
      });
  }

  useEffect(async () => {
    const dataLoad = async () => {
      await axios
        .get(`https://api.opensea.io/api/v1/assets?order_direction=desc&limit=9`)
        .then((result) => {
          console.log("== 오픈씨 데이터 가져오기 완료 ==");
          console.log(result.data.assets);
          setTrendingItems(result.data.assets);
          setLoading(false);
        })
        .catch((err) => {
          console.log(err);
          setLoading(false);
        });
    };
    await dataLoad();
  }, []);

  return (
    <div className="searchPage">
      <div className="container">
        <h1 className="searchTitle">Search</h1>

        <div className="inputContainer">
          <input
            type="text"
            value={inputData}
            onChange={handleChange}
            className="searchInput"
            onKeyPress={handleKeyPress}
            placeholder="Search for your favorite art or user..."
          />
          <button className="searchButton" onClick={buttonClicked}>
            <svg
              className="search-icon"
              version="1.1"
              id="Capa_1"
              xmlns="http://www.w3.org/2000/svg"
              x="0px"
              y="0px"
              viewBox="0 0 487.95 487.95"
              xml="preserve"
            >
              <g>
                <g>
                  <path
                    d="M481.8,453l-140-140.1c27.6-33.1,44.2-75.4,44.2-121.6C386,85.9,299.5,0.2,193.1,0.2S0,86,0,191.4s86.5,191.1,192.9,191.1
			c45.2,0,86.8-15.5,119.8-41.4l140.5,140.5c8.2,8.2,20.4,8.2,28.6,0C490,473.4,490,461.2,481.8,453z M41,191.4
			c0-82.8,68.2-150.1,151.9-150.1s151.9,67.3,151.9,150.1s-68.2,150.1-151.9,150.1S41,274.1,41,191.4z"
                  />
                </g>
              </g>
            </svg>
          </button>
        </div>
        <div className="row">
          <hr className="divider" />
        </div>
        {searchFinished ? (
          <div className="searchedItems">
            <div className="searchedItemsTitle">Searched Items</div>
            <SearchedItems searchedItems={searchedItems}></SearchedItems>
          </div>
        ) : null}

        <div className="trendingItems">
          <div className="trendingItemsTitle">Trending NFTs</div>
          {loading ? <Loading className="loading" /> : <TrendingItems trendingItems={trendingItems}></TrendingItems>}
        </div>
      </div>
    </div>
  );
}

export default Search;
