import { createReducer, on } from '@ngrx/store'
import {
  LAYOUT_COLOR_TYPES,
  LAYOUT_MODE_TYPES,
  LAYOUT_TYPES,
  MENU_COLOR_TYPES,
  SIDEBAR_SIZE_TYPES,
  TOPBAR_COLOR_TYPES,
} from './layout'
import {
  changelayout,
  changemode,
  changetheme,
  changemenucolor,
  changesidebarsize,
  changetopbarcolor,
  resetState,
} from './layout-action'

export interface LayoutState {
  LAYOUT: string
  LAYOUT_THEME: string
  LAYOUT_MODE: string
  TOPBAR_COLOR: string
  MENU_COLOR: string
  MENU_SIZE: string
}

const initialLayout: LayoutState = {
  LAYOUT: LAYOUT_TYPES.VERTICAL,
  LAYOUT_THEME: LAYOUT_COLOR_TYPES.LIGHTMODE,
  LAYOUT_MODE: LAYOUT_MODE_TYPES.FLUIDMODE,
  TOPBAR_COLOR: TOPBAR_COLOR_TYPES.LIGHT,
  MENU_COLOR: MENU_COLOR_TYPES.DARK,
  MENU_SIZE: SIDEBAR_SIZE_TYPES.DEFAULT,
}

export const layoutReducer = createReducer(
  initialLayout,
  on(changelayout, (state, action) => ({ ...state, LAYOUT: action.layout })),
  on(changetheme, (state, action) => ({ ...state, LAYOUT_THEME: action.color })),
  on(changemode, (state, action) => ({ ...state, LAYOUT_MODE: action.mode })),
  on(changetopbarcolor, (state, action) => ({ ...state, TOPBAR_COLOR: action.topbar })),
  on(changemenucolor, (state, action) => ({ ...state, MENU_COLOR: action.menu })),
  on(changesidebarsize, (state, action) => ({ ...state, MENU_SIZE: action.size })),
  on(resetState, () => initialLayout),
)