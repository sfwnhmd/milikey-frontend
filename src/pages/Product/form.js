import React, { useEffect, useRef, useState } from 'react'

import Input from '@/components/Input'
import Textarea from '@/components/Textarea'
import Label from '@/components/Label'
import Button from '@/components/Button'
import Center from '@/components/Center'

import { useFormik } from 'formik'

import { useAuth } from '@/hooks/auth'

import axios from '@/lib/axios'
import { BlockForkEvent } from '@ethersproject/abstract-provider'

/** Get handleAddProduct object to immedietly put 
 * the newly inserted data into the table */
const Forms = ({ handleAddProduct, selectProducts, setSelectProducts, handleUpdateProducts}) => {

  /** Fetch the user information 
   * + user - fetch data from api
   * + getUserObj - stores the user data
   * + getUserId - store the user id
  */
  const { user } = useAuth({ middleware: 'auth' })
  let getUserObj = {...user}
  let getUserId = getUserObj.id
  
  /** State for image preview */
  const [images, setImages] = useState([])
  const [editImages, setEditImages] = useState([])
  const [imageURLs, setImageURLs] = useState([]);
  
  /** Preview uploaded image */
  useEffect(() => {
    if (images.length < 1) return;
    const newImageUrls = [];
    images.forEach((image) => newImageUrls.push(URL.createObjectURL(image)))
    setImageURLs(newImageUrls);
  }, [images])
  
  /** Function to stiore the image to images state */
  function onImageChange(e) {
    setImages([...e.target.files]);
  }
 
  const formik = useFormik({
    
      /** Initiate the values */ 
      initialValues: {
        prod_name: '',
        prod_desc: '',
        prod_quantity: 0,
        user_id: '',
        prod_image: null,
      },

      onSubmit: values => {
        handleSubmit(values)
      },
      
    })

    /** Function Handle Submit */ 
   const handleSubmit = async (values, resetForm) => {
      
      /** Declare FormData() */
      let data = new FormData();
      let data2 = new FormData();
      
      /** Put all the passing values in an array */
      data.append('prod_name', values.prod_name);
      data.append('prod_desc', values.prod_desc);
      data.append('prod_quantity', values.prod_quantity);
      data.append('user_id', values.user_id);
      data.append('prod_image', values.prod_image);

      data2.append('prod_name', values.prod_name);
      data2.append('prod_desc', values.prod_desc);
      data2.append('prod_quantity', values.prod_quantity);
      data2.append('user_id', values.user_id);
      data2.append('prod_image', values.prod_image);
      data2.append('_method', 'put');

      if(selectProducts != ''){

        /** POST the data */
        await axios.post(`http://localhost:8000/api/products/${selectProducts}`,
        data2, {
          /** Declare Content-Type in header 
           * as working with uploaded file/image 
           */
          headers: {
            "Content-Type": "multipart/form-data",
            method: "PUT",
          }
        }
        )
        .then((response) => {
          console.log(response);
        
          /** Pass data for added product */
          handleUpdateProducts({
            product: response.data.data,
          })
          setSelectProducts('')
          resetForm()
        })
        .catch((err) => {
          console.log(err);
        });
      } else {

      /** POST the data */
      await axios.post('http://localhost:8000/api/products',
      data, {
        /** Declare Content-Type in header 
         * as working with uploaded file/image 
         */
        headers: {
          "Content-Type": "multipart/form-data"
        },
      })
      .then((response) => {
        console.log(response);
        
        /** Pass data for added product */
        handleAddProduct({
          product: response.data.data,
        })
        resetForm()
      })
      .catch((err) => {
        console.log(err);
      });
    }
    }

    useEffect(() =>{
      getProduct()
    }, [selectProducts])

    const handleEditImage = () => {
      if(images != null){
        setEditImages(null)
      }
    } 

    const getProduct = async () => {
      try {
        const { data } = await axios.get(`http://localhost:8000/api/products/${selectProducts}`)
        //setAddProduct(true)
        const product = data.data

        console.table(product)

        formik.setFieldValue("prod_name", product.prod_name)
        formik.setFieldValue("prod_desc", product.prod_desc)
        formik.setFieldValue("prod_quantity", product.prod_quantity)
        formik.setFieldValue("user_id", product.user_id)
        formik.setFieldValue("prod_image", product.prod_image)
        formik.setFieldValue("prod_id", product.id)

        setEditImages(`http://localhost:8000/storage/images/${product.prod_image}`)


      } catch(error) {
        console.log(error)
      }
    }
 
  return (
    <Center>

      { /** Formik */ }

      { /** Async Function with parameter: formik */ }

        <form onSubmit={formik.handleSubmit}>
          { /** Preview Image Component */ }
          {imageURLs.map((imageSrc, idx) => (
            <div className='justify-center flex mx-auto'>
              <img key={idx} width="240" height="240" className='rounded-2xl' src={imageSrc} />
            </div>
          ))}

        {editImages != null ? (
            <div className='justify-center flex mx-auto'>
              <img width="240" height="240" className='rounded-2xl' src={editImages} />
            </div>
        ) : (
           <></>
        )
        }
        { 
          /** Product Name 
          * setFieldValue - set value base from input
          */ 
        } 
        <div>
          <Label htmlFor="Product Name">Name</Label>
          <Input
            id="prod_name"
            name="prod_name"
            type="text"
            className="block mt-1 w-full"
            autoFocus
            required
            value={formik.values.prod_name}
            onChange={(event) => {
              formik.setFieldValue("prod_name", event.target.value)
            }}
            />
        </div>

        { 
          /** Product Quantity
          * setFieldValue - set value base from input
          */ 
        } 
        <div className='mt-4'>
          <Label htmlFor="Product Quantity">Quantity</Label>
          <Input
            id="prod_quantity"
            name="prod_quantity"
            type="number"
            className="block mt-1 w-full"
            autoFocus
            required
            value={formik.values.prod_quantity}
            onChange={(event) => {
              formik.setFieldValue("prod_quantity", event.target.value)
            }}
        /> 
        </div>
        
        { 
          /** Product Description
          * setFieldValue - set value base from input
          */ 
        } 
        <div className="mt-4">
          <Label htmlFor="Product Decription">Description</Label>
          <Textarea
            id="prod_desc"
            name="prod_desc"
            type="textarea"
            className="block mt-1 w-full"
            autoFocus
            required
            value={formik.values.prod_desc}
            onChange={(event) => {
              formik.setFieldValue("prod_desc", event.target.value);
            }}
        />
        </div>

        { 
          /** Product Image
          * setFieldValue - set value base from input
          */ 
        } 
        <div className="mt-4">
          <Label htmlFor="Product Image">Image</Label>
          <Input
            id="prod_image"
            name="prod_image"
            type="file"
            accept="image/*"
            values={formik.values.prod_image}
            className="block mt-1 w-full file:mr-4 file:py-2 file:px-4
                       file:rounded-full file:border-0
                       file:text-sm file:font-semibold
                     file:bg-violet-50 file:text-violet-700
                     hover:file:bg-violet-100"
             onChange={(event) => {
               formik.setFieldValue("prod_image", event.target.files[0]);
               onImageChange(event); handleEditImage();
              }}
         />
         </div>

         { /** Insert Form Button */ }
         { console.log(selectProducts) }
         <div className="flex items-center justify-end mt-4">
            <Button className="ml-3" type='submit'>
              {selectProducts != '' ? 'Update' : 'Insert'}
            </Button>
         </div>
       </form>
    </Center>
  )
}

export default Forms