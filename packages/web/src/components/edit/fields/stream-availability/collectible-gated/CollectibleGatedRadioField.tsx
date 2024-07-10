import {
  useAccessAndRemixSettings,
  useFeatureFlag,
  useHasNoCollectibles
} from '@audius/common/hooks'
import {
  StreamTrackAvailabilityType,
  AccessConditions
} from '@audius/common/models'
import { FeatureFlags } from '@audius/common/services'
import { IconCollectible } from '@audius/harmony'

import { ModalRadioItem } from 'components/modal-radio/ModalRadioItem'

import { CollectibleGatedDescription } from './CollectibleGatedDescription'
import { CollectibleGatedFields } from './CollectibleGatedFields'

const messages = {
  collectibleGated: 'Collectible Gated',
  noCollectibles:
    'No collectibles found. Link a wallet containing a digital collectible to enable this option.',
  fromFreeHint: (contentType: 'album' | 'track') =>
    `You can't make a free ${contentType} premium.`
}

type CollectibleGatedRadioFieldProps = {
  isRemix: boolean
  isUpload?: boolean
  isAlbum?: boolean
  initialStreamConditions?: AccessConditions
  isInitiallyUnlisted?: boolean
}

export const CollectibleGatedRadioField = (
  props: CollectibleGatedRadioFieldProps
) => {
  const {
    isRemix,
    isUpload,
    isAlbum,
    initialStreamConditions,
    isInitiallyUnlisted
  } = props

  const { isEnabled: isEditableAccessEnabled } = useFeatureFlag(
    FeatureFlags.EDITABLE_ACCESS_ENABLED
  )
  const hasNoCollectibles = useHasNoCollectibles()
  const {
    disableCollectibleGate: disabled,
    disableCollectibleGateFields: fieldsDisabled
  } = useAccessAndRemixSettings({
    isEditableAccessEnabled: !!isEditableAccessEnabled,
    isUpload: !!isUpload,
    isRemix,
    initialStreamConditions: initialStreamConditions ?? null,
    isInitiallyUnlisted: !!isInitiallyUnlisted
  })

  return (
    <ModalRadioItem
      icon={<IconCollectible />}
      label={messages.collectibleGated}
      value={StreamTrackAvailabilityType.COLLECTIBLE_GATED}
      disabled={disabled}
      description={
        <CollectibleGatedDescription
          hasCollectibles={!hasNoCollectibles}
          isUpload={true}
        />
      }
      checkedContent={<CollectibleGatedFields disabled={fieldsDisabled} />}
      tooltipText={
        hasNoCollectibles
          ? messages.noCollectibles
          : disabled
          ? messages.fromFreeHint(isAlbum ? 'album' : 'track')
          : undefined
      }
    />
  )
}
