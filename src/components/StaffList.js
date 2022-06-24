import React from 'react'
import Button from './PrimaryBtn/PrimaryButton'
import { useRouter } from 'next/router'

/** Function received staffs[], getStaff, setSelectStaffs, handleDeleteStaffs */
function List({
    staffs = [],
    getStaff,
    setSelectStaffs,
    handleDeleteStaffs,
}) {
    /** Using router to pass value */
    const router = useRouter()

    /**
     * Funtion to handle the view for the items
     * Received id from the staffs
     */
    const handleViewStaffs = async id => {
        router.push(`/items?id=${id}`)
    }

    return (
        <>
            {staffs.map(staff => (
                <div className='p-6 grid grid-cols-3' key={staff.id}>
                    <div>
                    <img
                        className='rounded-3xl w-32 pb-2'
                        src={`http://localhost:8000/storage/images/${staff.profile_photo}`}
                    />
                    </div>
                    <div className='pt-10'>
                        <p className='font-bold text-xl'>{staff.name}</p>
                        <p>{staff.email}</p>
                    </div>
                    
                    <div className='pt-10 grid grid-cols-2 gap-4 h-2'>
                    <Button
                        onClick={() => {
                            getStaff(staff.id)
                            setSelectStaffs(staff.id)
                        }}>
                        Edit
                    </Button>
                    <Button
                        onClick={() => {
                            handleDeleteStaffs(staff.id)
                        }}>
                        Delete
                    </Button>
                    </div>
                </div>
            ))}
        </>
    )
}

export default List
