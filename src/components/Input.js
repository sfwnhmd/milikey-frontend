const Input = ({ disabled = false, className, ...props }) => (
    <input
        disabled={disabled}
        className={`${className} rounded-md bg-gray-50 border-gray-100 font-bold text-gray-600 focus:border-gray-300 focus:ring focus:ring-gray-200 focus:ring-opacity-50`}
        {...props}
    />
)

export default Input
