import React from 'react'
import Button from './PrimaryBtn/PrimaryButton'
import { useRouter } from 'next/router'

/** Function received products[], getProduct, setSelectProducts, handleDeleteProducts */
function List({
    products = [],
    getProduct,
    setSelectProducts,
    handleDeleteProducts,
}) {
    /** Using router to pass value */
    const router = useRouter()

    /**
     * Funtion to handle the view for the items
     * Received id from the products
     */
    const handleViewItems = async id => {
        router.push(`/items?id=${id}`)
    }

    return (
        <>
            {products.map(product => (
                <div className='p-6 gird grid-cols-2' key={product.id}>
                    <div className='grid grid-cols-2'>
                    <div>
                    <p className='font-black text-4xl pb-6'>{product.prod_name}</p>
                    <p className='text-xl pb-6'>{product.prod_desc}</p>
                    </div>
                    <img
                        className='rounded-2xl w-72'
                        src={`http://localhost:8000/storage/images/${product.prod_image}`}
                    />
                    </div>
                    <div className='grid grid-cols-3 gap-4 p-6'>
                    <Button
                        onClick={() => {
                            getProduct(product.id)
                            setSelectProducts(product.id)
                        }}>
                        Edit
                    </Button>
                    <Button
                        onClick={() => {
                            handleDeleteProducts(product.id)
                        }}>
                        Delete
                    </Button>
                    <Button
                        onClick={() => {
                            handleViewItems(product.id)
                        }}>
                        View Items
                    </Button>
                    </div>
                </div>
            ))}
        </>
    )
}

export default List
