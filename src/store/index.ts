import { ActionReducerMap } from '@ngrx/store'
import { LayoutState, layoutReducer } from './layout/layout-reducers'

export interface RootState {
  layout: LayoutState
}

export const rootReducer: ActionReducerMap<RootState> = {
  layout: layoutReducer,
}