import type { User } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { Authenticator, AuthorizationError } from 'remix-auth'
import { FormStrategy } from 'remix-auth-form'
import { GoogleStrategy } from 'remix-auth-google'
import { prisma } from './prisma'
import { sessionStorage } from './session.server'

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
    throw new AuthorizationError('User not found')
  }

  if (!user.password) {
    throw new AuthorizationError('User has no password set.')
  }
  const passwordsMatch = await bcrypt.compare(String(password), user.password)

  if (!passwordsMatch) {
    throw new AuthorizationError('Invalid password')
  }

  const { password: _, ...userWithoutPassword } = user

  return userWithoutPassword
})

authenticator.use(formStrategy, 'user-pass')

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