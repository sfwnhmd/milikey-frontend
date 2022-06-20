import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import axios from '@/lib/axios'

function Items() {
  const router = useRouter()
  const { id } = router.query

  console.log(id)
  /** State to show list of products inserted */
  const [items, setItems] = useState([])
  const [prodName, setProdName] = useState('')
  const [prodDesc, setProdDesc] = useState('')
  const [prodQty, setProdQty] = useState('')

  
  /** Function to get product details based on id */
  const getProduct = async id => {
    try{
      const { data } = await axios.get(`http://localhost:8000/api/products/${id}`, {
        params: {
          status: 'test'
        }
      })
      
      const product = data.data[1]

      const item = data.data[0]

      console.table(item)

      setItems(item)

      setProdName(product.prod_name)
      setProdDesc(product.prod_desc)
      setProdQty(product.prodQty)
    } catch(error) {
      console.log(error)
    }
  }
  useEffect(() => {
    getProduct(id)
  }, [])

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
    </div>
    ))}
    </>
  )
}

export default Items