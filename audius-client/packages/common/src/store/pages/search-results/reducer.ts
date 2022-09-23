import { asLineup } from 'store/lineup/reducer'
import {
  FETCH_SEARCH_PAGE_RESULTS,
  FETCH_SEARCH_PAGE_RESULTS_SUCCEEDED,
  FETCH_SEARCH_PAGE_RESULTS_FAILED,
  SearchPageActions,
  FETCH_SEARCH_PAGE_TAGS,
  FETCH_SEARCH_PAGE_TAGS_SUCCEEDED,
  FETCH_SEARCH_PAGE_TAGS_FAILED,
  FetchSearchPageResultsFailedAction,
  FetchSearchPageResultsSuceededAction,
  FetchSearchPageTagsAction,
  FetchSearchPageTagsSucceededAction,
  FetchSearchPageTagsFailedAction
} from 'store/pages/search-results/actions'
import { PREFIX } from 'store/pages/search-results/lineup/tracks/actions'
import tracksReducer from 'store/pages/search-results/lineup/tracks/reducer'

import { Status } from '../../../models'

import { SearchPageState } from './types'

const calculateNewSearchResults = (
  state: SearchPageState,
  action:
    | FetchSearchPageResultsSuceededAction
    | FetchSearchPageTagsSucceededAction
) => {
  const query =
    action.type === 'SEARCH/FETCH_SEARCH_PAGE_RESULTS_SUCCEEDED'
      ? action.searchText
      : action.tag
  const prevStateQuery = state.searchText

  const newState = {
    ...initialState,
    status: Status.SUCCESS
  }
  if (action.results) {
    newState.searchText = query
    newState.isTagSearch =
      action.type === 'SEARCH/FETCH_SEARCH_PAGE_TAGS_SUCCEEDED'
    const keepPrevResult =
      query === prevStateQuery && newState.isTagSearch === state.isTagSearch
    newState.trackIds =
      action.results.tracks || (keepPrevResult ? state.trackIds : undefined)
    newState.albumIds =
      action.results.albums || (keepPrevResult ? state.albumIds : undefined)
    newState.playlistIds =
      action.results.playlists ||
      (keepPrevResult ? state.playlistIds : undefined)
    newState.artistIds =
      action.results.users || (keepPrevResult ? state.artistIds : undefined)
    newState.tracks = keepPrevResult ? state.tracks : initialState.tracks
  }
  return newState
}

const initialState: SearchPageState = {
  status: Status.SUCCESS,
  searchText: '',
  isTagSearch: false,
  trackIds: undefined,
  albumIds: undefined,
  playlistIds: undefined,
  artistIds: undefined,
  tracks: {
    entries: [],
    order: {},
    total: 0,
    deleted: 0,
    nullCount: 0,
    status: Status.LOADING,
    hasMore: true,
    inView: false,
    prefix: '',
    page: 0,
    isMetadataLoading: false,
    maxEntries: null,
    containsDeleted: false
  }
}

const actionsMap = {
  [FETCH_SEARCH_PAGE_RESULTS](state: SearchPageState) {
    return {
      ...state,
      status: Status.LOADING
    }
  },
  [FETCH_SEARCH_PAGE_RESULTS_SUCCEEDED](
    state: SearchPageState,
    action: FetchSearchPageResultsSuceededAction
  ) {
    return calculateNewSearchResults(state, action)
  },
  [FETCH_SEARCH_PAGE_RESULTS_FAILED](
    _state: SearchPageState,
    _action: FetchSearchPageResultsFailedAction
  ) {
    return {
      ...initialState,
      status: Status.ERROR
    }
  },
  [FETCH_SEARCH_PAGE_TAGS](
    state: SearchPageState,
    _action: FetchSearchPageTagsAction
  ) {
    return {
      ...state,
      status: Status.LOADING
    }
  },
  [FETCH_SEARCH_PAGE_TAGS_SUCCEEDED](
    state: SearchPageState,
    action: FetchSearchPageTagsSucceededAction
  ) {
    return calculateNewSearchResults(state, action)
  },
  [FETCH_SEARCH_PAGE_TAGS_FAILED](
    _state: SearchPageState,
    _action: FetchSearchPageTagsFailedAction
  ) {
    return {
      ...initialState,
      status: Status.ERROR
    }
  }
}

const tracksLineupReducer = asLineup(PREFIX, tracksReducer)

function reducer(
  state: SearchPageState = initialState,
  action: SearchPageActions
) {
  // @ts-ignore this technically will never hit with actions typed the way they are
  const tracks = tracksLineupReducer(state.tracks, action)
  if (tracks !== state.tracks) return { ...state, tracks }

  const matchingReduceFunction = actionsMap[action.type]
  if (!matchingReduceFunction) return state
  // @ts-ignore for some reason action is never ts 4.0 may help
  return matchingReduceFunction(state, action as SearchPageActions)
}

export default reducer
