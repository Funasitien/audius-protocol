import { useCallback, useEffect, useState } from 'react'

import type { ReactNativeStyle } from '@emotion/native'
import { useTheme } from '@emotion/react'
import { isNil } from 'lodash'

import { IconCloseAlt, Text } from '@audius/harmony-native'

import { BaseButton } from '../BaseButton/BaseButton'

import type { FilterButtonProps } from './types'

export const FilterButton = (props: FilterButtonProps) => {
  const {
    value,
    label,
    onPress,
    onOpen,
    onReset,
    disabled,
    variant = 'fillContainer',
    size = 'default',
    iconRight,
    leadingElement
  } = props

  const { color, cornerRadius, spacing, typography } = useTheme()
  const [isOpen, setIsOpen] = useState(false)

  // Size Styles
  const defaultStyles: ReactNativeStyle = {
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s
  }
  const defaultIconStyles: ReactNativeStyle = {
    width: spacing.unit4,
    height: spacing.unit4
  }

  const smallStyles: ReactNativeStyle = {
    paddingHorizontal: spacing.m,
    height: spacing.unit8
  }
  const smallIconStyles: ReactNativeStyle = {
    width: spacing.unit3,
    height: spacing.unit3
  }

  // TODO: Update these are the button styles to use animated styles for the background, border, text, and icon
  // State Styles
  const fillContainerStyles: ReactNativeStyle = {
    backgroundColor: color.secondary.s400,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: color.secondary.s400
  }

  const activeStyle: ReactNativeStyle =
    variant !== 'fillContainer' || isNil(value)
      ? {
          backgroundColor: color.background.surface2,
          borderWidth: 1,
          borderStyle: 'solid',
          borderColor: color.border.strong
        }
      : {}

  // Button Styles
  const buttonStyles: ReactNativeStyle = {
    backgroundColor: color.background.white,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: color.border.strong,
    borderRadius: cornerRadius.s,
    color:
      variant === 'fillContainer' && !isNil(value)
        ? color.static.white
        : color.text.default,
    gap: spacing.xs,
    fontSize: typography.size.s,
    fontWeight: '600',
    lineHeight: typography.lineHeight.s,
    opacity: disabled ? 0.6 : 1,

    ...(size === 'small' ? smallStyles : defaultStyles),
    ...(isOpen ? activeStyle : {}),
    ...(variant === 'fillContainer' && !isNil(value) ? fillContainerStyles : {})
  }

  const iconStyles = size === 'small' ? smallIconStyles : defaultIconStyles

  useEffect(() => {
    if (isOpen) {
      onOpen?.()
    }
  }, [isOpen, onOpen])

  const handlePress = useCallback(() => {
    if (onPress) {
      onPress()
    } else {
      if (variant === 'fillContainer' && !isNil(value)) {
        onReset?.()
      } else {
        setIsOpen((isOpen: boolean) => !isOpen)
      }
    }
  }, [onPress, onReset, value, variant])

  const iconSize = size === 'small' ? 's' : 'm'
  const textColor =
    !isNil(value) && variant === 'fillContainer' ? 'staticWhite' : 'default'

  return (
    <BaseButton
      style={buttonStyles}
      styles={{ icon: iconStyles }}
      innerProps={{
        icon: {
          color: 'staticWhite',
          size: iconSize
        }
      }}
      onPress={handlePress}
      iconRight={
        variant === 'fillContainer' && !isNil(value) ? IconCloseAlt : iconRight
      }
      disabled={disabled}
      aria-haspopup='listbox'
      aria-expanded={isOpen}
    >
      {leadingElement}
      <Text color={textColor}>{label}</Text>
    </BaseButton>
  )
}