// main.js — interactive behavior with GSAP (staggered post reveal)

document.addEventListener('DOMContentLoaded', ()=>{
  const posts = document.querySelectorAll('.post')
  if(!posts || posts.length===0) return
  try{
    if(window.gsap){
      gsap.from(posts,{opacity:0,y:18,duration:0.9,stagger:0.07,ease:'power2.out'})
    }else{
      // fallback: simple class toggle
      posts.forEach((p,i)=>{p.style.opacity=0;p.style.transform='translateY(12px)';setTimeout(()=>{p.style.transition='opacity .45s ease, transform .45s ease';p.style.opacity=1;p.style.transform='translateY(0)';},i*70)})
    }
  }catch(e){
    // no-op
  }
})
