import { BigNumber, ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from 'web3modal'
import { useRouter } from 'next/router'


import {
  milikeyAddress
} from '../../config'

import Milikey from '../../artifacts/contracts/Milikey.sol/Milikey.json'
import { messagePrefix } from '@ethersproject/hash'

export default function Home() {
  const [nfts, setNfts] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')
  const [address, setAddress] = useState([])
  const router = useRouter()
  useEffect(() => {
    loadNFTs()
  }, [])

  useEffect( () =>{
    checkIfWalletIsConnected();
  }, [address])

  async function checkIfWalletIsConnected() {
    const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    let accounts = await provider.send("eth_requestAccounts", []);
    let account = accounts[0];
    provider.on('accountsChanged', function (accounts) {
        account = accounts[0];
        console.log(address); // Print new address
      });
      
      const signer = provider.getSigner();
      
      const address = await signer.getAddress();
      
      setAddress(address)
      
      console.log(address)

  }

  console.log(address)

  function listNFT(nft) {
    console.log('nft:', nft)
    router.push(`/resell?id=${nft.tokenId}&tokenURI=${nft.tokenURI}`)
  }

  async function loadNFTs() {
    /* create a generic provider and query for unsold market items */
    const provider = new ethers.providers.JsonRpcProvider()
    const contract = new ethers.Contract(milikeyAddress, Milikey.abi, provider)
    let a = BigNumber.from(1)
    
    const data = await contract.fetchItems2(a)
    console.log(a)

    
    
    /*
    *  map over items returned from smart contract and format 
    *  them as well as fetch their token metadata
    */
   const items = await Promise.all(data.map(async i => {
     const tokenUri = await contract.tokenURI(i.tokenId)
     const meta = await axios.get(tokenUri)
     let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
     let item = {
       price,
       tokenId: i.tokenId.toNumber(),
       seller: i.seller,
       owner: i.owner,
       sold: i.sold,
       image: meta.data.image,
       name: meta.data.name,
       description: meta.data.description,
      }
      return item
    }))
    setNfts(items)
    setLoadingState('loaded') 
  }
  
  console.log(nfts)
  if (loadingState === 'loaded' && !nfts.length) return (<h1 className="px-20 py-10 text-3xl">No items in marketplace</h1>)
  async function buyNft(nft) {
    /* needs the user to sign the transaction, so will use Web3Provider and sign it */
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(milikeyAddress, Milikey.abi, signer)
    
    /* user will be prompted to pay the asking proces to complete the transaction */
    const price = ethers.utils.parseUnits(nft.price.toString(), 'ether')   
    const transaction = await contract.createMarketSale(nft.tokenId, {
      value: price
    })
    await transaction.wait()
    loadNFTs()
  }
  return (
    <div className="flex justify-center">
      <div className="px-4" style={{ maxWidth: '1600px' }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {
            nfts.map((nft, i) => (
              <div key={i} className="border shadow rounded-xl overflow-hidden">
                <img src={nft.image} />
                <div className="p-4">
                  <p style={{ height: '64px' }} className="text-2xl font-semibold">{nft.name}</p>
                  <div style={{ height: '70px', overflow: 'hidden' }}>
                    <p className="text-gray-400">{nft.description}</p>
                  </div>
                </div>
                <div className="p-4 bg-black">
                  <p className="text-2xl font-bold text-white">{nft.price}ETH</p>
                  {nft.owner != address ? <>
                  {nft.sold == true ?
                  <button className="mt-4 w-full bg-gray-600 text-gray-500 font-bold py-2 px-12 rounded disabled">NOT LISTED</button>
                  : 
                  <button className="mt-4 w-full bg-pink-500 text-white font-bold py-2 px-12 rounded" onClick={() => buyNft(nft)}>CLAIM</button>
                  } </>
                  :
                  <>
                  <h1 className='text-white'>You own this</h1>                
                  <button className="mt-4 w-full bg-pink-500 text-white font-bold py-2 px-12 rounded" onClick={() => listNFT(nft)}>List</button>
                  </>
                  }
                  </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}