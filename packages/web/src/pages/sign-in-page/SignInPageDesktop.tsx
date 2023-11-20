import {
  Box,
  Button,
  ButtonType,
  Flex,
  IconArrowRight,
  Text,
  TextLink
} from '@audius/harmony'
import { Form } from 'formik'
import { Link } from 'react-router-dom'

import audiusLogoColored from 'assets/img/audiusLogoColored.png'
import { HarmonyPasswordField } from 'components/form-fields/HarmonyPasswordField'
import { HarmonyTextField } from 'components/form-fields/HarmonyTextField'
import PreloadImage from 'components/preload-image/PreloadImage'
import {
  ArtworkContainer,
  AudiusValues
} from 'pages/sign-on/components/AudiusValues'
import { LeftContentContainer } from 'pages/sign-on/components/desktop/LeftContentContainer'
import { SignOnContainerDesktop } from 'pages/sign-on/components/desktop/SignOnContainerDesktop'
import { userHasMetaMask } from 'pages/sign-up-page/utils/metamask'
import { SIGN_UP_PAGE } from 'utils/route'

import styles from './SignInPage.module.css'
import { SignInWithMetaMaskButton } from './SignInWithMetaMaskButton'

const messages = {
  title: 'Sign Into Audius',
  emailLabel: 'Email',
  passwordLabel: 'Password',
  signIn: 'Sign In',
  createAccount: 'Create An Account',
  forgotPassword: 'Forgot password?'
}

export const SignInPageDesktop = () => {
  return (
    <SignOnContainerDesktop>
      <LeftContentContainer gap='2xl' justifyContent='space-between'>
        <Flex direction='column' gap='2xl' alignItems='center'>
          <PreloadImage
            src={audiusLogoColored}
            className={styles.logo}
            alt='Audius Colored Logo'
          />
          <Flex w='100%' direction='row' justifyContent='flex-start'>
            <Text variant='heading' size='l' tag='h1' color='accent'>
              {messages.title}
            </Text>
          </Flex>
          <Box w='100%'>
            <Form>
              <Flex direction='column' gap='2xl' w='100%'>
                <Flex direction='column' gap='l'>
                  <HarmonyTextField name='email' label={messages.emailLabel} />
                  <HarmonyPasswordField
                    name='password'
                    label={messages.passwordLabel}
                  />
                </Flex>
                <Flex direction='column' gap='l'>
                  <Flex direction='column' w='100%'>
                    <Button iconRight={IconArrowRight} type='submit'>
                      {messages.signIn}
                    </Button>
                    {userHasMetaMask ? <SignInWithMetaMaskButton /> : null}
                  </Flex>
                  <TextLink variant='visible' textVariant='body'>
                    {messages.forgotPassword}
                  </TextLink>
                </Flex>
              </Flex>
            </Form>
          </Box>
        </Flex>
        <Button variant={ButtonType.SECONDARY} asChild>
          <Link to={SIGN_UP_PAGE}>{messages.createAccount}</Link>
        </Button>
      </LeftContentContainer>
      <ArtworkContainer>
        <AudiusValues />
      </ArtworkContainer>
    </SignOnContainerDesktop>
  )
}
