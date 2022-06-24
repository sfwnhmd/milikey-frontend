import ApplicationLogo from '@/components/ApplicationLogo'
import Center from '@/components/Center'
import AuthSessionStatus from '@/components/AuthSessionStatus'
import AuthValidationErrors from '@/components/AuthValidationErrors'
import Button from '@/components/PrimaryBtn/PrimaryButton'
import GuestLayout from '@/components/Layouts/GuestLayout'
import Input from '@/components/Input/Input'
import Label from '@/components/Label'
import Link from 'next/link'
import logo from '../../../public/images/milikey_icon.svg'
import Image from 'next/image'
import { useAuth } from '@/hooks/auth'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

const Login = () => {
    const router = useRouter()

    const { login } = useAuth({
        middleware: 'guest',
        redirectIfAuthenticated: '/dashboard',
    })

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [errors, setErrors] = useState([])
    const [status, setStatus] = useState(null)

    useEffect(() => {
        if (router.query.reset?.length > 0 && errors.length === 0) {
            setStatus(atob(router.query.reset))
        } else {
            setStatus(null)
        }
    })

    const submitForm = async event => {
        event.preventDefault()

        login({ email, password, setErrors, setStatus })
    }

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

                {/* Session Status */}
                <AuthSessionStatus className="mb-4" status={status} />

                {/* Validation Errors */}
                <AuthValidationErrors className="mb-4" errors={errors} />

                <form onSubmit={submitForm}>
                <div className='pb-4'>
                    {/* Email Address */}
                    <div>
                        <Label htmlFor="email">Email</Label>

                        <Input
                            id="email"
                            type="email"
                            value={email}
                            className="block w-full mt-1"
                            onChange={event => setEmail(event.target.value)}
                            required
                            autoFocus
                        />
                    </div>

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
                            autoComplete="current-password"
                        />
                    </div>
                </div>
                    <div className="flex items-center justify-end mt-4">
                        <Button className="ml-3">Login</Button>
                    </div>
                </form>
                {/* Navigate to registe */}
                <div className='justify-center pt-6 text-center'>
                <p className='text-sm'>Dont have an account?
                <Link href="/register">
                    <a className="ml-2 text-sm font-bold text-gray-700 underline">
                        Register now
                    </a>
                </Link>
                </p>
                </div>
            </Center>
        </GuestLayout>
    )
}

export default Login
