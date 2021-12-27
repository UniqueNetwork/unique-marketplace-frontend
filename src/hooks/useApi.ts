import { useContext } from 'react'
import ApiContext, { ApiContextProps } from '../context/ApiContext'

export function useApi (): ApiContextProps {
  return useContext(ApiContext);
}