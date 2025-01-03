import { chatActions } from '@audius/common/store'
import { route } from '@audius/common/utils'
import { push as pushRoute } from 'connected-react-router'
import { takeLatest } from 'redux-saga/effects'
import { put } from 'typed-redux-saga'

import { chatPage } from 'utils/route'

const { CHATS_PAGE } = route
const { goToChat } = chatActions

function* watchGoToChat() {
  yield takeLatest(goToChat, function* (action: ReturnType<typeof goToChat>) {
    const {
      payload: { chatId, presetMessage }
    } = action
    if (!chatId) {
      yield* put(pushRoute(CHATS_PAGE))
    } else {
      yield* put(pushRoute(chatPage(chatId), { presetMessage }))
    }
  })
}

export default function sagas() {
  return [watchGoToChat]
}
