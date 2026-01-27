import debounce from "lodash.debounce"
import * as React from "react"

// ============================================================================

interface DebounceOptions {
  leading?: boolean
  trailing?: boolean
  maxWait?: number
}

interface ControlFunctions {
  cancel: () => void
  flush: () => void
  isPending: () => boolean
}

type DebouncedState<T extends (...args: any) => ReturnType<T>> = ((
  ...args: Parameters<T>
) => ReturnType<T> | undefined) &
  ControlFunctions

type UseDebounceValueOptions<T> = DebounceOptions & {
  equalityFn?: (left: T, right: T) => boolean
}

export function useDebounceValue<T>(
  initialValue: T | (() => T),
  delay: number,
  options?: UseDebounceValueOptions<T>,
): [T, DebouncedState<(value: T) => void>] {
  const eq = options?.equalityFn ?? ((left: T, right: T) => left === right)
  const unwrappedInitialValue = initialValue instanceof Function ? initialValue() : initialValue
  const [debouncedValue, setDebouncedValue] = React.useState<T>(unwrappedInitialValue)
  const previousValueRef = React.useRef<T | undefined>(unwrappedInitialValue)
  const debouncedFunc = React.useRef<ReturnType<typeof debounce>>(null)

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (debouncedFunc.current) {
        debouncedFunc.current.cancel()
      }
    }
  }, [])

  const updateDebouncedValue = React.useMemo(() => {
    const debouncedFuncInstance = debounce(setDebouncedValue, delay, options)

    const wrappedFunc: DebouncedState<(value: T) => void> = (value: T) => {
      return debouncedFuncInstance(value)
    }

    wrappedFunc.cancel = () => {
      debouncedFuncInstance.cancel()
    }

    wrappedFunc.isPending = () => {
      return !!debouncedFunc.current
    }

    wrappedFunc.flush = () => {
      return debouncedFuncInstance.flush()
    }

    return wrappedFunc
  }, [delay, options])

  React.useEffect(() => {
    debouncedFunc.current = debounce(setDebouncedValue, delay, options)
  }, [delay, options])

  // Update the debounced value if the initial value changes
  if (!eq(previousValueRef.current as T, unwrappedInitialValue)) {
    updateDebouncedValue(unwrappedInitialValue)
    previousValueRef.current = unwrappedInitialValue
  }

  return [debouncedValue, updateDebouncedValue]
}

export type { UseDebounceValueOptions, DebouncedState }

// ============================================================================