import { Address } from 'types'
import { fetchWithTimeout, TIMED_OUT_ERROR } from 'utils/fetch'
import { getRandomDefaultImage } from 'utils/identicon'

const api3Box = 'https://ipfs.3box.io'
const ipfsGateway = 'https://ipfs.infura.io/ipfs/'
const getProfileUrl = (wallet: string) => `${api3Box}/profile?address=${wallet}`

type User = {
  name?: string
  image: string
}

type UserWithCache = User & {
  noCache?: boolean
}

export const get3BoxProfile = async (
  wallet: Address
): Promise<UserWithCache> => {
  const image = getRandomDefaultImage(wallet)
  try {
    const user: User = { image }

    // Get the profile from 3box
    const profile = await fetchWithTimeout(getProfileUrl(wallet), 3000)
    if (profile.status === 'error') return user

    // Extract the name and image url
    if ('name' in profile) user.name = profile.name
    if (Array.isArray(profile.image) && profile.image.length > 0) {
      const [firstImage] = profile.image
      if ('contentUrl' in firstImage && '/' in firstImage.contentUrl) {
        const hash = firstImage.contentUrl['/']
        user.image = `${ipfsGateway}${hash}`
      }
    }

    // return the user
    return user
  } catch (err) {
    if (err.message.includes(TIMED_OUT_ERROR)) {
      // Response timed out - do not cache response
      return { image, noCache: true }
    }
    return { image }
  }
}

// NOTE: Look into storing the profiles in localstorage oir indexdb.
const cache3box: {
  [address: string]: User
} = {}

export const getUserProfile = async (wallet: string): Promise<User> => {
  if (wallet in cache3box) return cache3box[wallet]
  const profile = await get3BoxProfile(wallet)
  if (!profile.noCache) cache3box[wallet] = profile
  return {
    name: profile.name,
    image: profile.image
  }
}

export default getUserProfile
