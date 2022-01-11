import { useContext } from 'react'
import ApiContext, { ApiContextProps } from '../api/chainApi/ApiContext'

export function useApi(): ApiContextProps {
  return useContext(ApiContext)
}