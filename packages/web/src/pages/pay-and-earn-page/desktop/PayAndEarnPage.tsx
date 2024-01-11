import { useCallback, useEffect, useState } from 'react'

import { useUSDCBalance, accountSelectors } from '@audius/common'
import {
  Button,
  Flex,
  IconCloudDownload,
  Paper,
  SelectablePill
} from '@audius/harmony'
import { replace } from 'connected-react-router'
import { useDispatch, useSelector } from 'react-redux'

import Header from 'components/header/desktop/Header'
import LoadingSpinner from 'components/loading-spinner/LoadingSpinner'
import Page from 'components/page/Page'
import { PURCHASES_PAGE, SALES_PAGE, WITHDRAWALS_PAGE } from 'utils/route'

import styles from '../PayAndEarnPage.module.css'
import { PurchasesTab, usePurchases } from '../components/PurchasesTab'
import { SalesTab, useSales } from '../components/SalesTab'
import { USDCCard } from '../components/USDCCard'
import { WithdrawalsTab, useWithdrawals } from '../components/WithdrawalsTab'
import { PayAndEarnPageProps, TableType } from '../types'

const { getAccountHasTracks } = accountSelectors

export const messages = {
  title: 'Pay & Earn',
  description: 'Pay & earn with Audius',
  sales: 'Sales',
  purchases: 'Your Purchases',
  withdrawals: 'Withdrawal History',
  downloadCSV: 'Download CSV'
}

type TableMetadata = {
  label: string
  downloadCSV: () => void
  isDownloadCSVButtonDisabled: boolean
}

export const PayAndEarnPage = ({ tableView }: PayAndEarnPageProps) => {
  const dispatch = useDispatch()
  const { data: balance } = useUSDCBalance()
  const accountHasTracks = useSelector(getAccountHasTracks)

  const [tableOptions, setTableOptions] = useState<TableType[] | null>(null)
  const [selectedTable, setSelectedTable] = useState<TableType | null>(null)
  useEffect(() => {
    if (accountHasTracks !== null) {
      const tableOptions = accountHasTracks
        ? [TableType.SALES, TableType.PURCHASES, TableType.WITHDRAWALS]
        : [TableType.PURCHASES, TableType.WITHDRAWALS]
      setTableOptions(tableOptions)
      setSelectedTable(tableView ?? tableOptions[0])
    }
  }, [accountHasTracks, setSelectedTable, tableView, setTableOptions])

  const {
    count: salesCount,
    data: sales,
    fetchMore: fetchMoreSales,
    onSort: onSalesSort,
    onClickRow: onSalesClickRow,
    isEmpty: isSalesEmpty,
    isLoading: isSalesLoading,
    downloadCSV: downloadSalesCSV
  } = useSales()
  const {
    count: purchasesCount,
    data: purchases,
    fetchMore: fetchMorePurchases,
    onSort: onPurchasesSort,
    onClickRow: onPurchasesClickRow,
    isEmpty: isPurchasesEmpty,
    isLoading: isPurchasesLoading,
    downloadCSV: downloadPurchasesCSV
  } = usePurchases()
  const {
    count: withdrawalsCount,
    data: withdrawals,
    fetchMore: fetchMoreWithdrawals,
    onSort: onWithdrawalsSort,
    onClickRow: onWithdrawalsClickRow,
    isEmpty: isWithdrawalsEmpty,
    isLoading: isWithdrawalsLoading,
    downloadCSV: downloadWithdrawalsCSV
  } = useWithdrawals()

  const header = <Header primary={messages.title} />

  const tables: Record<TableType, TableMetadata> = {
    [TableType.SALES]: {
      label: messages.sales,
      downloadCSV: downloadSalesCSV,
      isDownloadCSVButtonDisabled: isSalesLoading || isSalesEmpty
    },
    [TableType.PURCHASES]: {
      label: messages.purchases,
      downloadCSV: downloadPurchasesCSV,
      isDownloadCSVButtonDisabled: isPurchasesLoading || isPurchasesEmpty
    },
    [TableType.WITHDRAWALS]: {
      label: messages.withdrawals,
      downloadCSV: downloadWithdrawalsCSV,
      isDownloadCSVButtonDisabled: isWithdrawalsLoading || isWithdrawalsEmpty
    }
  }

  const handleSelectablePillClick = useCallback(
    (t: TableType) => {
      let route: string
      switch (t) {
        case TableType.SALES:
          route = SALES_PAGE
          break
        case TableType.PURCHASES:
          route = PURCHASES_PAGE
          break
        case TableType.WITHDRAWALS:
          route = WITHDRAWALS_PAGE
          break
      }
      setSelectedTable(t)
      dispatch(replace(route))
    },
    [setSelectedTable, dispatch]
  )

  return (
    <Page
      title={messages.title}
      description={messages.description}
      contentClassName={styles.pageContainer}
      header={header}
    >
      {!tableOptions || !selectedTable || balance === null ? (
        <LoadingSpinner className={styles.spinner} />
      ) : (
        <>
          <USDCCard balance={balance} />
          <Paper w='100%'>
            <Flex direction='column' w='100%'>
              <Flex
                ph='xl'
                pt='xl'
                direction='row'
                justifyContent='space-between'
                w='100%'
              >
                <Flex gap='s'>
                  {tableOptions.map((t) => (
                    <SelectablePill
                      key={tables[t].label}
                      label={tables[t].label}
                      isSelected={selectedTable === t}
                      onClick={() => handleSelectablePillClick(t)}
                    />
                  ))}
                </Flex>
                <Button
                  onClick={tables[selectedTable].downloadCSV}
                  variant='secondary'
                  size='small'
                  iconLeft={IconCloudDownload}
                  disabled={tables[selectedTable].isDownloadCSVButtonDisabled}
                >
                  {messages.downloadCSV}
                </Button>
              </Flex>
              {selectedTable === 'withdrawals' ? (
                <WithdrawalsTab
                  data={withdrawals}
                  count={withdrawalsCount}
                  isEmpty={isWithdrawalsEmpty}
                  isLoading={isWithdrawalsLoading}
                  onSort={onWithdrawalsSort}
                  onClickRow={onWithdrawalsClickRow}
                  fetchMore={fetchMoreWithdrawals}
                />
              ) : selectedTable === 'purchases' ? (
                <PurchasesTab
                  data={purchases}
                  count={purchasesCount}
                  isEmpty={isPurchasesEmpty}
                  isLoading={isPurchasesLoading}
                  onSort={onPurchasesSort}
                  onClickRow={onPurchasesClickRow}
                  fetchMore={fetchMorePurchases}
                />
              ) : (
                <SalesTab
                  data={sales}
                  count={salesCount}
                  isEmpty={isSalesEmpty}
                  isLoading={isSalesLoading}
                  onSort={onSalesSort}
                  onClickRow={onSalesClickRow}
                  fetchMore={fetchMoreSales}
                />
              )}
            </Flex>
          </Paper>
        </>
      )}
    </Page>
  )
}
