import type { LoaderFunctionArgs } from '@remix-run/node'
import { authenticator } from '../utils/auth.server'

export const loader = ({ request }: LoaderFunctionArgs) => {
  return authenticator.authenticate('google', request, {
    successRedirect: '/',
    failureRedirect: '/auth/login',
  })
}