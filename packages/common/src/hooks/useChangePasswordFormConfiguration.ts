import { useState, useCallback } from 'react'

import { FormikHelpers } from 'formik'
import { z } from 'zod'
import { toFormikValidationSchema } from 'zod-formik-adapter'

import { useAppContext } from '../context'
import { confirmEmailSchema, passwordSchema } from '../schemas'

const messages = {
  invalidCredentials: 'Invalid credentials.',
  passwordRequired: 'Please enter a password.',
  accountMatchError: "Account doesn't match the currently signed in user.",
  passwordUpdated: 'Password updated!'
}

export enum ChangePasswordPage {
  ConfirmPassword = 0,
  VerifyEmail = 1,
  NewPassword = 2
}

const OTP_ERROR = 'Missing otp'
export const isOtpMissingError = (e: unknown) => {
  return (
    e instanceof Object &&
    'response' in e &&
    e.response instanceof Object &&
    'data' in e.response &&
    e.response.data instanceof Object &&
    'error' in e.response.data &&
    e.response.data.error === OTP_ERROR
  )
}

const passwordFormikSchema = toFormikValidationSchema(passwordSchema)
const confirmPasswordFormikSchema = toFormikValidationSchema(
  z.object({
    password: z.string({
      required_error: messages.passwordRequired
    })
  })
)
const verifyEmailFormikSchema = toFormikValidationSchema(confirmEmailSchema)

export type ChangePasswordFormValues = {
  oldEmail: string
  oldPassword: string
  password: string
  confirmPassword: string
  otp: string
}

const initialValues: ChangePasswordFormValues = {
  oldEmail: '',
  oldPassword: '',
  password: '',
  confirmPassword: '',
  otp: ''
}

export const useChangePasswordFormConfiguration = (onComplete: () => void) => {
  const { audiusBackend } = useAppContext()
  const [page, setPage] = useState(ChangePasswordPage.ConfirmPassword)

  const validationSchema =
    page === ChangePasswordPage.NewPassword
      ? passwordFormikSchema
      : page === ChangePasswordPage.ConfirmPassword
      ? confirmPasswordFormikSchema
      : page === ChangePasswordPage.VerifyEmail
      ? verifyEmailFormikSchema
      : undefined

  const confirmCredentials = useCallback(
    async (
      values: ChangePasswordFormValues,
      helpers: FormikHelpers<ChangePasswordFormValues>
    ) => {
      const { oldEmail: email, password, otp } = values
      const sanitizedOtp = otp.replace(/\s/g, '')
      const libs = await audiusBackend.getAudiusLibsTyped()
      try {
        const confirmed = await libs.Account?.confirmCredentials({
          email,
          username: email,
          password,
          otp: sanitizedOtp
        })
        if (confirmed) {
          // Move "password" to "oldPassword" to prevent it from conflicting
          helpers.resetForm({
            values: { ...values, oldPassword: password, password: '' }
          })
          setPage(ChangePasswordPage.NewPassword)
        } else {
          helpers.setFieldError('otp', messages.accountMatchError)
        }
      } catch (e) {
        if (isOtpMissingError(e)) {
          helpers.resetForm({ values })
          setPage(ChangePasswordPage.VerifyEmail)
        } else if (page === ChangePasswordPage.ConfirmPassword) {
          helpers.setFieldError('password', messages.invalidCredentials)
        } else if (page === ChangePasswordPage.VerifyEmail) {
          helpers.setFieldError('otp', messages.invalidCredentials)
        }
      }
    },
    [setPage, page, audiusBackend]
  )

  const changeCredentials = useCallback(
    async (values: ChangePasswordFormValues) => {
      const { oldEmail: email, oldPassword, password } = values
      const libs = await audiusBackend.getAudiusLibsTyped()
      await libs.Account?.changeCredentials({
        newUsername: email,
        newPassword: password,
        oldUsername: email,
        oldPassword
      })
      onComplete()
    },
    [onComplete, audiusBackend]
  )

  const onSubmit = useCallback(
    async (
      values: ChangePasswordFormValues,
      helpers: FormikHelpers<ChangePasswordFormValues>
    ) => {
      if (page === ChangePasswordPage.NewPassword) {
        await changeCredentials(values)
      } else {
        await confirmCredentials(values, helpers)
      }
    },
    [page, confirmCredentials, changeCredentials]
  )

  return {
    initialValues,
    validateOnChange: false,
    validationSchema,
    onSubmit,
    page,
    setPage
  }
}
