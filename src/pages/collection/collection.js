import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from 'web3modal'
import { useRouter } from 'next/router'
import AppLayout from '@/components/Layouts/AppLayout'
import Head from 'next/head'

import {
  milikeyAddress
} from '../../../config'

import Milikey from '../../../artifacts/contracts/Milikey.sol/Milikey.json'

export default function MyAssets() {
  const [nfts, setNfts] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')
  const router = useRouter()
  useEffect(() => {
    loadNFTs()
  }, [])
  async function loadNFTs() {
    const web3Modal = new Web3Modal({
      network: "mainnet",
      cacheProvider: true,
    })
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    const marketplaceContract = new ethers.Contract(milikeyAddress, Milikey.abi, signer)
    const data = await marketplaceContract.fetchMyNFTs()

    const items = await Promise.all(data.map(async i => {
      const tokenURI = await marketplaceContract.tokenURI(i.tokenId)
      const meta = await axios.get(tokenURI)
      let item = {
        tokenId: i.tokenId.toNumber(),
        current_owner: i.current_owner,
        new_owner: i.new_owner,
        image: meta.data.image,
        name: meta.data.name,
        description: meta.data.description,
        itemId: meta.data.item_id,
        size: meta.data.size
      }
      return item
    }))
    setNfts(items)
    setLoadingState('loaded') 
  }
  async function listNFT(nft) {
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    let contract = new ethers.Contract(milikeyAddress, Milikey.abi, signer)

    let transaction = await contract.letGoOwnership(nft.tokenId)
    await transaction.wait()
    loadNFTs()
  }

  return (
    <AppLayout
    /** Set the header */
    header={
        <h2 className="text-xl font-semibold leading-tight text-gray-800">
            Staff
        </h2>
    }>
    <Head>
        <title>Staff</title>
    </Head>
    <div className="flex justify-center pt-6">
      <div className="p-12">
        <div>
          <h1
           className='font-black text-4xl'
          >Collection</h1>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {
            nfts.map((nft, i) => (
              <div key={i} className="border shadow rounded-xl overflow-hidden">
                <div className="p-4 bg-black">
                <p className="text-2xl font-bold text-white">#{nft.tokenId}</p>
                <p className="text-xl font-bold text-white">NAME: {nft.name}</p>
                <p className="text-md font-bold text-white">{nft.description}</p>
                  <button className="mt-4 w-full bg-lime-200 text-black font-bold py-2 px-12 rounded" onClick={() => listNFT(nft)}>List</button>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
    </AppLayout>
  )
}