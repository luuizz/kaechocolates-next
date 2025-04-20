import React from 'react'


export default async function Page({ params }: { params: { slug: string } }) {
  const { slug } = await params

  return <div>Página do produto {slug}</div>
}
