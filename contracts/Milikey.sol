// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import "hardhat/console.sol";

contract Milikey is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    Counters.Counter private _itemsClaimed;

    address payable owner;

    mapping(uint256 => Item) private idToItem;

    struct Item {
      uint256 tokenId;
      address current_owner;
      address new_owner;
      bool claimed;
    }

    event ItemCreated (
      uint256 indexed tokenId,
      address current_owner,
      address new_owner,
      bool claimed
    );

    constructor() ERC721("MiliKey Tokens", "MKYT") {
      owner = payable(msg.sender);
    }

    /* Mints a token and lists it in the marketplace */
    function createToken(string memory tokenURI) public payable returns (uint) {
      _tokenIds.increment();
      uint256 newTokenId = _tokenIds.current();
      _mint(msg.sender, newTokenId);
      _setTokenURI(newTokenId, tokenURI);
      createItem(newTokenId);
      return newTokenId;
    }

    function createItem(
      uint256 tokenId
    ) private {

      idToItem[tokenId] =  Item (
        tokenId,
        msg.sender,
        address(this),
        false
      );

      _transfer(msg.sender, address(this), tokenId);
      emit ItemCreated(
        tokenId,
        msg.sender,
        address(this),
        false
      );
    }

    /* allows someone to resell a token they have purchased */
    function letGoOwnership(uint256 tokenId) public {
      require(idToItem[tokenId].new_owner == msg.sender, "Only item owner can perform this operation");
      idToItem[tokenId].claimed = false;
      idToItem[tokenId].current_owner = msg.sender;
      idToItem[tokenId].new_owner = address(this);
      _itemsClaimed.decrement();

      _transfer(msg.sender, address(this), tokenId);
    }

    /* Creates the sale of a marketplace item */
    /* Transfers ownership of the item, as well as funds between parties */
    function claimOwnership(
      uint256 tokenId
      ) public {
      idToItem[tokenId].new_owner = msg.sender;
      idToItem[tokenId].claimed = true;
      idToItem[tokenId].current_owner = address(0);
      _itemsClaimed.increment();
      /** Transfer the ownership to the buyer */
      _transfer(address(this), msg.sender, tokenId);
    }

    /* Returns all unsold market items */
    function fetchItems() public view returns (Item[] memory) {
      uint itemCount = _tokenIds.current();
      uint unclaimedItemCount = _tokenIds.current() - _itemsClaimed.current();
      uint currentIndex = 0;

      Item[] memory items = new Item[](unclaimedItemCount);
      for (uint i = 0; i < itemCount; i++) {
        if (idToItem[i + 1].new_owner == address(this)) {
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
        if (idToItem[i + 1].new_owner == msg.sender) {
          itemCount += 1;
        }
      }

      Item[] memory items = new Item[](itemCount);
      for (uint i = 0; i < totalItemCount; i++) {
        if (idToItem[i + 1].new_owner == msg.sender) {
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
        if (idToItem[i + 1].current_owner == msg.sender) {
          itemCount += 1;
        }
      }

      Item[] memory items = new Item[](itemCount);
      for (uint i = 0; i < totalItemCount; i++) {
        if (idToItem[i + 1].current_owner == msg.sender) {
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