import { useCallback, useMemo } from 'react'

import { useGetUsersByIds } from '@audius/common/api'
import { Status } from '@audius/common/models'
import { Button, Flex, LoadingSpinner, Paper, Text } from '@audius/harmony'
import { Form, Formik, useFormikContext } from 'formik'
import { PieChart, Pie, Tooltip, Cell } from 'recharts'

import { TextField } from 'components/form-fields'
import { SelectField } from 'components/form-fields/SelectField'
import Header from 'components/header/desktop/Header'
import Page from 'components/page/Page'
import UserList from 'components/user-list/components/UserList'

const messages = {
  title: 'Split Donation',
  description: 'Split your donation between multiple creators',
  amountInputLabel: 'Donation Amount',
  donateButtonLabel: 'Donate',
  selectPresetLabel: 'Split Preset',
  configureLabel: 'Configure your donation',
  usersListLabel: 'Selected Users',
  piechartLabel: 'Donation Breakdown'
}

const header = <Header primary={messages.title} />

const FEATURED_ARTIST_IDS = [50672, 207676588, 985480]

const presetOptions = [
  { value: 'featured', label: 'Featured Creators' },
  { value: 'custom', label: 'Custom Selection' },
  { value: 'favorite', label: 'Your Favorite Creators' }
]

const initialValues = {
  preset: 'featured'
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

type CustomPieChartProps = {
  data: { name: string; value: number }[]
}
const CustomPieChart = (props: CustomPieChartProps) => {
  const { data } = props
  return (
    <PieChart width={600} height={400} css={{ overflow: 'visible' }}>
      <Pie
        data={data}
        cx={300}
        cy={200}
        outerRadius={150}
        fill='#8884d8'
        dataKey='value'
        label={({ name, value }) => name}
        overflow={'visible'}
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip />
    </PieChart>
  )
}

export default CustomPieChart

const SplitDonationForm = () => {
  const { values } = useFormikContext<typeof initialValues>()

  const userIds = useMemo(() => {
    if (values.preset === 'featured') {
      return FEATURED_ARTIST_IDS
    }
    return []
  }, [values])

  const { data: users, status: usersStatus } = useGetUsersByIds({
    ids: userIds
  })

  const piechartData = useMemo(() => {
    return (
      users?.map((user) => ({
        name: user.name,
        value: 1
      })) ?? []
    )
  }, [users])

  return (
    <Flex gap='l' alignItems='flex-start'>
      <Flex direction='column' gap='l' flex='1 1 auto'>
        <Paper direction='column' gap='l' p='xl'>
          <Text variant='title' textAlign='left'>
            {messages.configureLabel}
          </Text>
          <TextField
            label={messages.amountInputLabel}
            placeholder='0'
            endAdornment='$AUDIO'
            name='amount'
            type='number'
          />
          <SelectField
            options={presetOptions}
            name='preset'
            label={messages.selectPresetLabel}
          />
          <Button variant='primary' type='submit' fullWidth>
            {messages.donateButtonLabel}
          </Button>
        </Paper>
        <Paper
          direction='column'
          justifyContent='center'
          gap='m'
          p='xl'
          alignItems='flex-start'
        >
          <Text variant='title'>{messages.piechartLabel}</Text>
          {usersStatus === Status.LOADING ? (
            <LoadingSpinner />
          ) : (
            <CustomPieChart data={piechartData} />
          )}
        </Paper>
      </Flex>
      <Paper direction='column' gap='m' p='xl' alignItems='flex-start'>
        <Text variant='title'>{messages.usersListLabel}</Text>
        <UserList
          hasMore={false}
          loading={usersStatus === Status.LOADING}
          userId={null}
          users={users ?? []}
          isMobile={false}
          tag={'split-donation'}
          loadMore={() => {}}
          onClickArtistName={() => {}}
          onFollow={() => {}}
          onUnfollow={() => {}}
        />
      </Paper>
    </Flex>
  )
}

export const SplitDonationPage = () => {
  const handleSubmit = useCallback((formValues: any) => {
    console.log('submit', formValues)
  }, [])
  return (
    <Page
      title={messages.title}
      description={messages.description}
      header={header}
    >
      <Formik initialValues={initialValues} onSubmit={handleSubmit}>
        <Form>
          <SplitDonationForm />
        </Form>
      </Formik>
    </Page>
  )
}
