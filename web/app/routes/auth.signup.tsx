// biome-ignore lint/style/useImportType: <explanation>
import { ActionFunctionArgs, LoaderFunctionArgs, json } from '@remix-run/node'
import { Link, useActionData, Form } from '@remix-run/react'
import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { GoogleForm } from '../components/GoogleForm'
import { parseWithZod } from '@conform-to/zod'
import { z } from 'zod'
import { authenticator } from '../utils/auth.server'
import { createUser } from '../utils/signup.server'
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "~/components/ui/card";
import { Alert, AlertDescription } from "~/components/ui/alert";


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
    <div className="container mx-auto max-w-md py-8">
    <Card>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
      </CardHeader>
      <CardContent>
        <Form method="post" {...getFormProps(form)}>
          {actionData?.result?.status === "error" && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>
                {JSON.stringify(actionData?.result)}
              </AlertDescription>
            </Alert>
          )}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={name.id}>Name</Label>
              <Input {...getInputProps(name, { type: "text" })} />
              {name.errors && (
                <p className="text-sm text-red-500">{name.errors}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor={email.id}>Email</Label>
              <Input {...getInputProps(email, { type: "email" })} />
              {email.errors && (
                <p className="text-sm text-red-500">{email.errors}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor={password.id}>Password</Label>
              <Input {...getInputProps(password, { type: "password" })} />
              {password.errors && (
                <p className="text-sm text-red-500">{password.errors}</p>
              )}
            </div>
            <Button type="submit" name="_action" value="SignUp" className="w-full">
              Create an account
            </Button>
          </div>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <GoogleForm />
        <p className="text-sm text-center">
          Already have an account?{" "}
          <Link to="/auth/login" className="text-blue-600 hover:underline">
            Sign In
          </Link>
        </p>
      </CardFooter>
    </Card>
  </div>
  )
}

export default SignUpPage