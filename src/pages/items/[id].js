import axios from '@/lib/axios'
import { BigNumber, ethers } from 'ethers'
import { useEffect, useState } from 'react'
import Web3Modal from 'web3modal'
import { useRouter } from 'next/router'
import AppLayout from '@/components/Layouts/AppLayout'
import Head from 'next/head'
import { useFormik } from 'formik'
import truncateEthAddress from 'truncate-eth-address'
import {
  milikeyAddress
} from '../../../config'

import Milikey from '../../../artifacts/contracts/Milikey.sol/Milikey.json'

export const getStaticPaths = async () => {
  const res = await axios.get('http://localhost:8000/api/items/');
  const data = res.data.data;

  // map data to an array of path objects with params (id)
  const paths = data.map(item => {
    return {
      params: { id: item.id.toString() }
    }
  })

  return {
    paths,
    fallback: false
  }
}

export const getStaticProps = async (context) => {
  const id = context.params.id;
  const res = await axios.get('http://localhost:8000/api/items/' + id);
  const data = res.data.data[0];

  return {
    props: { item: data }
  }
}

const Item = ({ item }) => {

  const [nfts, setNfts] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')
  const [address, setAddress] = useState([])
  const [history, setHistory] = useState([])
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

  async function loadNFTs() {
    /* create a generic provider and query for unsold market items */
    const provider = new ethers.providers.JsonRpcProvider()
    const contract = new ethers.Contract(milikeyAddress, Milikey.abi, provider)
    let a = BigNumber.from(item.id)
    
    const data = await contract.fetchItems2(a)
    console.log(a)

    /*
    *  map over items returned from smart contract and format 
    *  them as well as fetch their token metadata
    */
   const items = await Promise.all(data.map(async i => {
     const tokenUri = await contract.tokenURI(i.tokenId)
     //const meta = await axios.get(tokenUri)
     let item = {
       tokenId: i.tokenId.toNumber(),
       current_owner: i.current_owner,
       new_owner: i.new_owner,
       claimed: i.claimed,
       //image: meta.data.image,
       //name: meta.data.name,
      // description: meta.data.description,
      }
      return item
    }))
    setNfts(items)

    getHistory(item.id)
    setLoadingState('loaded') 
  }
  
  console.log(nfts)
  
  async function buyNft(nft, item) {
    /* needs the user to sign the transaction, so will use Web3Provider and sign it */
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(milikeyAddress, Milikey.abi, signer)
    
    const transaction = await contract.claimOwnership(nft.tokenId)
    await transaction.wait()
    await handleSubmit(item)
    loadNFTs()
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


   /** Using FORMIK to handle form */
   const formik = useFormik({

    /** Initiate the values */
    initialValues: {
        item_id: '',
        user_id: '',
    },

    /** Handle submit with valiues */
    onSubmit: () => {
        handleSubmit()
    },
  })

  const handleSubmit = async (item) => {
    let data = new FormData()
    
    data.append('item_id', item.id)

    await axios
              .post(
                  `http://localhost:8000/api/transactions`,
                  data)
              .then(response => {
                  console.log(response)
              })
              .catch(err => {
                console.log(err)
              }) 
  }

  /** Function to get product details based on id */
  const getHistory = async id => {
    try {
        const { data } = await axios.get(
            `http://localhost:8000/api/items/${id}`,
            {
              /** Params task to get products information
               * with items array
               */
              params: {
                  task: 'fetch_history',
              },
          },
         )

        /** Get product information and store to state */
        const his = data.data
        console.log('h',his)
        setHistory(his)

    } catch (error) {
        console.log(error)
    }
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

    <div className="flex items-center justify-center h-screen px-32" >
    <div className="grid grid-cols-2 gap-12">
        {
          nfts.map((nft, i) => (
            <div key={i} className="border shadow rounded-2xl overflow-hidden">
              <img className="object-cover" src={`http://localhost:8000/storage/images/${item.prod_image}`} />
              <div className="">
                <p className="text-2xl font-semibold">{nft.name}</p>
                  <p className="text-gray-400">{nft.description}</p>
              </div>
              <div className="p-4 bg-black">
              <p className="text-4xl font-bold text-white">#{item.id}</p>
                <p className="text-2xl font-bold text-white">{item.prod_name}</p>
                <p className="text-md font-bold text-white">{item.prod_desc}</p>
                {nft.new_owner != address ? <>
                {nft.claimed == true ?
                <button className="mt-4 w-full bg-gray-600 text-gray-500 font-bold py-2 px-12 rounded disabled">OWNED</button>
                : 
                <button className="mt-4 w-full bg-purple-300 text-black font-bold py-2 px-12 rounded" onClick={() => buyNft(nft, item)}>CLAIM</button>
                } </>
                :
                <>
                <h1 className='text-white'>You own this</h1>                
                <button className="mt-4 w-full bg-lime-300 text-black font-bold py-2 px-12 rounded-md" onClick={() => listNFT(nft)}>LIST</button>
                </>
                }
                </div>
            </div>
          ))
        }
        
        <div>
          <h1 className='text-3xl font-bold'>Ownership History</h1>
          {history.map((histo, i) => (
            <div className='grid grid-cols-4' key={i}>
              <p>{histo.id}</p>
              <p>{histo.name}</p>
              {histo.eth_address ? 
              <p>{truncateEthAddress(histo.eth_address)}</p>
              : 
              <></>
              }
              <p>{histo.created_at}</p>
            </div>
         ))}
        </div> 
      </div>
    </div>
</AppLayout>

  )
}

export default Item;