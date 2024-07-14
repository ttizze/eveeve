import { Form } from '@remix-run/react'
import { FaGoogle } from 'react-icons/fa'


export const GoogleForm = () => {
  return (
    <Form method="POST">
      <button
        type="submit"
        name="_action"
        value="SignInWithGoogle"
      >
        <FaGoogle size={22} />
        <span>Sign In with Google</span>
      </button>
    </Form>
  )
}