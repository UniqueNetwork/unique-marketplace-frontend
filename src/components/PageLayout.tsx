import React, { FC, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { Layout } from '@unique-nft/ui-kit'
import Footer from './Footer'

const PageLayout: FC = (props) => {
  const { children } = props

  const { pathname } = useLocation()

  const layoutProps = useMemo(() => {
    if (pathname === '/') return { heading: 'Block Explorer' }
  }, [pathname])

  return (
    <Layout {...layoutProps} footer={<Footer />}>
      {children}
    </Layout>
  )
}

export default PageLayout
