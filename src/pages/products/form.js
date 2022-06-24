import React, { useEffect, useState } from 'react'

import Input from '@/components/Input/Input'
import Textarea from '@/components/Textarea/Textarea'
import Label from '@/components/Label'
import Button from '@/components/PrimaryBtn/PrimaryButton'
import Center from '@/components/Center'

import { PhotographIcon } from '@heroicons/react/solid'

import { useFormik } from 'formik'

import { useAuth } from '@/hooks/auth'

import axios from '@/lib/axios'

/** Get handleAddProduct object to immedietly put
 * the newly inserted data into the table */
const Forms = ({
    handleAddProduct,
    selectProducts,
    setSelectProducts,
    handleUpdateProducts,
}) => {
    /** Fetch the user information
     * + user - fetch data from api
     * + getUserObj - stores the user data
     * + getUserId - store the user id
     */
    const { user } = useAuth({ middleware: 'auth' })
    let getUserObj = { ...user }
    let getUserId = getUserObj.id

    /** State for image preview */
    const [images, setImages] = useState([])
    const [editImages, setEditImages] = useState([])
    const [imageURLs, setImageURLs] = useState([])

    /** Preview uploaded image */
    useEffect(() => {
        if (images.length < 1) return
        const newImageUrls = []
        images.forEach(image => newImageUrls.push(URL.createObjectURL(image)))
        setImageURLs(newImageUrls)
    }, [images])

    /** Function to stiore the image to images state */
    function onImageChange(e) {
        setImages([...e.target.files])
    }

    /** Using FORMIK to handle form */
    const formik = useFormik({

        /** Initiate the values */
        initialValues: {
            prod_name: '',
            prod_desc: '',
            prod_quantity: 0,
            user_id: '',
            prod_image: null,
        },

        /** Handle submit with valiues */
        onSubmit: values => {
            handleSubmit(values)
        },
    })

    /** Function Handle Submit */
    const handleSubmit = async (values, resetForm) => {

        /** Using FormData() bcs need to work with upload image */

        /** data - use for add the new data */
        let data = new FormData()

        /** Put all the passing values in an array */
        data.append('prod_name', values.prod_name)
        data.append('prod_desc', values.prod_desc)
        data.append('prod_quantity', values.prod_quantity)
        data.append('user_id', values.user_id)
        data.append('prod_image', values.prod_image)

        /** data2 - use for update products data */
        let data2 = new FormData()

        /** Put all the passing values in an array */
        data2.append('prod_name', values.prod_name)
        data2.append('prod_desc', values.prod_desc)
        data2.append('prod_quantity', values.prod_quantity)
        data2.append('user_id', values.user_id)
        data2.append('prod_image', values.prod_image)
        /** Need to send type of method bcs using multipart/form-data */
        data2.append('_method', 'put')

        /** IF no there is selected products == UPDATE */
        if (selectProducts != '') {

            /** 
              * POST the data 
              * Not using the PUT bcs not work with multipart/form-data 
              */
            await axios
                .post(
                    `http://localhost:8000/api/products/${selectProducts}`,
                    data2,
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

                    /** Pass data for added product */
                    handleUpdateProducts({
                        product: response.data.data,
                    })

                    /** Clear the selected products after done update */
                    setSelectProducts('')

                    /** Reset the form */
                    resetForm()
                })
                .catch(err => {
                    console.log(err)
                })
        } else {
            /** POST the data */
            await axios
                .post('http://localhost:8000/api/products', data, {
                    /** Declare Content-Type in header
                     * as working with uploaded file/image
                     */
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                })
                .then(response => {
                    console.log(response)

                    /** Pass data for added product */
                    handleAddProduct({
                        product: response.data.data,
                    })

                    /** Reset the form */
                    resetForm()
                })
                .catch(err => {
                    console.log(err)
                })
        }
    }

    /** Get the products information for selected products to be update */ 
    useEffect(() => {
        getProduct()
    }, [selectProducts])

    /** Replace the image preview for updated image */
    const handleEditImage = () => {
        if (images != null) {
            setEditImages(null)
        }
    }

    useEffect(() => {
        if(editImages && editImages.length <= 46 ) {
            setEditImages(null)
        }
    }, [])

    /** Function to get selected product information and set the FORMIK value */
    const getProduct = async () => {
        try {
            const { data } = await axios.get(
                `http://localhost:8000/api/products/${selectProducts}`,
            )
            //setAddProduct(true)
            const product = data.data
            console.log('sini', data.data)

            /** Using setFieldValue to set the value */
            formik.setFieldValue('prod_name', product.prod_name)
            formik.setFieldValue('prod_desc', product.prod_desc)
            formik.setFieldValue('prod_quantity', product.prod_quantity)
            formik.setFieldValue('user_id', product.user_id)
            formik.setFieldValue('prod_image', product.prod_image)
            formik.setFieldValue('prod_id', product.id)

            /** Put the products image from db to image preview */
            setEditImages(
                `http://localhost:8000/storage/images/${product.prod_image}`,
            )
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <Center>
            <form onSubmit={formik.handleSubmit}>

                {/** Preview Image Component */}
                

                {editImages ? 
                    <div className="flex justify-center mx-auto">
                        <img
                            width="240"
                            height="240"
                            className="rounded-2xl"
                            src={editImages}
                            onError={(event) => event.target.style.display = 'none'}
                        />
                    </div>
                 :
                 imageURLs ?  
                 <div className="flex justify-center mx-auto">
                    {imageURLs.map((imageSrc, idx) => (
                        <img
                            key={idx}
                            width="240"
                            height="240"
                            className="rounded-2xl"
                            src={imageSrc}
                        /> ))}
                    </div>
                 : 
                 imageURLs != null  ?
                    <div className="flex justify-center mx-auto">
                        <PhotographIcon 
                        className="h-16 w-16 text-gray-200 mb-12"  
                        viewBox="0 0 24 24" 
                        />
                    </div>
                : <></>
                }

                {/** Product Name
                 * setFieldValue - set value base from input
                 */}
                <div>
                    <Label htmlFor="Product Name">Name</Label>
                    <Input
                        id="prod_name"
                        name="prod_name"
                        type="text"
                        className="block w-full mt-1"
                        autoFocus
                        required
                        value={formik.values.prod_name}
                        onChange={event => {
                            formik.setFieldValue(
                                'prod_name',
                                event.target.value,
                            )
                        }}
                    />
                </div>

                {/** Product Quantity
                 * setFieldValue - set value base from input
                 */}
                <div className="mt-4">
                    <Label htmlFor="Product Quantity">Quantity</Label>
                    <Input
                        id="prod_quantity"
                        name="prod_quantity"
                        type="number"
                        className="block w-full mt-1"
                        autoFocus
                        required
                        value={formik.values.prod_quantity}
                        onChange={event => {
                            formik.setFieldValue(
                                'prod_quantity',
                                event.target.value,
                            )
                        }}
                    />
                </div>

                {/** Product Description
                 * setFieldValue - set value base from input
                 */}
                <div className="mt-4">
                    <Label htmlFor="Product Decription">Description</Label>
                    <Textarea
                        id="prod_desc"
                        name="prod_desc"
                        type="textarea"
                        className="block w-full mt-1"
                        autoFocus
                        required
                        value={formik.values.prod_desc}
                        onChange={event => {
                            formik.setFieldValue(
                                'prod_desc',
                                event.target.value,
                            )
                        }}
                    />
                </div>

                {/** Product Image
                 * setFieldValue - set value base from input
                 */}
                <div className="mt-4">
                    <Label htmlFor="Product Image">Image</Label>
                    <Input
                        id="prod_image"
                        name="prod_image"
                        type="file"
                        accept="image/*"
                        values={formik.values.prod_image}
                        className="block w-full mt-1 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                        onChange={event => {
                            formik.setFieldValue(
                                'prod_image',
                                event.target.files[0],
                            )
                            onImageChange(event)
                            handleEditImage()
                        }}
                    />
                </div>

                {/** Insert Form Button */}
                <div className="flex items-center justify-end mt-4">
                    <Button className="ml-3" type="submit">
                        {selectProducts != '' ? 'Update' : 'Insert'}
                    </Button>
                </div>
            </form>
        </Center>
    )
}

export default Forms
