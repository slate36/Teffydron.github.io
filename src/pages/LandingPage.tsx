import React from 'react'
import Navbar from '@/components/landing/Navbar'
import Hero from '@/components/landing/Hero'
import Services from '@/components/landing/Services'
import Gallery from '@/components/landing/Gallery'
import VideoShowreel from '@/components/landing/VideoShowreel'
import Reviews from '@/components/landing/Reviews'
import Contact from '@/components/landing/Contact'
import Footer from '@/components/landing/Footer'

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <Hero />
      <Services />
      <Gallery />
      <VideoShowreel />
      <Reviews />
      <Contact />
      <Footer />
    </>
  )
}
