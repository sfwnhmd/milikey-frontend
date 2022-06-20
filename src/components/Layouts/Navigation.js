import ApplicationLogo from '@/components/ApplicationLogo'
import Dropdown from '@/components/Dropdown'
import Link from 'next/link'
import NavLink from '@/components/NavLink'
import ResponsiveNavLink, { ResponsiveNavButton } from '@/components/ResponsiveNavLink'
import { DropdownButton } from '@/components/DropdownLink'
import { useAuth } from '@/hooks/auth'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import logo from '../../../public/images/milikey_icon.svg'
import Image from 'next/image'
import { ethers } from 'ethers'
import truncateEthAddress from 'truncate-eth-address'
import Web3Modal from 'web3modal'

const Navigation = ({ user }) => {
    const router = useRouter()
    const { logout } = useAuth()

    const [open, setOpen] = useState(false)
    const [address, setAddress] = useState([])
    const [address2, setAddress2] = useState([])
    const [signer, setSigner] = useState([])

    let getUserObj = {...user}
    const getUserETH = String(getUserObj.eth_address)
            
    useEffect( () =>{
        checkIfWalletIsConnected();
      }, [])
    
      async function checkIfWalletIsConnected() {
        const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
        let accounts = await provider.send("eth_requestAccounts", []);
        let account = accounts[0];
        provider.on('accountsChanged', function (accounts) {
            account = accounts[0];
           // console.log(address); // Print new address
          });
          
          if(account.toUpperCase() == getUserETH.toUpperCase()){
          const signer = provider.getSigner();

          
          setSigner(signer)
          
          const address = await signer.getAddress();
          const address2 = await signer.getAddress();
          
          setAddress2(address)
          setAddress(truncateEthAddress(address))
          } else{
            alert('Wrong wallet! Please only use your registered wallet only.')
          }
        } 


      


      const isMetaMaskConnected = async () => {
        const accounts = await provider.listAccounts();
        return accounts.length > 0;
    }

    return (
        <nav className="fixed left-0 right-0 bg-white border-b border-gray-100">
            {/* Primary Navigation Menu */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        {/* Logo */}
                        <div className="flex-shrink-0 flex items-center">
                            <Link href="/dashboard">
                                <a>
                                <Image
                                    src={logo}
                                    width={50}
                                    height={50}
                                />
                                </a>
                            </Link>
                        </div>

                        {/* Navigation Links */}
                        <div className="hidden space-x-8 sm:-my-px sm:ml-10 sm:flex">
                            <NavLink
                                href="/dashboard"
                                active={router.pathname === '/dashboard'}>
                                Dashboard
                            </NavLink>
                            <NavLink
                                href="/products"
                                active={router.pathname === '/products'}>
                                Products
                            </NavLink>
                            <NavLink
                                href="/create"
                                active={router.pathname === '/create'}>
                                Create
                            </NavLink>
                        </div>
                    </div>


                    {/* Settings Dropdown */}
                    <div className="hidden sm:flex sm:items-center sm:ml-6">
                        <Dropdown
                            align="right"
                            width="48"
                            trigger={
                                <button className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 focus:outline-none transition duration-150 ease-in-out">
                                    <div>{user?.name}</div>

                                    <div className="ml-1">
                                        <svg
                                            className="fill-current h-4 w-4"
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 20 20">
                                            <path
                                                fillRule="evenodd"
                                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </div>
                                </button>
                            }>

                            {/* Authentication */}
                            {signer.length == 0 ? (
                            <DropdownButton onClick={checkIfWalletIsConnected}>
                                <p className='font-bold'>🦊 Connect Wallet</p>
                            </DropdownButton>
                            ):( 
                            <DropdownButton>
                                <p className='text-xs'>Your account</p>
                                <p className='font-bold'>{address}</p>
                            </DropdownButton>
                            )}       
                            <DropdownButton onClick={logout}>
                                Logout
                            </DropdownButton>
                        </Dropdown>
                    </div>

                    {/* Hamburger */}
                    <div className="-mr-2 flex items-center sm:hidden">
                        <button
                            onClick={() => setOpen(open => !open)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 focus:text-gray-500 transition duration-150 ease-in-out">
                            <svg
                                className="h-6 w-6"
                                stroke="currentColor"
                                fill="none"
                                viewBox="0 0 24 24">
                                {open ? (
                                    <path
                                        className="inline-flex"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                ) : (
                                    <path
                                        className="inline-flex"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Responsive Navigation Menu */}
            {open && (
                <div className="block sm:hidden">
                    <div className="pt-2 pb-3 space-y-1">
                        <ResponsiveNavLink
                            href="/dashboard"
                            active={router.pathname === '/dashboard'}>
                            Dashboard
                        </ResponsiveNavLink>
                    </div>

                    {/* Responsive Settings Options */}
                    <div className="pt-4 pb-1 border-t border-gray-200">
                        <div className="flex items-center px-4">
                            <div className="flex-shrink-0">
                                <svg
                                    className="h-10 w-10 fill-current text-gray-400"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                    />
                                </svg>
                            </div>

                            <div className="ml-3">
                                <div className="font-medium text-base text-gray-800">
                                    {user?.name}
                                </div>
                                <div className="font-medium text-sm text-gray-500">
                                    {user?.email}
                                </div>
                            </div>
                        </div>

                        <div className="mt-3 space-y-1">
                            {/* Authentication */}
                            <ResponsiveNavButton onClick={logout}>
                                Logout
                            </ResponsiveNavButton>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    )
}

export default Navigation
