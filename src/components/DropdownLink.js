import Link from 'next/link'
import { Menu } from '@headlessui/react'

const DropdownLink = ({ children, ...props }) => (
    <Menu.Item>{({ active }) => (
        (<Link
            {...props}
            className={`w-full text-left block py-2 px-4 text-sm leading-5 text-gray-700 ${active ? 'bg-gray-100' : ''} focus:outline-none transition duration-150 ease-in-out`}>

            {children}

        </Link>)
    )}
    </Menu.Item>
)

export const DropdownButton = ({ children, ...props }) => (
    <Menu.Item>{({ active }) => (
        <button
            className={`w-full rounded-md text-left block px-6 py-2 text-sm leading-5 text-gray-700 ${active ? 'bg-gray-100' : ''} focus:outline-none transition duration-150 ease-in-out`}
            {...props}>
            {children}
        </button>
    )}
    </Menu.Item>
)

export default DropdownLink
