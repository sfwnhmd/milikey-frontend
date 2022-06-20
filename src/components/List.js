import React, { useState } from 'react'
import Button from './Button'
import { useRouter } from 'next/router'

function List({products = [], getProduct, setSelectProducts, handleDeleteProducts}) {

  const router = useRouter()

  const handleViewItems = async id => {
    router.push(`/items?id=${id}`)
  }

  return (
    <>
      {products.map(product => (
        <div key={product.id}>
        <p>{product.prod_name}</p>
        <p>{product.prod_desc}</p>
        <img src={`http://localhost:8000/storage/images/${product.prod_image}`} />
        <Button
          onClick={() => {
            getProduct(product.id)
            setSelectProducts(product.id)
          }}
        >
          Edit
        </Button>
        <Button
          onClick={() => {
            handleDeleteProducts(product.id)
          }}
        >
          Delete
        </Button>
        <Button
          onClick={() => {
            handleViewItems(product.id)
          }}
        >
          View Items
        </Button>
      </div>
      ))}
    </>
  )
}

export default List