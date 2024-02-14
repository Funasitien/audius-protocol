import { useCallback, type ReactNode, useEffect } from 'react'

import { useGetTrackById } from '@audius/common/api'
import {
  useRemoteVar,
  useUSDCBalance,
  usePurchaseContentFormConfiguration,
  usePurchaseContentErrorMessage,
  usePayExtraPresets,
  PURCHASE_METHOD,
  PURCHASE_VENDOR,
  usePurchaseMethod,
  isTrackStreamPurchaseable,
  isTrackDownloadPurchaseable
} from '@audius/common/hooks'
import type { PurchaseableTrackMetadata } from '@audius/common/hooks'
import type { USDCPurchaseConditions } from '@audius/common/models'
import {
  Name,
  PurchaseVendor,
  statusIsNotFinalized
} from '@audius/common/models'
import { IntKeys, FeatureFlags } from '@audius/common/services'
import {
  usePremiumContentPurchaseModal,
  purchaseContentActions,
  purchaseContentSelectors,
  PurchaseContentStage,
  PurchaseContentPage,
  isContentPurchaseInProgress
} from '@audius/common/store'
import type { PurchaseContentError } from '@audius/common/store'
import { formatPrice } from '@audius/common/utils'
import { Formik, useField, useFormikContext } from 'formik'
import {
  Linking,
  View,
  ScrollView,
  TouchableOpacity,
  Platform
} from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { toFormikValidationSchema } from 'zod-formik-adapter'

import { IconCart, IconCloseAlt, IconError } from '@audius/harmony-native'
import { Button, LockedStatusBadge, Text } from 'app/components/core'
import Drawer from 'app/components/drawer'
import { useIsUSDCEnabled } from 'app/hooks/useIsUSDCEnabled'
import { useNavigation } from 'app/hooks/useNavigation'
import { useFeatureFlag } from 'app/hooks/useRemoteConfig'
import { make, track as trackEvent } from 'app/services/analytics'
import { getPurchaseVendor } from 'app/store/purchase-vendor/selectors'
import { flexRowCentered, makeStyles } from 'app/styles'
import { spacing } from 'app/styles/spacing'
import { useThemeColors } from 'app/utils/theme'

import LoadingSpinner from '../loading-spinner/LoadingSpinner'
import { PaymentMethod } from '../payment-method/PaymentMethod'
import { TrackDetailsTile } from '../track-details-tile'
import { USDCManualTransfer } from '../usdc-manual-transfer'

import { AudioMatchSection } from './AudioMatchSection'
import { PayExtraFormSection } from './PayExtraFormSection'
import { PurchaseSuccess } from './PurchaseSuccess'
import { PurchaseSummaryTable } from './PurchaseSummaryTable'
import { PurchaseUnavailable } from './PurchaseUnavailable'
import { usePurchaseContentFormState } from './hooks/usePurchaseContentFormState'
import { usePurchaseSummaryValues } from './hooks/usePurchaseSummaryValues'

const { getPurchaseContentFlowStage, getPurchaseContentError } =
  purchaseContentSelectors
const { setPurchasePage } = purchaseContentActions

const messages = {
  buy: 'Buy',
  title: 'Complete Purchase',
  summary: 'Summary',
  artistCut: 'Artist Cut',
  audiusCut: 'Audius Cut',
  alwaysZero: 'Always $0',
  youPay: 'You Pay',
  youPaid: 'You Paid',
  price: (price: string) => `$${price}`,
  payToUnlock: 'Pay-To-Unlock',
  purchasing: 'Purchasing',
  disclaimer: (termsOfUse: ReactNode) => (
    <>
      {'By clicking on "Buy", you agree to our '}
      {termsOfUse}
      {
        ' Additional payment provider fees may apply. Any remaining USDC balance in your Audius wallet will be applied to this transaction.'
      }
    </>
  ),
  termsOfUse: 'Terms of Use.',
  goBack: 'Go Back'
}

const useStyles = makeStyles(({ spacing, typography, palette }) => ({
  root: {
    height: '100%',
    justifyContent: 'space-between'
  },
  formContainer: {
    flex: 1
  },
  formContentContainer: {
    paddingBottom: spacing(6)
  },
  formContentSection: {
    paddingHorizontal: spacing(4),
    gap: spacing(6),
    marginTop: spacing(4)
  },
  formActions: {
    flex: 0,
    paddingTop: spacing(4),
    paddingHorizontal: spacing(4),
    paddingBottom: spacing(6),
    gap: spacing(4)
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    height: spacing(10),
    paddingHorizontal: spacing(4)
  },
  titleContainer: {
    ...flexRowCentered(),
    gap: spacing(2),
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'center',
    // Matches close icon width
    paddingRight: spacing(6)
  },
  trackTileContainer: {
    ...flexRowCentered(),
    borderColor: palette.neutralLight8,
    borderWidth: 1,
    borderRadius: spacing(2),
    backgroundColor: palette.neutralLight10
  },
  payToUnlockTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing(2),
    marginBottom: spacing(2)
  },
  errorContainer: {
    ...flexRowCentered(),
    gap: spacing(2),
    paddingHorizontal: spacing(4)
  },
  spinnerContainer: {
    width: '100%',
    height: '90%',
    justifyContent: 'center',
    ...flexRowCentered()
  },
  disclaimer: {
    lineHeight: typography.fontSize.medium * 1.25
  },
  bottomSection: {
    gap: spacing(6)
  },
  paddingTop: {
    paddingTop: spacing(4)
  }
}))

const RenderError = ({ error: { code } }: { error: PurchaseContentError }) => {
  const styles = useStyles()
  const { accentRed } = useThemeColors()
  return (
    <View style={styles.errorContainer}>
      <IconError fill={accentRed} width={spacing(5)} height={spacing(5)} />
      <Text weight='medium' color='accentRed'>
        {usePurchaseContentErrorMessage(code)}
      </Text>
    </View>
  )
}

const PremiumTrackPurchaseDrawerHeader = ({
  onClose
}: {
  onClose: () => void
}) => {
  const styles = useStyles()
  const { neutralLight2, neutralLight4 } = useThemeColors()
  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity activeOpacity={0.7} onPress={onClose}>
        <IconCloseAlt
          width={spacing(6)}
          height={spacing(6)}
          fill={neutralLight4}
        />
      </TouchableOpacity>
      <View style={styles.titleContainer}>
        <IconCart width={spacing(6)} height={spacing(6)} fill={neutralLight2} />
        <Text
          variant='label'
          fontSize='large'
          color='neutralLight2'
          weight='heavy'
          textTransform='uppercase'
          noGutter
        >
          {messages.title}
        </Text>
      </View>
    </View>
  )
}

const getButtonText = (isUnlocking: boolean, amountDue: number) =>
  isUnlocking
    ? messages.purchasing
    : amountDue > 0
    ? `${messages.buy} $${formatPrice(amountDue)}`
    : messages.buy

// The bulk of the form rendering is in a nested component because we want access
// to the FormikContext, which can only be used in a component which is a descendant
// of the `<Formik />` component
const RenderForm = ({
  onClose,
  track,
  purchaseConditions
}: {
  onClose: () => void
  track: PurchaseableTrackMetadata
  purchaseConditions: USDCPurchaseConditions
}) => {
  const navigation = useNavigation()
  const styles = useStyles()
  const dispatch = useDispatch()
  const { specialLightGreen, primary } = useThemeColors()
  const presetValues = usePayExtraPresets()
  const { isEnabled: isIOSUSDCPurchaseEnabled } = useFeatureFlag(
    FeatureFlags.IOS_USDC_PURCHASE_ENABLED
  )
  const isIOSDisabled = Platform.OS === 'ios' && !isIOSUSDCPurchaseEnabled

  const { submitForm, resetForm } = useFormikContext()

  // Reset form on track change
  useEffect(() => resetForm, [track.track_id, resetForm])

  const {
    usdc_purchase: { price }
  } = purchaseConditions

  const [{ value: purchaseMethod }, , { setValue: setPurchaseMethod }] =
    useField(PURCHASE_METHOD)

  const [, , { setValue: setPurchaseVendor }] = useField(PURCHASE_VENDOR)
  const purchaseVendor = useSelector(getPurchaseVendor)
  useEffect(() => {
    setPurchaseVendor(purchaseVendor)
  }, [purchaseVendor, setPurchaseVendor])

  const { data: balance } = useUSDCBalance({ isPolling: true })
  const { extraAmount } = usePurchaseSummaryValues({
    price,
    currentBalance: balance
  })
  const { isEnabled: isCoinflowEnabled } = useFeatureFlag(
    FeatureFlags.BUY_WITH_COINFLOW
  )
  const coinflowMaximumCents = useRemoteVar(IntKeys.COINFLOW_MAXIMUM_CENTS)

  const { isExistingBalanceDisabled, totalPriceInCents } = usePurchaseMethod({
    price,
    extraAmount,
    method: purchaseMethod,
    setMethod: setPurchaseMethod
  })

  const { page, stage, error, isUnlocking, purchaseSummaryValues } =
    usePurchaseContentFormState({ price })

  const isPurchaseSuccessful = stage === PurchaseContentStage.FINISH

  // Navigate to track screen in the background if purchase is successful
  useEffect(() => {
    if (isPurchaseSuccessful) {
      navigation.navigate('Track', { id: track.track_id })
    }
  }, [isPurchaseSuccessful, navigation, track.track_id])

  const handleTermsPress = useCallback(() => {
    Linking.openURL('https://audius.co/legal/terms-of-use')
    trackEvent(make({ eventName: Name.PURCHASE_CONTENT_TOS_CLICKED }))
  }, [])

  const handleUSDCManualTransferClose = useCallback(() => {
    dispatch(setPurchasePage({ page: PurchaseContentPage.PURCHASE }))
  }, [dispatch])

  const handleGoBackPress = useCallback(() => {
    dispatch(setPurchasePage({ page: PurchaseContentPage.PURCHASE }))
  }, [dispatch])

  const showCoinflow =
    isCoinflowEnabled && totalPriceInCents <= coinflowMaximumCents

  useEffect(() => {
    if (purchaseVendor === PurchaseVendor.COINFLOW && !showCoinflow) {
      setPurchaseVendor(PurchaseVendor.STRIPE)
    }
  }, [setPurchaseVendor, showCoinflow, purchaseVendor])

  const stemsPurchaseCount = track.is_download_gated
    ? track._stems?.length ?? 0
    : 0
  const downloadPurchaseCount =
    track.is_download_gated && track.download?.is_downloadable ? 1 : 0
  const streamPurchaseCount = track.is_stream_gated ? 1 : 0

  return (
    <View style={styles.root}>
      {page === PurchaseContentPage.PURCHASE ? (
        <>
          <ScrollView contentContainerStyle={styles.formContentContainer}>
            {stage !== PurchaseContentStage.FINISH ? (
              <AudioMatchSection amount={Math.round(price / 100)} />
            ) : null}
            <View style={styles.formContentSection}>
              <TrackDetailsTile trackId={track.track_id} showLabel={false} />
              {isPurchaseSuccessful ? null : (
                <PayExtraFormSection
                  amountPresets={presetValues}
                  disabled={isUnlocking}
                />
              )}
              <View style={styles.bottomSection}>
                <PurchaseSummaryTable
                  {...purchaseSummaryValues}
                  stemsPurchaseCount={stemsPurchaseCount}
                  downloadPurchaseCount={downloadPurchaseCount}
                  streamPurchaseCount={streamPurchaseCount}
                  totalPriceInCents={totalPriceInCents}
                />
                {isIOSDisabled || isUnlocking || isPurchaseSuccessful ? null : (
                  <PaymentMethod
                    selectedMethod={purchaseMethod}
                    setSelectedMethod={setPurchaseMethod}
                    balance={balance}
                    isExistingBalanceDisabled={isExistingBalanceDisabled}
                    showExistingBalance={!!(balance && !balance.isZero())}
                    isCoinflowEnabled={showCoinflow}
                  />
                )}
              </View>
              {isIOSDisabled ? (
                <PurchaseUnavailable />
              ) : isPurchaseSuccessful ? (
                <PurchaseSuccess onPressViewTrack={onClose} track={track} />
              ) : isUnlocking ? null : (
                <View>
                  <View style={styles.payToUnlockTitleContainer}>
                    <Text
                      weight='heavy'
                      textTransform='uppercase'
                      fontSize='small'
                    >
                      {messages.payToUnlock}
                    </Text>
                    <LockedStatusBadge locked />
                  </View>
                  <Text style={styles.disclaimer}>
                    {messages.disclaimer(
                      <Text colorValue={primary} onPress={handleTermsPress}>
                        {messages.termsOfUse}
                      </Text>
                    )}
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        </>
      ) : (
        <View style={styles.paddingTop}>
          <USDCManualTransfer
            onClose={handleUSDCManualTransferClose}
            amountInCents={totalPriceInCents}
          />
        </View>
      )}
      {isPurchaseSuccessful || isIOSDisabled ? null : (
        <View style={styles.formActions}>
          {error ? <RenderError error={error} /> : null}
          {page === PurchaseContentPage.TRANSFER ? (
            <Button
              title={messages.goBack}
              onPress={handleGoBackPress}
              variant='common'
              size='large'
              fullWidth
            />
          ) : null}
          <Button
            onPress={submitForm}
            disabled={isUnlocking}
            title={getButtonText(isUnlocking, totalPriceInCents)}
            variant={'primary'}
            size='large'
            color={specialLightGreen}
            iconPosition='left'
            icon={isUnlocking ? LoadingSpinner : undefined}
            fullWidth
          />
        </View>
      )}
    </View>
  )
}

export const PremiumTrackPurchaseDrawer = () => {
  const styles = useStyles()
  const dispatch = useDispatch()
  const isUSDCEnabled = useIsUSDCEnabled()
  const presetValues = usePayExtraPresets()
  const {
    data: { contentId: trackId },
    isOpen,
    onClose,
    onClosed
  } = usePremiumContentPurchaseModal()

  const { data: track, status: trackStatus } = useGetTrackById(
    { id: trackId },
    { disabled: !trackId }
  )
  const stage = useSelector(getPurchaseContentFlowStage)
  const error = useSelector(getPurchaseContentError)
  const isUnlocking = !error && isContentPurchaseInProgress(stage)

  const isLoading = statusIsNotFinalized(trackStatus)

  const isValidStreamGatedTrack = !!track && isTrackStreamPurchaseable(track)
  const isValidDownloadGatedTrack =
    !!track && isTrackDownloadPurchaseable(track)

  const purchaseConditions = isValidStreamGatedTrack
    ? track.stream_conditions
    : isValidDownloadGatedTrack
    ? track.download_conditions
    : null

  const price = purchaseConditions ? purchaseConditions?.usdc_purchase.price : 0

  const { initialValues, onSubmit, validationSchema } =
    usePurchaseContentFormConfiguration({ track, presetValues, price })

  const handleClosed = useCallback(() => {
    onClosed()
    dispatch(purchaseContentActions.cleanup())
  }, [onClosed, dispatch])

  if (
    !track ||
    !purchaseConditions ||
    !isUSDCEnabled ||
    !(isValidStreamGatedTrack || isValidDownloadGatedTrack)
  ) {
    console.error('PremiumContentPurchaseModal: Track is not purchasable')
    return null
  }

  return (
    <Drawer
      blockClose={isUnlocking && stage !== PurchaseContentStage.START}
      isOpen={isOpen}
      onClose={onClose}
      drawerHeader={PremiumTrackPurchaseDrawerHeader}
      onClosed={handleClosed}
      isGestureSupported={false}
      isFullscreen
    >
      {isLoading ? (
        <View style={styles.spinnerContainer}>
          <LoadingSpinner />
        </View>
      ) : (
        <View style={styles.formContainer}>
          <Formik
            initialValues={initialValues}
            validationSchema={toFormikValidationSchema(validationSchema)}
            onSubmit={onSubmit}
          >
            <RenderForm
              onClose={onClose}
              track={track}
              purchaseConditions={purchaseConditions}
            />
          </Formik>
        </View>
      )}
    </Drawer>
  )
}
