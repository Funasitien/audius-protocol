import { formatPrice } from '@audius/common'

import { Text } from 'components/typography'

import { FormatPrice } from './FormatPrice'
import styles from './PurchaseSummaryTable.module.css'

const messages = {
  summary: 'Summary',
  artistCut: 'Artist Cut',
  audiusCut: 'Audius Cut',
  alwaysZero: 'Always $0',
  existingBalance: 'Existing Balance',
  youPay: 'You Pay',
  zero: '$0',
  price: (val: string) => `$${val}`
}

export type PurchaseSummaryTableProps = {
  amountDue: number
  artistCut: number
  basePrice: number
  existingBalance?: number
}

export const PurchaseSummaryTable = ({
  amountDue,
  artistCut,
  basePrice,
  existingBalance
}: PurchaseSummaryTableProps) => {
  return (
    <Text className={styles.container}>
      <Text className={styles.row} variant='label' size='large'>
        {messages.summary}
      </Text>
      <div className={styles.row}>
        <span>{messages.artistCut}</span>
        <span>{messages.price(formatPrice(artistCut))}</span>
      </div>
      <div className={styles.row}>
        <span>{messages.audiusCut}</span>
        <span>{messages.alwaysZero}</span>
      </div>
      {existingBalance ? (
        <div className={styles.row}>
          <span>{messages.existingBalance}</span>
          <span>{`-${messages.price(formatPrice(existingBalance))}`}</span>
        </div>
      ) : null}
      <Text className={styles.row} variant='title'>
        <span>{messages.youPay}</span>
        <FormatPrice
          className={styles.finalPrice}
          basePrice={basePrice}
          amountDue={amountDue}
        />
      </Text>
    </Text>
  )
}
