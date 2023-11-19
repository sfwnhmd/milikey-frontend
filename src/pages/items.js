import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import axios from '@/lib/axios'

import AppLayout from '@/components/Layouts/AppLayout'
import Center from '@/components/Center'

import { useFormik } from 'formik'

/** Web3 package */
import { create as ipfsHttpClient } from 'ipfs-http-client'
import { BigNumber, ethers } from 'ethers'
import Web3Modal from 'web3modal'
import truncateEthAddress from 'truncate-eth-address'

/** Store items image in blockchain using IPFS */
const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')

/** Using the contract owner address */
import {
  milikeyAddress
} from '../../config'

/** Using the smart contracts */
import Milikey from '../../artifacts/contracts/Milikey.sol/Milikey.json'
import Button from '@/components/PrimaryBtn/PrimaryButton'
import Link from 'next/link'

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
    const [prodImage, setProdImage] = useState('')

    let a
    
    // useEffect(() => {
    //   if(prodName == '') {
    //     router.push(`/products`)
    //   }
    // }, [prodName])

    /** State to upload the items details to blockchain (minting process) */
    const [formInput, updateFormInput] = useState({ name: '', description: '' })

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
            setProdImage(product.prodImage)

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

    /** Fuction to upload the items details to blockchain / IPFS */
    async function uploadToIPFS(id, prodName, prodDesc, prodImage) {
      //const { name, description } = formInput
      const name = prodName
      const description = prodDesc
      const item_id = id
      const image = prodImage
      if (!name || !description) return
      /* first, upload to IPFS */
      const data = JSON.stringify({
        name, description, item_id, image
      })
      try {
        const added = await client.add(data)
        const url = `https://ipfs.infura.io/ipfs/${added.path}`
        /* after file is uploaded to IPFS, return the URL to use it in the transaction */
        return url
        console.log(url)
      } catch (error) {
        console.log('Error uploading file: ', error)
      }  
    }

    /** Function to list the NFT created */
    async function listNFTForSale(id, prodName, prodDesc, prodImage) {
      const url = await uploadToIPFS(id, prodName, prodDesc, prodImage)
      const web3Modal = new Web3Modal()
      const connection = await web3Modal.connect()
      const provider = new ethers.providers.Web3Provider(connection)
      const signer = provider.getSigner()
  
      /* next, create the item */
      let b = BigNumber.from(3)
      let contract = new ethers.Contract(milikeyAddress, Milikey.abi, signer.connectUnchecked())
      let transaction = await contract.createToken(url)

      await transaction.wait()

      
      await handleSubmit(transaction, id)
      //router.push(`/items?id=${id}`)
       await router.push(`/products`)
      //window.location.reload()
    }

     /** Using FORMIK to handle form */
     const formik = useFormik({

      /** Initiate the values */
      initialValues: {
          tx_hash: '',
      },

      /** Handle submit with valiues */
      onSubmit: () => {
          handleSubmit()
      },
    })

    const handleSubmit = async (transaction, id) => {
      let data = new FormData()

      data.append('tx_hash', transaction.hash)
      data.append('_method', 'put')

      await axios
                .post(
                    `http://localhost:8000/api/items/${id}`,
                    data,
                    {
                        /** Declare Content-Type in header
                         * as working with uploaded file/image
                         */
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            method: 'PUT',
                        },
                    },
                )
                .then(response => {
                    console.log(response)
                })
                .catch(err => {
                  console.log(err)
                }) 
    }

    return (
      <AppLayout
      /** Set the header */
      header={
          <h2 className="text-xl font-semibold leading-tight text-gray-800">
              Products
          </h2>
      }
      >
        <Center>
            <div className='my-12'>
                <h1
                  className='mb-4 text-6xl font-black'
                >
                  {prodName}
                </h1>
                <h1
                  className='text-3xl text-gray-600'
                >
                  {prodDesc}
                </h1>
            </div>

            {items.map(item => (
                <div className='grid grid-cols-2 mb-6' key={item.id}>
                  {item.status == 1 ?
                    <Link href={`http://localhost:3000/items/${item.id}`} legacyBehavior>
                      <h1
                        className='text-5xl font-black'
                      >
                        #{item.id}
                      </h1>
                    </Link>
                    :
                    <h1
                      className='text-5xl font-black'
                    >
                      #{item.id}
                    </h1>
                    }
                    {item.tx_hash != null ? 
                    <h1
                    className='mt-4 mb-6 text-2xl text-gray-700'
                    >
                      {truncateEthAddress(item.tx_hash)}
                    </h1>
                    :
                      <></>
                    }
                      {item.status == 0 ? 
                    <Button
                    onClick={ async () => { 
                      await listNFTForSale(item.id, prodName, prodDesc, prodImage)
                    }}
                    >
                      Upload
                    </Button>
                    :
                    <></>
                    }
                </div>
            ))}
            </Center>
        </AppLayout>
    );
}

export default Items
