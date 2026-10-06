const boards = [
  { token: 'pagayais', company: 'Pagaya' },
  { token: 'doitintl', company: 'DoiT' },
];
const israelLocation = /\bisrael\b|\b(tel aviv|jerusalem|haifa|beer sheva|be'er sheva|ramat gan|herzliya|petah tikva|netanya|raanana|kfar saba|rehovot|holon|lod|ashdod|ashkelon|eilat)\b|ישראל|תל אביב|ירושלים|חיפה|באר שבע|רמת גן|הרצליה|פתח תקווה|נתניה|רעננה|כפר סבא|רחובות|חולון|אשדוד|אשקלון|אילת/i;
const southernLocation = /beer sheva|be'er sheva|באר שבע|אשדוד|אשקלון|אילת/i;
const centralLocation = /tel aviv|תל אביב|רמת גן|ramat gan|herzliya|הרצליה|petah tikva|פתח תקווה|netanya|נתניה|raanana|רעננה|kfar saba|כפר סבא|rehovot|רחובות|holon|חולון|lod|לוד/i;

function isGreenhouseJobUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && ['boards.greenhouse.io', 'job-boards.greenhouse.io'].includes(url.hostname);
  } catch {
    return false;
  }
}

async function getGreenhouseJobs() {
  return Promise.all(boards.map(async board => {
    try {
      const response = await fetch(`https://boards-api.greenhouse.io/v1/boards/${board.token}/jobs?content=true`, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(10000),
      });
      if (!response.ok) throw new Error(`Greenhouse returned ${response.status}`);

      const payload = await response.json();
      if (!Array.isArray(payload.jobs)) throw new Error('Unexpected Greenhouse response');

      return {
        company: board.company,
        ok: true,
        jobs: payload.jobs.filter(job => israelLocation.test(String(job.location?.name || ''))).map(job => ({
          id: `greenhouse-${board.token}-${job.id}`,
          title: String(job.title || 'משרה ללא כותרת'),
          company: board.company,
          location: String(job.location?.name || 'מיקום לא צוין'),
          region: /\bremote\b|מרחוק/i.test(String(job.location?.name || '')) ? 'remote' : southernLocation.test(String(job.location?.name || '')) ? 'south' : centralLocation.test(String(job.location?.name || '')) ? 'center' : 'all',
          url: String(job.absolute_url || ''),
          publishedAt: String(job.first_published || ''),
          updatedAt: String(job.updated_at || ''),
          department: Array.isArray(job.departments) ? job.departments.map(item => item.name).filter(Boolean).join(' · ') : '',
          source: 'Greenhouse',
          isLive: true,
        })).filter(job => isGreenhouseJobUrl(job.url)),
      };
    } catch (error) {
      return { company: board.company, ok: false, jobs: [], error: error.message };
    }
  }));
}

module.exports = { getGreenhouseJobs };