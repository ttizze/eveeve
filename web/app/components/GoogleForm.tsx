import { Form } from '@remix-run/react'
import { FaGoogle } from 'react-icons/fa'
import { Button } from "~/components/ui/button"

export const GoogleForm = () => {
  return (
    <Form method="POST" className="w-full">
      <Button
        type="submit"
        name="_action"
        value="SignInWithGoogle"
        variant="outline"
        className="w-full"
      >
        <FaGoogle className="mr-2 h-4 w-4" />
        Sign In with Google
      </Button>
    </Form>
  )
}