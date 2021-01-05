import React from 'react'
import {
  IconTwitterBird,
  IconInstagram,
  IconDonate,
  IconLink
} from '@audius/stems'

import styles from './EditProfile.module.css'
import GroupableList from 'components/groupable-list/GroupableList'
import Grouping from 'components/groupable-list/Grouping'
import EditableRow, { Format } from 'components/groupable-list/EditableRow'

type EditProfileProps = {
  name: string
  bio: string
  location: string
  isVerified: boolean
  twitterHandle: string
  instagramHandle: string
  twitterVerified?: boolean
  instagramVerified?: boolean
  website: string
  donation: string

  onUpdateName: (name: string) => void
  onUpdateBio: (bio: string) => void
  onUpdateLocation: (location: string) => void
  onUpdateTwitterHandle: (handle: string) => void
  onUpdateInstagramHandle: (handle: string) => void
  onUpdateWebsite: (website: string) => void
  onUpdateDonation: (donation: string) => void
}

const EditProfile = ({
  name,
  bio,
  location,
  isVerified,
  twitterHandle,
  instagramHandle,
  twitterVerified,
  instagramVerified,
  website,
  donation,
  onUpdateName,
  onUpdateBio,
  onUpdateLocation,
  onUpdateTwitterHandle,
  onUpdateInstagramHandle,
  onUpdateWebsite,
  onUpdateDonation
}: EditProfileProps) => {
  return (
    <div className={styles.editProfile}>
      <GroupableList>
        <Grouping>
          <EditableRow
            label='Name'
            format={Format.INPUT}
            initialValue={name}
            onChange={onUpdateName}
            maxLength={32}
          />
          <EditableRow
            label='Bio'
            format={Format.TEXT_AREA}
            initialValue={bio}
            onChange={onUpdateBio}
            maxLength={256}
          />
          <EditableRow
            label='Location'
            format={Format.INPUT}
            initialValue={location}
            onChange={onUpdateLocation}
            maxLength={30}
          />
          <EditableRow
            label={<IconTwitterBird className={styles.icon} />}
            format={Format.INPUT}
            initialValue={twitterHandle}
            onChange={onUpdateTwitterHandle}
            maxLength={200}
            inputPrefix='@'
            isDisabled={!!twitterVerified}
          />
          <EditableRow
            label={<IconInstagram className={styles.icon} />}
            format={Format.INPUT}
            initialValue={instagramHandle}
            onChange={onUpdateInstagramHandle}
            maxLength={200}
            inputPrefix='@'
            isDisabled={!!instagramVerified}
          />
          <EditableRow
            label={<IconLink className={styles.icon} />}
            format={Format.INPUT}
            initialValue={website}
            onChange={onUpdateWebsite}
            maxLength={200}
          />
          <EditableRow
            label={<IconDonate className={styles.icon} />}
            format={Format.INPUT}
            initialValue={donation}
            onChange={onUpdateDonation}
            stripLinksFromLength
            maxLength={32}
          />
        </Grouping>
      </GroupableList>
    </div>
  )
}

export default EditProfile
