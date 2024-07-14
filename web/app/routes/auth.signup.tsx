// biome-ignore lint/style/useImportType: <explanation>
import { ActionFunctionArgs, LoaderFunctionArgs, json } from '@remix-run/node'
import { Link, useActionData, Form } from '@remix-run/react'
import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { GoogleForm } from './components/GoogleForm'
import { parseWithZod } from '@conform-to/zod'
import { z } from 'zod'
import { authenticator } from '../utils/auth.server'
import { createUser } from '../utils/signup.server'


const signUpSchema = z.object({
  name: z.string().min(1, '名前を入力してください'),
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(4, 'パスワードは4文字以上である必要があります'),
})

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await authenticator.isAuthenticated(request, {
    successRedirect: '/',
  })
  return json({ user })
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const clonedRequest = request.clone();
  const formData = await clonedRequest.formData();
  const action = String(formData.get('_action'))
    const submission = parseWithZod(formData, { schema: signUpSchema });

    
    try {
      switch (action) {
        case 'SignUp': {
          if (submission.status !== "success") {
            return json({ result: submission.reply() });
          }
        const result = await createUser(submission.value);
        if (result.error) {
          return json({
            result: submission.reply({
              formErrors: [result.error.message],
            })
          });
        }
        return authenticator.authenticate('user-pass', request, {
          successRedirect: '/',
          failureRedirect: '/auth/signup',
        });
      }
      case 'SignInWithGoogle': {
        return authenticator.authenticate('google', request, {
          successRedirect: '/',
          failureRedirect: '/auth/signup',
        })
      }
      default: {
        return json({
          result: submission.reply({
            formErrors: ['Invalid action'],
          })
        });
      }
    }
  } catch (error) {
    console.error('Signup error:', error);
    return json({
      result: submission.reply({
        formErrors: ['サインアップ中にエラーが発生しました。もう一度お試しください。']
      })
    });
  }
}

const SignUpPage = () => {
  const actionData = useActionData<typeof action>()
  const [form, { name, email, password }] = useForm({
    id: 'signup-form',
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: signUpSchema })
    },
  })

  return (
    <div>
      <div>
        <Form method="post" {...getFormProps(form)}>
          <h2>Create an account</h2>
          {actionData?.result?.status === 'error' && (
            <div className="text-red-500">
              {JSON.stringify(actionData?.result)}
            </div>
          )}
          <div>
            <label htmlFor={name.id}>Name</label>
            <input
              {...getInputProps(name, { type: 'text' })}
              className="w-full p-2 border rounded"
            />
            {name.errors && <p className="text-red-500">{name.errors}</p>}
          </div>
          <div className="mt-4">
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
            <button type="submit"
              name="_action"
              value="SignUp"
            >
              Create an account
            </button>
          </div>
        </Form>
        <GoogleForm />
      </div>
      <p>
        Already have an account?
        <Link to="/auth/login">
          <span>Sign In</span>
        </Link>
      </p>
    </div>
  )
}

export default SignUpPage