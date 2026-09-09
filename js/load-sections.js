// Sections are fetched at runtime, so the page must be served over http.

export async function loadSections(names, stage) {
  if (location.protocol === 'file:') throw new Error('opened from disk');
  const parts = await Promise.all(names.map(async (name) => {
    const res = await fetch(`sections/${name}.html`);
    if (!res.ok) throw new Error(`sections/${name}.html → ${res.status}`);
    return res.text();
  }));
  stage.insertAdjacentHTML('beforeend', parts.join(''));
}
