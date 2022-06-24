import styles from './index.module.css'

const Button = ({ type = 'submit', className, ...props }) => (
    <button
        className={styles.button}
        {...props}
    />
)

export default Button
