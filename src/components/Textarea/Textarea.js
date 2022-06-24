const Textarea = ({ disabled = false, className, ...props }) => (
    <textarea
        disabled={disabled}
        className={`${className} resize-none rounded-xl bg-gray-50 border-gray-100 font-bold text-gray-600 focus:border-gray-300 focus:ring focus:ring-gray-200 focus:ring-opacity-50`}
        {...props}
    />
)

export default Textarea
