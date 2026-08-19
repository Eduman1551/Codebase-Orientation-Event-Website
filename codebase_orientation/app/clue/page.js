// 'use Client'
// import React, { useEffect } from 'react'
// import { useRef } from 'react'

// const Clue = () => {
//     const [ans, setAns] = useState({ans: ""})
//     const [startTime, setStartTime] = useState()
//     useEffect(() => {
//         setStartTime(Date.now())
//     }, [])

//     const ref = useRef();

//     const handleSubmit = () =>{
//         let x = await
//     }
//   return (
//     <div>
//       <input type="text" name='ans' value={ans.ans} />
//       <input ref={ref} type="range" min={40} max={100} value={100} />
//       <button onClick={handleSubmit}></button>
//     </div>
//   )
// }

// export default Clue

'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

const Clue = ({ clueId }) => {
    const [ans, setAns] = useState("")
    const [startTime, setStartTime] = useState(null)
    const [submitted, setSubmitted] = useState(false)
    const [message, setMessage] = useState("")
    const [range, setRange] = useState(100)
    const [clue, setClue] = useState(null)

    const router = useRouter()
    const ref = useRef()

    const fetchClue = async () => {
       //fetch clue from db and store it in data

        // setClue(data.clue)
        setClue({clue1:"sdasd"})

        setRange(100)
    }

    useEffect(() => {
        if (!clue) return

        const interval = setInterval(() => {
            setRange(prev => prev - 1)
        }, 3000)

        const timeout = setTimeout(() => {
            router.push('/answer')
        }, 5 * 60 * 1000)

        return () => {
            clearInterval(interval)
            clearTimeout(timeout)
        }
    }, [clue, router])

    useEffect(() => {
        setStartTime(Date.now())
        fetchClue()
    }, [])
    
    
    const handleSubmit = async () => {
        if (!ans.trim() || !startTime || submitted) return

        const submittedAt = Date.now()

        try {
            const res = await checkAns(startTime, submittedAt, ans)

            if (res) {
                setSubmitted(true)
                setMessage("Correct!")
            } else {
                setMessage(data.message || "Wrong answer. Try again.")
            }
        } catch (error) {
            console.error(error)
            setMessage("Something went wrong.")
        }
    }

    if (!clue) {
        return <p>Loading...</p>
    }

    return (

        // clue section area show the clue here

        <div>
            <input type="text" name="ans" value={ans} onChange={(e) => setAns(e.target.value)} disabled={submitted} className='bg-amber-200'/>

            <input ref={ref} type="range" min={40} max={100} value={range} readOnly />

            <button onClick={handleSubmit} disabled={submitted || !ans.trim()}>Submit</button>
            <p>{message}</p>
        </div>
    )
}

export default Clue