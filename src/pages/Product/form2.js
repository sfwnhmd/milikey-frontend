import Input from '@/components/Input'
import Textarea from '@/components/Textarea'
import Label from '@/components/Label'
import Button from '@/components/Button'
import Center from '@/components/Center'
import React, { useEffect, useState } from 'react'
import { useFormik } from 'formik'
import { useAuth } from '@/hooks/auth'
import axios from '@/lib/axios'

const Form = ({ handleAddProduct }) => {
  const { user } = useAuth({ middleware: 'auth' })

  const [authUser, setAuthUser] = useState([])

  let getUserObj = {...user}
  let getUserId = getUserObj.id

  useEffect(() => {
    setAuthUser(user.id)
  },[])

  const formik = useFormik({
    initialValues: {
      prod_name: '',
      prod_desc: '',
      prod_quantity: 0,
      user_id: getUserId,
      prod_image: null,
    },
    onSubmit: (values, { resetForm }) => {
      handleSubmit(values, resetForm)
    },
  })

  const handleSubmit = async (values, resetForm) => {
    try {
      const { data } = await axios.post(
        'http://localhost:8001/api/products', 
        values,
      )

     handleAddProduct({
        product: data.data,
      })

      resetForm()
    } catch(error) {
      console.log(error)
    }
  }

  return (
    <Center>
    <form onSubmit={formik.handleSubmit}>
      <div>
      {/* Email Address */}
      <div>
      <Label htmlFor="email">Name</Label>

      <Input
                            id="prod_name"
                            name="prod_name"
                            type="text"
                            className="block mt-1 w-full"
                            onChange={formik.handleChange}
                            value={formik.values.prod_name}
                            required
                            autoFocus
                            />
                    </div>


                     {/* Product Quantity */}
      <div>
      <Label htmlFor="email">Quantity</Label>

      <Input
                            id="prod_quantity"
                            name="prod_quantity"
                            type="number"
                            className="block mt-1 w-full"
                            onChange={formik.handleChange}
                            value={formik.values.prod_quantity}
                            required
                            autoFocus
                            />
                    </div>

                    {/* Password */}
                    <div className="mt-4">
                        <Label htmlFor="decription">Description</Label>

                        <Textarea
                            id="prod_desc"
                            name="prod_desc"
                            onChange={formik.handleChange}
                            value={formik.values.prod_desc}
                            type="textarea"
                            className="block mt-1 w-full"
                            required
                            />
                    </div>

                    {/* Image */}
                    <div className="mt-4">
                        <Label htmlFor="decription">Image</Label>

                        <Input
                            id="file"
                            name="file"
                            type="file"
                            className="block mt-1 w-full file:mr-4 file:py-2 file:px-4
                            file:rounded-full file:border-0
                            file:text-sm file:font-semibold
                            file:bg-violet-50 file:text-violet-700
                            hover:file:bg-violet-100"
                            onChange={(event) => {
                              setFeildValue("file", event.target.files[0])
                            }}
                            />
                    </div>

                    <div className="flex items-center justify-end mt-4">
                        <Button className="ml-3" type='submit'>Insert</Button>
                    </div>
</div>
                </form>

    </Center>
  )
}

export default Form