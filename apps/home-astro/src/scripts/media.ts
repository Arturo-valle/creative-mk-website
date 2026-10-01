export {};
const videos = [...document.querySelectorAll<HTMLVideoElement>('[data-portfolio-video]')];
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
const connection = (navigator as Navigator & {connection?: EventTarget & {saveData?: boolean}}).connection;
const visible = new Set<HTMLVideoElement>();
const manuallyPaused = new WeakSet<HTMLVideoElement>();
const automaticPauses = new WeakSet<HTMLVideoElement>();
const pending = new WeakSet<HTMLVideoElement>();
const stop = (video: HTMLVideoElement) => {
 if (!video.paused) { automaticPauses.add(video); video.pause(); }
};
const allowed = () => !document.hidden && !reduced.matches && !connection?.saveData;
const start = (video: HTMLVideoElement) => {
 if (!allowed() || !visible.has(video) || manuallyPaused.has(video) || !video.paused || video.ended || pending.has(video)) return;
 video.muted = true;
 pending.add(video);
 video.play().then(() => {
  if (!allowed() || !visible.has(video)) stop(video);
 }).catch(() => { /* Browser policy can block autoplay; native controls remain available. */ })
 .finally(() => pending.delete(video));
};
const refresh = () => videos.forEach(video => {
 if (allowed() && visible.has(video)) start(video);
 else stop(video);
});
const opening=document.querySelector<HTMLVideoElement>('.hero-motion');
const toggle=document.querySelector<HTMLButtonElement>('[data-hero-toggle]');
if(opening&&toggle){
 toggle.hidden=false;
 const sync=()=>{toggle.textContent=opening.paused?toggle.dataset.play!:toggle.dataset.pause!;toggle.setAttribute('aria-pressed',String(!opening.paused));};
 toggle.addEventListener('click',()=>{if(opening.paused)opening.play().catch(sync);else opening.pause();});
 opening.addEventListener('play',sync);opening.addEventListener('pause',sync);sync();
}
for (const video of videos) {
 video.addEventListener('pause', () => {
  if (automaticPauses.has(video)) automaticPauses.delete(video);
  else if (!video.ended) manuallyPaused.add(video);
 });
 video.addEventListener('play', () => {
  manuallyPaused.delete(video);
  // A user-started video takes priority. Silent videos can autoplay together
  // when both mockups are visible; enabling audio pauses the other players.
  if (!pending.has(video) || !video.muted) for(const other of videos) if(other!==video) stop(other);
 });
 video.addEventListener('volumechange', () => {
  if (!video.muted && !video.paused) for(const other of videos) if(other!==video) stop(other);
 });
 video.addEventListener('error', () => {video.closest('figure')?.classList.add('media-unavailable');});
}
if ('IntersectionObserver' in window) {
 const observer = new IntersectionObserver(entries => {
  for (const entry of entries) {
   const video=entry.target as HTMLVideoElement;
   if(entry.isIntersecting && entry.intersectionRatio>=0.2) {visible.add(video);start(video);}
   else {visible.delete(video);stop(video);}
  }
 }, {threshold:[0,0.2]});
 videos.forEach(video=>observer.observe(video));
}
document.addEventListener('visibilitychange',refresh);
reduced.addEventListener('change',refresh);
connection?.addEventListener('change',refresh);
