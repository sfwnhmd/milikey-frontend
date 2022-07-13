import axios from '@/lib/axios'
import { BigNumber, ethers } from 'ethers'
import { useEffect, useState } from 'react'
import Web3Modal from 'web3modal'
import { useRouter } from 'next/router'
import AppLayout from '@/components/Layouts/AppLayout'
import Head from 'next/head'
import { useFormik } from 'formik'
import Input from '@/components/Input'

import styles from './index.module.css'

import { milikeyAddress } from '../../../config'

import Milikey from '../../../artifacts/contracts/Milikey.sol/Milikey.json'

export const getStaticPaths = async () => {
    const res = await axios.get('http://localhost:8000/api/items/')
    const data = res.data.data

    // map data to an array of path objects with params (id)
    const paths = data.map(item => {
        return {
            params: { id: item.id.toString() },
        }
    })

    return {
        paths,
        fallback: false,
    }
}

export const getStaticProps = async context => {
    const id = context.params.id
    const res = await axios.get('http://localhost:8000/api/items/' + id)
    const data = res.data.data[0]

    return {
        props: { item: data },
    }
}

const Item = () => {
    const [nfts, setNfts] = useState([])
    const [address, setAddress] = useState([])
    const [exist, setExist] = useState(false)
    const [checked, setChecked] = useState(false)
    const [loading, setLoading] = useState(false)
    const [formInput, updateFormInput] = useState({ item_id: '' })
    const router = useRouter()

    // useEffect(() => {
    //   loadNFTs()
    // }, [])

    useEffect(() => {
        checkIfWalletIsConnected()
    }, [address])

    async function checkIfWalletIsConnected() {
        const provider = new ethers.providers.Web3Provider(
            window.ethereum,
            'any',
        )
        let accounts = await provider.send('eth_requestAccounts', [])
        let account = accounts[0]
        provider.on('accountsChanged', function (accounts) {
            account = accounts[0]
            console.log(address) // Print new address
        })

        const signer = provider.getSigner()

        const address = await signer.getAddress()

        setAddress(address)

        console.log(address)
    }

    console.log(address)

    async function loadNFTs() {
        /* create a generic provider and query for unsold market items */
        const provider = new ethers.providers.JsonRpcProvider()
        const contract = new ethers.Contract(
            milikeyAddress,
            Milikey.abi,
            provider,
        )
        const id = formInput.item_id
        let a = BigNumber.from(id)

        const data = await contract.fetchItems2(a)
        if (data) {
            setExist(true)
        }
        console.log('data', data.data)
        console.log(a)

        /*
         *  map over items returned from smart contract and format
         *  them as well as fetch their token metadata
         */
        try {
            const items = await Promise.all(
                data.map(async i => {
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
                }),
            )
            setNfts(items)
            setChecked(true)
            setLoading(true)
            setTimeout(() => {
                setLoading(false)
            }, 4000)
        } catch (error) {
            setExist(false)
            setChecked(true)
            setLoading(true)
            setTimeout(() => {
                setLoading(false)
            }, 4000)
        }

        // getHistory(item.id)
        //setLoadingState('loaded')
    }

    console.log(nfts)

    async function buyNft(nft, item) {
        /* needs the user to sign the transaction, so will use Web3Provider and sign it */
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(
            milikeyAddress,
            Milikey.abi,
            signer,
        )

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

    const handleSubmit = async item => {
        let data = new FormData()

        data.append('item_id', item.id)

        await axios
            .post(`http://localhost:8000/api/transactions`, data)
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
                    Staff
                </h2>
            }>
            <Head>
                <title>Staff</title>
            </Head>

            {loading ? (
                <div className="flex items-center justify-center h-screen mx-auto">
                    <div className={styles.spinner}></div>
                </div>
            ) : (
                <div className="items-center justify-center h-screen px-32 m-32 rid grid-rows-2">
                    <div className="flex pb-24">
                        <Input
                            placeholder="Enter item id"
                            className="p-4 mt-8 border rounded"
                            onChange={e =>
                                updateFormInput({
                                    ...formInput,
                                    item_id: e.target.value,
                                })
                            }
                        />
                        <button
                            onClick={loadNFTs}
                            className="pt-8 pl-12 primary">
                            Verify Now
                        </button>
                    </div>
                    <div>
                        {exist == true ? (
                            <>
                                {nfts.map((nft, i) => (
                                    <div
                                        key={i}
                                        className="overflow-hidden border shadow rounded-2xl">
                                        <div className="">
                                            <p className="text-gray-400">
                                                {nft.description}
                                            </p>
                                        </div>
                                        <div className="p-4 bg-black">
                                            <p className="text-4xl font-semibold text-white">
                                                {nft.tokenId}
                                            </p>
                                            <h1 className="text-3xl text-white">
                                                Authentic!
                                            </h1>
                                            <button className="w-full px-12 py-2 mt-4 font-bold text-black bg-lime-300 rounded-md">
                                                View
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </>
                        ) : (
                            <>
                                <h1 className="pt-12 text-5xl font-bold">
                                    Not Authentic!
                                </h1>
                            </>
                        )}
                    </div>
                </div>
            )}
        </AppLayout>
    )
}

export default Item
