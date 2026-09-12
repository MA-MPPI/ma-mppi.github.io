'use strict';

// Keep the supplied video files and their original individual outcome labels.
const scenarios = [
  {id:'passage', title:'Constrained passage', description:'Successive turns through a constrained passage.', files:['HPMA','HPRL','HPVA'], outcomes:['Success','Stagnation & collision','Stagnation']},
  {id:'escape', title:'U-trap escape', description:'Move away from the goal to escape a U-shaped trap.', files:['HUIMA','HUIRL','HUIVA'], outcomes:['Success','Stagnation','Collision']},
  {id:'entry', title:'U-trap entry', description:'An exterior detour around a deceptive U-shaped entrance.', files:['HUOMA','HUORL','HUOVA'], outcomes:['Success','Stagnation','Stagnation']},
  {id:'clutter1', title:'Clutter 1', description:'Additional clutter demonstration 1; separate from the 14-task matched evaluation.', files:['video_1','video_2','video_3'], outcomes:['Success','Collision','Collision']},
  {id:'clutter2', title:'Clutter 2', description:'Additional clutter demonstration 2; separate from the 14-task matched evaluation.', files:['video_4','video_5','video_6'], outcomes:['Success','Stagnation','Collision']},
];
const methods = [
  {name:'MA-MPPI', label:'Adaptive prior'},
  {name:'RL-MPPI', label:'Always-on prior · γ = 1'},
  {name:'Vanilla MPPI', label:'No learned prior'},
];
const panelsContainer = document.querySelector('#video-panels');
scenarios.forEach((scenario, scenarioIndex) => {
  const panel = document.createElement('section');
  panel.className = 'video-panel';
  panel.id = 'panel-' + scenario.id;
  panel.setAttribute('role', 'tabpanel');
  panel.setAttribute('aria-labelledby', 'tab-' + scenario.id);
  panel.tabIndex = 0;
  panel.hidden = scenarioIndex !== 0;
  panel.dataset.description = scenario.description;
  scenario.files.forEach((file, methodIndex) => {
    const method = methods[methodIndex];
    const outcome = scenario.outcomes[methodIndex];
    const outcomeClass = outcome === 'Success' ? 'success' : outcome.toLowerCase().includes('collision') ? 'failure' : 'stalled';
    const figure = document.createElement('figure');
    figure.className = 'video-card' + (methodIndex === 0 ? ' ours' : '');
    figure.innerHTML = '<figcaption><div><span class="method-tag"></span><h3></h3></div><span class="outcome"></span></figcaption>';
    figure.querySelector('.method-tag').textContent = method.label;
    figure.querySelector('h3').textContent = method.name;
    figure.querySelector('.outcome').textContent = outcome;
    figure.querySelector('.outcome').classList.add(outcomeClass);
    const video = document.createElement('video');
    video.controls = true;
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.preload = 'none';
    video.poster = 'assets/posters/' + file + '.webp';
    video.setAttribute('aria-label', method.name + ' · ' + scenario.title + ': ' + outcome);
    const source = document.createElement('source');
    source.src = file + '.mp4';
    source.type = 'video/mp4';
    const fallback = document.createElement('a');
    fallback.href = source.src;
    fallback.textContent = 'Download video';
    video.append(source, fallback);
    figure.append(video);
    panel.append(figure);
  });
  panelsContainer.append(panel);
});

const tabs = [...document.querySelectorAll('.video-tabs [role="tab"]')];
const panels = [...document.querySelectorAll('.video-panel')];
const playAllButton = document.querySelector('#play-all');
const speedControl = document.querySelector('#playback-rate');
const status = document.querySelector('#video-status');
let activePanel = panels[0];
let operation = 0;

function selectedVideos() { return [...activePanel.querySelectorAll('video')]; }
function updatePlaybackButton() {
  const playing = selectedVideos().some(video => !video.paused && !video.ended);
  playAllButton.textContent = playing ? 'Ⅱ Pause all' : '▶ Play all';
  playAllButton.setAttribute('aria-label', playing ? 'Pause the three selected videos' : 'Play the three selected videos');
}
function pauseAllMedia() {
  document.querySelectorAll('video').forEach(video => video.pause());
}
function activateTab(tab, focus = false) {
  operation++;
  panels.forEach(panel => {
    panel.querySelectorAll('video').forEach(video => video.pause());
    panel.hidden = panel.id !== tab.getAttribute('aria-controls');
  });
  tabs.forEach(item => {
    const selected = item === tab;
    item.setAttribute('aria-selected', String(selected));
    item.tabIndex = selected ? 0 : -1;
  });
  activePanel = document.getElementById(tab.getAttribute('aria-controls'));
  selectedVideos().forEach(video => { video.playbackRate = Number(speedControl.value); });
  document.querySelector('#scenario-description').textContent = activePanel.dataset.description;
  status.textContent = '';
  updatePlaybackButton();
  if (focus) tab.focus();
}
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => activateTab(tab));
  tab.addEventListener('keydown', event => {
    let destination;
    if (event.key === 'ArrowRight') destination = (index + 1) % tabs.length;
    if (event.key === 'ArrowLeft') destination = (index - 1 + tabs.length) % tabs.length;
    if (event.key === 'Home') destination = 0;
    if (event.key === 'End') destination = tabs.length - 1;
    if (destination !== undefined) {
      event.preventDefault();
      activateTab(tabs[destination], true);
    }
  });
});

async function startSelectedVideos() {
  const currentOperation = ++operation;
  const videos = selectedVideos();
  status.textContent = '';
  const results = await Promise.allSettled(videos.map(video => {
    if (video.ended) video.currentTime = 0;
    video.playbackRate = Number(speedControl.value);
    return video.play();
  }));
  if (currentOperation !== operation) return;
  if (results.some(result => result.status === 'rejected')) {
    status.textContent = 'Some videos could not start. Use the individual play controls, or open the original clip below.';
  }
  updatePlaybackButton();
}
playAllButton.addEventListener('click', () => {
  if (selectedVideos().some(video => !video.paused && !video.ended)) {
    operation++;
    selectedVideos().forEach(video => video.pause());
  } else {
    startSelectedVideos();
  }
});
document.querySelector('#restart-all').addEventListener('click', () => {
  selectedVideos().forEach(video => { video.currentTime = 0; });
  startSelectedVideos();
});
speedControl.addEventListener('change', () => {
  selectedVideos().forEach(video => { video.playbackRate = Number(speedControl.value); });
});
document.querySelectorAll('.video-card video').forEach(video => {
  ['play','pause','ended'].forEach(name => video.addEventListener(name, updatePlaybackButton));
  video.addEventListener('error', () => {
    if (!video.closest('.video-panel').hidden) status.textContent = 'A video could not be loaded. Open its original MP4 using the link beneath the player.';
  });
  const download = document.createElement('a');
  download.className = 'clip-original';
  download.href = video.querySelector('source').src;
  download.target = '_blank';
  download.rel = 'noopener';
  download.textContent = 'Original clip ↗';
  download.setAttribute('aria-label', 'Open original clip: ' + video.getAttribute('aria-label'));
  video.parentElement.append(download);
});

// Native dialog supplies keyboard focus containment and Escape-to-close behavior.
const dialog = document.querySelector('#media-dialog');
const dialogContent = document.querySelector('#dialog-content');
const dialogCaption = document.querySelector('#dialog-caption');
const dialogOriginal = document.querySelector('#dialog-original');
function openDialog(source, caption, isVideo) {
  operation++;
  pauseAllMedia();
  const media = document.createElement(isVideo ? 'video' : 'img');
  media.src = source;
  if (isVideo) {
    media.controls = true;
    media.playsInline = true;
    media.muted = true;
    media.setAttribute('aria-label', caption);
  } else {
    media.alt = caption;
    media.title = 'Click to toggle full-resolution view';
    media.addEventListener('click', () => media.classList.toggle('full-resolution'));
  }
  dialogCaption.textContent = caption;
  dialogOriginal.href = source;
  dialogContent.replaceChildren(media);
  document.body.classList.add('modal-open');
  dialog.showModal();
  document.querySelector('#dialog-close').focus();
  if (isVideo) media.play().catch(() => { /* Native controls remain available. */ });
}
document.querySelectorAll('[data-lightbox]').forEach(link => {
  link.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    if (typeof dialog.showModal !== 'function') return;
    event.preventDefault();
    openDialog(link.href, link.dataset.caption, false);
  });
});
document.querySelectorAll('[data-open-video]').forEach(button => {
  button.addEventListener('click', () => {
    if (typeof dialog.showModal !== 'function') {
      window.location.href = button.dataset.openVideo;
      return;
    }
    openDialog(button.dataset.openVideo, button.dataset.videoTitle, true);
  });
});
document.querySelector('#dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const rect = dialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
});
dialog.addEventListener('close', () => {
  dialogContent.querySelectorAll('video').forEach(video => video.pause());
  dialogContent.replaceChildren();
  document.body.classList.remove('modal-open');
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    operation++;
    pauseAllMedia();
  }
});

// Lightweight active-section navigation; all content is visible without animation.
const sectionLinks = [...document.querySelectorAll('.nav-links a')];
let navigationScheduled = false;
function updateNavigation() {
  let current = null;
  sectionLinks.forEach(link => {
    if (document.querySelector(link.getAttribute('href')).getBoundingClientRect().top <= 160) current = link;
  });
  sectionLinks.forEach(link => {
    if (link === current) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
  navigationScheduled = false;
}
window.addEventListener('scroll', () => {
  if (!navigationScheduled) {
    navigationScheduled = true;
    requestAnimationFrame(updateNavigation);
  }
}, { passive:true });
updateNavigation();
