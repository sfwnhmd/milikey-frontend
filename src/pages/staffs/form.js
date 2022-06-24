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

/** Get handleAddStaff object to immedietly put
 * the newly inserted data into the table */
const Forms = ({
    handleAddStaff,
    selectStaffs,
    setSelectStaffs,
    handleUpdateStaffs,
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
            name: '',
            email: '',
            eth_address: '',
            role: '',
            profile_photo: null,
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
        data.append('name', values.name)
        data.append('email', values.email)
        data.append('eth_address', values.eth_address)
        data.append('role', values.role)
        data.append('profile_photo', values.profile_photo)

        /** data2 - use for update staffs data */
        let data2 = new FormData()

        /** Put all the passing values in an array */
        data2.append('name', values.name)
        data2.append('email', values.email)
        data2.append('eth_address', values.eth_address)
        data2.append('role', values.role)
        data2.append('profile_photo', values.profile_photo)
        /** Need to send type of method bcs using multipart/form-data */
        data2.append('_method', 'put')

        /** IF no there is selected staffs == UPDATE */
        if (selectStaffs != '') {

            /** 
              * POST the data 
              * Not using the PUT bcs not work with multipart/form-data 
              */
            await axios
                .post(
                    `http://localhost:8000/api/staffs/${selectStaffs}`,
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

                    /** Pass data for added staff */
                    handleUpdateStaffs({
                        staff: response.data.data,
                    })

                    /** Clear the selected staffs after done update */
                    setSelectStaffs('')

                    /** Reset the form */
                    resetForm()
                })
                .catch(err => {
                    console.log(err)
                })
        } else {
            /** POST the data */
            await axios
                .post('http://localhost:8000/api/staffs', data, {
                    /** Declare Content-Type in header
                     * as working with uploaded file/image
                     */
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                })
                .then(response => {
                    console.log(response)

                    /** Pass data for added staff */
                    handleAddStaff({
                        staff: response.data.data,
                    })

                    /** Reset the form */
                    resetForm()
                })
                .catch(err => {
                    console.log(err)
                })
        }
    }

    /** Get the staffs information for selected staffs to be update */ 
    useEffect(() => {
        getStaff()
    }, [selectStaffs])

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

    /** Function to get selected staff information and set the FORMIK value */
    const getStaff = async () => {
        try {
            const { data } = await axios.get(
                `http://localhost:8000/api/staffs/${selectStaffs}`,
            )
            //setAddStaff(true)
            const staff = data.data
            console.log(staff.name)

            /** Using setFieldValue to set the value */
            formik.setFieldValue('name', staff.name)
            formik.setFieldValue('email', staff.email)
            formik.setFieldValue('eth_address', staff.eth_address)
            formik.setFieldValue('role', staff.role)
            formik.setFieldValue('profile_photo', staff.profile_photo)
            formik.setFieldValue('id', staff.id)

            /** Put the staffs image from db to image preview */
            setEditImages(
                `http://localhost:8000/storage/images/${staff.profile_photo}`,
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

                {/** Staff Name
                 * setFieldValue - set value base from input
                 */}
                <div>
                    <Label htmlFor="Staff Name">Name</Label>
                    <Input
                        id="name"
                        name="name"
                        type="text"
                        className="block w-full mt-1"
                        autoFocus
                        required
                        value={formik.values.name}
                        onChange={event => {
                            formik.setFieldValue(
                                'name',
                                event.target.value,
                            )
                        }}
                    />
                </div>

                {/** Staff ETH Address
                 * setFieldValue - set value base from input
                 */}
                <div className="mt-4">
                    <Label htmlFor="Staff Name">ETH Address</Label>
                    <Input
                        id="name"
                        name="name"
                        type="text"
                        className="block w-full mt-1"
                        autoFocus
                        required
                        value={formik.values.eth_address}
                        onChange={event => {
                            formik.setFieldValue(
                                'eth_address',
                                event.target.value,
                            )
                        }}
                    />
                </div>

                {/** Staff Email
                 * setFieldValue - set value base from input
                 */}
                <div className="mt-4">
                    <Label htmlFor="Staff Decription">Email</Label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        className="block w-full mt-1"
                        autoFocus
                        required
                        value={formik.values.email}
                        onChange={event => {
                            formik.setFieldValue(
                                'email',
                                event.target.value,
                            )
                        }}
                    />
                </div>

                {/** Staff Image
                 * setFieldValue - set value base from input
                 */}
                <div className="mt-4">
                    <Label htmlFor="Profile Photo">Profile Photo</Label>
                    <Input
                        id="profile_photo"
                        name="profile_photo"
                        type="file"
                        accept="image/*"
                        values={formik.values.profile_photo}
                        className="block w-full mt-1 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                        onChange={event => {
                            formik.setFieldValue(
                                'profile_photo',
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
                        {selectStaffs != '' ? 'Update' : 'Insert'}
                    </Button>
                </div>
            </form>
        </Center>
    )
}

export default Forms
