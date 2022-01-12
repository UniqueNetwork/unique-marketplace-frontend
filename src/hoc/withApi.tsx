import React from 'react'
import { ApiConsumer, ApiContextProps } from '../api/ApiContext'

export default function withApi<P extends ApiContextProps>(
  Inner: React.ComponentType<P>
): React.ComponentType<P> {
  return (props) => {
    return (
      <ApiConsumer>
        {(apiProps: ApiContextProps): React.ReactNode => {
          return <Inner {...props} {...apiProps} />
        }}
      </ApiConsumer>
    )
  }
}
