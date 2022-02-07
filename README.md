# KiFT : Community-Curated NFT MarketPlace
![LOGO](https://codestates.notion.site/image/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fsecure.notion-static.com%2Ff8d283a8-9024-46c1-b8b9-d02add9a5152%2FScreen_Shot_2022-01-28_at_11.25.47_AM.png?table=block&id=8606192e-26a5-4375-9b9a-9aab3931fdc2&spaceId=82d63a72-8254-4cde-bf1e-b2597b7c099c&width=2000&userId=&cache=v2)
KiFT는 디지털 NFT 마켓플레이스와 더불어 예술 큐레이션 및 인센티브 기반 토큰 배포 기능이 추가된 디지털 통합 환경입니다. 또한 사용자들은 NFT를 직접 만들어서 배포할 수 있는 기능도 포함되어 있습니다. 자신이 원하는 NFT를 사고 팔고, 그 활동의 대가로 커뮤니티 고유 토큰인 KFT 토큰을 받을 수 있는 환경입니다.

### 세부 기능 (02-01 이후 추가된 기능 제외)
1. 메타마스크로 로그인 및 모든 서명 
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
12. KiFT 자체 ERC-721 컨트랙트를 통해 컨텐츠, 이름, 콜렉션, 설명, 프로퍼티 등을 기입해 NFT 민팅 가능
13. KiFT에서 한번이라도 로그인 한 기록이 있는 address의 모든 NFT는 Search를 통해 검색 가능

### 주의사항
- 클라이언트 .env파일내에 관련 컨트랙트 주소가 정확히 기입되어야합니다.
- 서버 .env파일내에서 INFURA_API_KEY를 확인하여야 합니다.
- 현재 클라이언트에서 사용되는 AXIOS 통신 주소는 우리가 AWS에 배포한 서버를 사용하고 있습니다.
- 배포한 클라이언트와 서버가 Hhttps 통신을 전제로 작성되어있습니다.
- npm install 오류시 캐시를 지우고 package-lock.json과 node_modules 디렉토리를 삭제 후 다시 install 해야합니다.
- 더 자세한 내용을 얻고 싶다면 Wiki를 참고하십시오.
