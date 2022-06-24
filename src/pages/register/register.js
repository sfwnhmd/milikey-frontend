import Center from '@/components/Center'
import AuthValidationErrors from '@/components/AuthValidationErrors'
import Button from '@/components/PrimaryBtn/PrimaryButton'
import GuestLayout from '@/components/Layouts/GuestLayout'
import Input from '@/components/Input/Input'
import Select from '@/components/Select/Select'
import Label from '@/components/Label'
import Link from 'next/link'
import logo from '../../../public/images/milikey_icon.svg'
import Image from 'next/image'
import { useAuth } from '@/hooks/auth'
import { useEffect, useState } from 'react'

const Register = () => {
    const { register } = useAuth({
        middleware: 'guest',
        redirectIfAuthenticated: '/dashboard',
    })

    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [passwordConfirmation, setPasswordConfirmation] = useState('')
    const [role, setRole] = useState('')
    const [errors, setErrors] = useState([])
    const [val, setVal] = useState('');
    const states = [
        'Perlis',
        'Kedah',
        'Pulau Pinang',
        'Perak',
        'Pahang',
        'Terengganu',
        'Kelantan',
        'Selangor',
        'Kuala Lumpur',
        'Putrajaya',
        'Negeri Sembilan',
        'Melaka',
        'Johor',
        'Labuan',
        'Sabah',
        'Sarawak'
    ]

    const submitForm = event => {
        event.preventDefault()

        register({ name, email, password, password_confirmation: passwordConfirmation, role, setErrors })
    }

    useEffect(() => {
        console.log(role)
    },[setRole])

    return (
        <GuestLayout>
            <Center
                logo={
                    <Link href="/">
                        <a>
                            <Image
                                src={logo}
                                width={120}
                                height={120}
                            />
                        </a>
                    </Link>
                }>
                {/* Validation Errors */}
                <AuthValidationErrors className="mb-4" errors={errors} />

                <form onSubmit={submitForm}>
                <div className='pb-4'>
                    {/* Role */}
                    <div className="mt-4">
                        <Label htmlFor="role">Register as: </Label>
                        <ul class="grid grid-cols-2 gap-x-5 m-4 mx-auto justify-center">
                        <li className="relative">
                        <Input
                            id="user"
                            value="user"
                            type="radio"
                            name="role"
                            className="sr-only peer"
                            required
                            onClick={event => 
                                setRole(event.target.value)
                            }
                        />
                        <Label className="flex justify-center p-5 font-bold bg-white border border-gray-200 cursor-pointer rounded-xl focus:outline-none hover:bg-gray-50 peer-checked:ring-purple-500 peer-checked:ring-2 peer-checked:bg-purple-50 text-md peer-checked:border-transparent" for="user">Consumer</Label>
                        </li>
                        <li className="relative">
                        <Input
                            id="admin"
                            value="admin"
                            type="radio"
                            name="role"
                            required
                            className="sr-only peer"
                            onClick={event => 
                                setRole(event.target.value)
                            }
                        />
                        <Label className="flex justify-center p-5 font-bold bg-white border border-gray-200 cursor-pointer rounded-xl focus:outline-none hover:bg-gray-50 peer-checked:ring-purple-500 peer-checked:ring-2 peer-checked:bg-purple-50 text-md peer-checked:border-transparent" for="admin">Merchant</Label>
                        </li>
                        </ul>
                    </div>

                    {/* Name */}
                    <div>
                        {role == 'user' ? 
                        <Label htmlFor="name">Name</Label>
                        :
                        <Label htmlFor="name">Merchant Name</Label>
                        }

                        <Input
                            id="name"
                            type="text"
                            value={name}
                            className="block w-full mt-1"
                            onChange={event => setName(event.target.value)}
                            required
                            autoFocus
                        />
                    </div>

                    {/* Email Address */}
                    <div className="mt-4">
                        {role == 'user' ? 
                        <Label htmlFor="name">Email</Label>
                        :
                        <Label htmlFor="name">Merchant Email</Label>
                        }

                        <Input
                            id="email"
                            type="email"
                            value={email}
                            className="block w-full mt-1"
                            onChange={event => setEmail(event.target.value)}
                            required
                        />
                    </div>
                    
                    <div className='grid grid-cols-2 gap-6'>
                    {/* Password */}
                    <div className="mt-4">
                        <Label htmlFor="password">Password</Label>

                        <Input
                            id="password"
                            type="password"
                            value={password}
                            className="block w-full mt-1"
                            onChange={event => setPassword(event.target.value)}
                            required
                            autoComplete="new-password"
                        />
                    </div>

                    {/* Confirm Password */}
                    <div className="mt-4">
                        <Label htmlFor="passwordConfirmation">
                            Confirm Password
                        </Label>

                        <Input
                            id="passwordConfirmation"
                            type="password"
                            value={passwordConfirmation}
                            className="block w-full mt-1"
                            onChange={event =>
                                setPasswordConfirmation(event.target.value)
                            }
                            required
                        />
                    </div>
                    </div>

                    {role == 'admin' ? 
                        <>
                        <div className='mt-4'>
                            <Label htmlFor="ssm">
                                SSM Number
                            </Label>
                            <Input
                                id="ssm"
                                type="text"
                                className="block w-full mt-1"
                            />
                        </div>
                        <div className='mt-4'>
                            <Label htmlFor="address">
                                Address
                            </Label>
                            <Input
                                id="address"
                                type="text"
                                className="block w-full mt-1"
                            />
                        </div>
                        <div className='mt-4 grid grid-cols-3 gap-6'>
                            <div>
                                <Label htmlFor="city">
                                    City
                                </Label>
                                <Input
                                    id="city"
                                    type="text"
                                    className="block w-full mt-1"
                                />
                            </div>
                            <div>
                                <Label htmlFor="city">
                                    Postcode
                                </Label>
                                <Input
                                    id="city"
                                    type="text"
                                    pattern="[0-9]*"
                                    value={val}
                                    className="block w-full mt-1"
                                    onChange={(e) =>
                                        setVal((v) => (e.target.validity.valid ? e.target.value : v))
                                    }
                                />
                            </div>
                            <div>
                                <Label htmlFor="city">
                                    State
                                </Label>
                                <Select
                                    id="city"
                                    type="select"
                                    className="block w-full mt-1"
                                >
                                <option
                                    id=""
                                    name="state"
                                    value={""}
                                    selected
                                    disabled
                                >
                                    State
                                </option>
                                {states.map((state) => 
                                <option
                                    id={state}
                                    name="state"
                                    value={state}
                                >
                                    {state}
                                </option>
                                )}
                                </Select>
                            </div>
                        </div>
                        </>
                    :    
                        <></>
                    }

                </div>
                    <div className="flex items-center justify-end mt-4">
                        <Button className="ml-4">Register</Button>
                    </div>
                </form>
                {/* Navigate to registe */}
                <div className='justify-center pt-6 text-center'>
                <p className='text-sm'>Already have an account?
                <Link href="/login">
                    <a className="ml-2 text-sm font-bold text-gray-700 underline">
                        Login now
                    </a>
                </Link>
                </p>
                </div>
            </Center>
        </GuestLayout>
    )
}

export default Register
