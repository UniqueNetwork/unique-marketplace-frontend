import React, { FC } from 'react'
import { NavLink } from 'react-router-dom'

const Header: FC = () => {

  return (
    <header className='app-header'>
      <div className='app-container app-container--header'>
        <NavLink to={'/'} >
          <img
            alt={`logo`}
            src={'/logos/unique.svg'}
          />
        </NavLink>
      </div>
    </header>
  )
}

export default Header
