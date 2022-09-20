![LOGO](https://gateway.pinata.cloud/ipfs/QmRwXds4eSWDiKXYsk2gaFMoyXYP1VQcHRK3P6CNbzSeFw)
KiFT is a digital NFT marketplace that integrates art cuation and incentive-based token distribution. It also includes the ability for users to create and deploy their own NFTs. It is an environment where you can buy and sell NFTs you want and receive KFT tokens in return for their activities. Tokens can not only be staked, but also can be used for value creation and participation in the token economy.

### Detailed Function
1. Login and signature signing with Kaikas and Metamask
2. Show all NFT items owned by the current address on My Page
3. Transfer function to send NFTs to another address 
4. Sell (list) function in the marketplace for NFTs
5. Listing and buying functionalities for  all NFT items on the marketplace
6. When an NFT purchase is made, the listingPrice (initial 0.00025ETH) set inside the KiFT market contract is sent to the server, and the sale amount is sent to the seller exlcuding the listingPrice
7. Price change and cancellation (unlist) function of NFT items registered in the market
8. Minting, list, price change, cancellation (unlist), transfer, and transaction records of all NFT items are recorded and shown in the history
9. Display of NFTs selected by KiFT on the curated page
10. Give contribution points when a transaction is made
11. KFT token minting on the claim token page based on the contribution points of each wallet address
12. Staking KFT tokens to grant KFT tokens with interest
13. Through KiFT's own KIP-17 and ERC-721 contracts, NFT minting is possible by entering content, name, collection, description, properties, etc.
14. In KiFT, all NFTs of an address that have logged in at least once can be found through Search

### Conditions
1. When Kaikas and Metamask are logged in at the same time, the Baobab environment is operated centered on Kaikas.
2. When nothing is logged in, the market shows NFTs on the Rinkeby Test Network.
3. If both wallets are not installed as a Google Chrome extension, users are directed to the installation page.
4. On the CreateNFT page, minting is automatically performed on the network that the user is logged into.
5. Claim and Staking pages use Baobab environment for Klaytn and KIP-7 for Ethereum. 
6. In the Nav.js component, the Rinkeby environment and the KFT token of ERC-20 are also commented out to use the Claim and Staking pages, and related components and logic are written.
7. For staking, no separate deposit time or interest rate was calculated.
8. DAO is WIP, and when clicked, it will move to the main screen.

### Precautions
- The relevant contract address must be correctly written in the client .env file.
- Currently, the AXIOS communication address used by the client is using the server we deployed on AWS.
- The deployed client and server are written on the premise of HTTPS communications.
- In case of npm install error, you need to clear the cache, delete package-lock.json and node_modules directory, and then install again.
- See Wiki for more details.
