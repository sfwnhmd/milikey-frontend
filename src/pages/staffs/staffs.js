import { useState, useEffect } from 'react'

import AppLayout from '@/components/Layouts/AppLayout'
import Head from 'next/head'
import BigButton from '@/components/BigButton'
import Center from '@/components/Center'
import List from '@/components/StaffList'

import { useAuth } from '@/hooks/auth'

import axios from '@/lib/axios'

import Form from './form'

const StaffPage = () => {

    /** Fetch the user information
     * + user - fetch data from api
     */
    const { user } = useAuth({ middleware: 'auth' })

    /** State addProduct - use for triggering add product form */
    const [addStaff, setAddStaff] = useState(false)

    /** State to show list of staffs inserted */
    const [staffs, setStaffs] = useState([])

    const [selectStaffs, setSelectStaffs] = useState('')
    /** State to show loading element while fetching the data */
    const [loading, setLoading] = useState(false)

    /** State tp show error for axios */
    const [error, setError] = useState(null)

    /** Function set true after user click the add product button */
    const addingStaff = () => {
        setAddStaff(true)
    }

    /** Function to show all the added produtcs immidietely with the previous product to a state */
    const handleAddStaff = ({ staff }) => {
        setStaffs(prev => [...prev, staff])
        setLoading(true)
        setTimeout(() => {
            setLoading(false)
        }, 1000)
    }

    /**
     * Function to update the product information
     * Received product array
     */
    const handleUpdateStaffs = ({ staff }) => {
        const updateStaffs = staffs.map(item =>
            item.id === staff.id ? staff : item,
        )
        setStaffs(updateStaffs)
        setLoading(true)
        setTimeout(() => {
            setLoading(false)
        }, 1000)
    }

    /**
     * Function to delete selected product
     * Received id from the List
     */
    const handleDeleteStaffs = async id => {
        /** Alert to ask the user before deleting a product */
        const confirmDel = confirm('Are you sure?')

        if (confirmDel) {
            await axios.delete(`http://localhost:8000/api/staffs/${id}`)
            const filteredStaffs = staffs.filter(item => item.id !== id)
            setStaffs(filteredStaffs)
        }
    }

    /** Function to get product details based on id */
    const getStaff = async id => {
        try {
            setSelectStaffs(id)
            const { data } = await axios.get(
                `http://localhost:8000/api/staffs/${id}`,
            )
            setAddStaff(true)
            console.table(data)
        } catch (error) {
            console.log(error)
        }
    }

    /** Function to show all the added produtcs after refresh */
    const fetchStaffs = async () => {
        try {
            setLoading(true)
            const { data } = await axios.get(
                'http://localhost:8000/api/staffs',
            )
            setStaffs(data.data)
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
        setAddStaff(false)
    }, [staffs])

    /** Function to call the fetchProducts() - list all the inserted staffs from db */
    useEffect(() => {
        fetchStaffs()
        console.log(staffs)
    }, [])

    return (
        <AppLayout
            /** Set the header */
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Staff
                </h2>
            }>
            <Head>
                <title>Staff</title>
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
                                            staffs={staffs}
                                            getStaff={getStaff}
                                            setSelectStaffs={
                                                setSelectStaffs
                                            }
                                            handleDeleteStaffs={
                                                handleDeleteStaffs
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
                    {addStaff == false ? (
                        <Center>
                             <div className='mx-auto flex justify-center'>
                            <BigButton onClick={addingStaff}>
                                <div className="flex items-center space-x-3">
                                    <h1 className="text-base font-bold">
                                        Create Staff
                                    </h1>
                                </div>
                            </BigButton>
                            </div>
                        </Center>
                    ) : (
                        <Form
                            handleAddStaff={handleAddStaff}
                            handleUpdateStaffs={handleUpdateStaffs}
                            setSelectStaffs={setSelectStaffs}
                            selectStaffs={selectStaffs}
                        />
                    )}
                </div>
            </div>
        </AppLayout>
    )
}

export default StaffPage
