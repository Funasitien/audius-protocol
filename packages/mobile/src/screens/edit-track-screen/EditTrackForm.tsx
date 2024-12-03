import { useCallback, useContext, useEffect, useState } from 'react'

import { useFeatureFlag } from '@audius/common/hooks'
import { FeatureFlags } from '@audius/common/services'
import type { TrackForUpload } from '@audius/common/store'
import {
  useEarlyReleaseConfirmationModal,
  useHideContentConfirmationModal,
  usePublishConfirmationModal
} from '@audius/common/store'
import { useField } from 'formik'
import { Keyboard } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { useDispatch } from 'react-redux'

import {
  IconCaretLeft,
  IconCloudUpload,
  Button,
  Flex
} from '@audius/harmony-native'
import { Tile } from 'app/components/core'
import { InputErrorMessage } from 'app/components/core/InputErrorMessage'
import { PriceAndAudienceField } from 'app/components/edit/PriceAndAudienceField'
import { VisibilityField } from 'app/components/edit/VisibilityField'
import { PickArtworkField, TextField } from 'app/components/fields'
import { useNavigation } from 'app/hooks/useNavigation'
import { FormScreen } from 'app/screens/form-screen'
import { setVisibility } from 'app/store/drawers/slice'
import { makeStyles } from 'app/styles'

import { TopBarIconButton } from '../app-screen'
import { UploadFileContext } from '../upload-screen/screens/UploadFileContext'

import { EditTrackFormOverflowMenuDrawer } from './EditTrackFormOverflowMenuDrawer'
import { EditTrackFormPreviewContextProvider } from './EditTrackFormPreviewContext'
import { CancelEditTrackDrawer } from './components'
import { FileReplaceContainer } from './components/FileReplaceContainer'
import {
  SelectGenreField,
  DescriptionField,
  SelectMoodField,
  TagField,
  SubmenuList,
  RemixSettingsField,
  AdvancedField
} from './fields'
import type { EditTrackFormProps } from './types'

const messages = {
  trackName: 'Track Name',
  trackNameError: 'Track Name Required',
  fixErrors: 'Fix Errors To Continue',
  cancel: 'Cancel',
  untitled: 'Untitled'
}

const useStyles = makeStyles(({ spacing }) => ({
  backButton: {
    marginLeft: -6
  },
  tile: {
    margin: spacing(3)
  },
  errorText: {
    alignSelf: 'center',
    marginTop: 0,
    marginBottom: spacing(4)
  }
}))

export type EditTrackParams = TrackForUpload

export const EditTrackForm = (props: EditTrackFormProps) => {
  const {
    handleSubmit: handleSubmitProp,
    initialValues,
    file,
    handleSelectTrack,
    values,
    isUpload,
    isSubmitting,
    errors,
    touched,
    dirty,
    title,
    doneText
  } = props
  const errorsKeys = Object.keys(errors)
  const hasErrors =
    errorsKeys.length > 0 && errorsKeys.every((errorKey) => touched[errorKey])
  const styles = useStyles()
  const navigation = useNavigation()
  const dispatch = useDispatch()
  const { track } = useContext(UploadFileContext)
  const { isEnabled: isTrackReplaceEnabled } = useFeatureFlag(
    FeatureFlags.TRACK_AUDIO_REPLACE
  )
  const initiallyHidden = initialValues.is_unlisted
  const isInitiallyScheduled = initialValues.is_scheduled_release
  const usersMayLoseAccess = !isUpload && !initiallyHidden && values.is_unlisted
  const isToBePublished = !isUpload && initiallyHidden && !values.is_unlisted
  const [isOverflowMenuOpen, setIsOverflowMenuOpen] = useState(false)
  const [{ value: origFilename }] = useField('orig_filename')
  const [{ value: streamUrl }] = useField('stream.url')
  const [, { touched: isTitleTouched }, { setValue: setTitle }] =
    useField('title')

  const handleOverflowMenuOpen = useCallback(() => {
    setIsOverflowMenuOpen(true)
  }, [])
  const handleOverflowMenuClose = useCallback(() => {
    setIsOverflowMenuOpen(false)
  }, [])

  const { onOpen: openHideContentConfirmation } =
    useHideContentConfirmationModal()
  const { onOpen: openEarlyReleaseConfirmation } =
    useEarlyReleaseConfirmationModal()
  const { onOpen: openPublishConfirmation } = usePublishConfirmationModal()

  const handlePressBack = useCallback(() => {
    if (!dirty) {
      navigation.goBack()
    } else {
      Keyboard.dismiss()
      dispatch(
        setVisibility({
          drawer: 'CancelEditTrack',
          visible: true
        })
      )
    }
  }, [dirty, navigation, dispatch])

  // Update title when the file is replaced
  useEffect(() => {
    if (track && !isTitleTouched) {
      setTitle(track.metadata.title)
    }
  }, [isTitleTouched, setTitle, track])

  const handleSubmit = useCallback(() => {
    Keyboard.dismiss()

    if (usersMayLoseAccess) {
      openHideContentConfirmation({ confirmCallback: handleSubmitProp })
    } else if (isToBePublished && isInitiallyScheduled) {
      openEarlyReleaseConfirmation({
        contentType: 'track',
        confirmCallback: handleSubmitProp
      })
    } else if (isToBePublished) {
      openPublishConfirmation({
        contentType: 'track',
        confirmCallback: handleSubmitProp
      })
    } else {
      handleSubmitProp()
    }
  }, [
    usersMayLoseAccess,
    isToBePublished,
    isInitiallyScheduled,
    handleSubmitProp,
    openHideContentConfirmation,
    openEarlyReleaseConfirmation,
    openPublishConfirmation
  ])

  return (
    <>
      <EditTrackFormPreviewContextProvider>
        <FormScreen
          title={title}
          icon={IconCloudUpload}
          topbarLeft={
            <TopBarIconButton
              icon={IconCaretLeft}
              style={styles.backButton}
              onPress={handlePressBack}
            />
          }
          bottomSection={
            <>
              {hasErrors ? (
                <InputErrorMessage
                  message={messages.fixErrors}
                  style={styles.errorText}
                />
              ) : null}
              <Flex direction='row' gap='s'>
                <Button fullWidth variant='secondary' onPress={handlePressBack}>
                  {messages.cancel}
                </Button>
                <Button
                  variant='primary'
                  fullWidth
                  onPress={handleSubmit}
                  disabled={isSubmitting || hasErrors}
                >
                  {doneText}
                </Button>
              </Flex>
            </>
          }
        >
          <>
            <KeyboardAwareScrollView>
              <Tile style={styles.tile}>
                {isTrackReplaceEnabled && isUpload ? (
                  <Flex pt='l' ph='l'>
                    <FileReplaceContainer
                      fileName={file?.name || origFilename || messages.untitled}
                      // @ts-ignore
                      filePath={file?.uri || streamUrl || ''}
                      onMenuButtonPress={handleOverflowMenuOpen}
                    />
                  </Flex>
                ) : null}
                <PickArtworkField name='artwork' />
                <TextField name='title' label={messages.trackName} required />
                <SubmenuList>
                  <SelectGenreField />
                  <SelectMoodField />
                </SubmenuList>
                <TagField />
                <DescriptionField />
                <SubmenuList removeBottomDivider>
                  <VisibilityField />
                  <PriceAndAudienceField />
                  <RemixSettingsField />
                  <AdvancedField />
                </SubmenuList>
              </Tile>
            </KeyboardAwareScrollView>
          </>
        </FormScreen>
      </EditTrackFormPreviewContextProvider>
      <CancelEditTrackDrawer />
      <EditTrackFormOverflowMenuDrawer
        isOpen={isOverflowMenuOpen}
        onClose={handleOverflowMenuClose}
        onReplace={handleSelectTrack}
        // TODO: Update this later when edit flow is updated for file replace
        onDownload={isUpload ? undefined : () => {}}
      />
    </>
  )
}
