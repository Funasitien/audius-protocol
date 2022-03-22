import { useCallback, useRef } from 'react'

import { getUserId } from 'audius-client/src/common/store/account/selectors'
import { Animated, LayoutAnimation, View } from 'react-native'
import { useToggle } from 'react-use'

import IconCrown from 'app/assets/images/iconCrown.svg'
import IconSettings from 'app/assets/images/iconSettings.svg'
import { Screen } from 'app/components/core'
import { useNavigation } from 'app/hooks/useNavigation'
import { useSelectorWeb } from 'app/hooks/useSelectorWeb'
import { TopBarIconButton } from 'app/screens/app-screen'
import { makeStyles } from 'app/styles/makeStyles'
import { useThemeColors } from 'app/utils/theme'

import { ProfileTabScreenParamList } from '../app-screen/ProfileTabScreen'

import { ArtistRecommendations } from './ArtistRecommendations/ArtistRecommendations'
import { CoverPhoto } from './CoverPhoto'
import { ExpandableBio } from './ExpandableBio'
import { ProfileInfo } from './ProfileInfo'
import { ProfileMetrics } from './ProfileMetrics'
import { ProfilePicture } from './ProfilePicture'
import { ProfileSocials } from './ProfileSocials'
import { ProfileTabNavigator } from './ProfileTabNavigator'
import { UploadTrackButton } from './UploadTrackButton'
import { useSelectProfileRoot } from './selectors'

const useStyles = makeStyles(({ palette, spacing }) => ({
  header: {
    backgroundColor: palette.neutralLight10,
    paddingTop: spacing(8),
    paddingHorizontal: spacing(3),
    paddingBottom: spacing(3)
  },
  profilePicture: {
    position: 'absolute',
    top: 37,
    left: 11,
    zIndex: 100
  },
  navigator: {
    height: '100%'
  },
  topBarIcons: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  iconCrownRoot: {
    marginLeft: spacing(1)
  },
  iconCrown: {
    height: 22,
    width: 22
  }
}))

export const ProfileScreen = () => {
  const styles = useStyles()
  const profile = useSelectProfileRoot(['user_id', 'does_current_user_follow'])
  const accountId = useSelectorWeb(getUserId)
  // const dispatchWeb = useDispatchWeb()
  // const status = useSelectorWeb(getProfileStatus)
  // const [isRefreshing, setIsRefreshing] = useState(false)
  const [hasUserFollowed, setHasUserFollowed] = useToggle(false)
  const { accentOrange } = useThemeColors()

  const navigation = useNavigation<ProfileTabScreenParamList>()

  const handleNavigateSettings = useCallback(() => {
    navigation.push({
      native: { screen: 'SettingsScreen', params: undefined },
      web: { route: '/settings' }
    })
  }, [navigation])

  const handleNavigateAudio = useCallback(() => {
    navigation.push({
      native: { screen: 'AudioScreen', params: undefined },
      web: { route: '/audio ' }
    })
  }, [navigation])

  const handleFollow = useCallback(() => {
    if (!profile?.does_current_user_follow) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
      setHasUserFollowed(true)
    }
  }, [setHasUserFollowed, profile])

  const handleCloseArtistRecs = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
    setHasUserFollowed(false)
  }, [setHasUserFollowed])

  // TODO(AUD-1649): Fix pull to refresh
  // const handleRefresh = useCallback(() => {
  //   if (profile) {
  //     setIsRefreshing(true)
  //     const { handle, user_id } = profile
  //     dispatchWeb(fetchProfile(handle, user_id, true, true, true))
  //   }
  // }, [profile, dispatchWeb])

  // useEffect(() => {
  //   if (status === Status.SUCCESS) {
  //     setIsRefreshing(false)
  //   }
  // }, [status])

  const isOwner = profile?.user_id === accountId

  const topbarLeft = isOwner ? (
    <View style={styles.topBarIcons}>
      <TopBarIconButton icon={IconSettings} onPress={handleNavigateSettings} />
      <TopBarIconButton
        styles={{ root: styles.iconCrownRoot, icon: styles.iconCrown }}
        fill={accentOrange}
        icon={IconCrown}
        onPress={handleNavigateAudio}
      />
    </View>
  ) : undefined

  const scrollY = useRef(new Animated.Value(0)).current

  const renderHeader = () => {
    return (
      // Box-none gets us scrolling on the non-touchable parts of the header
      // See scroll on header documentation:
      // https://github.com/PedroBern/react-native-collapsible-tab-view/tree/v2#scroll-on-header
      // And also known drawbacks:
      // https://github.com/PedroBern/react-native-collapsible-tab-view/pull/30
      <>
        <CoverPhoto scrollY={scrollY} />
        <ProfilePicture style={styles.profilePicture} />
        <View pointerEvents='box-none' style={styles.header}>
          <ProfileInfo onFollow={handleFollow} />
          <ProfileMetrics />
          <ProfileSocials />
          <ExpandableBio />
          {!hasUserFollowed ? null : (
            <ArtistRecommendations onClose={handleCloseArtistRecs} />
          )}
          {!isOwner ? null : <UploadTrackButton />}
        </View>
      </>
    )
  }

  return (
    <Screen topbarLeft={topbarLeft}>
      {!profile ? null : (
        <>
          <View style={styles.navigator}>
            <ProfileTabNavigator
              renderHeader={renderHeader}
              animatedValue={scrollY}
            />
          </View>
        </>
      )}
    </Screen>
  )
}
