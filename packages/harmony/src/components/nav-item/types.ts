import { MouseEvent, ReactNode } from 'react'

import { IconComponent } from 'components/icon'
import { FlexProps } from 'components/layout'
import { TextSize } from 'components/text'

import type { WithCSS } from '../../foundations/theme'

export type NavItemProps = WithCSS<{
  /** The label text of the navigation item. */
  children: React.ReactNode
  /** The name of the icon to display on the left side of the label. */
  leftIcon?: IconComponent
  /** The name of the icon to display on the right side of the label. */
  rightIcon?: ReactNode
  /** Whether the navigation item is currently selected. */
  isSelected?: boolean
  /** The callback function to be called when the navigation item is clicked. */
  onClick?: (event?: MouseEvent<Element>) => void
  /** The size of the text to display. */
  textSize?: TextSize
}> &
  FlexProps
