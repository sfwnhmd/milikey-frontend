import { useState, useEffect} from 'react'

import AppLayout from '@/components/Layouts/AppLayout'
import Head from 'next/head'
import Button from '@/components/Button'
import BigButton from '@/components/BigButton'
import Center from '@/components/Center'

import { useAuth } from '@/hooks/auth'

import axios from '@/lib/axios'

import Form from '../pages/Product/form'
import List from '@/components/List'

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

  const handleUpdateProducts = ({ product }) => {
    const updateProducts = products.map(
      item => item.id === product.id ? product : item,
    )
    setProducts(updateProducts)
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }

  const handleDeleteProducts = async id => {

    const confirmDel = confirm('Are you sure?');

    if (confirmDel) {
      await axios.delete(`http://localhost:8000/api/products/${id}`)
      const filteredProducts = products.filter(item => item.id !== id)
  
      setProducts(filteredProducts)
    }
  }

  /** Function to get product details based on id */
  const getProduct = async id => {
    try{
      setSelectProducts(id)
      const { data } = await axios.get(`http://localhost:8000/api/products/${id}`)
      setAddProduct(true)
      console.table(data)
    } catch(error) {
      console.log(error)
    }
  }

  /** Function to show all the added produtcs after refresh */  
  const fetchProducts = async () => {
    try {
      setLoading(true)
      const { data } = await axios.get('http://localhost:8000/api/products')
      setProducts(data.data)
      console.log(data.data)
    } catch(error) {
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
        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
          Products
        </h2>
      }
    >
    
    <Head>
      <title>Products</title>
    </Head>

    <div              
      className='h-screen flex-row overflow-hidden max-w-screen hidden md:flex'
    >
    
      {/** Data table */}
      <div
        className='flex w-4/6 flex-col overflow-y-auto align-center bg-gray-100'
      >
        <div className="py-12">
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div className="bg-white shadow-sm sm:rounded-lg">
              <div className="p-6 bg-white border-b border-gray-200">
              {loading ? "Loading ..." :
               <List 
                products={products} 
                getProduct={getProduct} 
                setSelectProducts={setSelectProducts}
                handleDeleteProducts={handleDeleteProducts}
                />
              }
              </div>
            </div>
          </div>
        </div>
      </div>
              
      {/** Data table */}
      <div
        className='flex w-2/6 flex-col overflow-visible align-center bg-white'
      >

      {addProduct == false ? (
        <Center>
          <p>Nothing here {user?.name}</p>
          <BigButton 
            onClick={addingProd}
          >
          <div className='flex items-center space-x-3'>
            <h1 className='text-base font-bold'>Create Product</h1>
          </div>
          <p className='text-left'>Click this button to create a product</p>
          </BigButton>
        </Center>
      ) : (
        <Form 
          handleAddProduct={handleAddProduct} 
          handleUpdateProducts={handleUpdateProducts}
          setSelectProducts={setSelectProducts} 
          selectProducts={selectProducts} />
      )}
    
      </div>
    </div>
    </AppLayout>
  )
}

export default ProductsPage