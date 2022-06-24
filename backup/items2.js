import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import axios from '@/lib/axios'

/** Web3 package */
import { create as ipfsHttpClient } from 'ipfs-http-client'
import { BigNumber, ethers } from 'ethers'
import Web3Modal from 'web3modal'

/** Store items image in blockchain using IPFS */
const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')

let a = BigNumber.from(1)

/** Using the contract owner address */
import {
  milikeyAddress
} from '../config'

/** Using the smart contracts */
import Milikey from '../../artifacts/contracts/Milikey.sol/Milikey.json'
import Button from '@/components/PrimaryBtn/PrimaryButton'

function Items() {
 
    /** Initialized the router */
    const router = useRouter()

    
    /** Declare id to get the passing id */
    const { id } = router.query
    
    /** State to show list of products inserted */
    const [items, setItems] = useState([])
    const [prodName, setProdName] = useState('')
    const [prodDesc, setProdDesc] = useState('')
    const [prodQty, setProdQty] = useState('')
    
    // useEffect(() => {
    //   if(prodName == '') {
    //     router.push(`/products`)
    //   }
    // }, [prodName])

    /** State to upload the items details to blockchain (minting process) */
    const [fileUrl, setFileUrl] = useState(null)
    const [formInput, updateFormInput] = useState({ price: '', name: '', description: '' })

    /** Function to get product details based on id */
    const getProduct = async id => {
        try {
            const { data } = await axios.get(
                `http://localhost:8000/api/products/${id}`,
                {
                    /** Params task to get products information
                     * with items array
                     */
                    params: {
                        task: 'fetch_items',
                    },
                },
            )

            /** Get product information and store to state */
            const product = data.data[1]
            setProdName(product.prod_name)
            setProdDesc(product.prod_desc)
            setProdQty(product.prodQty)

            /** Get item array and store to state */
            const item = data.data[0]
            setItems(item)

        } catch (error) {
            console.log(error)
        }
    }

    /** Call the getProduct() with id from the router */
    useEffect(() => {
        getProduct(id)
    }, [])

    async function onChange(e) {
      const file = e.target.files[0]
      console.log(file)
      try {
        const added = await client.add(
          file,
          {
            progress: (prog) => console.log(`received: ${prog}`)
          }
        )
        const url = `https://ipfs.infura.io/ipfs/${added.path}`
        console.log(url)
        setFileUrl(url)
      } catch (error) {
        console.log('Error uploading file: ', error)
      }  
    }
    
    /** Fuction to upload the items details to blockchain / IPFS */
    async function uploadToIPFS() {
      const { name, description, price } = formInput
      if (!name || !description || !price || !fileUrl) return
      /* first, upload to IPFS */
      const data = JSON.stringify({
        name, description, image: fileUrl
      })
      try {
        const added = await client.add(data)
        const url = `https://ipfs.infura.io/ipfs/${added.path}`
        /* after file is uploaded to IPFS, return the URL to use it in the transaction */
        return url
      } catch (error) {
        console.log('Error uploading file: ', error)
      }  
    }

    /** Function to list the NFT created */
    async function listNFTForSale() {
      const url = await uploadToIPFS()
      const web3Modal = new Web3Modal()
      const connection = await web3Modal.connect()
      const provider = new ethers.providers.Web3Provider(connection)
      const signer = provider.getSigner()
  
      /* next, create the item */
      const price = ethers.utils.parseUnits(formInput.price, 'ether')
      let contract = new ethers.Contract(milikeyAddress, Milikey.abi, signer.connectUnchecked())
      let listingPrice = await contract.getListingPrice()
      listingPrice = listingPrice.toString()
      let transaction = await contract.createToken(url, price, { value: listingPrice })
      console.log(transaction.hash)
      await transaction.wait()
     
      router.push(`/items?=${id}`)
    }


    return (
        <>
            <div>
                <p>{prodName}</p>
                <p>{prodDesc}</p>
                <p>{prodQty}</p>
            </div>

            {items.map(item => (
                <div key={item.id}>
                    <p>{item.id}</p>
                    <p>{item.name}</p>
                    <p>{item.status}</p>
                    <input
                      placeholder="Asset Price in Eth"
                      className="mt-2 border rounded p-4"
                      value={0.1}
                      onChange={e => updateFormInput({ ...formInput, price: e.target.value })}
                    />
                    <input 
                      placeholder="Asset Name"
                      className="mt-8 border rounded p-4"
                      onChange={e => updateFormInput({ ...formInput, name: e.target.value })}
                    />
                    <textarea
                      placeholder="Asset Description"
                      className="mt-2 border rounded p-4"
                      onChange={e => updateFormInput({ ...formInput, description: e.target.value })}
                    />
                    <input
                      type="file"
                      name="Asset"
                      className="my-4"
                      onChange={onChange}
                    />
                    <Button
                    onClick={listNFTForSale}
                    >
                      Upload
                    </Button>
                </div>
            ))}
        </>
    )
}

export default Items
