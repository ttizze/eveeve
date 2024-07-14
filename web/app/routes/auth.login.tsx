import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from '@remix-run/node'
import { Link } from '@remix-run/react'
import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { parseWithZod } from '@conform-to/zod'
import { z } from 'zod'
import { authenticator } from '../utils/auth.server'
import { json } from '@remix-run/node'
import { useActionData, Form } from '@remix-run/react'
import { GoogleForm } from './components/GoogleForm'
export const meta: MetaFunction = () => {
  return [{ title: 'New Remix App login' }]
}


const loginSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(4, 'パスワードは4文字以上である必要があります'),
})

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await authenticator.isAuthenticated(request, {
    successRedirect: '/',
  })
  return user
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.clone().formData()
  const action = String(formData.get('_action'))
  const submission = parseWithZod(formData, { schema: loginSchema })

  if (submission.status !== "success") {
    return json({ result: submission.reply() })
  }

  switch (action) {
    case 'SignIn':
  return authenticator.authenticate('user-pass', request, {
    successRedirect: '/',
        failureRedirect: '/auth/login',
      })
    case 'SignInWithGoogle':
      return authenticator.authenticate('google', request, {
        successRedirect: '/',
        failureRedirect: '/auth/login',
      })
    default:
      return json({ result: { message: 'Invalid action' } })
  }
}

const LoginPage = () => {
  const lastSubmission = useActionData<typeof action>()
  const [form, { email, password }] = useForm({
    id: 'login-form',
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: loginSchema })
    },
  })

  return (
    <div>
      <div>
        <Form method="post" {...getFormProps(form)}>
          <h2>Login</h2>
          <div>
            <label htmlFor={email.id}>Email</label>
            <input
              {...getInputProps(email, { type: 'email' })}
              className="w-full p-2 border rounded"
            />
            {email.errors && <p className="text-red-500">{email.errors}</p>}
          </div>
          <div className="mt-4">
            <label htmlFor={password.id}>Password</label>
            <input
              {...getInputProps(password, { type: 'password' })}
              className="w-full p-2 border rounded"
            />
            {password.errors && <p className="text-red-500">{password.errors}</p>}
          </div>
          <div>
            <button
              type="submit"
              name="_action"
              value="SignIn"
            >
              Login
            </button>
          </div>
        </Form>
        <GoogleForm />
      </div>
      <p>
        Don't have an account?
        <Link to="/auth/signup">
          <span>Sign Up</span>
        </Link>
      </p>
    </div>
  )
}

export default LoginPage