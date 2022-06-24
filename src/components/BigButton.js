const BigButton = ({ type = 'submit', className, ...props }) => (
    <button
        type={type}
        className={`${className} flex p-5 text-white bg-gray-800 border border-none rounded-2xl cursor-pointer focus:outline-none hover:ring-2 hover:ring-purple-500 font-bold text-md peer-checked:border-transparent`}
        {...props}
    />
)

export default BigButton
