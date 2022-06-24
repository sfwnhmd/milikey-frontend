// SPDX-License-Identifier: MIT

// Solidity version
pragma solidity ^0.8.4;

// Import dependency
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

/**
  * Milikey = name of the contract
 */
contract Milikey1 is ERC721URIStorage {

    // Counter use for increment of token id and item sold
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    Counters.Counter private _itemsSold;

    /**
      * Enable the address account to send ethers
      * Owner - public address assigned as owner of the contract
      * Able to receive commision of every transaction
      */ 
    address payable owner;

    // Price need to be paid to list a NFT in the marketplace
    uint256 listingPrice = 0 ether;

    // Use to fetch the item based on id: idToItem
    mapping(uint256 => Item) private idToItem;

    // Array of Item
    struct Item {
      uint256 tokenId;
      address payable seller;
      address payable owner;
      uint256 price;
      bool sold;
    }

    // Array to hold the data for created item
    event ItemCreated (
      uint256 indexed tokenId,
      address seller,
      address owner,
      uint256 price,
      bool sold
    );

    /**
      * Create the token
      * Name    : MiliKey Tokens
      * Symbol  : MKYT
      * Type    : ERC721      
     */
    constructor() ERC721("MiliKey Tokens", "MKYT") {
      /** 
        * Assign the current address that call the contract 
        to be the owner of the    contract      
        */ 
      owner = payable(msg.sender);
    }

    /* Updates the listing price of the contract */
    function updateListingPrice(uint _listingPrice) public payable {
      require(owner == msg.sender, "Only marketplace owner can update listing price.");
      listingPrice = _listingPrice;
    }

    /* Returns the listing price of the contract */
    function getListingPrice() public view returns (uint256) {
      return listingPrice;
    }

    /* 
     * Mints a token and lists it in the marketplace 
     * received two parameters which are tokenURI and price
    */
    function createToken(string memory tokenURI, uint256 price) public payable returns (uint) {

      _tokenIds.increment();
      uint256 newTokenId = _tokenIds.current();

      _mint(msg.sender, newTokenId);
      _setTokenURI(newTokenId, tokenURI);
      createMarketItem(newTokenId, price);
      return newTokenId;
    }
 

    /** Function to create the item
      * receives two parameters which are tokenId and priceh
     */
    function createMarketItem(
      uint256 tokenId,
      uint256 price
    ) private {

      // Need the seller to input the price for the NFT more than 1 wei
      require(price > 0, "Price must be at least 1 wei");

      // Need the seller to pay for the listing price along with the transactions
      require(msg.value == listingPrice, "Price must be equal to listing price");

      /**
        * Create the the item based on the tokenId
       */
      idToItem[tokenId] = Item (
        tokenId,
        payable(msg.sender),
        payable(address(this)),
        price,
        false
      );

      /**
        * Transfer the token to the address
        * transferFrom(address _from, address _to, uint256 _tokenId)
        * msg.sender -> tokenId -> address
       */
      _transfer(msg.sender, address(this), tokenId);
      // Run the ItemCreated event after the token have been transfered
      emit ItemCreated(
        tokenId,
        msg.sender,
        address(this),
        price,
        false
      );
    }

    /* allows someone to resell a token they have purchased */
    function resellToken(uint256 tokenId, uint256 price) public payable {
      require(idToItem[tokenId].owner == msg.sender, "Only item owner can perform this operation");
      require(msg.value == listingPrice, "Price must be equal to listing price");
      idToItem[tokenId].sold = false;
      idToItem[tokenId].price = price;
      idToItem[tokenId].seller = payable(msg.sender);
      idToItem[tokenId].owner = payable(address(this));
      _itemsSold.decrement();

      _transfer(msg.sender, address(this), tokenId);
    }

    /* Creates the sale of a marketplace item */
    /* Transfers ownership of the item, as well as funds between parties */
    function createMarketSale(
      uint256 tokenId
      ) public payable {
      /** Access the price based on the tokenId */
      uint price = idToItem[tokenId].price;
      /** Access the seller address based on the tokenId */
      address seller = idToItem[tokenId].seller;
      /** Need the buyer to fund the asking price  */
      require(msg.value == price, "Please submit the asking price in order to complete the purchase");
      /** Transfer the fund to the seller */
      idToItem[tokenId].owner = payable(msg.sender);
      idToItem[tokenId].sold = true;
      idToItem[tokenId].seller = payable(address(0));
      _itemsSold.increment();
      /** Transfer the ownership to the buyer */
      _transfer(address(this), msg.sender, tokenId);
      payable(owner).transfer(listingPrice);
      payable(seller).transfer(msg.value);
    }

    /* Returns all unsold market items */
    function fetchItems() public view returns (Item[] memory) {
      uint itemCount = _tokenIds.current();
      uint unsoldItemCount = _tokenIds.current() - _itemsSold.current();
      uint currentIndex = 0;

      Item[] memory items = new Item[](unsoldItemCount);
      for (uint i = 0; i < itemCount; i++) {
        if (idToItem[i + 1].owner == address(this)) {
          uint currentId = i + 1;
          Item storage currentItem = idToItem[currentId];
          items[currentIndex] = currentItem;
          currentIndex += 1;
        }
      }
      return items;
    }

    /* Returns only items that a user has purchased */
    function fetchMyNFTs() public view returns (Item[] memory) {
      uint totalItemCount = _tokenIds.current();
      uint itemCount = 0;
      uint currentIndex = 0;

      for (uint i = 0; i < totalItemCount; i++) {
        if (idToItem[i + 1].owner == msg.sender) {
          itemCount += 1;
        }
      }

      Item[] memory items = new Item[](itemCount);
      for (uint i = 0; i < totalItemCount; i++) {
        if (idToItem[i + 1].owner == msg.sender) {
          uint currentId = i + 1;
          Item storage currentItem = idToItem[currentId];
          items[currentIndex] = currentItem;
          currentIndex += 1;
        }
      }
      return items;
    }

    /* Returns only items a user has listed */
    function fetchItemsListed() public view returns (Item[] memory) {
      uint totalItemCount = _tokenIds.current();
      uint itemCount = 0;
      uint currentIndex = 0;

      for (uint i = 0; i < totalItemCount; i++) {
        if (idToItem[i + 1].seller == msg.sender) {
          itemCount += 1;
        }
      }

      Item[] memory items = new Item[](itemCount);
      for (uint i = 0; i < totalItemCount; i++) {
        if (idToItem[i + 1].seller == msg.sender) {
          uint currentId = i + 1;
          Item storage currentItem = idToItem[currentId];
          items[currentIndex] = currentItem;
          currentIndex += 1;
        }
      }
      return items;
    }

    function fetchItems2(uint a) public view returns (Item[] memory){
      Item[] memory items = new Item[](1);
      Item storage currentItem = idToItem[a];
      items[0] = currentItem;

      if(idToItem[a].tokenId < 0){
        revert('The nft doesnt existed!');
      } else {
        return items;
      }
    }
    
}