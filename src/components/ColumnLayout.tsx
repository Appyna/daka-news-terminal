import React from 'react'
import type { Feed, Article } from '../types'

export default function ColumnLayout({ feeds, onOpenArticle }:{feeds: Feed[]; onOpenArticle:(a:Article)=>void}){
  // group feeds by country
  const byCountry = feeds.reduce<Record<string, Feed[]>>((acc,f)=>{(acc[f.country]??= []).push(f);return acc},{})
  return (
    <div style={{display:'flex',gap:12,alignItems:'stretch'}}>
      {Object.entries(byCountry).map(([country, list])=> (
        <section key={country} aria-label={`Pays ${country}`} style={{minWidth:260,background:'var(--panel)',padding:12,borderRadius:6}}>
          <h2 style={{marginTop:0}}>{country}</h2>
          {list.map(feed=> (
            <div key={feed.id} style={{marginTop:8}}>
              <h3 style={{margin:0,fontSize:14}}>{feed.name}</h3>
              <ul style={{listStyle:'none',padding:0,marginTop:8}}>
                {feed.articles.map(a=> (
                  <li key={a.id}>
                    <button onClick={()=>onOpenArticle(a)} style={{display:'block',width:'100%',textAlign:'left',background:'transparent',border:'none',color:'var(--text)',padding:'8px 6px',borderRadius:4}}>
                      <strong style={{display:'block',fontSize:13}}>{a.title}</strong>
                      <span style={{fontSize:12,color:'var(--muted)'}}>{a.source} • {a.publishedAt ?? ''}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      ))}
    </div>
  )
}
