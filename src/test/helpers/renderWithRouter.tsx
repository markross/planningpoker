import { render, type RenderOptions } from '@testing-library/react'
import { MemoryRouter, type MemoryRouterProps } from 'react-router-dom'
import type { ReactNode } from 'react'

interface RouterRenderOptions extends RenderOptions {
  readonly routerProps?: MemoryRouterProps
}

export function renderWithRouter(
  ui: ReactNode,
  { routerProps, ...renderOptions }: RouterRenderOptions = {},
) {
  return render(
    <MemoryRouter {...routerProps}>{ui}</MemoryRouter>,
    renderOptions,
  )
}
