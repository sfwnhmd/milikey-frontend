const BigButton = ({ type = 'submit', className, ...props }) => (
    <button
        type={type}
        className={`${className} block group max-w-xs mx-auto rounded-lg py-6 pl-6 pr-6 bg-gray-800 space-y-3 font-semibold text-xs text-white tracking-widest hover:bg-gray-900 hover:ring-gray-300 transition ease-in-out duration-150`}
        {...props}
    />
)

export default BigButton
