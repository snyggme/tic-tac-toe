import React from 'react'

export const Header = (props) => {
  const styleActive = {
    borderBottom: '2px solid lightblue',
    boxShadow: '0 4px 5px rgba(0,0,0,.16)'
  }
  const styleDisable = {
    borderBottom: 'none',
    boxShadow: '0 1px 1px rgba(0,0,0,.16)'
  }
  return(
    <header>
      <div className='header-x-box' 
            onClick={props.active ? props.pickCrossSign : null}
            style={props.crossActive ? styleActive : styleDisable}>
        <div id='cross-small'>
          <div className='cross-small-line small-line-1'></div>
          <div className='cross-small-line small-line-2'></div> 
        </div>
      </div>
      <div className='header-o-box' 
            onClick={props.active ? props.pickZeroSign : null}
            style={props.zeroActive ? styleActive : styleDisable}>
        <div id='zero-small'><div></div></div>
      </div>
      <div className='header-game-text'>
        {props.text}
      </div>
    </header>
  )
}