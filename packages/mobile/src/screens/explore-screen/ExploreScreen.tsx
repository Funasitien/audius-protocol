import { explorePageActions } from '@audius/common/store'
import { useDispatch } from 'react-redux'
import { useEffectOnce } from 'react-use'

import {
  IconExplore,
  IconStars,
  IconMood,
  IconPlaylists,
  IconUser
} from '@audius/harmony-native'
import { Screen, ScreenContent, ScreenHeader } from 'app/components/core'
import { ScreenPrimaryContent } from 'app/components/core/Screen/ScreenPrimaryContent'
import { ScreenSecondaryContent } from 'app/components/core/Screen/ScreenSecondaryContent'
import { TopTabNavigator } from 'app/components/top-tab-bar'
import { useAppTabScreen } from 'app/hooks/useAppTabScreen'

import { HeaderLeftProfile } from '../app-screen/useAppScreenOptions'

import { ArtistsTab } from './tabs/ArtistsTab'
import { ForYouTab } from './tabs/ForYouTab'
import { MoodsTab } from './tabs/MoodsTab'
import { PlaylistsTab } from './tabs/PlaylistsTab'

const { fetchExplore } = explorePageActions

const messages = {
  header: 'Explore',
  forYou: 'For You'
}

const exploreScreens = [
  {
    name: 'forYou',
    label: messages.forYou,
    Icon: IconStars,
    component: ForYouTab
  },
  {
    name: 'moods',
    Icon: IconMood,
    component: MoodsTab
  },
  {
    name: 'playlists',
    Icon: IconPlaylists,
    component: PlaylistsTab
  },
  {
    name: 'artists',
    Icon: IconUser,
    component: ArtistsTab
  }
]

const ExploreScreen = () => {
  const dispatch = useDispatch()
  useAppTabScreen()

  useEffectOnce(() => {
    dispatch(fetchExplore())
  })

  return (
    <Screen topbarLeft={<HeaderLeftProfile />}>
      <ScreenPrimaryContent>
        <ScreenHeader
          text={messages.header}
          icon={IconExplore}
          iconProps={{ height: 30 }}
        />
      </ScreenPrimaryContent>
      <ScreenContent>
        <ScreenSecondaryContent>
          <TopTabNavigator
            screens={exploreScreens}
            screenOptions={{ lazy: true }}
          />
        </ScreenSecondaryContent>
      </ScreenContent>
    </Screen>
  )
}

export default ExploreScreen
