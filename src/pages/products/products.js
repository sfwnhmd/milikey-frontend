import { useState, useEffect } from 'react'

import AppLayout from '@/components/Layouts/AppLayout'
import Head from 'next/head'
import BigButton from '@/components/BigButton'
import Center from '@/components/Center'
import List from '@/components/List'

import { useAuth } from '@/hooks/auth'

import axios from '@/lib/axios'

import Form from './form'

const ProductsPage = () => {

    /** Fetch the user information
     * + user - fetch data from api
     */
    const { user } = useAuth({ middleware: 'auth' })

    /** State addProduct - use for triggering add product form */
    const [addProduct, setAddProduct] = useState(false)

    /** State to show list of products inserted */
    const [products, setProducts] = useState([])

    const [selectProducts, setSelectProducts] = useState('')
    /** State to show loading element while fetching the data */
    const [loading, setLoading] = useState(false)

    /** State tp show error for axios */
    const [error, setError] = useState(null)

    /** Function set true after user click the add product button */
    const addingProd = () => {
        setAddProduct(true)
    }

    /** Function to show all the added produtcs immidietely with the previous product to a state */
    const handleAddProduct = ({ product }) => {
        setProducts(prev => [...prev, product])
        setLoading(true)
        setTimeout(() => {
            setLoading(false)
        }, 1000)
    }

    /**
     * Function to update the product information
     * Received product array
     */
    const handleUpdateProducts = ({ product }) => {
        const updateProducts = products.map(item =>
            item.id === product.id ? product : item,
        )
        setProducts(updateProducts)
        setLoading(true)
        setTimeout(() => {
            setLoading(false)
        }, 1000)
    }

    /**
     * Function to delete selected product
     * Received id from the List
     */
    const handleDeleteProducts = async id => {
        /** Alert to ask the user before deleting a product */
        const confirmDel = confirm('Are you sure?')

        if (confirmDel) {
            await axios.delete(`http://localhost:8000/api/products/${id}`)
            const filteredProducts = products.filter(item => item.id !== id)
            setProducts(filteredProducts)
        }
    }

    /** Function to get product details based on id */
    const getProduct = async id => {
        try {
            setSelectProducts(id)
            const { data } = await axios.get(
                `http://localhost:8000/api/products/${id}`,
            )
            setAddProduct(true)
            console.table(data)
        } catch (error) {
            console.log(error)
        }
    }

    /** Function to show all the added produtcs after refresh */
    const fetchProducts = async () => {
        try {
            setLoading(true)
            const { data } = await axios.get(
                'http://localhost:8000/api/products',
            )
            setProducts(data.data)
            console.log(data.data)
        } catch (error) {
            setError(error.message)
        } finally {
            setTimeout(() => {
                setLoading(false)
            }, 3000)
        }
    }

    /** Function to close the form after inserted a product */
    useEffect(() => {
        setAddProduct(false)
    }, [products])

    /** Function to call the fetchProducts() - list all the inserted products from db */
    useEffect(() => {
        fetchProducts()
        console.log(products)
    }, [])

    return (
        <AppLayout
            /** Set the header */
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Products
                </h2>
            }>
            <Head>
                <title>Products</title>
            </Head>

            <div className="flex-row hidden h-screen overflow-hidden max-w-screen md:flex">
                {/** Data table */}
                <div className="flex flex-col w-4/6 overflow-y-auto bg-gray-100 align-center">
                    <div className="py-12">
                        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                            <div className="bg-white shadow-sm sm:rounded-lg">
                                <div className="p-6 bg-white border-b border-gray-200">
                                    {loading ? (
                                        'Loading ...'
                                    ) : (
                                        <List
                                            products={products}
                                            getProduct={getProduct}
                                            setSelectProducts={
                                                setSelectProducts
                                            }
                                            handleDeleteProducts={
                                                handleDeleteProducts
                                            }
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/** Data table */}
                <div className="flex flex-col w-2/6 overflow-visible bg-white align-center">
                    {addProduct == false ? (
                        <Center>
                            <div className='mx-auto flex justify-center'>
                            <BigButton onClick={addingProd}>
                                    <h1 className="text-base font-bold">
                                        Create Product
                                    </h1>
                            </BigButton>
                            </div>
                        </Center>
                    ) : (
                        <Form
                            handleAddProduct={handleAddProduct}
                            handleUpdateProducts={handleUpdateProducts}
                            setSelectProducts={setSelectProducts}
                            selectProducts={selectProducts}
                        />
                    )}
                </div>
            </div>
        </AppLayout>
    )
}

export default ProductsPage
