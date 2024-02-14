import { useCallback } from 'react'

import { finishProfilePageMessages } from '@audius/common/messages'
import { finishProfileSchema } from '@audius/common/schemas'
import { MAX_DISPLAY_NAME_LENGTH } from '@audius/common/services'
import type { Image } from '@audius/common/store'
import { css } from '@emotion/native'
import {
  getCoverPhotoField,
  getHandleField,
  getIsVerified,
  getProfileImageField
} from 'audius-client/src/common/store/pages/signon/selectors'
import {
  setField,
  setValueField,
  signUp
} from 'common/store/pages/signon/actions'
import { Formik, useField } from 'formik'
import { isEmpty } from 'lodash'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'
import { useDispatch, useSelector } from 'react-redux'
import { toFormikValidationSchema } from 'zod-formik-adapter'

import { Paper, useTheme, Text } from '@audius/harmony-native'
import { HarmonyTextField } from 'app/components/fields'
import { useNavigation } from 'app/hooks/useNavigation'
import { launchSelectImageActionSheet } from 'app/utils/launchSelectImageActionSheet'

import { AccountHeader } from '../components/AccountHeader'
import { Heading, Page, PageFooter } from '../components/layout'
import type { SignUpScreenParamList } from '../types'

const AnimatedText = Animated.createAnimatedComponent(Text)

const finishProfileFormikSchema = toFormikValidationSchema(finishProfileSchema)

type FinishProfileValues = {
  displayName: string
  profileImage: Image
  coverPhoto?: Image
}

export const FinishProfileScreen = () => {
  const navigation = useNavigation<SignUpScreenParamList>()
  const dispatch = useDispatch()
  const { spacing } = useTheme()
  const savedProfileImage = useSelector(getProfileImageField)
  const savedCoverPhoto = useSelector(getCoverPhotoField)

  const handleSubmit = useCallback(
    (values: FinishProfileValues) => {
      const { displayName } = values
      dispatch(setValueField('name', displayName))
      dispatch(signUp())
      navigation.navigate('SelectGenre')
    },
    [dispatch, navigation]
  )

  const initialValues = {
    profileImage: savedProfileImage || ({} as Image),
    coverPhoto: savedCoverPhoto || ({} as Image),
    displayName: ''
  }

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={finishProfileFormikSchema}
    >
      <Page>
        <Heading
          heading={finishProfilePageMessages.header}
          description={finishProfilePageMessages.description}
        />
        <Paper>
          <AccountHeaderField />
          <HarmonyTextField
            name='displayName'
            label={finishProfilePageMessages.displayName}
            placeholder={finishProfilePageMessages.inputPlaceholder}
            maxLength={MAX_DISPLAY_NAME_LENGTH}
            autoComplete='off'
            style={css({
              padding: spacing.l,
              paddingTop: spacing.unit10
            })}
          />
        </Paper>
        <PageFooter prefix={<UploadProfilePhotoHelperText />} />
      </Page>
    </Formik>
  )
}

const AccountHeaderField = () => {
  const [{ value: profileImage }, , { setValue: setProfileImage }] =
    useField<Image>('profileImage')
  const dispatch = useDispatch()

  const handleSelectProfilePicture = useCallback(() => {
    const handleImageSelected = (image: Image) => {
      dispatch(setField('profileImage', image))
      setProfileImage(image)
    }

    launchSelectImageActionSheet(
      handleImageSelected,
      { height: 1000, width: 1000, cropperCircleOverlay: true },
      'profilePicture'
    )
  }, [dispatch, setProfileImage])

  const [{ value: coverPhoto }, , { setValue: setCoverPhoto }] =
    useField<Image>('coverPhoto')

  const handleSelectCoverPhoto = useCallback(() => {
    const handleImageSelected = (image: Image) => {
      setCoverPhoto(image)
      dispatch(setField('coverPhoto', image))
    }
    launchSelectImageActionSheet(
      handleImageSelected,
      { height: 1000, width: 2000, freeStyleCropEnabled: true },
      'coverPhoto'
    )
  }, [dispatch, setCoverPhoto])

  const [{ value: displayName }] = useField('displayName')
  const { value: handle } = useSelector(getHandleField)
  const isVerified = useSelector(getIsVerified)

  return (
    <AccountHeader
      profilePicture={isEmpty(profileImage) ? undefined : profileImage}
      coverPhoto={isEmpty(coverPhoto) ? undefined : coverPhoto}
      onSelectProfilePicture={handleSelectProfilePicture}
      onSelectCoverPhoto={handleSelectCoverPhoto}
      displayName={displayName}
      handle={handle}
      isVerified={isVerified}
    />
  )
}

const UploadProfilePhotoHelperText = () => {
  const [{ value: displayName }, { touched }] = useField('displayName')
  const [{ value: profileImage }] = useField<Image>('profileImage')
  const isVisible = displayName && touched && isEmpty(profileImage)
  const { motion } = useTheme()

  if (!isVisible) return null

  return (
    <AnimatedText
      variant='body'
      textAlign='center'
      entering={FadeIn.duration(motion.calm.duration)}
      exiting={FadeOut.duration(motion.calm.duration)}
    >
      {finishProfilePageMessages.uploadProfilePhoto}
    </AnimatedText>
  )
}
