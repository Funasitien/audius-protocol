import type {
  BorderColors,
  CornerRadiusOptions,
  ShadowOptions
} from 'foundations'

import type { FlexProps } from '../Flex'

/**
 * An elevated container which stands out from the background.
 */
export type BasePaperProps = {
  /**
   * Border type. If not provided, no border will be used.
   * @default default
   */
  border?: BorderColors

  /**
   * Border Radius
   * @default m
   */
  borderRadius?: CornerRadiusOptions

  /**
   * Elevation Shadow
   * @default mid
   */
  shadow?: Exclude<ShadowOptions, 'drop'>
}

export type PaperProps = BasePaperProps & FlexProps
