// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "hardhat/console.sol";

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import "hardhat/console.sol";

contract Milikey is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    Counters.Counter private _itemsSold;

    uint256 listingPrice = 0 ether;
    address payable owner;

    mapping(uint256 => Item) private idToItem;

    struct Item {
      uint256 tokenId;
      address payable seller;
      address payable owner;
      uint256 price;
      bool sold;
    }

    event ItemCreated (
      uint256 indexed tokenId,
      address seller,
      address owner,
      uint256 price,
      bool sold
    );

    constructor() ERC721("Metaverse Tokens", "METT") {
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

    /* Mints a token and lists it in the marketplace */
    function createToken(string memory tokenURI, uint256 price) public payable returns (uint) {
      _tokenIds.increment();
      uint256 newTokenId = _tokenIds.current();

      _mint(msg.sender, newTokenId);
      _setTokenURI(newTokenId, tokenURI);
      createMarketItem(newTokenId, price);
      return newTokenId;
    }

    function createMarketItem(
      uint256 tokenId,
      uint256 price
    ) private {
      require(price > 0, "Price must be at least 1 wei");
      require(msg.value == listingPrice, "Price must be equal to listing price");

      idToItem[tokenId] = Item(
        tokenId,
        payable(msg.sender),
        payable(address(this)),
        price,
        false
      );

      _transfer(msg.sender, address(this), tokenId);
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
      uint price = idToItem[tokenId].price;
      address seller = idToItem[tokenId].seller;
      require(msg.value == price, "Please submit the asking price in order to complete the purchase");
      idToItem[tokenId].owner = payable(msg.sender);
      idToItem[tokenId].sold = true;
      idToItem[tokenId].seller = payable(address(0));
      _itemsSold.increment();
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