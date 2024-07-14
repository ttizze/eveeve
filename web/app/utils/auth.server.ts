import type { User } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { Authenticator, AuthorizationError } from 'remix-auth'
import { FormStrategy } from 'remix-auth-form'
import { GoogleStrategy } from 'remix-auth-google'
import { prisma } from './prisma'
import { sessionStorage } from './session.server'
import { c } from 'node_modules/vite/dist/node/types.d-aGj9QkWt'

const SESSION_SECRET = process.env.SESSION_SECRET

if (!SESSION_SECRET) {
  throw new Error('SESSION_SECRET is not defined')
}

const authenticator = new Authenticator<Omit<User, 'password'>>(sessionStorage)

const formStrategy = new FormStrategy(async ({ form }) => {
  const email = form.get('email')
  const password = form.get('password')

  if (!(email && password)) {
    throw new Error('Invalid Request')
  }

  const user = await prisma.user.findUnique({ where: { email: String(email) } })

  if (!user) {
    throw new AuthorizationError()
  }

  const passwordsMatch = await bcrypt.compare(String(password), user.password)

  if (!passwordsMatch) {
    throw new AuthorizationError()
  }

  const { password: _, ...userWithoutPassword } = user

  return userWithoutPassword
})

authenticator.use(formStrategy, 'user-pass')

if (
  !(
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.CLIENT_URL
  )
) {
  throw new Error(
    'GOOGLE_CLIENT_ID、GOOGLE_CLIENT_SECRET、CLIENT_URLが設定されていません。',
  )
}

const googleStrategy = new GoogleStrategy<User>(
  {
    clientID: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackURL: `${process.env.CLIENT_URL}/api/auth/callback/google`,
  },
  async ({ profile }) => {
    const user = await prisma.user.findUnique({
      where: { email: profile.emails[0].value },
    })
    if (user) {
      return user
    }
    try {
      const newUser = await prisma.user.create({
        data: {
          email: profile.emails[0].value || '',
          name: profile.displayName,
          provider: 'google',
        },
      })
      return newUser
    } catch (error) {
      console.error('Error creating new user:', error)
      throw new Error('Error creating new user')
    }
  },
)

authenticator.use(googleStrategy)
export { authenticator }