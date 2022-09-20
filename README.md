![LOGO](https://gateway.pinata.cloud/ipfs/QmRwXds4eSWDiKXYsk2gaFMoyXYP1VQcHRK3P6CNbzSeFw)
KiFT is a digital NFT marketplace that integrates art cuation and incentive-based token distribution. It also includes the ability for users to create and deploy their own NFTs. It is an environment where you can buy and sell NFTs you want and receive KFT tokens in return for their activities. Tokens can not only be staked, but also can be used for value creation and participation in the token economy.![image](https://user-images.githubusercontent.com/28004118/191167165-597715ef-5200-4661-b8e4-664a2cc214e6.png)


### 세부 기능
1. 카이카스 및 메타마스크로 로그인 및 모든 서명 
2. 마이페이지에서 현재 address가 보유한 NFT 아이템 모두 출력
3. 보유중인 NFT 아이템 중 다른 address로 전송(트랜스퍼) 기능
4. 보유중인 NFT 아이템 중 마켓에 판매 등록(리스트) 기능
5. 마켓에 판매 등록되어 있는 모든 NFT아이템 출력 및 구매 기능
6. NFT 구매가 이루어지면 KiFT 마켓 컨트랙트 내부에 설정 된 listingPrice(초기 0.00025ETH) 서버에게 전송 및 판매자에게 listingPrice제외하고 판매대금 전송
7. 마켓에 등록된 NFT 아이템의 가격변경 및 취소(언리스트) 기능
8. 모든 NFT아이템의 민팅, 리스트, 가격변경, 취소(언리스트), 전송(트랜스퍼), 거래 기록을 히스토리에 기록 및 출력
9. 큐레이트페이지에서 KiFT가 선정한 NFT 표시
10. KiFT내 NFT 아이템 판매 등록(리스트) 및 거래가 성사될 시 기여도 부여
11. 클레임토큰페이지에서 각 address별 기여도에 따른 KFT토큰 민팅
12. KFT토큰을 스테이킹하여 이자로 KFT 토큰을 부여
13. KiFT 자체 KIP-17, ERC-721 컨트랙트를 통해 컨텐츠, 이름, 콜렉션, 설명, 프로퍼티 등을 기입해 NFT 민팅 가능
14. KiFT에서 한번이라도 로그인 한 기록이 있는 address의 모든 NFT는 Search를 통해 검색 가능

### 조건
1. 카이카스와 메타마스크가 동시에 로그인되어 있을 시 카이카스를 중심으로 Baobab환경이 작동됩니다.
2. 아무것도 로그인되어 있지 않을시 마켓에서는 Rinkeby NFT를 출력합니다.
3. 구글 크롬 확장 프로그램으로 두 지갑이 설치되어있지 않을 시 설치 알람과 함께 설치페이지가 작동됩니다.
4. CreateNFT 페이지에서는 현재 로그인한 지갑 중 중심네트워크에 따라 자동으로 해당 네트워크를 사용하여 민팅합니다.
5. Claim, Staking 페이지는 Baobab환경과 KIP-7의 KFT토큰을 사용합니다.
6. Nav.js 컴포넌트에서 Rinkeby환경과 ERC-20의 KFT토큰도 Claim, Staking 페이지 사용을 위해 주석처리되어있고 관련 컴포넌트와 로직이 작성되어있습니다. 
7. Staking은 별도의 예치시간이나 이자율 등이 계산되진 않았습니다.
8. DAO는 구현 중에 있으며 클릭시 메인화면으로 이동합니다.

### 주의사항
- 클라이언트 .env파일내에 관련 컨트랙트 주소가 정확히 기입되어야합니다.
- 현재 클라이언트에서 사용되는 AXIOS 통신 주소는 우리가 AWS에 배포한 서버를 사용하고 있습니다.
- 배포한 클라이언트와 서버가 Https 통신을 전제로 작성되어있습니다.
- npm install 오류시 캐시를 지우고 package-lock.json과 node_modules 디렉토리를 삭제 후 다시 install 해야합니다.
- 더 자세한 내용을 얻고 싶다면 Wiki를 참고하십시오.
