import React, { useState } from 'react'
import { LuWorkflow, LuSparkles } from "react-icons/lu";
import { PiMagicWand } from "react-icons/pi";

import { motion } from 'framer-motion'
import { Card, CardContent } from "@/components/ui/card"

export default function EmptyState({ title, ...props }) {
  const [animate1, setAnimate1] = useState()
  const [animate2, setAnimate2] = useState()
  const [animate3, setAnimate3] = useState()

  const inOut = (inoutState) => {
    if (inoutState) {
      setAnimate1({ y: -5 })
      setAnimate2({ y: -5, rotate: -5 })
      setAnimate3({ y: -5, rotate: 5 })
    } else {
      setAnimate1({})
      setAnimate2({})
      setAnimate3({})
    }
  }

  return (
    <div
      {...props}
      className={`mt-6 py-40 relative group ${props.className}`}
      onMouseEnter={() => inOut(true)}
      onMouseLeave={() => inOut(false)}
    >
      <div className='absolute top-20 left-1/2 w-64 -ml-32'>
        <motion.div
          initial={{ scale: 1, rotate: -2 }}
          animate={animate2}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20
          }}
          className="absolute -left-2 top-6">
          <Card>
            <CardContent className="p-6">
              <LuWorkflow size={40} className='opacity-50 group-hover:text-rose-400 group-hover:opacity-100 duration-700 transition-all' />
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ scale: 1 }}
          animate={animate1}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20
          }}
          className="absolute left-20">
          <Card>
            <CardContent className="p-6">
              <PiMagicWand size={40} className='opacity-50 group-hover:text-swishjam group-hover:opacity-100 duration-500 transition-all' />
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ scale: 1, rotate: 2 }}
          animate={animate3}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20
          }}
          className="absolute left-40 top-6">
          <Card>
            <CardContent className="p-6">
              <LuSparkles size={40} className='opacity-50 group-hover:text-sky-300 group-hover:opacity-100 duration-500 transition-all' />
            </CardContent>
          </Card>
        </motion.div>
        <h2 className='text-zinc-800 text-xl text-center mt-36'>{title}</h2>
      </div>
    </div>
  )

}