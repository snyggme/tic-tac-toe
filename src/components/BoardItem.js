import React from 'react'

export const BoardItem = (props) => {
  const content = props.content === 'none' ? '' :
                    props.content === 'cross' 
                      ? <div id='cross'>
                          <div className='cross-line line-1'></div>
                          <div className='cross-line line-2'></div>
                        </div>
                      : <div id='zero'>
                          <div></div>
                        </div>
  return(
    <div  className={`item ${props.name}`}   
          onClick={props.onClick}>
      {content}
    </div>
  )
}