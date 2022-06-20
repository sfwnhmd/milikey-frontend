import React, { useEffect, useRef, useState } from 'react'

import Input from '@/components/Input'
import Textarea from '@/components/Textarea'
import Label from '@/components/Label'
import Button from '@/components/Button'
import Center from '@/components/Center'

import { Formik, Form, useFormik } from 'formik'

import { useAuth } from '@/hooks/auth'

import axios from '@/lib/axios'

/** Get handleAddProduct object to immedietly put 
 * the newly inserted data into the table */
const Forms = ({ handleAddProduct, selectProducts }) => {

  /** Fetch the user information 
   * + user - fetch data from api
   * + getUserObj - stores the user data
   * + getUserId - store the user id
  */
  const { user } = useAuth({ middleware: 'auth' })
  let getUserObj = {...user}
  let getUserId = getUserObj.id

  console.log(selectProducts)
  
  /** State for image preview */
  const [images, setImages] = useState([])
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
  
  const [authUser, setAuthUser] = useState([])
  useEffect(() => {
    setAuthUser(user.id)
  },[])
  const getProduct = async (selectProducts) => {
    try{
      const { data } = await axios.get(`http://localhost:8000/api/products/${selectProducts}`, {
        /** Declare Content-Type in header 
         * as working with uploaded file/image 
        */
        headers: {
          "Content-Type": "multipart/form-data"
        },
      })

      console.table(data)
      //setAddProduct(true)
      const product = data.data

      console.table('dwqdqwdqw',product)

      const formik = useFormik()

      formik.setFieldValue("prod_name", "asdasdasda")
      formik.setFieldValue("prod_desc", product.prod_desc)
      formik.setFieldValue("prod_quantity", product.prod_quantity)
      formik.setFieldValue("user_id", product.user_id)
      formik.setFieldValue("prod_image", product.prod_image)
      formik.setFieldValue("prod_id", product.prod_id)

    } catch(error) {
      console.log(error)
    }
}
 
  return (
    <Center>

      { /** Formik */ }
      <Formik

          /** Initiarte the values */ 
          initialValues= {{
            prod_name: '',
            prod_desc: '',
            prod_quantity: 0,
            user_id: getUserId,
            prod_image: null,
          }}

          enableReinitialize={true}
          
          /** Function Handle Submit */ 
          onSubmit={ async (values, resetForm) => {
            
            /** Declare FormData() */
            let data = new FormData();
            
            /** Put all the passing values in an array */
            data.append('prod_name', values.prod_name);
            data.append('prod_desc', values.prod_desc);
            data.append('prod_quantity', values.prod_quantity);
            data.append('user_id', values.user_id);
            data.append('prod_image', values.prod_image);

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
              });
            })
            .catch((err) => {
              console.log(err);
            });
          }}
          
          /** Function to get product details based on id */
>

      { /** Async Function with parameter: formik */ }
      {(formik) => (      

        <Form>
          { /** Preview Image Component */ }
          {imageURLs.map((imageSrc, idx) => (
            <div className='justify-center flex mx-auto'>
              <img key={idx} width="240" height="240" className='rounded-2xl' src={imageSrc} />
            </div>
          ))}

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
            value={formik.values.prod_image}
            className="block mt-1 w-full file:mr-4 file:py-2 file:px-4
                       file:rounded-full file:border-0
                       file:text-sm file:font-semibold
                     file:bg-violet-50 file:text-violet-700
                     hover:file:bg-violet-100"
             onChange={(event) => {
               formik.setFieldValue("prod_image", event.target.files[0]);
               onImageChange(event);
              }}
         />
         </div>

         { /** Insert Form Button */ }
         <div className="flex items-center justify-end mt-4">
            <Button className="ml-3" type='submit'>Insert</Button>
         </div>
       </Form>
      )}
    </Formik>
    </Center>
  )
}

export default Forms