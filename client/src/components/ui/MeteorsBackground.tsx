import React from 'react'

const MeteorsBackground = ( {children} :{
    children:React.ReactNode
}) => {
    return (
        <div className='overflow-hidden'>
            {children}
        </div>
    )
}

export default MeteorsBackground