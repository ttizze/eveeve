import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'
import { Form, useLoaderData } from '@remix-run/react'
import { authenticator } from '../utils/auth.server'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: '/auth/login',
  })

  return user
}

export const action = async({ request }: ActionFunctionArgs) => {
  return await authenticator.logout(request, { redirectTo: '/' })
}
export default function Logout() {
  const user = useLoaderData<typeof loader>()
  return (
    <>
      <h1>Hello {user.name}さん</h1>
      <Form method='POST'>
        <button type='submit' name='action' value='logout'>Logout</button>
      </Form>
    </>
  )
}